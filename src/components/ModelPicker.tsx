/**
 * src/components/ModelPicker.tsx
 *
 * Full-screen model picker modal — identical to the one in the standalone
 * index.html but as a proper React component.
 *
 * Props:
 *   isOpen       – whether to show the modal
 *   onClose      – called when user closes
 *   selected     – current SelectedModel state
 *   onSelect     – called with updated SelectedModel when user picks
 *
 * Usage:
 *   <ModelPicker
 *     isOpen={showPicker}
 *     onClose={() => setShowPicker(false)}
 *     selected={model}
 *     onSelect={setModel}
 *   />
 */

import { useState } from 'react';
import { X, Zap, Sparkles, Shuffle, Github, Flame, Bot, Cloud, Palette, Check } from 'lucide-react';
import { MODEL_REGISTRY } from '../lib/aiClient';
import type { SelectedModel, ModelEntry } from '../lib/aiClient';

// ─── Provider metadata ────────────────────────────────────────────────────────

const PROVIDER_META: Record<string, { icon: React.ReactNode; color: string; bg: string; desc: string }> = {
  'Groq':          { icon: <Zap size={14} />,      color: '#f97316', bg: 'rgba(249,115,22,0.12)',   desc: 'Ultra-fast inference' },
  'Gemini':        { icon: <Sparkles size={14} />,  color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)',  desc: 'Google DeepMind' },
  'OpenRouter':    { icon: <Shuffle size={14} />,   color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', desc: 'Multi-model gateway' },
  'GitHub Models': { icon: <Github size={14} />,    color: '#24292f', bg: 'rgba(36,41,47,0.10)',   desc: 'Microsoft / GitHub' },
  'SambaNova':     { icon: <Flame size={14} />,     color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  desc: 'Custom AI chips' },
  'AIMLAPI':       { icon: <Bot size={14} />,       color: '#22c55e', bg: 'rgba(34,197,94,0.12)', desc: 'AI/ML aggregator' },
  'Puter':         { icon: <Cloud size={14} />,     color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  desc: 'Free · no key needed' },
  'Pollinations':  { icon: <Palette size={14} />,   color: '#e879f9', bg: 'rgba(232,121,249,0.12)', desc: 'Free image generation' },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ModelPickerProps {
  isOpen:   boolean;
  onClose:  () => void;
  selected: SelectedModel;
  onSelect: (m: SelectedModel) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ModelPicker({ isOpen, onClose, selected, onSelect }: ModelPickerProps) {
  const [activeProvider, setActiveProvider] = useState(selected.provider);

  if (!isOpen) return null;

  const providers  = Object.keys(MODEL_REGISTRY);
  const categories = MODEL_REGISTRY[activeProvider] || {};
  const isImgProvider = activeProvider === 'Pollinations' || activeProvider === 'Puter';

  function countModels(p: string) {
    return Object.values(MODEL_REGISTRY[p] || {}).reduce((s, arr) => s + arr.length, 0);
  }

  function selectModel(m: ModelEntry) {
    if (m.img) {
      onSelect({ ...selected, imageProvider: activeProvider, imageModelId: m.id, imageModelName: m.name });
    } else {
      onSelect({ ...selected, provider: activeProvider, modelId: m.id, modelName: m.name });
    }
  }

  function isSelected(m: ModelEntry) {
    if (m.img) return m.id === selected.imageModelId;
    return m.id === selected.modelId;
  }

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[92vw] max-w-3xl flex flex-col"
           style={{ height: '80vh', maxHeight: '640px' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0"
             style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, transparent 60%)' }}>
          <div>
            <div className="font-bold text-lg text-slate-900 tracking-tight">AI Model</div>
            <div className="text-xs text-slate-400 mt-0.5 font-mono uppercase tracking-widest">Select provider &amp; model</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Provider list */}
          <div className="w-48 flex-shrink-0 border-r border-slate-100 bg-slate-50 overflow-y-auto p-2">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.2em] px-2 pb-2">Provider</div>
            {providers.map(p => {
              const meta = PROVIDER_META[p] || { icon: '◆', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', desc: '' };
              const active = p === activeProvider;
              return (
                <button
                  key={p}
                  onClick={() => setActiveProvider(p)}
                  className={`flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-left text-sm mb-1 transition-all ${
                    active ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-white hover:text-slate-800'
                  }`}
                >
                  <span className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-transform"
                        style={{ background: meta.bg, color: meta.color }}>
                    {meta.icon}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block truncate leading-tight">{p}</span>
                    <span className="text-[10px] font-mono opacity-60 block leading-tight">{meta.desc}</span>
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border ${
                    active ? 'bg-indigo-100 border-indigo-200 text-indigo-500' : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {countModels(p)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Model list */}
          <div className="flex-1 overflow-y-auto p-4 min-w-0">
            {Object.entries(categories).map(([cat, models]) => (
              <div key={cat} className="mb-5">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-[0.15em] pb-2 mb-2 border-b border-slate-100">
                  {cat}
                </div>
                <div className="flex flex-col gap-1.5">
                  {(models as ModelEntry[]).map(m => {
                    const sel = isSelected(m);
                    return (
                      <button
                        key={m.id}
                        onClick={() => selectModel(m)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left w-full transition-all ${
                          sel
                            ? 'border-indigo-400 bg-indigo-50 shadow-sm shadow-indigo-100'
                            : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 hover:translate-x-0.5'
                        }`}
                      >
                        {/* Radio circle */}
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          sel ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                        }`}>
                          {sel && <Check size={9} color="white" strokeWidth={3} />}
                        </span>

                        {/* Model name + desc */}
                        <span className="flex-1 min-w-0">
                          <span className={`block text-sm font-medium leading-tight ${sel ? 'text-indigo-600' : 'text-slate-800'}`}>
                            {m.name}
                          </span>
                          {m.desc && (
                            <span className="text-[11px] font-mono text-slate-400 block mt-0.5">{m.desc}</span>
                          )}
                        </span>

                        {/* Badge */}
                        {m.img ? (
                          <span className="text-[10px] font-mono text-fuchsia-500 bg-fuchsia-50 border border-fuchsia-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            🖼 Image
                          </span>
                        ) : (
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md max-w-[130px] truncate ${
                            sel ? 'bg-indigo-100 text-indigo-400' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {m.id}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-shrink-0 bg-slate-50 rounded-b-2xl">
          <div className="text-xs font-mono text-slate-400 truncate">
            <strong className="text-slate-600">{selected.provider}</strong>
            {' → '}{selected.modelName}
            {' · 🎨 '}{selected.imageProvider}: {selected.imageModelName}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
