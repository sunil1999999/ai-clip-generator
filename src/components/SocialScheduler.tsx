import React, { useState } from 'react';
import { Share2, Calendar, CheckCircle2, AlertCircle, Youtube, Sparkles, Send, Clock } from 'lucide-react';
import { Clip } from '../types';

interface SocialSchedulerProps {
  clip: Clip;
}

export default function SocialScheduler({ clip }: SocialSchedulerProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['tiktok', 'youtube_shorts']);
  const [scheduleDate, setScheduleDate] = useState<string>('2026-05-24');
  const [scheduleTime, setScheduleTime] = useState<string>('18:30');
  const [titleInput, setTitleInput] = useState<string>(clip.suggestedTitles[0] || clip.title);
  const [descInput, setDescInput] = useState<string>(clip.description);
  
  // Custom Scheduling state
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'scheduled' | 'error'>('idle');
  const [publishStep, setPublishStep] = useState<string>('');

  // Sync title input if active clip changes
  React.useEffect(() => {
    setTitleInput(clip.suggestedTitles[0] || clip.title);
    setDescInput(clip.description);
  }, [clip]);

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]
    );
  };

  const handleApplyTitlePreset = (preset: string) => {
    setTitleInput(preset);
  };

  const executePublish = () => {
    if (selectedPlatforms.length === 0) {
      alert("Please select at least one social target channel.");
      return;
    }

    setPublishStatus('publishing');
    const steps = [
      "Securing social server authentications...",
      "Encoding horizontal source vectors to vertical h264 portrait MP4...",
      "Overlaying brand typeface & high-opacity watermark...",
      "Injecting synchronized word-by-word subtitles markup...",
      "Streaming compressed payload buffers to cloud distribution nodes...",
      "Injecting titles, descriptions & viral hashtags metadata...",
      "Queue placement established successfully!"
    ];

    let index = 0;
    setPublishStep(steps[0]);

    const interval = setInterval(() => {
      index++;
      if (index < steps.length) {
        setPublishStep(steps[index]);
      } else {
        clearInterval(interval);
        setPublishStatus('scheduled');
      }
    }, 850);
  };

  return (
    <div className="p-6 rounded-xl bg-brand-gray border border-white/10 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-brand-green" />
            <h3 className="font-sans font-black text-xs text-white uppercase tracking-wider">AI Social Optimizer</h3>
          </div>
          <span className="text-[9px] bg-brand-green/15 text-brand-green font-mono border border-brand-green/20 px-2.5 py-0.5 rounded-full tracking-wider uppercase font-bold">
            Direct Post
          </span>
        </div>

        {/* Channels Target Row */}
        <div className="space-y-2 mb-4">
          <label className="text-[9px] font-mono text-white/50 uppercase tracking-widest block">Target Channels</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'tiktok', label: 'TikTok Reels', icon: '🎵' },
              { id: 'youtube_shorts', label: 'YT Shorts', icon: '📺' },
              { id: 'instagram_reels', label: 'IG Reels', icon: '📸' }
            ].map((p) => {
              const isActive = selectedPlatforms.includes(p.id);
              return (
                <button
                  id={`target-platform-btn-${p.id}`}
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`text-[10px] p-2.5 rounded border flex flex-col items-center justify-center gap-1 transition-all uppercase tracking-wider ${
                    isActive 
                      ? 'border-brand-green bg-brand-green/10 text-brand-green shadow-[0_0_8px_rgba(0,255,102,0.15)]' 
                      : `border-white/10 bg-black/40 text-white/50 hover:text-white hover:border-white/30`
                  }`}
                >
                  <span className="text-sm">{p.icon}</span>
                  <span className="text-[9px] font-mono font-bold">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Clickbait preset Title Recommender */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <label className="text-[9px] font-mono text-white/50 uppercase tracking-widest">AI Clickbait Recommended Titles</label>
            <Sparkles className="w-3 h-3 text-brand-green animate-pulse" />
          </div>
          <div className="space-y-1">
            {clip.suggestedTitles.map((caption, i) => (
              <button
                id={`title-preset-btn-${i}`}
                key={i}
                onClick={() => handleApplyTitlePreset(caption)}
                className="w-full text-left text-[11px] text-brand-green hover:text-white bg-black hover:bg-black/60 border border-white/5 p-2 px-3 rounded transition-colors truncate block font-sans"
              >
                🔥 "{caption}"
              </button>
            ))}
          </div>
        </div>

        {/* Edit Form */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-[9px] font-mono text-white/50 uppercase tracking-widest block mb-1.5">Editing Post Title</label>
            <input
              id="social-editor-title-input"
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green"
            />
          </div>

          <div>
            <label className="text-[9px] font-mono text-white/50 uppercase tracking-widest block mb-1.5">Description & Tags</label>
            <textarea
              id="social-editor-desc-textarea"
              rows={2}
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white/80 focus:outline-none focus:border-brand-green font-sans"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {clip.hashtags.map((tag, i) => (
              <span id={`social-tag-${tag}-${i}`} key={tag} className="text-[9px] font-mono text-brand-green bg-brand-green/10 border border-brand-green/20 px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Schedule dates parameters */}
        <div className="space-y-2 mb-4.5">
          <label className="text-[9px] font-mono text-white/50 uppercase tracking-widest block mb-1.5">Automatic Slot Scheduler</label>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-1 bg-black border border-white/10 p-2 rounded-lg text-white">
              <Calendar className="w-3.5 h-3.5 text-white/40" />
              <input
                id="social-schedule-date-input"
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="bg-transparent border-none text-[10px] font-mono w-full text-white focus:outline-none"
              />
            </div>
            <div className="flex-1 flex items-center gap-1 bg-black border border-white/10 p-2 rounded-lg text-white">
              <Clock className="w-3.5 h-3.5 text-white/40" />
              <input
                id="social-schedule-time-input"
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="bg-transparent border-none text-[10px] font-mono w-full text-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Row */}
      <div>
        {publishStatus === 'idle' && (
          <button
            id="social-publish-execute-btn"
            onClick={executePublish}
            className="w-full py-4 bg-brand-green text-black font-black text-xs uppercase tracking-widest hover:bg-white rounded-lg transition-all"
          >
            <Send className="w-3.5 h-3.5 mr-1" /> Schedule and Publish Now
          </button>
        )}

        {publishStatus === 'publishing' && (
          <div className="p-3.5 bg-black border border-brand-green/20 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-xs text-white">
              <div className="w-3 h-3 border-2 border-t-transparent border-brand-green rounded-full animate-spin shrink-0" />
              <span className="font-mono font-bold uppercase tracking-widest text-[9px] text-brand-green">Processing export pipeline...</span>
            </div>
            <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider animate-pulse">{publishStep}</p>
          </div>
        )}

        {publishStatus === 'scheduled' && (
          <div className="p-4 bg-brand-green/10 border border-brand-green/30 rounded-lg text-white/80">
            <div className="flex items-center gap-2 text-brand-green text-xs font-black uppercase tracking-wider mb-1">
              <CheckCircle2 className="w-4 h-4" /> Queue established successfully!
            </div>
            <p className="text-[10px] text-white/60 font-mono uppercase tracking-wide leading-normal">
              Payload successfully processed for algorithm post metrics at <strong>{scheduleDate}</strong> at <strong>{scheduleTime}</strong> PM.
            </p>
            <button 
              id="social-publish-reset-btn"
              onClick={() => setPublishStatus('idle')}
              className="mt-3 text-[9px] font-mono uppercase tracking-widest text-brand-green hover:underline decoration-brand-green"
            >
              ← Schedule another clip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
