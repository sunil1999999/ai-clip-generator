import React, { useState } from 'react';
import { Word, Speaker } from '../types';
import { Trash2, AlertCircle, RefreshCw, Sparkles, Smile, Edit3, Check } from 'lucide-react';

interface TranscriptEditorProps {
  transcript: Word[];
  currentTime: number;
  onWordClick: (start: number) => void;
  onUpdateWords: (words: Word[]) => void;
  speakers: Speaker[];
}

export default function TranscriptEditor({
  transcript,
  currentTime,
  onWordClick,
  onUpdateWords,
  speakers
}: TranscriptEditorProps) {
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  const toggleWordDeleted = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent setting current time when clicking trash icon
    const updated = transcript.map(w => 
      w.id === id ? { ...w, deleted: !w.deleted } : w
    );
    onUpdateWords(updated);
  };

  const handleStartEditing = (word: Word, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWordId(word.id);
    setEditingText(word.text);
  };

  const handleSaveEdit = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editingText.trim()) return;
    const updated = transcript.map(w =>
      w.id === id ? { ...w, text: editingText.trim() } : w
    );
    onUpdateWords(updated);
    setEditingWordId(null);
  };

  const recoverAllWords = () => {
    const updated = transcript.map(w => ({ ...w, deleted: false }));
    onUpdateWords(updated);
  };

  const getSpeakerColor = (speakerId: string) => {
    return speakers.find(s => s.id === speakerId)?.color || '#94a3b8';
  };

  const getSpeakerName = (speakerId: string) => {
    return speakers.find(s => s.id === speakerId)?.name || 'Speaker';
  };

  return (
    <div className="flex flex-col h-full bg-brand-gray border border-white/10 rounded-xl overflow-hidden">
      {/* Title Header */}
      <div className="px-5 py-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-green" />
          <h3 className="font-sans font-black text-xs text-white uppercase tracking-wider">AI Word Sequence Editor</h3>
        </div>
        
        <button 
          id="recover-all-words-btn"
          onClick={recoverAllWords}
          className="text-[9px] font-mono hover:text-brand-green bg-black px-2.5 py-1.5 border border-white/10 rounded flex items-center gap-1 text-white/50 uppercase tracking-wider transition-colors"
        >
          <RefreshCw className="w-3 h-3" /> Reset Edits
        </button>
      </div>

      {/* Advisory Tips banner */}
      <div className="px-5 py-2.5 border-b border-white/10 bg-brand-green/10 text-brand-green text-[10px] font-mono flex items-center gap-2 uppercase tracking-wider">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        <span>Click to teleport head tracking. Slice words to trigger seamless cuts.</span>
      </div>

      {/* Actual list of words structured into conversation paragraphs grouped by Speaker */}
      <div className="flex-1 p-5 overflow-y-auto space-y-6 max-h-[295px]">
        {transcript.reduce<Array<{ speakerId: string; words: Word[] }>>((acc, word) => {
          const lastGroup = acc[acc.length - 1];
          if (lastGroup && lastGroup.speakerId === word.speakerId) {
            lastGroup.words.push(word);
          } else {
            acc.push({ speakerId: word.speakerId, words: [word] });
          }
          return acc;
        }, []).map((group, groupIndex) => (
          <div key={groupIndex} className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-3 relative group">
            {/* Speaker Name Tag */}
            <div className="flex items-center gap-2">
              <span 
                style={{ backgroundColor: `${getSpeakerColor(group.speakerId)}20`, color: getSpeakerColor(group.speakerId) }}
                className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-white/5 uppercase tracking-wider"
              >
                {getSpeakerName(group.speakerId)}
              </span>
              <span className="text-[9px] text-white/30 font-mono">
                {group.words[0]?.start.toFixed(1)}s - {group.words[group.words.length - 1]?.end.toFixed(1)}s
              </span>
            </div>

            {/* Paragraph of words */}
            <div className="flex flex-wrap gap-x-2.5 gap-y-3">
              {group.words.map((word) => {
                const isActive = currentTime >= word.start && currentTime <= word.end;
                const isEditing = editingWordId === word.id;

                return (
                  <div
                    key={word.id}
                    onClick={() => onWordClick(word.start)}
                    className={`group/word relative cursor-pointer outline-none transition-all rounded p-1 px-1.5 flex items-center gap-1 font-sans ${
                      word.deleted 
                        ? 'bg-red-950/20 text-white/20 border border-transparent opacity-40' 
                        : isActive
                          ? 'bg-brand-green/20 text-brand-green font-bold border border-brand-green/60 shadow-[0_0_8px_rgba(0,255,102,0.15)] scale-105'
                          : 'hover:bg-white/10 hover:text-white text-white/80 border border-transparent'
                    }`}
                  >
                    {/* Inline edit form */}
                    {isEditing ? (
                      <form onSubmit={(e) => handleSaveEdit(word.id, e)} className="flex items-center gap-1 z-10" onClick={e => e.stopPropagation()}>
                        <input
                          id={`inline-word-edit-input-${word.id}`}
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-16 bg-black border border-brand-green text-xs px-1 rounded text-white py-0.5 focus:outline-none"
                          autoFocus
                        />
                        <button type="submit" className="text-brand-green p-0.5"><Check className="w-3 h-3" /></button>
                      </form>
                    ) : (
                      <>
                        <span className={word.deleted ? 'line-through decoration-red-500 decoration-2' : ''}>
                          {word.text}
                        </span>
                        
                        {word.emoji && (
                          <span className="text-xs bg-black px-1 border border-white/15 rounded" title="AI suggested emoji integration">
                            {word.emoji}
                          </span>
                        )}

                        {word.bRoll && (
                          <span className="text-[8px] font-mono px-1 py-0.5 bg-brand-green/20 text-brand-green rounded-sm" title={`B-Roll Overlay Tag: ${word.bRoll}`}>
                            BR
                          </span>
                        )}
                      </>
                    )}

                    {/* Popover Action Menu for this specific word */}
                    {!isEditing && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-black border border-white/10 rounded shadow-2xl opacity-0 group-hover/word:opacity-100 transition-opacity z-10 flex items-center gap-1.5 pointer-events-auto h-7">
                        <button
                          id={`word-edit-btn-${word.id}`}
                          onClick={(e) => handleStartEditing(word, e)}
                          title="Correct typo in subtitle"
                          className="hover:text-amber-400 text-white/50 p-0.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`word-trash-btn-${word.id}`}
                          onClick={(e) => toggleWordDeleted(word.id, e)}
                          title={word.deleted ? "Recover word block" : "Cut word block from sequence"}
                          className={`p-0.5 ${word.deleted ? 'text-brand-green' : 'text-red-400 hover:text-red-300'}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
