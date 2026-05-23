import React, { useState } from 'react';
import { 
  Video, Sparkles, TrendingUp, Type, Layers, Users, FileText, 
  Share2, Maximize2, Globe, Palette, Smile, ArrowRight, CheckCircle2,
  Tv, Eye, Play, Pause, ChevronRight, Minimize2, Trash
} from 'lucide-react';
import { translations } from './Translations';

interface LandingPageProps {
  onStart: (initialTopic?: string) => void;
  lang: 'en' | 'hi';
  onLangToggle: () => void;
  user: { email: string; name: string; credits: number; tier: string } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onGoToDashboard: () => void;
  onOpenPricing: () => void;
}

export default function LandingPage({ 
  onStart, 
  lang, 
  onLangToggle, 
  user, 
  onOpenAuth, 
  onLogout, 
  onGoToDashboard, 
  onOpenPricing 
}: LandingPageProps) {
  const t = translations[lang];
  // Demo states for in-landing micro-interactions
  const [resizeMode, setResizeMode] = useState<'16-9' | '9-16'>('16-9');
  const [activeCaptionPreset, setActiveCaptionPreset] = useState<'glow' | 'impact' | 'neon'>('glow');
  const [deletedWords, setDeletedWords] = useState<string[]>([]);
  const [facePosition, setFacePosition] = useState<number>(50); // percentage X

  // Sample words for the landing transcript simulator
  const initialWords = ["We", "have", "to", "build", "something", "insanely", "cool", "right", "now", "without", "any", "excuses."];

  const toggleResize = () => {
    setResizeMode(prev => prev === '16-9' ? '9-16' : '16-9');
    // Randomize face center to show tracker activity
    setFacePosition(prev => prev === 50 ? 32 : 50);
  };

  const handleWordDelete = (word: string) => {
    if (deletedWords.includes(word)) {
      setDeletedWords(deletedWords.filter(w => w !== word));
    } else {
      setDeletedWords([...deletedWords, word]);
    }
  };

  const featureCards = [
    {
      id: "clip-gen",
      icon: <Video className="w-6 h-6 text-emerald-400" />,
      badge: "Viral #1",
      title: "AI Clip Generator",
      description: "Paste YouTube, Podcast, Webinar or any MP4 links. AI immediately searches, clips and spits out beautiful Shorts, Reels and TikTok videos."
    },
    {
      id: "highlight-detector",
      icon: <TrendingUp className="w-6 h-6 text-purple-400" />,
      badge: "Core AI",
      title: "Auto Viral Highlights",
      description: "No manual scrolling. Our proprietary neural scoring models detect emotional shifts, funny moments, powerful quotes, and visual hooks."
    },
    {
      id: "word-subtitles",
      icon: <Type className="w-6 h-6 text-amber-400" />,
      badge: "Stylized",
      title: "Auto Captions & Subtitles",
      description: "Generate breathtaking word-by-word animated captions, high-tempo karaoke styles, and color-matched emojis instantly in 40+ languages."
    },
    {
      id: "auto-resize",
      icon: <Maximize2 className="w-6 h-6 text-blue-400" />,
      badge: "9:16 Crop",
      title: "Auto Vertical Resize",
      description: "Smooth portrait cropping from 16:9 backdrops. Keeps key visual subjects perfectly composed for vertical screens."
    },
    {
      id: "speaker-tracking",
      icon: <Users className="w-6 h-6 text-pink-400" />,
      badge: "Speaker Lock",
      title: "AI Speaker Detection",
      description: "Automatically tags who is talking and tracks faces down to the millisecond, shifting frames dynamically to center talking heads."
    },
    {
      id: "doc-editing",
      icon: <FileText className="w-6 h-6 text-cyan-400" />,
      badge: "No Timeline",
      title: "Text-Based Editing",
      description: "Delete words, sentences or filler gaps ('uhm', 'so') directly from your text transcript to cut the corresponding video footage instantly."
    },
    {
      id: "seo-optimization",
      icon: <Sparkles className="w-6 h-6 text-violet-400" />,
      badge: "SEO Magic",
      title: "AI Social Optimization",
      description: "Auto-generates high-CTR clickbait titles, platform hashtags, and magnetic descriptions customized for YouTube Shorts, IG and TikTok."
    },
    {
      id: "social-posting",
      icon: <Share2 className="w-6 h-6 text-red-400" />,
      badge: "Direct Sync",
      title: "Direct Social Posting",
      description: "Schedule posts, publish with single-click ease, and push exports safely to your favorite networks with built-in integrations."
    },
    {
      id: "reframing-matrix",
      icon: <Tv className="w-6 h-6 text-indigo-400" />,
      badge: "Dual Lens",
      title: "AI Reframing Focus",
      description: "Intelligent horizontal-to-portrait crops. Centered face locking prevents subjects from drifting outside mobile viewing windows."
    },
    {
      id: "translation",
      icon: <Globe className="w-6 h-6 text-teal-400" />,
      badge: "40+ Dialects",
      title: "Multi-Language Translators",
      description: "Instantly translate subtitles, transcriptions, and generated descriptions to reach visual consumers globally."
    },
    {
      id: "brand-presets",
      icon: <Palette className="w-6 h-6 text-orange-400" />,
      badge: "Templates",
      title: "Custom Brand Templates",
      description: "Save customized typography layouts, watermarks, brand logos, primary color presets and transitions to maintain visual consistency."
    },
    {
      id: "browser-editor",
      icon: <Layers className="w-6 h-6 text-yellow-500" />,
      badge: "Full Suite",
      title: "Online Video Editor",
      description: "Timeline trim, bespoke canvas resizing, layer overlay grids, title integrations, and manual video tuning in a unified web bundle."
    },
    {
      id: "audio-broll",
      icon: <Smile className="w-6 h-6 text-rose-400" />,
      badge: "Smart Assets",
      title: "AI B-Roll & Emojis",
      description: "Auto-inject background contextual B-roll clips and humorous emotional emojis in sync with jokes, shocks or climaxes."
    },
    {
      id: "massive-repurposing",
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
      badge: "Multiplication",
      title: "Content Repurposing Multiplier",
      description: "Transform 1 single video into 20+ viral short clips instantly. Slay fatigue, feed algorithms, and multiply traffic on autopilot."
    }
  ];

  const [pastedUrl, setPastedUrl] = useState('');

  return (
    <div className="min-h-screen bg-brand-black text-brand-offwhite flex flex-col font-sans overflow-x-hidden antialiased">
      {/* Header */}
      <nav id="navbar" className="w-full border-b border-white/10 bg-brand-black/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(0,255,102,0.4)]">
              <div className="w-3 h-3 bg-black rounded-sm rotate-45"></div>
            </div>
            <span className="font-sans font-black text-xl tracking-tighter text-white flex items-center gap-1.5 cursor-pointer" onClick={onGoToDashboard}>
              VIRACLIP.AI <span className="text-[9px] font-mono font-bold bg-brand-green/10 text-brand-green border border-brand-green/20 px-2 py-0.5 rounded-full uppercase tracking-widest">{t.engineBadge}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Lang switcher */}
            <button
              id="lang-selector-btn"
              onClick={onLangToggle}
              className="px-3 py-1.5 rounded border border-white/10 text-[10px] font-mono hover:bg-white/5 uppercase tracking-widest flex items-center gap-1 cursor-pointer text-brand-green"
            >
              <Globe className="w-3.5 h-3.5" /> {lang === 'en' ? 'हिन्दी' : 'English'}
            </button>

            {user ? (
              <>
                <button
                  id="navbar-dashboard-redirect"
                  onClick={onGoToDashboard}
                  className="px-4 py-2 border border-brand-green text-brand-green hover:bg-brand-green hover:text-black font-sans font-black text-xs uppercase tracking-wider rounded-full transition-all cursor-pointer"
                >
                  {t.myDashboard}
                </button>
                
                <button
                  id="navbar-pricing-btn"
                  onClick={onOpenPricing}
                  className="px-4 py-2 text-white/70 hover:text-white font-sans text-xs uppercase tracking-wider cursor-pointer"
                >
                  {t.pricingHeader.split(' ')[0]} ({user.credits} CR)
                </button>

                <button
                  id="navbar-logout-btn"
                  onClick={onLogout}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-full text-xs font-mono uppercase cursor-pointer"
                >
                  {t.logout}
                </button>
              </>
            ) : (
              <>
                <button
                  id="navbar-login-btn"
                  onClick={onOpenAuth}
                  className="px-4 py-2 bg-brand-green text-black hover:bg-white font-sans font-black text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer"
                >
                  {t.btnSignIn}
                </button>
              </>
            )}

            <button 
              id="launch-editor-button" 
              onClick={() => onStart()}
              className="group hidden sm:flex items-center gap-1.5 px-6 py-2 bg-white text-black font-bold rounded-full text-xs hover:bg-brand-green tracking-wide transition-all shadow-md cursor-pointer"
            >
              {t.launchEditor || "LAUNCH EDITOR"}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="max-w-6xl mx-auto px-6 pt-20 pb-12 text-center relative">
        <span className="text-brand-green font-mono text-xs tracking-[0.3em] uppercase mb-4 inline-block">{t.heroSub}</span>

        <h1 className="font-sans text-4xl sm:text-6xl font-black text-white tracking-tighter leading-[0.95] mb-8 italic uppercase max-w-4xl mx-auto" style={{ wordBreak: 'keep-all' }}>
          {t.heroHeading}<br />
          <span className="text-brand-green">{t.heroHeadingHighlight}</span><br />
          {t.heroHeadingTail}
        </h1>

        <p className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-sans font-light">
          {t.heroDescription}
        </p>

        {/* Long Video Input Bar */}
        <div className="max-w-3xl mx-auto p-4 bg-white/5 border border-white/10 rounded-xl shadow-2xl backdrop-blur-md mb-12">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2">
              <Video className="w-5 h-5 text-white/40 shrink-0" />
              <input 
                id="landing-video-url-input"
                type="text" 
                placeholder={t.inputPlaceholder}
                value={pastedUrl}
                onChange={e => setPastedUrl(e.target.value)}
                className="w-full bg-transparent border-none text-white placeholder-white/20 focus:outline-none focus:ring-0 text-sm font-sans"
              />
            </div>
            <button 
              id="analyze-init-button"
              onClick={() => onStart(pastedUrl || undefined)}
              className="px-6 py-4 bg-brand-green text-black font-black text-sm tracking-wider uppercase rounded-lg hover:bg-white shadow-[0_0_40px_rgba(0,255,102,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {t.btnAnalyze} <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feature Suggest Quick-Tags */}
        <div className="flex items-center justify-center flex-wrap gap-2.5 max-w-2xl mx-auto text-xs text-white/40">
          <span className="text-white/30 font-mono text-[10px] uppercase tracking-[0.15em] pr-1">{t.samplesLabel}:</span>
          {[t.techAdv, t.scalingRules, t.creatorVlog].map((preset, i) => (
            <button
              id={`quick-start-preset-${i}`}
              key={preset}
              onClick={() => onStart(preset)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-brand-green text-[10px] font-mono text-white/70 hover:text-brand-green transition-all uppercase tracking-wider cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>
      </section>

      {/* Embedded Live Features Simulator Playground */}
      <section id="interactive-demos" className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-white font-sans tracking-tighter uppercase italic">
            See the Magic in Action
          </h2>
          <p className="text-white/50 text-sm mt-2 max-w-md mx-auto">
            Test three critical automated AI features below before scheduling your first rendering queue.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Interactive Demo Column 1: Resize & Face Tracking */}
          <div className="p-6 rounded-2xl bg-brand-gray border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] bg-brand-green/10 text-brand-green border border-brand-green/20 px-2.5 py-1 rounded-full font-mono font-bold tracking-wider uppercase">Feature #4 & #5 Preview</span>
                <button 
                  id="toggle-resize-btn" 
                  onClick={toggleResize}
                  className="px-2.5 py-1 rounded-full bg-white text-black font-bold text-[10px] uppercase hover:bg-brand-green transition-colors"
                >
                  Toggle Format
                </button>
              </div>
              <h3 className="text-lg font-black text-white mb-2 font-sans uppercase italic">AI Reframing & Speaker Target</h3>
              <p className="text-white/50 text-xs mb-6">
                Detects speakers and reframes horizontal 16:9 recordings gracefully into eye-catching vertical 9:16 portrait feeds automatically.
              </p>
            </div>

            {/* Visualizer Frame */}
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
              {/* Outer horizontal 16:9 video mock representation */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-black via-white/5 to-white/5" />
              
              {/* Speakers placeholders */}
              <div className="absolute left-[25%] -translate-x-1/2 flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/20 flex items-center justify-center font-bold text-xs text-white">A</div>
                <span className="text-[10px] text-white/60 font-mono bg-black/80 px-1 py-0.5 rounded">Host (32%)</span>
              </div>

              <div className="absolute left-[75%] -translate-x-1/2 flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/20 flex items-center justify-center font-bold text-xs text-white">B</div>
                <span className="text-[10px] text-white/60 font-mono bg-black/80 px-1 py-0.5 rounded">Guest (75%)</span>
              </div>

              {/* Speaker tracking viewport box helper */}
              {resizeMode === '9-16' ? (
                <div 
                  style={{ left: `${facePosition}%` }}
                  className="absolute top-0 bottom-0 w-[42%] border-2 border-brand-green bg-brand-green/5 -translate-x-1/2 transition-all duration-700 shadow-[0_0_20px_rgba(0,255,102,0.25)] flex flex-col justify-between p-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-mono text-black bg-brand-green px-1 rounded font-bold uppercase">9:16 View</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-ping" />
                  </div>
                  <div className="w-full text-center pb-2">
                    <span className="text-[8px] font-mono text-brand-green bg-black/90 px-1.5 py-0.5 rounded uppercase tracking-wider">AUTO_TRACKING</span>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 border border-white/20 bg-white/2 p-2 flex flex-col justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-mono text-white/60 bg-black px-1 border border-white/10 rounded uppercase">16:9 Wide</span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-white/40 text-[10px] font-mono text-center mt-3 uppercase tracking-wider">
              {resizeMode === '16-9' ? "Original Widescreen Video Mode Ready" : `Track locked on Speaker (X: ${facePosition}%)`}
            </div>
          </div>

          {/* Interactive Demo Column 2: Transcript Text-Based Editing */}
          <div className="p-6 rounded-2xl bg-brand-gray border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] bg-brand-green/10 text-brand-green border border-brand-green/20 px-2.5 py-1 rounded-full font-mono font-bold tracking-wider uppercase">Feature #6 Preview</span>
                <button 
                  id="reset-words-btn" 
                  onClick={() => setDeletedWords([])}
                  className="text-white/40 hover:text-brand-green text-[10px] font-mono uppercase tracking-wider"
                >
                  Reset Transcript
                </button>
              </div>
              <h3 className="text-lg font-black text-white mb-2 font-sans uppercase italic">Text-Based Editing</h3>
              <p className="text-white/50 text-xs mb-6">
                Edit video like editing a doc. Try clicking unnecessary or filler words below to slice them right out of the simulated timeline.
              </p>
            </div>

            {/* Transcript Simulator */}
            <div className="p-4 rounded-xl bg-black/80 border border-white/10 flex flex-wrap gap-2.5 mb-4 align-middle">
              {initialWords.map((word) => {
                const isDel = deletedWords.includes(word);
                return (
                  <button
                    id={`word-del-btn-${word}`}
                    key={word}
                    onClick={() => handleWordDelete(word)}
                    className={`group relative text-xs px-2.5 py-1.5 rounded border transition-all flex items-center gap-1 font-mono uppercase tracking-wider ${
                      isDel 
                        ? 'border-red-950/40 bg-red-950/25 text-red-500/60 line-through' 
                        : 'border-white/10 bg-white/5 text-white/80 hover:border-red-500/40 hover:text-red-300'
                    }`}
                  >
                    {word}
                    <Trash className={`w-3 h-3 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ${isDel ? 'hidden' : 'block'}`} />
                  </button>
                );
              })}
            </div>

            <div className="p-3.5 rounded-xl bg-black border border-white/10 text-center">
              <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest block mb-1.5">Impact on Timeline:</span>
              <div className="flex gap-1 items-center h-2 bg-black rounded-full overflow-hidden p-0.5 border border-white/10">
                {initialWords.map((word) => {
                  const isDel = deletedWords.includes(word);
                  return (
                    <div 
                      key={word} 
                      className={`h-full rounded-sm flex-1 transition-all duration-300 ${isDel ? 'bg-red-500/10 w-0' : 'bg-brand-green'}`} 
                    />
                  );
                })}
              </div>
              <span className="text-[10px] text-white/40 font-mono mt-2 block uppercase tracking-wider">
                {deletedWords.length > 0 ? `Deleted ${deletedWords.length} sections / Cut ${deletedWords.length * 1.5}s` : "Select words to simulate cuts"}
              </span>
            </div>
          </div>

          {/* Interactive Demo Column 3: Auto Captions styles */}
          <div className="p-6 rounded-2xl bg-brand-gray border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] bg-brand-green/10 text-brand-green border border-brand-green/20 px-2.5 py-1 rounded-full font-mono font-bold tracking-wider uppercase">Feature #3 Preview</span>
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Live Selector</span>
              </div>
              <h3 className="text-lg font-black text-white mb-2 font-sans uppercase italic">Adaptive Captions</h3>
              <p className="text-white/50 text-xs mb-4">
                Instantly switch styles to match your target platform. Pick a style below to see how words render for high social engagement.
              </p>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { id: 'glow', label: 'Neon Glow' },
                { id: 'impact', label: 'Beast Impact' },
                { id: 'neon', label: 'Speed Yellow' }
              ].map(p => (
                <button
                  id={`preset-landing-${p.id}`}
                  key={p.id}
                  onClick={() => setActiveCaptionPreset(p.id as any)}
                  className={`text-[10px] py-2 rounded border font-mono uppercase tracking-wider transition-all ${
                    activeCaptionPreset === p.id 
                      ? 'border-brand-green bg-brand-green/15 text-brand-green font-bold shadow-[0_0_12px_rgba(0,255,102,0.15)]' 
                      : 'border-white/10 bg-black text-white/60 hover:border-white/25'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Render Preview Text */}
            <div className="p-6 rounded-xl bg-black border border-white/10 text-center flex items-center justify-center min-h-[110px]">
              {activeCaptionPreset === 'glow' && (
                <div className="font-sans font-black text-2xl tracking-tighter text-white drop-shadow-[0_0_15px_rgba(0,255,102,0.8)] animate-pulse uppercase italic">
                  THAT IS <span className="text-brand-green">INSANE</span> 🤯
                </div>
              )}
              {activeCaptionPreset === 'impact' && (
                <div className="font-serif italic font-black text-3xl uppercase tracking-tighter text-white p-2 border border-white/20 bg-brand-gray inline-block rotate-[-2deg]">
                  MUST WATCH 🔥
                </div>
              )}
              {activeCaptionPreset === 'neon' && (
                <div className="font-mono font-bold text-sm text-brand-green tracking-widest uppercase">
                  [ STEP 1 ] : <span className="bg-brand-green text-black px-1.5 py-0.5 rounded font-black">START</span> TODAY.
                </div>
              )}
            </div>

            <div className="text-white/40 text-[10px] font-mono text-center mt-3 uppercase tracking-wider">
              Caption render matches preset styles.
            </div>
          </div>

        </div>
      </section>

      {/* Grid of the 14 High Fidelity Features */}
      <section id="features-bento-grid" className="max-w-7xl mx-auto px-6 py-16 border-t border-white/10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter font-sans uppercase italic">
            Completely Loaded Creator Engine
          </h2>
          <p className="text-white/50 text-sm mt-3 leading-relaxed">
            Fourteen core AI automation engines working in absolute synchronization behind the scenes to maximize virality and engagement metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featureCards.map((card, i) => (
            <div 
              id={`feature-card-${card.id}`}
              key={card.id} 
              className="p-6 rounded-xl bg-brand-gray border border-white/10 hover:border-brand-green/45 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-5">
                  <div className="p-2.5 rounded-xl bg-black border border-white/15 group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <span className="text-[9px] font-mono font-bold text-brand-green bg-brand-green/10 border border-brand-green/20 px-2.5 py-0.5 rounded-full tracking-wider uppercase">
                    {card.badge}
                  </span>
                </div>
                
                <h3 className="font-sans font-black text-base text-white tracking-tight mb-2 uppercase italic group-hover:text-brand-green transition-colors">
                  {i + 1}. {card.title}
                </h3>
                
                <p className="text-xs text-white/50 leading-relaxed font-sans font-light">
                  {card.description}
                </p>
              </div>

              <div className="pt-4 flex items-center gap-1 text-[10px] font-mono text-brand-green group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity mt-4 uppercase tracking-wider">
                Launch Editor Demo <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section id="footer-cta" className="bg-brand-black py-16 relative border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="p-10 rounded-2xl bg-brand-gray border border-white/10 backdrop-blur-sm relative overflow-hidden">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tighter mb-4 uppercase italic">
              Ready to automate your social presence?
            </h2>
            <p className="text-white/50 text-sm sm:text-base max-w-xl mx-auto mb-8 font-light leading-relaxed">
              Stop wasting hundreds of hours cutting and reframing clips. Experience zero friction content multiplication now with high-contrast, beautiful editorial templates.
            </p>

            <button 
              id="cta-bottom-start-btn" 
              onClick={() => onStart()}
              className="px-8 py-4 rounded-lg bg-brand-green text-black font-black text-xs uppercase tracking-widest hover:bg-white shadow-[0_0_30px_rgba(0,255,102,0.25)] transition-all inline-flex items-center gap-2"
            >
              Start Generating for Free <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Humble aesthetic footer */}
      <footer id="footer" className="w-full py-10 border-t border-white/10 bg-brand-black text-center text-[10px] text-white/40 font-mono tracking-widest uppercase">
        <p>© 2026 ViraClip platform. Powered by Google AI Studio Gemini 3.5 Models.</p>
        <p className="mt-1.5 text-white/20">Enterprise grade auto clips rendering cloud infrastructure.</p>
      </footer>
    </div>
  );
}
