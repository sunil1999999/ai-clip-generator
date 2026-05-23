import React from 'react';
import { BrandTemplate } from '../types';
import { Palette } from 'lucide-react';

interface BrandTemplatesConfigProps {
  brand: BrandTemplate;
  onChange: (updated: BrandTemplate) => void;
}

export default function BrandTemplatesConfig({ brand, onChange }: BrandTemplatesConfigProps) {
  const fontPresets = ['Inter', 'Space Grotesk', 'JetBrains Mono', 'Playfair Display'];
  const colorPresets = [
    { name: 'Gold Yellow', primary: '#FFFF00', stroke: '#000000' },
    { name: 'Neon Pink', primary: '#EC4899', stroke: '#000000' },
    { name: 'Retro Teal', primary: '#2DD4BF', stroke: '#000000' },
    { name: 'Premium White', primary: '#FFFFFF', stroke: '#0f172a' }
  ];

  const handleUpdate = <K extends keyof BrandTemplate>(key: K, value: BrandTemplate[K]) => {
    onChange({
      ...brand,
      [key]: value
    });
  };

  return (
    <div className="p-6 rounded-xl bg-brand-gray border border-white/10 space-y-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-brand-green" />
          <h3 className="font-sans font-black text-xs text-white uppercase tracking-wider">Brand Kit & Captions</h3>
        </div>

        {/* Font Style Row */}
        <div className="space-y-2.5 mb-5">
          <label className="text-[9px] font-mono text-white/50 uppercase tracking-widest block">Subtitle Typography</label>
          <div className="grid grid-cols-2 gap-2">
            {fontPresets.map((f) => (
              <button
                id={`font-preset-btn-${f.replace(" ", "-")}`}
                key={f}
                onClick={() => handleUpdate('fontFamily', f)}
                className={`text-xs px-2.5 py-2 rounded border text-left transition-all ${
                  brand.fontFamily === f 
                    ? 'border-brand-green bg-brand-green/10 text-brand-green shadow-[0_0_8px_rgba(0,255,102,0.15)] font-bold' 
                    : 'border-white/10 bg-black/40 text-white/50 hover:border-brand-green hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Color presets list */}
        <div className="space-y-2.5 mb-5">
          <label className="text-[9px] font-mono text-white/50 uppercase tracking-widest block">Preset Color Palette</label>
          <div className="grid grid-cols-2 gap-2">
            {colorPresets.map((color) => (
              <button
                id={`color-preset-btn-${color.name.replace(" ", "-")}`}
                key={color.name}
                onClick={() => {
                  handleUpdate('primaryColor', color.primary);
                  handleUpdate('strokeColor', color.stroke);
                }}
                className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded border text-left transition-all ${
                  brand.primaryColor === color.primary 
                    ? 'border-brand-green bg-brand-green/10 text-brand-green' 
                    : 'border-white/10 bg-black/40 text-white/50 hover:border-brand-green'
                }`}
              >
                <div style={{ backgroundColor: color.primary }} className="w-3.5 h-3.5 rounded-full border border-white/20" />
                <span className="font-mono text-[9px] uppercase tracking-wider">{color.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Text capitalization switch */}
        <div className="space-y-2.5 mb-5">
          <label className="text-[9px] font-mono text-white/50 uppercase tracking-widest block">Spelling Alignment</label>
          <div className="flex gap-2 bg-black p-1.5 rounded-lg border border-white/10">
            {['uppercase', 'none'].map((cStyle) => (
              <button
                id={`brand-case-${cStyle}`}
                key={cStyle}
                onClick={() => handleUpdate('fontCase', cStyle as any)}
                className={`flex-1 text-[9px] font-mono py-1.5 rounded uppercase tracking-wider transition-all text-center ${
                  brand.fontCase === cStyle 
                    ? 'bg-brand-green text-black font-extrabold shadow-md' 
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {cStyle === 'uppercase' ? "ALL CAPS" : "Standard Case"}
              </button>
            ))}
          </div>
        </div>

        {/* Logo Placement */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[9px] font-mono text-white/50 uppercase tracking-widest">Watermark Accent</label>
          </div>
          <input
            id="brand-logo-text-input"
            type="text"
            value={brand.logoUrl || ''}
            onChange={(e) => handleUpdate('logoUrl', e.target.value)}
            placeholder="Add logo text or URL watermark..."
            className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-green transition-colors"
          />
        </div>
      </div>

      {/* Positioning choice */}
      <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between gap-1 text-[9px] text-white/40 font-mono uppercase tracking-wider">
        <span>Watermark Anchor:</span>
        <div className="flex gap-1.5">
          {['top-left', 'top-right', 'bottom-right'].map((pos) => (
            <button
              id={`brand-logo-pos-${pos}`}
              key={pos}
              onClick={() => handleUpdate('logoPosition', pos as any)}
              className={`px-1.5 py-0.5 rounded border uppercase text-[8px] tracking-wider ${
                brand.logoPosition === pos 
                  ? 'border-brand-green text-brand-green bg-brand-green/10' 
                  : 'border-white/10 text-white/40'
              }`}
            >
              {pos.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
