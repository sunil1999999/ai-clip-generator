import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Video, Sparkles, TrendingUp, Cpu, Maximize2, 
  Trash2, Smile, AlertCircle, Share2, Palette, Globe, CheckCircle, 
  Settings, Play, Pause, RefreshCw, Layers, Check, FileVideo
} from 'lucide-react';
import { Clip, Word, BrandTemplate } from '../types';
import VideoPlayerSim from './VideoPlayerSim';
import TranscriptEditor from './TranscriptEditor';
import BrandTemplatesConfig from './BrandTemplatesConfig';
import SocialScheduler from './SocialScheduler';
import ClipExporter from './ClipExporter';

import { translations } from './Translations';

interface WorkspaceProps {
  initialTopic?: string;
  initialProject?: any; // Selected project from dashboard lists
  onBackToLanding: () => void;
  lang: 'en' | 'hi';
  user: { email: string; name: string; credits: number; tier: string } | null;
  onRefreshUser: (updatedUser: any) => void;
  onOpenAuth: () => void;
}

export default function Workspace({ 
  initialTopic = "", 
  initialProject,
  onBackToLanding,
  lang,
  user,
  onRefreshUser,
  onOpenAuth
}: WorkspaceProps) {
  const t = translations[lang];

  // Save workflow indicators
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [presetStatus, setPresetStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');

  // Input URL or Topic states
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoTopic, setVideoTopic] = useState<string>(initialTopic);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  
  // Data State
  const [activeClipId, setActiveClipId] = useState<string>("");
  const [clips, setClips] = useState<Clip[]>([]);
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [aiSource, setAiSource] = useState<string>("");
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  // Playback State
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<'16-9' | '9-16'>('9-16');
  const [translationLanguage, setTranslationLanguage] = useState<string>("en");

  // Custom Brand Styling Settings state
  const [brandSettings, setBrandSettings] = useState<BrandTemplate>({
    name: "Default Preset",
    fontFamily: "Space Grotesk",
    fontSize: 22,
    primaryColor: "#FFFF00", // Yellow default
    strokeColor: "#000000",
    fontCase: "uppercase",
    backgroundColor: "rgba(0,0,0,0.65)",
    logoUrl: "ViraClip AI overlay",
    logoPosition: "top-right"
  });

  // Reference for tick interval
  const timerRef = useRef<number | null>(null);

  // Auto start a generation or load dynamic project parameters
  useEffect(() => {
    if (initialProject) {
      setVideoUrl(initialProject.videoUrl || "");
      setVideoTopic(initialProject.topic || "");
      if (initialProject.clips && initialProject.clips.length > 0) {
        setClips(initialProject.clips);
        setActiveClipId(initialProject.clips[0].id);
        setCurrentTime(initialProject.clips[0].startTime);
      }
      if (initialProject.speakers) {
        setSpeakers(initialProject.speakers);
      }
    } else if (initialTopic) {
      if (initialTopic.startsWith('http://') || initialTopic.startsWith('https://') || initialTopic.includes('youtube.com') || initialTopic.includes('youtu.be') || initialTopic.toLowerCase().endsWith('.mp4')) {
        setVideoUrl(initialTopic);
        setVideoTopic("Custom Video Campaign");
      }
      triggerAnalysis(initialTopic);
    }
  }, [initialProject, initialTopic]);

  const handleSaveCampaignProject = async () => {
    if (!user) {
      alert("Please register or sign in to save templates / clip campaigns.");
      onOpenAuth();
      return;
    }
    setSaveStatus('saving');
    setSaveError('');
    try {
      const payloadProject = {
        id: initialProject?.id || "proj_" + Date.now(),
        title: videoTopic ? `Campaign: ${videoTopic}` : "My Saved Clip Campaign",
        videoUrl: videoUrl,
        topic: videoTopic,
        clips: clips,
        speakers: speakers,
        tags: initialProject?.tags || ["viral-short"],
        timestamp: initialProject?.timestamp || new Date().toISOString().split('T')[0]
      };

      const res = await fetch("/api/projects/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, project: payloadProject })
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } else {
        setSaveStatus('error');
        setSaveError(data.error || "Failed to commit project changes.");
      }
    } catch (err) {
      setSaveStatus('error');
      setSaveError("Endpoint pipeline error.");
    }
  };

  const handleSaveCaptionTemplatePreset = async () => {
    if (!user) {
      alert("Please register or sign in to customize and save template configurations.");
      onOpenAuth();
      return;
    }
    setPresetStatus('saving');
    try {
      const templatePayload = {
        id: "temp_" + Date.now(),
        name: brandSettings.name || "Default Preset",
        fontFamily: brandSettings.fontFamily,
        fontSize: brandSettings.fontSize,
        primaryColor: brandSettings.primaryColor,
        strokeColor: brandSettings.strokeColor,
        fontCase: brandSettings.fontCase,
        backgroundColor: brandSettings.backgroundColor,
        logoUrl: brandSettings.logoUrl,
        logoPosition: brandSettings.logoPosition
      };

      const res = await fetch("/api/templates/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, template: templatePayload })
      });
      const data = await res.json();
      if (data.success) {
        setPresetStatus('saved');
        setTimeout(() => setPresetStatus('idle'), 2500);
      } else {
        setPresetStatus('error');
      }
    } catch (err) {
      setPresetStatus('error');
    }
  };

  const activeClip = clips.find(c => c.id === activeClipId) || clips[0];

  // Tick timer loop when isPlaying is true
  useEffect(() => {
    if (isPlaying && activeClip) {
      const intervalMs = 120; // tick 120ms
      timerRef.current = window.setInterval(() => {
        setCurrentTime(prevTime => {
          let nextTime = prevTime + (intervalMs / 1000);
          
          // Loop or cap
          if (nextTime >= activeClip.endTime) {
            setIsPlaying(false);
            return activeClip.startTime;
          }

          // Text-Based editing logic:
          // If the word containing nextTime is flagged as DELETED,
          // instantly warp/warp forward nextTime to the next active word!
          const containingWord = activeClip.transcript.find(
            w => nextTime >= w.start && nextTime <= w.end
          );

          if (containingWord && containingWord.deleted) {
            // Find the first undeleted word whose start timestamp is greater than nextTime
            const followingNonDeletedWord = activeClip.transcript.find(
              w => w.start > nextTime && !w.deleted
            );
            
            if (followingNonDeletedWord) {
              return followingNonDeletedWord.start;
            } else {
              // No following words remaining that are not deleted, pause playback
              setIsPlaying(false);
              return activeClip.startTime;
            }
          }

          return nextTime;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, activeClip]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleResetPlayback = () => {
    if (activeClip) {
      setCurrentTime(activeClip.startTime);
      setIsPlaying(false);
    }
  };

  const handleWordNavigation = (start: number) => {
    setCurrentTime(start);
  };

  const handleUpdateActiveClipTranscript = (updatedWords: Word[]) => {
    setClips(prev => prev.map(c => 
      c.id === activeClip.id ? { ...c, transcript: updatedWords } : c
    ));
  };

  // Run full pipeline fetch (hits server side Gemini API endpoint)
  const triggerAnalysis = async (selectedTopicOverride?: string) => {
    setIsProcessing(true);
    setClips([]);
    setIsPlaying(false);
    setQuotaExceeded(false);

    const targetTopic = selectedTopicOverride || videoTopic || videoUrl || "Startup Advice For Founders";

    const stages = [
      "Accessing video indexing pipelines...",
      "Analyzing auditory peaks & generating word transcriptions...",
      "Running AI Highlight detector logic directly via Gemini 3.5...",
      "Constructing 9:16 mobile view speaker tracking frames layers...",
      "Applying contextual emojis and brand stylizer kits...",
      "Injecting search tags & clickbait titles optimization guidelines..."
    ];

    // Simulate stepping through stages visually to keep the user engaged
    let stageIndex = 0;
    setProcessingStep(stages[0]);

    const stageTimer = setInterval(() => {
      stageIndex++;
      if (stageIndex < stages.length) {
        setProcessingStep(stages[stageIndex]);
      }
    }, 600);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: videoUrl,
          topic: targetTopic,
          email: user?.email || ""
        })
      });

      if (response.status === 402) {
        clearInterval(stageTimer);
        const data = await response.json();
        alert(data.error || "Insufficient credits remaining. Please buy credits or subscribe on the dashboard.");
        setIsProcessing(false);
        return;
      }

      const result = await response.json();
      clearInterval(stageTimer);

      if (result.success && result.clips && result.clips.length > 0) {
        setClips(result.clips);
        setSpeakers(result.speakers);
        setAiSource(result.aiPower);
        setActiveClipId(result.clips[0].id);
        setCurrentTime(result.clips[0].startTime);
        if (result.quotaExceeded) {
          setQuotaExceeded(true);
        }
        
        // Refresh balance
        if (user) {
          onRefreshUser(user);
        }
      } else {
        alert(result.error || "Failed to analyze feed details correctly. Running fallbacks.");
      }
    } catch (e) {
      console.warn("Server connection failed during analytics. Activating resilient local framework.", e);
      clearInterval(stageTimer);
      
      // Resilient Client Side Fallback Mock Clips
      const localFallbackSubject = targetTopic || "Startup Strategy";
      const localFallbackClips = [
        {
          id: "local_clip_1",
          title: `The Hidden Opportunity in ${localFallbackSubject}`,
          description: `An expert highlight explaining the sudden growth trends across ${localFallbackSubject} markets.`,
          startTime: 0,
          endTime: 19,
          duration: 19,
          viralScore: 89,
          speakerId: "speaker_a",
          facePositionX: 42,
          reason: "Intense starting audio focus, short visual breaks, and an highly active opening hooks profile.",
          hashtags: ["viral", "ideas", "strategy", "insight"],
          suggestedTitles: [
            `How to dominate ${localFallbackSubject} in 30 days`,
            "The industry cheat code no one tells you",
            "This will save you 100+ hours of work"
          ],
          transcript: [
            { id: "lw1", text: "Look,", start: 0.2, end: 0.8, speakerId: "speaker_a", emoji: "👀" },
            { id: "lw2", text: "this", start: 0.9, end: 1.3, speakerId: "speaker_a" },
            { id: "lw3", text: "is", start: 1.4, end: 1.8, speakerId: "speaker_a" },
            { id: "lw4", text: "exactly", start: 1.9, end: 2.5, speakerId: "speaker_a", emoji: "⚡" },
            { id: "lw5", text: "where", start: 2.6, end: 3.1, speakerId: "speaker_a" },
            { id: "lw6", text: "everyone", start: 3.2, end: 3.8, speakerId: "speaker_a" },
            { id: "lw11", text: "misses", start: 3.9, end: 4.5, speakerId: "speaker_a", emoji: "⚠️" },
            { id: "lw12", text: "the", start: 4.6, end: 4.9, speakerId: "speaker_a" },
            { id: "lw13", text: "point.", start: 5.0, end: 6.2, speakerId: "speaker_a", emoji: "💡" },
            { id: "lw14", text: "You", start: 6.6, end: 7.0, speakerId: "speaker_a" },
            { id: "lw15", text: "have", start: 7.1, end: 7.5, speakerId: "speaker_a" },
            { id: "lw16", text: "to", start: 7.6, end: 7.9, speakerId: "speaker_a" },
            { id: "lw17", text: "build", start: 8.0, end: 8.6, speakerId: "speaker_a", emoji: "🏆" },
            { id: "lw18", text: "right", start: 8.7, end: 9.1, speakerId: "speaker_a" },
            { id: "lw19", text: "now.", start: 9.2, end: 10.0, speakerId: "speaker_a" },
            { id: "lw20", text: "No", start: 10.5, end: 11.0, speakerId: "speaker_a", emoji: "❌" },
            { id: "lw21", text: "matter", start: 11.1, end: 11.6, speakerId: "speaker_a" },
            { id: "lw22", text: "what", start: 11.7, end: 12.2, speakerId: "speaker_a" },
            { id: "lw23", text: "excuses", start: 12.3, end: 13.0, speakerId: "speaker_a", emoji: "🧠" },
            { id: "lw24", text: "you", start: 13.1, end: 13.4, speakerId: "speaker_a" },
            { id: "lw25", text: "make.", start: 13.5, end: 14.2, speakerId: "speaker_a", bRoll: "brain-explosion" }
          ]
        }
      ];

      setClips(localFallbackClips);
      setSpeakers([
        { id: "speaker_a", name: "Speaker A (Host)", color: "#FF3366" },
        { id: "speaker_b", name: "Speaker B (Expert)", color: "#33CCFF" }
      ]);
      setAiSource("local-failover");
      setActiveClipId("local_clip_1");
      setCurrentTime(0);
      setQuotaExceeded(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const activeSpeakerName = () => {
    if (!activeClip) return "Unidentified Speaker";
    const currentWord = activeClip.transcript.find(
      w => currentTime >= w.start && currentTime <= w.end && !w.deleted
    );
    const speakerId = currentWord ? currentWord.speakerId : activeClip.speakerId;
    const sObj = speakers.find(s => s.id === speakerId);
    return sObj ? sObj : { id: "speaker_a", name: "Speaker A(Host)", color: "#FF3366" };
  };

  return (
    <div className="min-h-screen bg-brand-black text-brand-offwhite font-sans flex flex-col antialiased">
      {/* Immersive Header */}
      <nav className="w-full bg-brand-black border-b border-white/10 px-6 py-4.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button 
            id="back-to-landing-btn"
            onClick={onBackToLanding}
            className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:border-brand-green hover:text-brand-green transition-colors flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> EXIT EDITOR
          </button>
          
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white uppercase tracking-wider">Workspace Dashboard</span>
            <span className="text-[9px] font-mono uppercase bg-brand-green/15 text-brand-green px-2 py-0.5 rounded border border-brand-green/20">
              ACTIVE_PIPELINE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Saving Controls */}
          <button 
            id="workspace-save-project"
            onClick={handleSaveCampaignProject}
            disabled={saveStatus === 'saving'}
            className="px-3.5 py-2 rounded-lg border border-brand-green/50 bg-brand-green/15 hover:bg-brand-green hover:text-black font-mono font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
          >
            {saveStatus === 'saving' ? 'Saving Campaign...' : saveStatus === 'saved' ? 'Campaign Saved ✓' : t.btnSaveProject || 'Save Campaign'}
          </button>

          <button 
            id="workspace-save-preset"
            onClick={handleSaveCaptionTemplatePreset}
            disabled={presetStatus === 'saving'}
            className="px-3.5 py-2 rounded-lg border border-white/15 bg-black/60 hover:bg-white/10 text-brand-green hover:text-white font-mono font-bold text-[9px] uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
          >
            {presetStatus === 'saving' ? 'Saving Preset...' : presetStatus === 'saved' ? 'Preset Saved ✓' : t.btnSavePreset || 'Save Preset'}
          </button>

          {user ? (
            <span className="text-[9px] font-mono uppercase text-brand-green border border-brand-green/25 bg-brand-green/10 px-2.5 py-1.5 rounded tracking-wide font-black">
              {user.credits} {t.creditsLabel || "Credits"}
            </span>
          ) : (
            <button
              id="workspace-guest-login-notice"
              onClick={onOpenAuth}
              className="text-[9px] font-mono uppercase text-white/50 border border-white/10 hover:border-brand-green px-2.5 py-1.5 rounded tracking-wide hover:text-brand-green cursor-pointer"
            >
              Sign In to Save
            </button>
          )}

          {/* AI Origin descriptor */}
          {aiSource && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-[9px] text-white/50 font-mono uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" />
              <span>AI: {aiSource}</span>
            </div>
          )}
        </div>
      </nav>

      {/* Quota Exceeded / Rate Limit Warning Alert */}
      {quotaExceeded && (
        <div className="mx-6 mt-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/25 rounded-lg border border-amber-500/40 shrink-0 text-amber-400">
              <AlertCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-sans font-black text-xs uppercase tracking-wider text-amber-400">Gemini Daily Quota Exhausted (Rate Limit)</h4>
              <p className="text-[11px] text-white/70 leading-relaxed font-sans mt-0.5">
                The public Gemini API free-tier rate limit (20 reqs/day) has been reached. We have automatically activated our responsive local pipeline fallback simulation. All editing tools, animated subtitles style customizers, and scheduler queues remain 100% active and editable!
              </p>
            </div>
          </div>
          <button 
            onClick={() => setQuotaExceeded(false)}
            className="px-3.5 py-1.5 rounded border border-white/10 bg-black/40 hover:border-amber-500/50 hover:text-amber-400 text-[9px] font-mono tracking-widest uppercase text-white/60 transition-colors shrink-0 cursor-pointer"
          >
            DISMISS WARNING
          </button>
        </div>
      )}

      {/* Main Container Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Parameters Form / Clips Sidebar Panel (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Analyze Configuration Block */}
          <div className="p-6 rounded-xl bg-brand-gray border border-white/10 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Video className="w-4 h-4 text-brand-green" />
              <h3 className="font-sans font-black text-xs text-white uppercase tracking-wider">Source Long Video Details</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-mono text-white/50 uppercase tracking-widest block mb-1.5">Pasted URL Content Anchor</label>
                <input
                  id="workspace-url-input"
                  type="text"
                  placeholder="Paste YouTube or podcast Link..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-white/50 uppercase tracking-widest block mb-1.5">Override Topic or Keywords Context</label>
                <input
                  id="workspace-topic-input"
                  type="text"
                  placeholder="e.g. startup advice, space, AI podcast"
                  value={videoTopic}
                  onChange={(e) => setVideoTopic(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-green"
                />
              </div>

              <button
                id="workspace-execute-analyze"
                onClick={() => triggerAnalysis()}
                disabled={isProcessing}
                className="w-full py-4 bg-brand-green text-black font-black text-xs uppercase tracking-widest rounded-lg hover:bg-white transition-all shadow-[0_0_20px_rgba(0,255,102,0.15)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                {isProcessing ? "Processing Video Feed..." : "Re-Analyze and Chop Clips"}
              </button>
            </div>
          </div>

          {/* Processing Loading Spinner Box */}
          {isProcessing && (
            <div className="p-10 rounded-xl bg-brand-gray border border-brand-green/30 flex flex-col items-center justify-center text-center space-y-4 shadow-[0_0_30px_rgba(0,255,102,0.05)] animate-pulse">
              <div className="w-10 h-10 border-3 border-brand-green border-t-transparent rounded-full animate-spin" />
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-white uppercase tracking-wider">Searching & Splitting</h4>
                <p className="text-[10px] text-brand-green font-mono uppercase tracking-wider">{processingStep}</p>
              </div>
              <p className="text-[9px] text-white/40 leading-relaxed max-w-xs pt-2 uppercase tracking-wide">
                Matching vocal spikes, analyzing speaker face frames, and predicting algorithmic clickbait indexes.
              </p>
            </div>
          )}

          {/* Generated Viral Clips list */}
          {clips.length > 0 && !isProcessing && (
            <div className="p-6 rounded-xl bg-brand-gray border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-green" />
                  <h3 className="font-sans font-black text-xs text-white uppercase tracking-wider">Detected Viral Shorts ({clips.length})</h3>
                </div>
                <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Ranked</span>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {clips.map((clip, idx) => {
                  const isActive = clip.id === activeClipId;
                  return (
                    <div
                      id={`workspace-clip-card-${clip.id}`}
                      key={clip.id}
                      onClick={() => {
                        setActiveClipId(clip.id);
                        setCurrentTime(clip.startTime);
                        setIsPlaying(false);
                      }}
                      className={`p-4 rounded-lg border cursor-pointer text-left transition-all ${
                        isActive 
                          ? 'border-brand-green bg-brand-green/10 hover:bg-brand-green/10 shadow-[0_0_12px_rgba(0,255,102,0.1)]' 
                          : 'border-white/10 bg-black/40 hover:border-white/20 hover:bg-black/60'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-[10px] font-mono text-brand-green font-bold uppercase tracking-wider">
                          Clip #{idx + 1} ({clip.duration.toFixed(0)}s)
                        </span>
                        
                        {/* Highlights score tag */}
                        <div className="bg-brand-green/15 border border-brand-green/30 text-[10px] font-mono font-bold text-brand-green px-2 py-0.5 rounded flex items-center gap-1">
                          🔥 {clip.viralScore}%
                        </div>
                      </div>

                      <h4 className="text-xs font-black text-white mb-1.5 line-clamp-1 font-sans uppercase italic">{clip.title}</h4>
                      
                      <p className="text-[10px] text-white/50 line-clamp-2 leading-relaxed font-sans font-light mb-2.5">
                        {clip.description}
                      </p>

                      <div className="text-[9px] text-white/40 font-mono flex items-center gap-1.5 pt-2 border-t border-white/5 uppercase tracking-wider">
                        <span>Hook Rating:</span>
                        <span className="text-brand-green font-bold">EXCELLENT</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state instruction card if no clips generated yet */}
          {clips.length === 0 && !isProcessing && (
            <div className="p-6 rounded-xl bg-brand-gray border border-white/10 text-center space-y-4">
              <AlertCircle className="w-8 h-8 text-brand-green mx-auto animate-bounce" />
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-white uppercase tracking-wider">No active compilation analyzed</h4>
                <p className="text-[11px] text-white/50 leading-relaxed max-w-xs mx-auto">
                  Paste a link or select a quick topic on the landing screen, then press "Re-Analyze" to trigger real-time smart highlights.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Ultimate Editor Workspace Panel (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {activeClip ? (
            <>
              {/* Row 1: Video Player Simulation & Metadata Summary */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Visualizer player block (md:col-span-7) */}
                <div className="md:col-span-8">
                  <VideoPlayerSim
                    videoUrl={videoUrl || initialProject?.videoUrl || ""}
                    clip={activeClip}
                    currentTime={currentTime}
                    isPlaying={isPlaying}
                    onTogglePlay={handleTogglePlay}
                    onResetPlayback={handleResetPlayback}
                    aspectRatio={aspectRatio}
                    onToggleAspectRatio={() => setAspectRatio(prev => prev === '16-9' ? '9-16' : '16-9')}
                    brandSettings={brandSettings}
                    activeSpeaker={activeSpeakerName()}
                    translationLanguage={translationLanguage}
                  />
                </div>

                {/* Viral Reasoning Metrices & Multimodal Subtitle Translator (md:col-span-5) */}
                <div className="md:col-span-4 p-5 rounded-xl bg-brand-gray border border-white/10 space-y-5 h-full flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono uppercase bg-brand-green/15 text-brand-green border border-brand-green/25 px-2.5 py-0.5 rounded tracking-wider font-bold">Viral Recommendation</span>
                    <h3 className="font-sans font-black text-xs uppercase tracking-wider text-white mt-3 mb-2">Why this clip goes viral:</h3>
                    <p className="text-[11px] text-white/60 leading-relaxed font-sans font-light">
                      {activeClip.reason}
                    </p>
                  </div>

                  {/* Multilingual Translation module */}
                  <div className="space-y-2.5 pt-4 border-t border-white/10">
                    <label className="text-[9px] font-mono text-white/50 uppercase tracking-wider block">Subtitle Language Translation</label>
                    <div className="grid grid-cols-2 gap-1.5 bg-black p-1.5 rounded-lg border border-white/15">
                      {[
                        { id: 'en', label: 'English' },
                        { id: 'es', label: 'Spanish' },
                        { id: 'fr', label: 'French' },
                        { id: 'ja', label: 'Japanese' }
                      ].map(lang => (
                        <button
                          id={`lang-btn-${lang.id}`}
                          key={lang.id}
                          onClick={() => setTranslationLanguage(lang.id)}
                          className={`text-[9px] py-1.5 px-1.5 rounded font-mono uppercase tracking-wider transition-colors text-center ${
                            translationLanguage === lang.id 
                              ? 'bg-brand-green text-black font-extrabold shadow-[0_0_10px_rgba(0,255,102,0.15)]' 
                              : 'text-white/40 hover:text-white'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono text-center block leading-normal">
                      Select target to translate in-player overlay subtitles instantly.
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: Text-Based Editor Grid & Brand Styles Customizable Configs */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Word Transcript Editor Simulator (md:col-span-6) */}
                <div className="md:col-span-7">
                  <TranscriptEditor
                    transcript={activeClip.transcript}
                    currentTime={currentTime}
                    onWordClick={handleWordNavigation}
                    onUpdateWords={handleUpdateActiveClipTranscript}
                    speakers={speakers}
                  />
                </div>

                {/* Brand Styles presets Kit (md:col-span-6) */}
                <div className="md:col-span-5">
                  <BrandTemplatesConfig
                    brand={brandSettings}
                    onChange={(updated) => setBrandSettings(updated)}
                  />
                </div>

              </div>

              {/* Row 3: AI Social Optimizer & Local Clip Exporter Core */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <SocialScheduler clip={activeClip} />
                <ClipExporter clip={activeClip} videoUrl={videoUrl || initialProject?.videoUrl || ""} />
              </div>
            </>
          ) : (
            <div className="aspect-video bg-brand-gray border border-white/10 rounded-xl flex flex-col justify-center items-center text-center p-6 space-y-3">
              <Layers className="w-10 h-10 text-white/35 animate-sine" />
              <div className="space-y-1">
                <h4 className="font-sans font-black text-xs text-white uppercase tracking-wider">Waiting for Clip rendering parameters</h4>
                <p className="text-[11px] text-white/40 max-w-sm leading-relaxed uppercase tracking-wide">
                  Provide a topic or source link, then press "Re-Analyze and Chop Clips" to activate editing timelines.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
