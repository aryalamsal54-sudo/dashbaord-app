/**
 * src/components/AISolver.tsx
 *
 * Drop-in AI Solver panel for any question modal across the site.
 *
 * Handles:
 *  - Stage progress pills (Solve → Format)
 *  - Solution slot (idle / loading / result / error)
 *  - Diagram generation via Pollinations / Puter
 *  - "Solve Again" button
 *  - Model badge
 *
 * Usage inside any modal:
 *
 *   import { AISolver } from '@/src/components/AISolver';
 *   import { useAISolver } from '@/src/hooks/useAISolver';
 *   import { ModelPicker } from '@/src/components/ModelPicker';
 *   import { DEFAULT_MODEL } from '@/src/lib/aiClient';
 *   import { useState } from 'react';
 *
 *   const solver = useAISolver();
 *   const [model, setModel] = useState(DEFAULT_MODEL);
 *   const [showPicker, setShowPicker] = useState(false);
 *
 *   // When user clicks a question row:
 *   solver.openQuestion({ id, text, topic, tab, chapter, num });
 *
 *   // In JSX:
 *   <AISolver solver={solver} model={model} onOpenModelPicker={() => setShowPicker(true)} />
 *   <ModelPicker isOpen={showPicker} onClose={…} selected={model} onSelect={setModel} />
 */

import { useEffect, useRef } from 'react';
import { Loader2, RefreshCw, Settings2, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { generateDiagramUrl } from '../lib/aiClient';
import type { UseSolverReturn } from '../hooks/useAISolver';
import type { SelectedModel } from '../lib/aiClient';

// ─── Stage pill ───────────────────────────────────────────────────────────────

function StagePill({
  label,
  stage,
}: {
  label: string;
  stage: 'idle' | 'active' | 'done' | 'error';
}) {
  const base = 'flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-mono uppercase tracking-wide transition-all duration-200 select-none';
  const styles = {
    idle:   'border-slate-200 text-slate-400',
    active: 'border-indigo-400 text-indigo-500 bg-indigo-50',
    done:   'border-emerald-400 text-white bg-emerald-500',
    error:  'border-red-400 text-red-500',
  };

  return (
    <span className={`${base} ${styles[stage]}`}>
      {stage === 'active' && <Loader2 size={10} className="animate-spin" />}
      {stage === 'done'   && <CheckCircle2 size={10} />}
      {stage === 'error'  && <XCircle size={10} />}
      {stage === 'idle'   && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {label}
    </span>
  );
}

// ─── Diagram injector ─────────────────────────────────────────────────────────

function DiagramInjector({ container, imageModel, imageProvider }: {
  container:     HTMLDivElement | null;
  imageModel:    string;
  imageProvider: string;
}) {
  useEffect(() => {
    if (!container) return;
    const placeholders = container.querySelectorAll<HTMLElement>('.derivation-diagram-placeholder');
    placeholders.forEach(async ph => {
      const hintEl = ph.querySelector<HTMLElement>('.diagram-hint-text');
      const stub   = ph.querySelector<HTMLElement>('.diagram-stub');
      if (!hintEl || !stub) return;

      const hint = hintEl.textContent?.trim() || '';
      if (!hint || hint.toLowerCase().includes('no diagram required')) {
        ph.innerHTML = '<p style="font-size:0.75rem;color:#94a3b8;padding:8px 0">ℹ No diagram needed for this derivation.</p>';
        return;
      }

      stub.innerHTML = '<span style="font-size:0.72rem;color:#94a3b8">⏳ Generating diagram…</span>';
      hintEl.style.display = 'none';

      try {
        const url = await generateDiagramUrl({ hint, provider: imageProvider, modelId: imageModel });
        const img = document.createElement('img');
        img.alt   = 'Physics diagram';
        img.style.cssText = 'width:100%;border-radius:6px;border:1px solid #e2e8f0;margin-top:6px;display:none';
        img.onload  = () => { stub.innerHTML = ''; img.style.display = ''; stub.appendChild(img); };
        img.onerror = () => { stub.innerHTML = '<span style="font-size:0.72rem;color:#94a3b8">⚠ Diagram could not be generated.</span>'; hintEl.style.display = ''; };
        img.src = url;
        stub.appendChild(img);
      } catch {
        stub.innerHTML = '<span style="font-size:0.72rem;color:#94a3b8">⚠ Diagram could not be generated.</span>';
        hintEl.style.display = '';
      }
    });
  }, [container, imageModel, imageProvider]);

  return null;
}

// ─── Main AISolver component ──────────────────────────────────────────────────

interface AISolverProps {
  solver:             UseSolverReturn;
  model:              SelectedModel;
  onOpenModelPicker:  () => void;
  /** Label for the primary CTA button. Defaults to "Solve with AI" */
  solveLabel?:        string;
  /** Label shown while solving. Defaults to "Solving…" */
  solvingLabel?:      string;
  /** Label shown after solved. Defaults to "Solve Again" */
  solveAgainLabel?:   string;
}

export function AISolver({
  solver,
  model,
  onOpenModelPicker,
  solveLabel      = '⚡ Solve with AI',
  solvingLabel    = 'Solving…',
  solveAgainLabel = 'Solve Again',
}: AISolverProps) {
  const { state, solve } = solver;
  const slotRef          = useRef<HTMLDivElement>(null);

  const isSolving  = state.slotState === 'loading';
  const hasResult  = state.slotState === 'result';
  const hasError   = state.slotState === 'error';
  const showStages = state.stages.solve !== 'idle' || state.stages.format !== 'idle';

  const btnLabel = isSolving
    ? solvingLabel
    : hasResult
      ? solveAgainLabel
      : solveLabel;

  return (
    <div className="mt-1 space-y-3">

      {/* Stage pills + model badge row */}
      <div className="flex items-center gap-2 flex-wrap">
        {showStages && (
          <>
            <StagePill label="Solve"  stage={state.stages.solve} />
            <StagePill label="Format" stage={state.stages.format} />
          </>
        )}
        {hasResult && (
          <span className="ml-auto text-[11px] font-mono text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
            {state.modelUsed}{state.fromCache ? ' · cached' : ''}
          </span>
        )}
      </div>

      {/* Solution slot */}
      {state.slotState === 'idle' && (
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex items-center justify-center min-h-[80px]">
          <span className="text-sm text-slate-400 font-mono">
            AI step-by-step solution — click <em>{solveLabel}</em> to begin
          </span>
        </div>
      )}

      {state.slotState === 'loading' && (
        <div className="border border-slate-200 rounded-xl p-5 min-h-[80px] flex items-center gap-3">
          <Loader2 size={18} className="text-indigo-500 animate-spin flex-shrink-0" />
          <span className="text-sm text-indigo-600 font-mono">Generating solution…</span>
        </div>
      )}

      {hasResult && (
        <>
          <div
            ref={slotRef}
            className="border border-slate-200 rounded-xl overflow-hidden"
            dangerouslySetInnerHTML={{ __html: state.slotHtml }}
          />
          {/* Inject diagrams after render */}
          <DiagramInjector
            container={slotRef.current}
            imageModel={model.imageModelId}
            imageProvider={model.imageProvider}
          />
        </>
      )}

      {hasError && (
        <div className="border border-red-300 bg-red-50 rounded-xl p-4 text-sm text-red-600 font-mono">
          ⚠ {state.slotError}
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-2 pt-1">
        {/* Model picker button */}
        <button
          onClick={onOpenModelPicker}
          className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-500 bg-white hover:border-indigo-300 hover:text-indigo-600 transition-all"
        >
          <Settings2 size={13} />
          <span>{model.provider} · {model.modelName}</span>
        </button>

        {/* Solve button */}
        <button
          disabled={isSolving}
          onClick={() => solve(model)}
          className={`ml-auto flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            isSolving
              ? 'bg-indigo-400 cursor-wait text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 hover:-translate-y-0.5'
          }`}
        >
          {isSolving
            ? <><Loader2 size={14} className="animate-spin" /> {solvingLabel}</>
            : hasResult
              ? <><RefreshCw size={14} /> {solveAgainLabel}</>
              : <><Zap size={14} /> {solveLabel}</>}
        </button>
      </div>
    </div>
  );
}
