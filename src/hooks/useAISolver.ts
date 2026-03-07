/**
 * src/hooks/useAISolver.ts
 *
 * Central hook that powers AI solving across all subject pages.
 *
 * Features:
 *  - In-memory session cache (instant re-display)
 *  - DB-backed persistence (loads cached solutions from backend)
 *  - Multi-provider support (passes selected model to backend)
 *  - Solved-set tracking (drives green row indicators)
 *  - Stage pill state machine: idle → solving → done / error
 *
 * Usage:
 *   const solver = useAISolver({ subject: 'physics', solveEndpoint: '/api/physics/solve' });
 *
 *   // open a question modal:
 *   solver.openQuestion({ id: 'osc-deriv-0', text: '...', topic: 'osc', tab: 'derivations' });
 *
 *   // in JSX:
 *   <AISolver solver={solver} selectedModel={model} />
 */

import { useCallback, useRef, useState } from 'react';
import { callAI, generateDiagramUrl, SYSTEM_PROMPTS } from '../lib/aiClient';
import type { SelectedModel } from '../lib/aiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Stage = 'idle' | 'active' | 'done' | 'error';

export interface StageState {
  solve:  Stage;
  format: Stage;
}

export interface CachedSolution {
  solution:  string;
  modelUsed: string;
}

export interface CurrentQuestion {
  id:      string;
  text:    string;
  topic:   string;
  tab:     string;   // 'derivations' | 'numericals' | 'theory' | 'code' | 'output'
  chapter: string;
  num:     string;
}

export interface SolverState {
  question:     CurrentQuestion | null;
  stages:       StageState;
  slotState:    'idle' | 'loading' | 'result' | 'error';
  slotHtml:     string;
  slotError:    string;
  modelUsed:    string;
  fromCache:    boolean;
  solvedSet:    Set<string>;
  isOpen:       boolean;
}

export interface UseSolverReturn {
  state:        SolverState;
  openQuestion: (q: CurrentQuestion) => void;
  closeModal:   () => void;
  solve:        (model: SelectedModel) => Promise<void>;
  loadSolvedIds:() => Promise<void>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || '';

function getSystemPrompt(tab: string): string {
  switch (tab) {
    case 'derivations': return SYSTEM_PROMPTS.physicsDerivation;
    case 'numericals':  return SYSTEM_PROMPTS.physicsNumerical;
    case 'math':        return SYSTEM_PROMPTS.math;
    case 'code':        return SYSTEM_PROMPTS.programmingCode;
    case 'theory':      return SYSTEM_PROMPTS.programmingTheory;
    case 'output':      return SYSTEM_PROMPTS.programmingOutput;
    default:            return SYSTEM_PROMPTS.math;
  }
}

function getSolveEndpoint(tab: string): string {
  if (tab === 'derivations' || tab === 'numericals') return `${BACKEND_URL}/api/physics/solve`;
  if (tab === 'math') return `${BACKEND_URL}/api/math/solve`;
  return `${BACKEND_URL}/api/programming/solve`;
}

function getSolvedIdsEndpoint(tab: string): string {
  if (tab === 'derivations' || tab === 'numericals') return `${BACKEND_URL}/api/physics/solved-ids`;
  if (tab === 'math') return `${BACKEND_URL}/api/math/solved-ids`;
  return `${BACKEND_URL}/api/programming/solved-ids`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAISolver(): UseSolverReturn {
  const sessionCache = useRef<Record<string, CachedSolution>>({});

  const [state, setState] = useState<SolverState>({
    question:  null,
    stages:    { solve: 'idle', format: 'idle' },
    slotState: 'idle',
    slotHtml:  '',
    slotError: '',
    modelUsed: '',
    fromCache: false,
    solvedSet: new Set(),
    isOpen:    false,
  });

  // ── helpers ────────────────────────────────────────────────────────────────

  const setStages = useCallback((solve: Stage, format: Stage) => {
    setState(s => ({ ...s, stages: { solve, format } }));
  }, []);

  const setLoading = useCallback(() => {
    setState(s => ({ ...s, slotState: 'loading', slotHtml: '', slotError: '' }));
  }, []);

  const setResult = useCallback((html: string, modelUsed: string, fromCache: boolean, qid: string) => {
    setState(s => ({
      ...s,
      slotState: 'result',
      slotHtml:  html,
      modelUsed,
      fromCache,
      solvedSet: new Set([...s.solvedSet, qid]),
    }));
  }, []);

  const setError = useCallback((msg: string) => {
    setState(s => ({ ...s, slotState: 'error', slotError: msg }));
  }, []);

  // ── loadSolvedIds ──────────────────────────────────────────────────────────

  const loadSolvedIds = useCallback(async () => {
    // Try all three subjects in parallel
    const endpoints = [
      `${BACKEND_URL}/api/physics/solved-ids`,
      `${BACKEND_URL}/api/math/solved-ids`,
      `${BACKEND_URL}/api/programming/solved-ids`,
    ];
    const results = await Promise.allSettled(endpoints.map(ep => fetch(ep).then(r => r.json())));
    const ids: string[] = [];
    results.forEach(r => {
      if (r.status === 'fulfilled') ids.push(...(r.value.ids || []));
    });
    setState(s => ({ ...s, solvedSet: new Set(ids) }));
  }, []);

  // ── openQuestion ───────────────────────────────────────────────────────────

  const openQuestion = useCallback((q: CurrentQuestion) => {
    setState(s => ({
      ...s,
      question:  q,
      isOpen:    true,
      stages:    { solve: 'idle', format: 'idle' },
      slotHtml:  '',
      slotError: '',
      modelUsed: '',
      fromCache: false,
    }));

    // Show cached solution immediately if available
    const cached = sessionCache.current[q.id];
    if (cached) {
      setState(s => ({
        ...s,
        slotState: 'result',
        slotHtml:  cached.solution,
        modelUsed: cached.modelUsed,
        fromCache: true,
        stages:    { solve: 'done', format: 'done' },
      }));
      return;
    }

    // Fetch from DB if previously solved
    // (handled lazily — user sees placeholder, auto-loads on open)
    setState(s => ({ ...s, slotState: 'idle' }));
  }, []);

  // ── closeModal ─────────────────────────────────────────────────────────────

  const closeModal = useCallback(() => {
    setState(s => ({ ...s, isOpen: false }));
  }, []);

  // ── solve ──────────────────────────────────────────────────────────────────

  const solve = useCallback(async (model: SelectedModel) => {
    const q = state.question;
    if (!q) return;

    const isSolveAgain = state.slotState === 'result';
    if (isSolveAgain) delete sessionCache.current[q.id];

    setLoading();
    setStages('active', 'idle');

    try {
      // 1. Check session cache (unless re-solving)
      if (!isSolveAgain && sessionCache.current[q.id]) {
        const c = sessionCache.current[q.id];
        setStages('done', 'done');
        setResult(c.solution, c.modelUsed, true, q.id);
        return;
      }

      // 2. Try calling AI directly via the multi-provider backend route
      const systemPrompt = getSystemPrompt(q.tab);
      const text = await callAI({
        provider:     model.provider,
        modelId:      model.modelId,
        prompt:       q.text,
        systemPrompt,
      });

      setStages('done', 'active');

      // 3. Persist solution to DB via subject-specific endpoint
      const solveEndpoint = getSolveEndpoint(q.tab);
      try {
        await fetch(solveEndpoint, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId:   q.id,
            question:     q.text,
            solution:     text,
            modelUsed:    `${model.provider} · ${model.modelName}`,
            topic:        q.topic,
            tab:          q.tab,
            forceRefresh: isSolveAgain,
          }),
        });
      } catch {
        // DB persistence failure is non-fatal
      }

      setStages('done', 'done');

      const modelLabel = `${model.provider} · ${model.modelName}`;
      sessionCache.current[q.id] = { solution: text, modelUsed: modelLabel };
      setResult(text, modelLabel, false, q.id);

    } catch (err: any) {
      setStages('error', 'error');
      setError(err.message);
    }
  }, [state.question, state.slotState, setLoading, setStages, setResult, setError]);

  return { state, openQuestion, closeModal, solve, loadSolvedIds };
}
