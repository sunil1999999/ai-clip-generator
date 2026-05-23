import React from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Headphones, User, Maximize2, Crop, Sparkles, Smile, Image } from 'lucide-react';
import { Word, Clip, BrandTemplate } from '../types';

interface VideoPlayerSimProps {
  videoUrl?: string;
  clip: Clip;
  currentTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onResetPlayback: () => void;
  aspectRatio: '16-9' | '9-16';
  onToggleAspectRatio: () => void;
  brandSettings: BrandTemplate;
  activeSpeaker: { id: string; name: string; color: string };
  translationLanguage: string;
}

// Translations dictionaries
const translations: Record<string, Record<string, string>> = {
  es: {
    "Look,": "Mira,",
    "this": "este",
    "is": "es",
    "the": "el",
    "single": "único",
    "most": "más",
    "important": "importante",
    "trend": "tendencia",
    "of": "de",
    "our": "nuestra",
    "generation.": "generación.",
    "And": "Y",
    "if": "si",
    "you": "tú",
    "are": "estás",
    "not": "no",
    "capitalizing": "aprovechando",
    "on": "en",
    "it,": "ello,",
    "you're": "te estás",
    "getting": "quedando",
    "left": "atrás",
    "behind.": "por completo.",
    "It's": "Es",
    "mind-blowing,": "alucinante,",
    "completely": "totalmente",
    "wild.": "salvaje.",
    "Let's": "Vamos a",
    "break": "desglosar",
    "down": "detalladamente",
    "exactly": "exactamente",
    "how": "cómo",
    "to": "para",
    "master": "dominar",
    "starting": "comenzando",
    "today.": "hoy.",
    "Ready?": "¿Listo?",
    "Wait": "Espera",
    "a": "un",
    "minute.": "minuto.",
    "Are": "¿De verdad",
    "we": "vamos",
    "really": "a",
    "going": "pretender",
    "pretend": "que",
    "there's": "no",
    "no": "hay",
    "downside?": "desventajas?",
    "Because": "Porque",
    "truth": "verdad",
    "is,": "es,",
    "it": "esto",
    "requires": "requiere",
    "thousands": "miles",
    "unseen": "horas de",
    "grind.": "esfuerzo invisible.",
    "Most": "La mayoría",
    "people": "quiere",
    "just": "la",
    "want": "gloria.",
    "glory.": "gloria.",
    "But": "Pero",
    "ready": "listo",
    "fail": "para",
    "ten": "fracasar",
    "times": "diez veces",
    "before": "antes de",
    "one": "una",
    "win?": "victoria?"
  },
  fr: {
    "Look,": "Regardez,",
    "this": "c'est",
    "is": "la",
    "the": "seule",
    "single": "tendance",
    "most": "la plus",
    "important": "importante",
    "trend": "de notre",
    "of": "génération.",
    "our": "notre",
    "generation.": "génération,",
    "And": "Et",
    "if": "si",
    "you": "vous",
    "are": "ne",
    "not": "capitalisez",
    "capitalizing": "pas",
    "on": "dessus,",
    "it,": "vous Êtes",
    "you're": "laissé",
    "getting": "de",
    "left": "côté.",
    "behind.": "derrière.",
    "It's": "C'est",
    "mind-blowing,": "incroyable,",
    "completely": "complètement",
    "wild.": "fou.",
    "Let's": "Décortiquons",
    "break": "ensemble",
    "down": "exactement",
    "exactly": "comment",
    "how": "le",
    "to": "maîtriser",
    "master": "dès",
    "starting": "commencer",
    "today.": "maintenant."
  },
  ja: {
    "Look,": "見てください、",
    "this": "これが",
    "is": "私たちの",
    "the": "世代で",
    "single": "唯一の",
    "most": "最も",
    "important": "重要な",
    "trend": "トレンドです。",
    "of": "もし",
    "our": "あなたが",
    "generation.": "これを活用して",
    "And": "いなければ、",
    "if": "取り残される",
    "you": "ことになります。",
    "are": "信じられない",
    "not": "ほど",
    "capitalizing": "素晴らしいです。",
    "on": "完全に",
    "it,": "クレイジーです。",
    "you're": "今日から",
    "getting": "どうやって",
    "left": "マスターするか",
    "behind.": "解説します。"
  }
};

export default function VideoPlayerSim({
  videoUrl,
  clip,
  currentTime,
  isPlaying,
  onTogglePlay,
  onResetPlayback,
  aspectRatio,
  onToggleAspectRatio,
  brandSettings,
  activeSpeaker,
  translationLanguage
}: VideoPlayerSimProps) {
  
  // High-fidelity Audio & Speech Synthesis States
  const [soundMode, setSoundMode] = React.useState<'original' | 'tts' | 'retro' | 'mute'>(() => {
    const saved = localStorage.getItem("viraclip_sound_mode");
    return (saved === 'original' || saved === 'tts' || saved === 'retro' || saved === 'mute') ? saved : 'original';
  });
  const [volume, setVolume] = React.useState<number>(() => {
    const saved = localStorage.getItem("viraclip_volume");
    return saved ? parseFloat(saved) : 0.8;
  });

  // Check if original video url is present (pasted link or file url)
  const isRealVideo = React.useMemo(() => {
    return !!(videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.toLowerCase().endsWith('.mp4') || videoUrl.startsWith('http')));
  }, [videoUrl]);

  // If playing a real original video, default to hiding cartoon face avatars for full 100% video focus
  const [showAvatars, setShowAvatars] = React.useState<boolean>(() => !isRealVideo);

  const lastSpokenWordIdRef = React.useRef<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Helper to extract YouTube video ID
  const getYoutubeId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getResolvedVideoUrl = () => {
    if (videoUrl && videoUrl.startsWith('http')) {
      if (getYoutubeId(videoUrl)) {
        return null; // Is YouTube
      }
      return videoUrl;
    }
    
    // Choose high-fidelity thematic podcast speaker video loops based on video topic/title keywords
    const lowerClipTitle = (clip.title || "").toLowerCase();
    const lowerTopic = (videoUrl || "").toLowerCase();
    
    if (lowerClipTitle.includes("vlog") || lowerTopic.includes("vlog") || lowerClipTitle.includes("creator")) {
      return "https://assets.mixkit.co/videos/preview/mixkit-woman-recording-a-podcast-in-a-studio-40339-large.mp4";
    }
    if (lowerClipTitle.includes("rule") || lowerTopic.includes("rule") || lowerClipTitle.includes("scale") || lowerClipTitle.includes("business")) {
      return "https://assets.mixkit.co/videos/preview/mixkit-news-anchor-talking-on-screen-in-a-studio-41712-large.mp4";
    }
    
    // Default podcaster loop (Speaker A/Host and general tech talk fits beautifully!)
    return "https://assets.mixkit.co/videos/preview/mixkit-man-holding-a-microphone-talking-34293-large.mp4";
  };

  const resolvedVideoUrl = getResolvedVideoUrl() || "https://assets.mixkit.co/videos/preview/mixkit-man-holding-a-microphone-talking-34293-large.mp4";
  const youtubeId = videoUrl ? getYoutubeId(videoUrl) : null;

  // Sync volume with HTML5 video
  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  // Sync mute with HTML5 video sound Mode
  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = soundMode !== 'original';
    }
  }, [soundMode]);

  // Sync playback triggers
  React.useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  // Seek video timing to align with currentTime
  React.useEffect(() => {
    if (!videoRef.current) return;
    if (Math.abs(videoRef.current.currentTime - currentTime) > 0.8) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  // Sync state to local storage
  React.useEffect(() => {
    localStorage.setItem("viraclip_sound_mode", soundMode);
  }, [soundMode]);

  React.useEffect(() => {
    localStorage.setItem("viraclip_volume", volume.toString());
  }, [volume]);

  // Clean-up synthesis on unmout
  React.useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Find current active word(s) based on matching start/end timestamps
  const activeWord = clip.transcript.find(
    w => currentTime >= w.start && currentTime <= w.end && !w.deleted
  );

  // Filter out deleted transcript words
  const visibleWords = clip.transcript.filter(w => !w.deleted);

  // Get translated word if applicable
  const getRenderWordText = (word: Word) => {
    if (translationLanguage !== 'en' && translations[translationLanguage]?.[word.text]) {
      return translations[translationLanguage][word.text];
    }
    return word.text;
  };

  // Play Speech Synthesis
  const playTTS = (text: string, speakerId: string, vol: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = vol;
      utterance.rate = 1.35; // fast-paced typical short speed
      
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        if (speakerId === 'speaker_b') {
          // Assigned Female-pitched dynamic voice
          const optVoice = voices.find(v => 
            v.name.toLowerCase().includes('female') || 
            v.name.toLowerCase().includes('zira') || 
            v.name.toLowerCase().includes('hazel') ||
            v.name.toLowerCase().includes('google')
          );
          if (optVoice) utterance.voice = optVoice;
          utterance.pitch = 1.2;
        } else {
          // Assigned Male-pitched dynamic voice
          const optVoice = voices.find(v => 
            v.name.toLowerCase().includes('male') || 
            v.name.toLowerCase().includes('david') || 
            v.name.toLowerCase().includes('mark') ||
            v.name.toLowerCase().includes('microsoft')
          );
          if (optVoice) utterance.voice = optVoice;
          utterance.pitch = 0.95;
        }
      } else {
        utterance.pitch = speakerId === 'speaker_b' ? 1.25 : 0.95;
      }
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis trigger error:", e);
    }
  };

  // Play cyber rhythmic inflection tones
  const playSynthBeep = (speakerId: string, vol: number) => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (speakerId === 'speaker_b') {
        osc.type = 'sine';
        const baseFreq = 250 + Math.random() * 60;
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        gain.gain.setValueAtTime(vol * 0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.07);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else {
        osc.type = 'triangle';
        const baseFreq = 140 + Math.random() * 30;
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        gain.gain.setValueAtTime(vol * 0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.11);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch (err) {
      // safe silent sound guard
    }
  };

  // Sound listener effect ticking on activeWord updates
  React.useEffect(() => {
    if (!isPlaying) {
      lastSpokenWordIdRef.current = null;
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (activeWord && activeWord.id !== lastSpokenWordIdRef.current && !activeWord.deleted) {
      lastSpokenWordIdRef.current = activeWord.id;
      
      if (soundMode !== 'mute' && volume > 0) {
        const wordText = getRenderWordText(activeWord);
        if (soundMode === 'tts') {
          playTTS(wordText, activeWord.speakerId, volume);
        } else if (soundMode === 'retro') {
          playSynthBeep(activeWord.speakerId, volume);
        }
      }
    }
  }, [activeWord, isPlaying, soundMode, volume]);

  // Speaker tracking calculation:
  // In 9:16 mode, we apply a horizontal translate to keep the speaking person centered.
  // Speaker A is centered at ~40% position. Speaker B is centered at ~70%.
  let focusOffsetPercent = 50; 
  if (activeWord) {
    if (activeWord.speakerId === 'speaker_b') {
      focusOffsetPercent = 70;
    } else {
      focusOffsetPercent = 38;
    }
  }

  // Active b-roll clip overlay representation
  const activeBRoll = activeWord?.bRoll;
  const activeEmoji = activeWord?.emoji;

  const fontStyleClass = () => {
    switch(brandSettings.fontFamily) {
      case 'Space Grotesk': return 'font-sans font-extrabold tracking-tight';
      case 'JetBrains Mono': return 'font-mono font-bold';
      case 'Playfair Display': return 'font-serif italic font-medium';
      default: return 'font-sans font-black';
    }
  };

  return (
    <div className="flex flex-col gap-4 text-white">
      {/* Player Screen Frame */}
      <div 
        className={`relative transition-all duration-500 bg-black rounded-xl border border-white/10 overflow-hidden flex items-center justify-center ${
          aspectRatio === '9-16' 
            ? 'aspect-[9/16] h-[480px] max-w-[270px] mx-auto shadow-2xl ring-2 ring-white/15' 
            : 'w-full aspect-video shadow-lg'
        }`}
      >
        
        {/* Original Widescreen Background Video Simulation */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black">
          
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?start=${Math.floor(clip.startTime)}&autoplay=${isPlaying ? 1 : 0}&mute=${soundMode === 'original' ? 0 : 1}&controls=0&showinfo=0&rel=0&enablejsapi=1`}
              className={`absolute h-full pointer-events-none z-0 transition-opacity duration-300 scale-105 ${showAvatars ? 'opacity-60' : 'opacity-100'}`}
              style={aspectRatio === '9-16' ? {
                width: '316%',
                top: 0,
                left: `${-108 - (focusOffsetPercent - 50) * 2.16}%`
              } : {
                width: '100%',
                top: 0,
                left: 0
              }}
              allow="autoplay; encrypted-media"
              title="Original YouTube Stream"
            />
          ) : (
            <video
              ref={videoRef}
              src={resolvedVideoUrl}
              className={`absolute w-full h-full object-cover z-0 transition-opacity duration-300 ${showAvatars ? 'opacity-60' : 'opacity-100'}`}
              style={{
                objectPosition: `${focusOffsetPercent}% center`,
              }}
              loop
              playsInline
            />
          )}

          {/* Dark scrim overlay for legibility of overlays and avatars */}
          <div className={`absolute inset-0 z-5 pointer-events-none transition-all duration-300 ${
            showAvatars 
              ? 'bg-gradient-to-t from-black via-black/40 to-black/75' 
              : 'bg-gradient-to-t from-black/80 via-transparent to-black/30'
          }`} />
          
          {/* Simulated background grids */}
          {showAvatars && (
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 z-5 pointer-events-none" />
          )}
          
          {/* Animated Wave in Background syncing with Play State */}
          {isPlaying && showAvatars && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-4/5 flex justify-center items-end gap-0.5 h-12 pointer-events-none opacity-30 z-5">
              {Array.from({ length: 40 }).map((_, i) => (
                <div 
                  key={i} 
                  style={{ height: `${Math.sin((currentTime * 8) + i) * 100}%` }} 
                  className="w-1.5 bg-brand-green rounded-full transition-all duration-300"
                />
              ))}
            </div>
          )}

          {/* Actual Speaker avatars in horizontal layout */}
          {showAvatars && (
            <div className="absolute inset-0 flex items-center justify-around px-8 z-10 pointer-events-none">
              
              {/* Speaker A */}
              <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${activeSpeaker.id === 'speaker_a' ? 'scale-110 opacity-100' : 'scale-95 opacity-50'}`}>
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-brand-green flex items-center justify-center shadow-[0_0_20px_rgba(0,255,102,0.2)]">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  {activeSpeaker.id === 'speaker_a' && isPlaying && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-green"></span>
                    </span>
                  )}
                </div>
                <div className="bg-black border border-white/10 px-3 py-1 rounded">
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Speaker A (Host)</span>
                </div>
              </div>

              {/* Speaker B */}
              <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${activeSpeaker.id === 'speaker_b' ? 'scale-110 opacity-100' : 'scale-95 opacity-50'}`}>
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-white/40 flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  {activeSpeaker.id === 'speaker_b' && isPlaying && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
                    </span>
                  )}
                </div>
                <div className="bg-black border border-white/10 px-3 py-1 rounded">
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Speaker B (Guest)</span>
                </div>
              </div>

            </div>
          )}

          {/* AI B-Roll Video Overlays Mock */}
          {activeBRoll && (
            <div className="absolute inset-0 bg-black border border-brand-green flex flex-col justify-center items-center p-4 z-20 animate-fade-in text-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-black to-black opacity-60" />
              <Image className="w-12 h-12 text-brand-green animate-pulse mb-3 z-10" />
              <span className="text-[10px] font-mono font-bold text-brand-green px-3 py-1 bg-brand-green/10 border border-brand-green/20 rounded-full mb-1 uppercase tracking-wider z-10">AI B-ROLL INTEGRATION</span>
              <h4 className="text-base font-black text-white uppercase tracking-wider z-10">[ SIMULATED FOOTAGE: {activeBRoll.replace("-", " ")} ]</h4>
              <p className="text-[10px] text-white/40 mt-1 max-w-xs z-10">Dynamic overlay injected to improve hook visual indices.</p>
            </div>
          )}

          {/* Brand Logo Watermark Overlay */}
          {brandSettings.logoUrl && (
            <div className={`absolute p-3 bg-black/95 border border-white/10 text-[9px] font-mono rounded flex items-center gap-1 text-white/80 z-10 ${
              brandSettings.logoPosition === 'top-left' ? 'top-3 left-3' :
              brandSettings.logoPosition === 'top-right' ? 'top-3 right-3' : 'bottom-3 right-3'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-brand-green animate-pulse" />
              {brandSettings.logoUrl}
            </div>
          )}

          {/* SPREAD OUT WORDS - CURRENT WORD HIGHLIGHT WATERMARK CAPTION BOX */}
          <div className="absolute bottom-1/4 left-0 right-0 p-4 text-center z-10">
            <div 
              id="caption-overlay-wrapper"
              style={{ 
                backgroundColor: brandSettings.backgroundColor,
                fontSize: `${brandSettings.fontSize}px`
              }} 
              className={`inline-block px-4 py-2 rounded-xl border transition-all ${fontStyleClass()}`}
            >
              {activeWord ? (
                <div className="flex items-center gap-2 justify-center flex-wrap">
                  {/* Suggest Emojis */}
                  {activeEmoji && (
                    <span className="text-3xl animate-bounce pr-1">{activeEmoji}</span>
                  )}
                  
                  <span 
                    style={{ 
                      color: brandSettings.primaryColor,
                      textShadow: `1px 1px 0px ${brandSettings.strokeColor}, -1px -1px 0px ${brandSettings.strokeColor}, 1px -1px 0px ${brandSettings.strokeColor}, -1px 1px 0px ${brandSettings.strokeColor}`
                    }}
                    className={`transition-colors drop-shadow-md duration-100 ${brandSettings.fontCase === 'uppercase' ? 'uppercase' : ''}`}
                  >
                    {getRenderWordText(activeWord)}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-white/40 font-mono uppercase tracking-widest">[ AUDIO SYNC LIVE ]</span>
              )}
            </div>
          </div>

        </div>

        {/* 16:9 ➔ 9:16 Vertical Crop Re-framer mask viewer (only visible when we are rendering raw horizontal background) */}
        {aspectRatio === '9-16' && (
          <div 
            style={{ left: `${focusOffsetPercent}%` }}
            className="absolute top-0 bottom-0 w-[42%] border-l border-r border-brand-green bg-brand-green/5 -translate-x-1/2 transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.9)] z-30 pointer-events-none"
          >
            {/* Crop Boundary Markers */}
            <div className="absolute top-2 left-2 bg-black/90 text-[8px] font-mono font-bold text-brand-green px-1.5 py-0.5 border border-brand-green/20 rounded uppercase">
              9:16 MOBILE VIEW
            </div>
            <div className="absolute bottom-2 right-2 bg-black/90 text-[8px] font-mono font-bold text-brand-green px-1.5 py-0.5 border border-brand-green/20 rounded flex items-center gap-1 text-right uppercase">
              <span className="w-1 h-1 rounded-full bg-brand-green animate-ping" />
              AUTO-REFRAMED
            </div>
            {/* Subtle Crop Grid lines */}
            <div className="absolute inset-0 border-l border-r border-dashed border-brand-green/20 grid grid-cols-3 grid-rows-3 opacity-35">
              <div className="border-r border-b border-brand-green/10"></div>
              <div className="border-r border-b border-brand-green/10"></div>
              <div className="border-b border-brand-green/10"></div>
              <div className="border-r border-b border-brand-green/10"></div>
              <div className="border-r border-b border-brand-green/10"></div>
              <div className="border-b border-brand-green/10"></div>
            </div>
          </div>
        )}

      </div>

      {/* Control Strip */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between p-4 bg-brand-gray border border-white/10 rounded-xl">
        {/* Playback Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <button 
              id="play-pause-btn" 
              onClick={onTogglePlay}
              className="p-3 bg-brand-green hover:bg-white rounded-lg transition-colors text-black cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.15)] hover:shadow-[0_0_20px_rgba(0,255,102,0.3)]"
              title={isPlaying ? "Pause simulation" : "Play simulation"}
            >
              {isPlaying ? <Pause className="w-4 h-4 text-black" /> : <Play className="w-4 h-4 text-black fill-black pr-0.5" />}
            </button>
            
            <button 
              id="reset-playback-btn"
              onClick={onResetPlayback}
              className="p-3 bg-white/5 hover:bg-white/15 text-white hover:text-brand-green rounded-lg border border-white/10 transition-colors cursor-pointer"
              title="Restart playback from start timestamp"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Current relative time counter */}
          <div className="font-mono text-xs text-white/50 bg-black px-3 py-2 rounded border border-white/10">
            <span className="text-brand-green font-semibold">{(currentTime).toFixed(2)}s</span>
            <span className="text-white/20 mx-1.5">/</span>
            {clip.endTime.toFixed(1)}s
          </div>
        </div>

        {/* Dynamic Interactive Audio Sim Workspace Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-black/40 border border-white/5 p-2 rounded-lg w-full sm:w-auto justify-center sm:justify-start">
          <div className="flex items-center gap-1">
            <Headphones className="w-3.5 h-3.5 text-brand-green animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 font-bold">Voice:</span>
          </div>
          
          <div className="flex bg-black rounded-md p-0.5 border border-white/15 text-[10px] gap-0.5">
            <button
              onClick={() => setSoundMode('original')}
              className={`px-2 py-1 rounded font-mono uppercase font-semibold transition-colors cursor-pointer ${soundMode === 'original' ? 'bg-brand-green text-black font-black' : 'text-white/60 hover:text-white'}`}
              title="Play original video audio track directly"
            >
              Original Audio
            </button>
            <button
              onClick={() => setSoundMode('tts')}
              className={`px-2 py-1 rounded font-mono uppercase font-semibold transition-colors cursor-pointer ${soundMode === 'tts' ? 'bg-brand-green text-black font-black' : 'text-white/60 hover:text-white'}`}
              title="Speak transcribed words out loud"
            >
              AI Voice (TTS)
            </button>
            <button
              onClick={() => setSoundMode('retro')}
              className={`px-2 py-1 rounded font-mono uppercase font-semibold transition-colors cursor-pointer ${soundMode === 'retro' ? 'bg-brand-green text-black font-black' : 'text-white/60 hover:text-white'}`}
              title="Cute synthesized retro beat chatter"
            >
              Synth Beeps
            </button>
            <button
              onClick={() => setSoundMode('mute')}
              className={`px-2 py-1 rounded font-mono uppercase font-semibold transition-colors cursor-pointer ${soundMode === 'mute' ? 'bg-brand-green text-black font-black' : 'text-white/60 hover:text-white'}`}
              title="Mute all playback sounds"
            >
              Muted
            </button>
          </div>

          {/* Volume Slider Block */}
          {soundMode !== 'mute' && (
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setVolume(v => v > 0 ? 0 : 0.8)} 
                className="text-white/60 hover:text-brand-green transition-colors cursor-pointer"
              >
                {volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-14 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-brand-green animate-none"
              />
            </div>
          )}
        </div>

        {/* Layout & Mode Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Avatar simulation toggle */}
          <button
            onClick={() => setShowAvatars(prev => !prev)}
            className={`px-3 py-2 rounded-lg text-xs transition-all font-mono uppercase tracking-wider flex items-center gap-1.5 border cursor-pointer ${
              showAvatars 
                ? 'bg-brand-green/20 border-brand-green/40 text-brand-green font-bold' 
                : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/25'
            }`}
            title="Toggle between original clip video track and simulated podcast cartoon characters"
          >
            <User className="w-3.5 h-3.5" />
            {showAvatars ? "Simulation Mode" : "Original Clip Mode"}
          </button>

          {/* Direct Layout Toggle */}
          <button 
            id="aspect-ratio-toggle-btn"
            onClick={onToggleAspectRatio}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white hover:text-brand-green rounded-lg text-xs transition-colors font-mono flex items-center gap-1.5 border border-white/10 uppercase tracking-wider cursor-pointer justify-center"
          >
            <Crop className="w-3.5 h-3.5" />
            {aspectRatio === '16-9' ? "Dual (16:9)" : "Mobile (9:16)"}
          </button>
        </div>
      </div>
    </div>
  );
}
