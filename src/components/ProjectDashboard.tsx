import React, { useState, useEffect } from 'react';
import { translations } from './Translations';
import { 
  Search, Grid, List, SortAsc, Calendar, Play, Trash2, Tag, ArrowRight, 
  Sparkles, Palette, Plus, FolderHeart, Video, TrendingUp, Clock, FileVideo
} from 'lucide-react';

interface Clip {
  id: string;
  title: string;
  duration: number;
  viralScore: number;
  hashtags: string[];
}

interface Project {
  id: string;
  title: string;
  videoUrl: string;
  topic: string;
  clips: Clip[];
  tags: string[];
  speakers: any[];
  timestamp: string;
}

interface SavedTemplate {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  primaryColor: string;
  strokeColor: string;
  fontCase: string;
  logoUrl?: string;
  logoPosition?: string;
}

interface ProjectDashboardProps {
  lang: 'en' | 'hi';
  user: { email: string; name: string; credits: number; tier: string } | null;
  onSelectProject: (project: Project) => void;
  onCreateNewProject: () => void;
  onOpenPricingModal: () => void;
}

export default function ProjectDashboard({ 
  lang, 
  user, 
  onSelectProject, 
  onCreateNewProject,
  onOpenPricingModal
}: ProjectDashboardProps) {
  const t = translations[lang];

  // Projects & templates data
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  
  // Dashboard UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState<'recent' | 'viral' | 'duration' | 'name'>('recent');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'clips' | 'empty'>('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('All');
  
  // Tag creation / assignment state
  const [activeProjectTagInputId, setActiveProjectTagInputId] = useState<string | null>(null);
  const [newTagVal, setNewTagVal] = useState('');

  // Loaded state flags
  const [isLoading, setIsLoading] = useState(false);

  // Fetch projects & templates from DB on mount/user-change
  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. Fetch user projects
      const projRes = await fetch("/api/projects/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email })
      });
      const projData = await projRes.json();
      if (projData.success) {
        setProjects(projData.projects);
      }

      // 2. Fetch templates
      const tempRes = await fetch("/api/templates/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email })
      });
      const tempData = await tempRes.json();
      if (tempData.success) {
        setTemplates(tempData.templates);
      }
    } catch (err) {
      console.error("Dashboard list loading failed from express server APIs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!user) return;
    if (!confirm(t.deleteSuccess.split(".")[0] + "?")) return;

    try {
      const res = await fetch("/api/projects/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, id: projId })
      });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== projId));
      }
    } catch (err) {
      console.error("Express delete request failed:", err);
    }
  };

  const handleAddCustomFolderTag = async (projId: string, event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !newTagVal.trim()) return;

    const projToEdit = projects.find(p => p.id === projId);
    if (!projToEdit) return;

    const updatedTags = Array.from(new Set([...(projToEdit.tags || []), newTagVal.trim().toLowerCase()]));
    const updatedProj = { ...projToEdit, tags: updatedTags };

    try {
      const res = await fetch("/api/projects/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, project: updatedProj })
      });
      const data = await res.json();
      if (data.success) {
        setProjects(prev => prev.map(p => p.id === projId ? { ...p, tags: updatedTags } : p));
        setNewTagVal('');
        setActiveProjectTagInputId(null);
      }
    } catch (err) {
      console.error("Project folder tag update api error:", err);
    }
  };

  // Compile active tags across all projects
  const availableTags = ['All', ...Array.from(new Set(projects.flatMap(p => p.tags || [])))];

  // Apply filters
  const filteredProjects = projects
    .filter(p => {
      // Search
      const textMatch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.videoUrl || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter Type
      const typeMatch = 
        selectedFilter === 'all' ||
        (selectedFilter === 'clips' && p.clips && p.clips.length > 0) ||
        (selectedFilter === 'empty' && (!p.clips || p.clips.length === 0));

      // Tag Folder Filter
      const tagMatch = 
        selectedTagFilter === 'All' ||
        (p.tags && p.tags.includes(selectedTagFilter.toLowerCase()));

      return textMatch && typeMatch && tagMatch;
    })
    .sort((a, b) => {
      if (selectedSort === 'recent') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (selectedSort === 'viral') {
        const topViralA = a.clips?.reduce((max, c) => Math.max(max, c.viralScore || 0), 0) || 0;
        const topViralB = b.clips?.reduce((max, c) => Math.max(max, c.viralScore || 0), 0) || 0;
        return topViralB - topViralA;
      }
      if (selectedSort === 'duration') {
        const totalDurationA = a.clips?.reduce((sum, c) => sum + (c.duration || 0), 0) || 0;
        const totalDurationB = b.clips?.reduce((sum, c) => sum + (c.duration || 0), 0) || 0;
        return totalDurationA - totalDurationB;
      }
      if (selectedSort === 'name') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  return (
    <div id="project-dashboard" className="w-full min-h-[70vh] text-white">
      
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        
        <div className="p-4 rounded-xl bg-brand-gray border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block font-bold">Project Folders</span>
            <span className="font-sans font-black text-2xl text-white block mt-1">{projects.length}</span>
          </div>
          <div className="p-2.5 bg-brand-green/10 border border-brand-green/20 rounded-lg text-brand-green">
            <Video className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-brand-gray border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block font-bold">Viral Highlight Clips</span>
            <span className="font-sans font-black text-2xl text-white block mt-1">
              {projects.reduce((sum, p) => sum + (p.clips?.length || 0), 0)}
            </span>
          </div>
          <div className="p-2.5 bg-brand-green/10 border border-brand-green/20 rounded-lg text-brand-green">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-brand-gray border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block font-bold">Brand Preset Templates</span>
            <span className="font-sans font-black text-2xl text-white block mt-1">{templates.length}</span>
          </div>
          <div className="p-2.5 bg-brand-green/10 border border-brand-green/20 rounded-lg text-brand-green">
            <Palette className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-brand-gray border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block font-bold">Billing Balance</span>
            <span className="font-sans font-black text-2xl text-brand-green block mt-1">{user?.credits || 0} credits</span>
          </div>
          <button 
            id="dashboard-upgrade-credits-btn"
            onClick={onOpenPricingModal}
            className="px-3 py-1.5 bg-brand-green/10 hover:bg-brand-green text-brand-green hover:text-black font-mono font-bold text-[8px] border border-brand-green/20 uppercase tracking-wider rounded transition-colors"
          >
            + Get Credits
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main query lists workspace */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Controls Bar */}
          <div className="p-5 rounded-xl bg-brand-gray border border-white/10 space-y-4">
            
            {/* Row 1: Search and button */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-white/30" />
                <input
                  id="dashboard-search-projects"
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-brand-green"
                />
              </div>

              <button
                id="dashboard-new-project-btn"
                onClick={onCreateNewProject}
                className="w-full md:w-auto px-6 py-3.5 bg-brand-green text-black font-black text-xs uppercase tracking-widest rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> {t.createNewBtn}
              </button>

            </div>

            {/* Row 2: Sorts, Tag filters */}
            <div className="flex flex-wrap items-center gap-4 pt-3.5 border-t border-white/5 text-xs text-white/60">
              
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/40 font-bold">{t.sortBy}:</span>
                <select
                  id="dashboard-sort-select"
                  value={selectedSort}
                  onChange={e => setSelectedSort(e.target.value as any)}
                  className="bg-black border border-white/10 rounded px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-brand-green font-mono uppercase"
                >
                  <option value="recent">{t.sortRecent}</option>
                  <option value="viral">{t.sortViral}</option>
                  <option value="duration">{t.sortDuration}</option>
                  <option value="name">{t.sortName}</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/40 font-bold">{t.filterType}:</span>
                {['all', 'clips', 'empty'].map(f => (
                  <button
                    id={`filter-type-${f}`}
                    key={f}
                    onClick={() => setSelectedFilter(f as any)}
                    className={`px-2.5 py-0.5 rounded text-[9px] font-mono uppercase border tracking-wider transition-colors cursor-pointer ${
                      selectedFilter === f 
                        ? 'border-brand-green bg-brand-green/10 text-brand-green' 
                        : 'border-white/5 text-white/40 hover:text-white hover:border-white/15'
                    }`}
                  >
                    {f === 'all' && t.filterAll}
                    {f === 'clips' && t.filterGenerated}
                    {f === 'empty' && "Source Links Only"}
                  </button>
                ))}
              </div>

            </div>

            {/* Row 3: Tag / Folder Rails */}
            <div className="pt-2 flex flex-wrap gap-1.5 items-center">
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/40 font-bold mr-1">{t.tagsLabel}</span>
              {availableTags.map(tag => (
                <button
                  id={`tag-filter-${tag}`}
                  key={tag}
                  onClick={() => setSelectedTagFilter(tag)}
                  className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-widest transition-colors cursor-pointer ${
                    ((tag as string) === 'All' && selectedTagFilter === 'All') || (selectedTagFilter.toLowerCase() === (tag as string).toLowerCase())
                      ? 'bg-brand-green text-black font-black' 
                      : 'bg-black text-white/40 border border-white/10 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

          </div>

          {/* Project Cards Grid */}
          {filteredProjects.length === 0 ? (
            <div className="p-12 text-center bg-brand-gray border border-white/10 rounded-xl space-y-3">
              <FolderHeart className="w-10 h-10 text-white/20 mx-auto" />
              <h4 className="font-sans font-black text-xs text-white uppercase tracking-wider">{t.noProjectsTitle}</h4>
              <p className="text-white/40 text-[10px] uppercase tracking-wider leading-relaxed">{t.noProjectsSub}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map(p => {
                const isTaggingActive = activeProjectTagInputId === p.id;
                
                return (
                  <div
                    id={`project-card-${p.id}`}
                    key={p.id}
                    onClick={() => onSelectProject(p)}
                    className="p-5 bg-brand-gray hover:bg-white/[0.03] border border-white/10 hover:border-brand-green rounded-xl transition-all cursor-pointer group flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <span className="text-[8px] font-mono text-brand-green tracking-widest bg-brand-green/10 border border-brand-green/20 px-2 py-0.5 rounded uppercase font-bold">
                          {p.timestamp}
                        </span>
                        
                        {/* Delete trigger */}
                        <button
                          id={`delete-project-btn-${p.id}`}
                          onClick={(e) => handleDeleteProject(p.id, e)}
                          className="p-1 text-white/20 hover:text-red-400 rounded hover:bg-black/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="font-sans font-black text-sm text-white uppercase tracking-wide group-hover:text-brand-green transition-colors leading-snug">
                        {p.title}
                      </h3>

                      {p.topic && (
                        <p className="text-[10px] text-white/40 font-sans line-clamp-2 uppercase tracking-wide leading-relaxed">
                          Topic: {p.topic}
                        </p>
                      )}

                      {p.videoUrl && (
                        <p className="text-[9px] text-white/30 font-mono truncate uppercase tracking-widest">
                          URL: {p.videoUrl}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3.5 border-t border-white/5 pt-3.5">
                      {/* Clips metadata overview */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-white/55 uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-brand-green" /> 
                          {p.clips?.length || 0} {t.projectCardClips}
                        </span>
                        
                        {p.clips && p.clips.length > 0 && (
                          <span className="font-bold text-brand-green">
                            Max Viral: {Math.max(...p.clips.map(c => c.viralScore || 0))}%
                          </span>
                        )}
                      </div>

                      {/* Display active tags folder */}
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <Tag className="w-3 h-3 text-white/30 shrink-0" />
                        {p.tags?.map((tag, i) => (
                          <span key={i} className="text-[8px] font-mono tracking-wider text-white/50 bg-black px-1.5 py-0.5 rounded uppercase border border-white/5">
                            {tag}
                          </span>
                        ))}

                        {/* Tag appending controls */}
                        {isTaggingActive ? (
                          <form 
                            onSubmit={(e) => handleAddCustomFolderTag(p.id, e)}
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1"
                          >
                            <input 
                              id={`tag-input-${p.id}`}
                              type="text"
                              value={newTagVal}
                              onChange={e => setNewTagVal(e.target.value)}
                              placeholder="Folder Tag"
                              className="bg-black text-[9px] text-white border border-brand-green/50 placeholder-white/20 px-1.5 py-0.5 rounded uppercase focus:outline-none font-mono"
                              autoFocus
                            />
                            <button type="submit" className="text-[9px] text-brand-green hover:underline uppercase">OK</button>
                            <button type="button" onClick={() => setActiveProjectTagInputId(null)} className="text-[9px] text-white/30 hover:underline uppercase">✕</button>
                          </form>
                        ) : (
                          <button
                            id={`add-tag-trigger-${p.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveProjectTagInputId(p.id);
                              setNewTagVal('');
                            }}
                            className="text-[8px] font-mono uppercase tracking-widest text-brand-green/80 hover:underline cursor-pointer"
                          >
                            + Tag
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Sidebar templates collection panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-5 rounded-xl bg-brand-gray border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Palette className="w-4 h-4 text-brand-green" />
              <h3 className="font-sans font-black text-xs uppercase tracking-wider">{t.savedTemplatesTitle}</h3>
            </div>

            {templates.length === 0 ? (
              <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-wider py-4 border-t border-white/5 font-sans">
                {t.noTemplatesText}
              </p>
            ) : (
              <div className="space-y-2 pt-2 border-t border-white/5">
                {templates.map(temp => (
                  <div
                    id={`template-preset-card-${temp.id}`}
                    key={temp.id}
                    className="p-3.5 rounded bg-black border border-white/5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-black text-[10px] uppercase text-white tracking-wide truncate pr-2">
                        {temp.name}
                      </span>
                      <span className="text-[8px] font-mono uppercase tracking-wider bg-brand-green/20 text-brand-green px-1.5 py-0.5 rounded">
                        {temp.fontFamily}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                      <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: temp.primaryColor }} />
                      <span className="text-[8px] font-mono tracking-widest text-white/30 uppercase">
                        Cap: {temp.fontCase === 'uppercase' ? "ALL CAPS" : "Standard"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
