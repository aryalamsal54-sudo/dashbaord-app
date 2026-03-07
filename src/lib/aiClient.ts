/**
 * src/lib/aiClient.ts
 *
 * Frontend AI service:
 *  - Holds the model registry (same providers as the standalone index.html)
 *  - Provides callAI() for direct-to-provider calls (Groq, etc. via proxy)
 *  - Provides generateDiagram() for image generation via Pollinations / Puter
 *
 * Usage:
 *   import { callAI, generateDiagram, MODEL_REGISTRY } from '@/src/lib/aiClient';
 */

// ─── Model registry ───────────────────────────────────────────────────────────

export interface ModelEntry {
  id:     string;
  name:   string;
  img?:   boolean;
  desc?:  string;
  puter?: boolean;
}

export type ModelRegistry = Record<string, Record<string, ModelEntry[]>>;

export const MODEL_REGISTRY: ModelRegistry = {
  Groq: {
    'Meta Llama': [
      { id: 'llama-3.3-70b-versatile',           name: 'Llama 3.3 70B Versatile' },
      { id: 'llama-3.1-8b-instant',              name: 'Llama 3.1 8B Instant' },
      { id: 'meta-llama/llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick 17B' },
      { id: 'meta-llama/llama-4-scout-17b-16e-instruct',    name: 'Llama 4 Scout 17B' },
    ],
    'Qwen': [
      { id: 'qwen-qwq-32b',  name: 'Qwen QwQ 32B' },
      { id: 'qwen/qwen3-32b',name: 'Qwen 3 32B' },
    ],
    'DeepSeek': [
      { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill 70B' },
    ],
    'Mistral': [
      { id: 'mistral-saba-24b', name: 'Mistral Saba 24B' },
    ],
    'Google': [
      { id: 'gemma2-9b-it',  name: 'Gemma 2 9B' },
    ],
  },
  Gemini: {
    'Gemini 2.5': [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Fast · best for IOE' },
      { id: 'gemini-2.5-pro',   name: 'Gemini 2.5 Pro',   desc: 'Highest quality' },
    ],
    'Gemini 2.0': [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    ],
    'Gemini 1.5': [
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
      { id: 'gemini-1.5-pro',   name: 'Gemini 1.5 Pro' },
    ],
  },
  OpenRouter: {
    'Anthropic': [
      { id: 'anthropic/claude-sonnet-4-5',      name: 'Claude Sonnet 4.5' },
      { id: 'anthropic/claude-3-7-sonnet',      name: 'Claude 3.7 Sonnet' },
      { id: 'anthropic/claude-3-5-haiku',       name: 'Claude 3.5 Haiku' },
    ],
    'OpenAI': [
      { id: 'openai/gpt-4o',                    name: 'GPT-4o' },
      { id: 'openai/o4-mini',                   name: 'o4 Mini' },
      { id: 'openai/o3',                        name: 'o3' },
    ],
    'Google': [
      { id: 'google/gemini-2.5-flash-preview',  name: 'Gemini 2.5 Flash' },
      { id: 'google/gemini-2.5-pro-preview',    name: 'Gemini 2.5 Pro' },
    ],
    'Meta': [
      { id: 'meta-llama/llama-3.3-70b-instruct',name: 'Llama 3.3 70B' },
    ],
  },
  'GitHub Models': {
    'OpenAI': [
      { id: 'gpt-4o',           name: 'GPT-4o' },
      { id: 'gpt-4o-mini',      name: 'GPT-4o Mini' },
      { id: 'o3-mini',          name: 'o3 Mini' },
    ],
    'Microsoft': [
      { id: 'Phi-4',            name: 'Phi 4' },
      { id: 'Phi-3.5-MoE-instruct', name: 'Phi 3.5 MoE' },
    ],
    'Meta': [
      { id: 'Meta-Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B' },
      { id: 'Meta-Llama-3.1-8B-Instruct',  name: 'Llama 3.1 8B' },
    ],
  },
  SambaNova: {
    'Meta Llama': [
      { id: 'Meta-Llama-3.3-70B-Instruct',  name: 'Llama 3.3 70B' },
      { id: 'Meta-Llama-3.1-405B-Instruct', name: 'Llama 3.1 405B' },
      { id: 'Meta-Llama-3.1-70B-Instruct',  name: 'Llama 3.1 70B' },
    ],
    'DeepSeek': [
      { id: 'DeepSeek-R1',                          name: 'DeepSeek R1' },
      { id: 'DeepSeek-R1-Distill-Llama-70B',        name: 'DeepSeek R1 Distill 70B' },
      { id: 'DeepSeek-V3-0324',                     name: 'DeepSeek V3' },
    ],
  },
  AIMLAPI: {
    'Text & Reasoning': [
      { id: 'mistral-large-latest',          name: 'Mistral Large' },
      { id: 'meta-llama/Llama-3-70b-chat-hf',name: 'Llama 3 70B' },
      { id: 'Qwen/Qwen2.5-72B-Instruct',    name: 'Qwen 2.5 72B' },
      { id: 'deepseek/deepseek-r1',          name: 'DeepSeek R1' },
    ],
  },
  Pollinations: {
    'Image Generation': [
      { id: 'flux',         name: 'Flux',          img: true, desc: 'Best quality, default' },
      { id: 'flux-realism', name: 'Flux Realism',  img: true, desc: 'Photo-realistic style' },
      { id: 'flux-anime',   name: 'Flux Anime',    img: true, desc: 'Anime / illustration' },
      { id: 'flux-3d',      name: 'Flux 3D',       img: true, desc: '3D render style' },
      { id: 'turbo',        name: 'Turbo (SDXL)',  img: true, desc: 'Fastest generation' },
    ],
  },
  Puter: {
    '🖼 OpenAI': [
      { id: 'dall-e-3',         name: 'DALL·E 3',      img: true, desc: 'HD quality', puter: true },
      { id: 'dall-e-2',         name: 'DALL·E 2',      img: true, desc: 'Classic · fast', puter: true },
    ],
    '🖼 Flux': [
      { id: 'flux-1-schnell',   name: 'Flux 1 Schnell', img: true, desc: 'Fastest Flux', puter: true },
      { id: 'flux-1.1-pro',     name: 'Flux 1.1 Pro',   img: true, desc: 'Top-tier quality', puter: true },
    ],
    '🖼 Stable Diffusion': [
      { id: 'stable-diffusion-3',  name: 'Stable Diffusion 3',  img: true, puter: true },
      { id: 'stable-diffusion-xl', name: 'Stable Diffusion XL', img: true, puter: true },
    ],
  },
};

// ─── Current model state (module-level singleton) ─────────────────────────────

export interface SelectedModel {
  provider:          string;
  modelId:           string;
  modelName:         string;
  imageProvider:     string;
  imageModelId:      string;
  imageModelName:    string;
}

export const DEFAULT_MODEL: SelectedModel = {
  provider:       'Groq',
  modelId:        'llama-3.3-70b-versatile',
  modelName:      'Llama 3.3 70B Versatile',
  imageProvider:  'Pollinations',
  imageModelId:   'flux',
  imageModelName: 'Flux',
};

// ─── AI call (routes through backend proxy to avoid CORS / key exposure) ──────

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export interface AICallOptions {
  provider:      string;
  modelId:       string;
  prompt:        string;
  systemPrompt?: string;
}

export async function callAI(opts: AICallOptions): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/api/ai/solve`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(opts),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Server error ${res.status}`);
  }
  const data = await res.json() as { text: string };
  return data.text;
}

// ─── Diagram generation ───────────────────────────────────────────────────────

export interface DiagramOptions {
  hint:     string;  // text description of desired diagram
  provider: string;  // 'Pollinations' | 'Puter'
  modelId:  string;
}

/** Returns either an img element (Puter) or a URL string (Pollinations) */
export async function generateDiagramUrl(opts: DiagramOptions): Promise<string> {
  const styleTag = ', clean physics textbook line art, black and white, white background, clearly labelled, no shading, no color';
  const prompt   = opts.hint + styleTag;

  if (opts.provider === 'Puter') {
    // Puter.js must be loaded via <script src="https://js.puter.com/v2/"> in index.html
    const puter = (window as any).puter;
    if (!puter) throw new Error('Puter.js not loaded. Add <script src="https://js.puter.com/v2/"> to index.html');
    const imgEl: HTMLImageElement = await puter.ai.txt2img(prompt, { model: opts.modelId });
    return imgEl.src;
  }

  // Pollinations
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?model=${opts.modelId}&width=720&height=360&nologo=true&seed=42`;
}

// ─── Subject-specific system prompts ─────────────────────────────────────────

export const SYSTEM_PROMPTS = {
  physicsDerivation: `You are a physics expert at a university level. Derive the requested result step-by-step.

Format output as HTML with this exact structure — no Markdown, no code fences, raw HTML only:

<div class="ai-solution">
  <div class="sol-step">
    <p class="sol-text">Explanation of the step</p>
    <div class="math-block">Equation in plain text or LaTeX-like notation</div>
  </div>
  <!-- more steps -->
  <div class="sol-result">
    <span class="sol-result-label">Final Result</span>
    <span class="sol-result-val">Equation or expression</span>
  </div>
</div>

Use <code class="math"> for inline math. Do not include any diagram placeholders. Return raw HTML only.`,

  physicsNumerical: `You are an expert university physics solver. Solve the problem step-by-step showing full working.

Format output as HTML — no Markdown, no code fences, raw HTML only:

<div class="ai-solution">
  <div class="sol-step">
    <p class="sol-text">GIVEN:</p>
    <div class="math-block">List of known values</div>
  </div>
  <div class="sol-step">
    <p class="sol-text">FORMULA:</p>
    <div class="math-block">Relevant equations</div>
  </div>
  <div class="sol-step">
    <p class="sol-text">WORKING:</p>
    <div class="math-block">Step-by-step calculation</div>
  </div>
  <div class="sol-result">
    <span class="sol-result-label">Answer</span>
    <span class="sol-result-val">Final numerical result with units</span>
  </div>
</div>

Use <code class="math"> for inline math. Return raw HTML only.`,

  math: `You are a mathematics expert. Solve the problem step-by-step.

Format output as HTML — no Markdown, no code fences, raw HTML only:

<div class="ai-solution">
  <div class="sol-step">
    <p class="sol-text">Explanation</p>
    <div class="math-block">Equation</div>
  </div>
  <!-- more steps -->
  <div class="sol-result">
    <span class="sol-result-label">Final Answer</span>
    <span class="sol-result-val">Result</span>
  </div>
</div>

Use <code class="math"> for inline math. Return raw HTML only.`,

  programmingCode: `You are an expert C programmer. Write a complete, compilable C program.
If the problem explicitly mentions Fortran, write Fortran instead.

Format output as HTML — no Markdown code fences, raw HTML only:

<div class="ai-solution">
  <div class="code-explanation mb-6">
    <p class="text-slate-300">Brief explanation of the logic.</p>
  </div>
  <div class="code-block mb-6 relative group">
    <pre class="bg-[#0b1120] p-4 rounded-xl border border-white/10 overflow-x-auto"><code class="language-c text-sm font-mono text-blue-100">
// Your clean, commented code here
    </code></pre>
  </div>
  <div class="code-output">
    <strong class="text-blue-300 block mb-2">Expected Output:</strong>
    <pre class="bg-black/30 p-4 rounded-lg border border-white/10 font-mono text-sm text-slate-400">Sample output</pre>
  </div>
</div>

Return raw HTML only.`,

  programmingTheory: `You are an expert Computer Science teacher. Give a detailed theoretical explanation.

Format output as HTML — no Markdown, raw HTML only:

<div class="ai-solution">
  <div class="theory-explanation">
    <h3 class="text-lg font-semibold text-blue-300 mb-2">Explanation</h3>
    <p class="mb-4">Your detailed explanation...</p>
    <ul class="list-disc pl-5 space-y-1 text-slate-300">
      <li>Key point 1</li>
      <li>Key point 2</li>
    </ul>
  </div>
</div>

Return raw HTML only.`,

  programmingOutput: `You are an expert C programmer. Determine the output of the given C code.

Format output as HTML — no Markdown, raw HTML only:

<div class="ai-solution">
  <div class="output-result mb-6">
    <strong class="text-blue-300 block mb-2">Output:</strong>
    <pre class="bg-black/30 p-4 rounded-lg border border-white/10 font-mono text-emerald-400">The output value</pre>
  </div>
  <div class="output-explanation">
    <h3 class="text-lg font-semibold text-blue-300 mb-2">Step-by-Step Evaluation</h3>
    <p class="text-slate-300">Explanation of how the output was derived...</p>
  </div>
</div>

Return raw HTML only.`,
};
