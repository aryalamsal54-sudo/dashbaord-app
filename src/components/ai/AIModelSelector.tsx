import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, ChevronDown, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Model {
  id: string;
  name: string;
  cat: string;
  img?: boolean;
  desc?: string;
}

interface Provider {
  id: string;
  name: string;
  icon: string;
  desc: string;
  color: string;
  clo: string;
  models: Model[];
}

// --- Data ---
const PROVIDERS: Provider[] = [
  {
    id:'groq', name:'Groq', icon:'⚡', desc:'Ultra-fast inference',
    color:'#f97316', clo:'rgba(249,115,22,0.18)',
    models:[
      {id:'llama-3.3-70b-versatile',              name:'Llama 3.3 70B Versatile',   cat:'Production', desc:'Best for: General reasoning, coding, and instruction following.'},
      {id:'llama-3.1-8b-instant',                 name:'Llama 3.1 8B Instant',      cat:'Production', desc:'Best for: Fast, lightweight tasks and quick responses.'},
      {id:'openai/gpt-oss-120b',                  name:'GPT OSS 120B',              cat:'Production', desc:'Best for: Complex analysis and deep reasoning.'},
      {id:'openai/gpt-oss-20b',                   name:'GPT OSS 20B',               cat:'Production', desc:'Best for: Balanced performance and speed.'},
      {id:'mixtral-8x7b-32768',                   name:'Mixtral 8x7B',              cat:'Production', desc:'Best for: Long context windows and multi-tasking.'},
      {id:'gemma2-9b-it',                         name:'Gemma 2 9B IT',             cat:'Production', desc:'Best for: Instruction tuning and efficient processing.'},
      {id:'meta-llama/llama-4-scout-17b-16e-instruct',name:'Llama 4 Scout 17B',    cat:'Preview', desc:'Best for: Early access to next-gen Llama capabilities.'},
      {id:'moonshotai/kimi-k2-instruct-0905',     name:'Kimi K2',                   cat:'Preview', desc:'Best for: Advanced instruction following and reasoning.'},
      {id:'qwen/qwen3-32b',                       name:'Qwen 3 32B',                cat:'Preview', desc:'Best for: Multilingual tasks and coding.'},
      {id:'groq/compound',                        name:'Groq Compound',             cat:'Agentic', desc:'Best for: Complex agentic workflows and tool use.'},
      {id:'groq/compound-mini',                   name:'Groq Compound Mini',        cat:'Agentic', desc:'Best for: Fast, lightweight agentic tasks.'},
    ]
  },
  {
    id:'gemini', name:'Gemini', icon:'✦', desc:'Google DeepMind',
    color:'#0ea5e9', clo:'rgba(14,165,233,0.18)',
    models:[
      {id:'gemini-3.1-pro-preview',               name:'Gemini 3.1 Pro Preview',    cat:'Gemini 3.x', desc:'Best for: Complex reasoning, coding, math, and STEM.'},
      {id:'gemini-3.1-flash-lite-preview',        name:'Gemini 3.1 Flash Lite',     cat:'Gemini 3.x', desc:'Best for: High-speed, high-volume tasks.'},
      {id:'gemini-2.5-pro',                       name:'Gemini 2.5 Pro',            cat:'Gemini 2.5', desc:'Best for: Advanced reasoning and multimodal tasks.'},
      {id:'gemini-2.5-flash',                     name:'Gemini 2.5 Flash',          cat:'Gemini 2.5', desc:'Best for: Fast multimodal processing.'},
      {id:'gemini-2.5-flash-lite',                name:'Gemini 2.5 Flash Lite',     cat:'Gemini 2.5', desc:'Best for: Lightweight, fast multimodal tasks.'},
      {id:'gemini-2.0-flash',                     name:'Gemini 2.0 Flash',          cat:'Gemini 2.0', desc:'Best for: General multimodal tasks.'},
      {id:'gemini-2.0-flash-lite',                name:'Gemini 2.0 Flash Lite',     cat:'Gemini 2.0', desc:'Best for: Fast, efficient multimodal tasks.'},
    ]
  },
  {
    id:'openrouter', name:'OpenRouter', icon:'🔀', desc:'Multi-model gateway',
    color:'#8b5cf6', clo:'rgba(139,92,246,0.18)',
    models:[
      {id:'anthropic/claude-opus-4',              name:'Claude Opus 4',             cat:'Anthropic', desc:'Best for: Highly complex tasks and deep analysis.'},
      {id:'anthropic/claude-sonnet-4',            name:'Claude Sonnet 4',           cat:'Anthropic', desc:'Best for: Balanced performance and speed.'},
      {id:'anthropic/claude-3.5-sonnet',          name:'Claude 3.5 Sonnet',         cat:'Anthropic', desc:'Best for: Coding, reasoning, and general tasks.'},
      {id:'anthropic/claude-3.5-haiku',           name:'Claude 3.5 Haiku',          cat:'Anthropic', desc:'Best for: Fast, lightweight tasks.'},
      {id:'openai/gpt-4o',                        name:'GPT-4o',                    cat:'OpenAI', desc:'Best for: Advanced reasoning and multimodal tasks.'},
      {id:'openai/gpt-4o-mini',                   name:'GPT-4o Mini',               cat:'OpenAI', desc:'Best for: Fast, cost-effective tasks.'},
      {id:'openai/o3',                            name:'o3',                        cat:'OpenAI', desc:'Best for: Advanced reasoning and problem-solving.'},
      {id:'openai/o4-mini',                       name:'o4 Mini',                   cat:'OpenAI', desc:'Best for: Fast reasoning tasks.'},
      {id:'deepseek/deepseek-r1',                 name:'DeepSeek R1',               cat:'DeepSeek', desc:'Best for: Coding and reasoning.'},
      {id:'deepseek/deepseek-chat-v3-5',          name:'DeepSeek V3.5',             cat:'DeepSeek', desc:'Best for: General chat and reasoning.'},
      {id:'meta-llama/llama-4-maverick',          name:'Llama 4 Maverick',          cat:'Meta', desc:'Best for: Advanced reasoning and coding.'},
      {id:'meta-llama/llama-4-scout',             name:'Llama 4 Scout',             cat:'Meta', desc:'Best for: Fast, lightweight tasks.'},
      {id:'mistralai/mistral-large',              name:'Mistral Large',             cat:'Mistral', desc:'Best for: Complex reasoning and multilingual tasks.'},
      {id:'qwen/qwen3-235b-a22b',                 name:'Qwen3 235B',                cat:'Qwen', desc:'Best for: Advanced reasoning and coding.'},
      {id:'google/gemini-2.5-flash-image',        name:'Gemini 2.5 Flash Image',    cat:'Image',img:true,desc:'Best for: Fast, high-quality image generation.'},
      {id:'google/gemini-3.1-flash-image-preview',name:'Gemini 3.1 Flash Image',    cat:'Image',img:true,desc:'Best for: Pro-level image generation at Flash speed.'},
      {id:'google/gemini-3.1-pro-image-preview',  name:'Gemini 3.1 Pro Image',      cat:'Image',img:true,desc:'Best for: Most advanced Google image generation.'},
      {id:'openai/gpt-5-image',                   name:'GPT-5 Image',               cat:'Image',img:true,desc:'Best for: GPT-5 with image output.'},
      {id:'openai/gpt-5-image-mini',              name:'GPT-5 Image Mini',          cat:'Image',img:true,desc:'Best for: Faster, cheaper GPT-5 image generation.'},
      {id:'black-forest-labs/flux.2-pro',         name:'Flux 2 Pro',                cat:'Image',img:true,desc:'Best for: Black Forest Labs flagship image generation.'},
      {id:'black-forest-labs/flux.2-flex',        name:'Flux 2 Flex',               cat:'Image',img:true,desc:'Best for: Flexible steps & guidance in image generation.'},
      {id:'bytedance/seedream-4.5',               name:'SeedDream 4.5',             cat:'Image',img:true,desc:'Best for: Portrait & text rendering.'},
      {id:'sourceful/riverflow-v2-pro',           name:'Riverflow V2 Pro',          cat:'Image',img:true,desc:'Best for: Best quality & super-res image generation.'},
      {id:'sourceful/riverflow-v2-fast',          name:'Riverflow V2 Fast',         cat:'Image',img:true,desc:'Best for: Fastest image generation.'},
    ]
  },
  {
    id:'github', name:'GitHub Models', icon:'🐙', desc:'Microsoft / GitHub',
    color:'#94a3b8', clo:'rgba(148,163,184,0.18)',
    models:[
      {id:'gpt-4o',                               name:'GPT-4o',                    cat:'OpenAI', desc:'Best for: Advanced reasoning and multimodal tasks.'},
      {id:'gpt-4o-mini',                          name:'GPT-4o Mini',               cat:'OpenAI', desc:'Best for: Fast, cost-effective tasks.'},
      {id:'o1',                                   name:'o1',                        cat:'OpenAI', desc:'Best for: Advanced reasoning and problem-solving.'},
      {id:'o1-mini',                              name:'o1 Mini',                   cat:'OpenAI', desc:'Best for: Fast reasoning tasks.'},
      {id:'o3-mini',                              name:'o3 Mini',                   cat:'OpenAI', desc:'Best for: Fast reasoning tasks.'},
      {id:'Meta-Llama-3.3-70B-Instruct',          name:'Llama 3.3 70B',             cat:'Meta', desc:'Best for: General reasoning, coding, and instruction following.'},
      {id:'Meta-Llama-3.1-405B-Instruct',         name:'Llama 3.1 405B',            cat:'Meta', desc:'Best for: Highly complex tasks and deep analysis.'},
      {id:'Mistral-large',                        name:'Mistral Large',             cat:'Mistral', desc:'Best for: Complex reasoning and multilingual tasks.'},
      {id:'Mistral-small',                        name:'Mistral Small',             cat:'Mistral', desc:'Best for: Fast, lightweight tasks.'},
      {id:'Phi-4',                                name:'Phi-4',                     cat:'Microsoft', desc:'Best for: Small, efficient reasoning tasks.'},
      {id:'Phi-3.5-MoE-instruct',                name:'Phi-3.5 MoE',              cat:'Microsoft', desc:'Best for: Efficient reasoning and coding.'},
      {id:'AI21-Jamba-1.5-Large',                name:'Jamba 1.5 Large',          cat:'AI21', desc:'Best for: Long context windows and general tasks.'},
      {id:'DeepSeek-R1',                          name:'DeepSeek R1',               cat:'DeepSeek', desc:'Best for: Coding and reasoning.'},
    ]
  },
  {
    id:'sambanova', name:'SambaNova', icon:'🔥', desc:'Custom AI chips',
    color:'#ef4444', clo:'rgba(239,68,68,0.18)',
    models:[
      {id:'Meta-Llama-3.3-70B-Instruct',          name:'Llama 3.3 70B',             cat:'Meta Llama', desc:'Best for: General reasoning, coding, and instruction following.'},
      {id:'Meta-Llama-3.1-405B-Instruct',         name:'Llama 3.1 405B',            cat:'Meta Llama', desc:'Best for: Highly complex tasks and deep analysis.'},
      {id:'Meta-Llama-3.1-70B-Instruct',          name:'Llama 3.1 70B',             cat:'Meta Llama', desc:'Best for: General reasoning and coding.'},
      {id:'Meta-Llama-3.1-8B-Instruct',           name:'Llama 3.1 8B',              cat:'Meta Llama', desc:'Best for: Fast, lightweight tasks.'},
      {id:'DeepSeek-R1',                          name:'DeepSeek R1',               cat:'DeepSeek', desc:'Best for: Coding and reasoning.'},
      {id:'DeepSeek-R1-Distill-Llama-70B',        name:'DeepSeek R1 Distill 70B',   cat:'DeepSeek', desc:'Best for: Efficient coding and reasoning.'},
      {id:'DeepSeek-V3-0324',                     name:'DeepSeek V3',               cat:'DeepSeek', desc:'Best for: General chat and reasoning.'},
    ]
  },
  {
    id:'aimlapi', name:'AIMLAPI', icon:'🤖', desc:'AI/ML aggregator',
    color:'#22c55e', clo:'rgba(34,197,94,0.18)',
    models:[
      {id:'mistral-large-latest',                 name:'Mistral Large',             cat:'Text', desc:'Best for: Complex reasoning and multilingual tasks.'},
      {id:'meta-llama/Llama-3-70b-chat-hf',       name:'Llama 3 70B',               cat:'Text', desc:'Best for: General reasoning and chat.'},
      {id:'Qwen/Qwen2.5-72B-Instruct',            name:'Qwen 2.5 72B',              cat:'Text', desc:'Best for: Multilingual tasks and coding.'},
      {id:'deepseek/deepseek-r1',                 name:'DeepSeek R1',               cat:'Text', desc:'Best for: Coding and reasoning.'},
      {id:'google/gemini-2.0-flash',              name:'Gemini 2.0 Flash',          cat:'Text', desc:'Best for: Fast multimodal processing.'},
    ]
  },
  {
    id:'puter', name:'Puter', icon:'☁️', desc:'Free · no API key',
    color:'#3b82f6', clo:'rgba(59,130,246,0.18)',
    models:[
      {id:'gpt-image-1',                          name:'GPT Image 1',               cat:'OpenAI',img:true,desc:'Best for: Latest OpenAI image generation.'},
      {id:'gpt-image-1.5',                        name:'GPT Image 1.5',             cat:'OpenAI',img:true,desc:'Best for: Enhanced GPT Image generation.'},
      {id:'gpt-image-1-mini',                     name:'GPT Image Mini',            cat:'OpenAI',img:true,desc:'Best for: Fast & cheap image generation.'},
      {id:'dall-e-3',                             name:'DALL·E 3',                  cat:'OpenAI',img:true,desc:'Best for: HD quality & wide support.'},
      {id:'dall-e-2',                             name:'DALL·E 2',                  cat:'OpenAI',img:true,desc:'Best for: Classic & fast image generation.'},
      {id:'gemini-2.5-flash-image-preview',       name:'Gemini 2.5 Flash Image',    cat:'Google',img:true,desc:'Best for: Fast & sharp image generation.'},
      {id:'flux-1-schnell',                       name:'Flux 1 Schnell',            cat:'Flux',  img:true,desc:'Best for: Fastest Flux open-source image generation.'},
      {id:'flux-1-kontext',                       name:'Flux 1 Kontext',            cat:'Flux',  img:true,desc:'Best for: Context-aware image generation.'},
      {id:'flux-1.1-pro',                         name:'Flux 1.1 Pro',              cat:'Flux',  img:true,desc:'Best for: Top-tier Flux quality image generation.'},
      {id:'stable-diffusion-3',                   name:'Stable Diffusion 3',        cat:'SD',    img:true,desc:'Best for: Balanced quality image generation.'},
      {id:'stable-diffusion-xl',                  name:'Stable Diffusion XL',       cat:'SD',    img:true,desc:'Best for: High resolution image generation.'},
      {id:'ByteDance-Seed/Seedream-4.0',          name:'SeedDream 4.0',             cat:'Other', img:true,desc:'Best for: Portrait & text image generation.'},
      {id:'HiDream-ai/HiDream-I1-Full',           name:'HiDream I1 Full',           cat:'Other', img:true,desc:'Best for: Highest quality image generation.'},
      {id:'HiDream-ai/HiDream-I1-Fast',           name:'HiDream I1 Fast',           cat:'Other', img:true,desc:'Best for: Fast HiDream image generation.'},
      {id:'RunDiffusion/Juggernaut-pro-flux',     name:'Juggernaut Pro Flux',       cat:'Other', img:true,desc:'Best for: RunDiffusion flagship image generation.'},
      {id:'Qwen/Qwen-Image',                      name:'Qwen Image',                cat:'Other', img:true,desc:'Best for: Alibaba multilingual image generation.'},
    ]
  },
  {
    id:'pollinations', name:'Pollinations', icon:'🎨', desc:'Free image generation',
    color:'#e879f9', clo:'rgba(232,121,249,0.18)',
    models:[
      {id:'flux',         name:'Flux',         cat:'Image',img:true,desc:'Best for: Default high-quality image generation.'},
      {id:'flux-realism', name:'Flux Realism', cat:'Image',img:true,desc:'Best for: Photo-realistic style image generation.'},
      {id:'flux-anime',   name:'Flux Anime',   cat:'Image',img:true,desc:'Best for: Anime / illustration style image generation.'},
      {id:'flux-3d',      name:'Flux 3D',      cat:'Image',img:true,desc:'Best for: 3D render style image generation.'},
      {id:'turbo',        name:'Turbo (SDXL)', cat:'Image',img:true,desc:'Best for: Fastest image generation.'},
    ]
  },
];

// --- Styles ---
const STYLES = `
.orb {
  position: absolute; border-radius: 50%;
  filter: blur(140px); pointer-events: none; z-index: 0;
  transition: background 0.9s ease;
}
.orb-a { width:700px;height:700px;top:-280px;left:-180px;opacity:0.09; }
.orb-b { width:500px;height:500px;bottom:-220px;right:-120px;opacity:0.06; }

.scene {
  --card-w: 460px;
  --card-h: 290px;
  --card-offset: 488px;
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  z-index: 1;
  perspective: 1100px;
  perspective-origin: 50% 50%;
  overflow: hidden;
}

@media (max-width: 640px) {
  .scene {
    --card-w: 300px;
    --card-h: 380px;
    --card-offset: 316px;
  }
}

.card-stage {
  position: relative;
  width: var(--card-w);
  height: var(--card-h);
  transform-style: preserve-3d;
}

.model-card {
  position: absolute;
  width: var(--card-w);
  height: var(--card-h);
  left: 50%; top: 50%;
  transform: translate(-50%,-50%);
  transform-style: preserve-3d;
  backface-visibility: hidden;
  cursor: pointer;
  transition:
    transform 0.52s cubic-bezier(0.22,1,0.36,1),
    opacity   0.52s cubic-bezier(0.22,1,0.36,1),
    filter    0.52s ease;
  will-change: transform, opacity, filter;
}

.card-face {
  position: absolute; inset: 0;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  background: var(--bg-secondary);
  display: flex; flex-direction: column;
  justify-content: space-between;
  padding: 26px 30px 22px;
  overflow: hidden;
  box-shadow:
    0 1px 0 var(--glass-highlight) inset,
    0 20px 48px var(--modal-overlay);
  transition: border-color 0.4s, box-shadow 0.4s;
}

.card-face::before {
  content:''; position:absolute;
  top:0; right:18px;
  width:72px; height:1px;
  background: linear-gradient(to left, var(--pc), transparent);
  opacity:0; transition:opacity 0.4s;
}
.card-face::after {
  content:''; position:absolute;
  top:18px; right:0;
  width:1px; height:72px;
  background: linear-gradient(to bottom, var(--pc), transparent);
  opacity:0; transition:opacity 0.4s;
}
.model-card.is-center .card-face {
  border-color: var(--glass-text-muted);
  box-shadow:
    0 1px 0 var(--glass-highlight) inset,
    0 28px 60px var(--modal-overlay),
    0 0 0 1.5px var(--pc),
    0 0 40px color-mix(in srgb, var(--pc) 20%, transparent);
}
.model-card.is-center .card-face::before,
.model-card.is-center .card-face::after { opacity: 0.65; }
.model-card.is-confirmed.is-center .card-face {
  box-shadow:
    0 1px 0 var(--glass-highlight) inset,
    0 28px 60px var(--modal-overlay),
    0 0 0 2px var(--pc),
    0 0 56px color-mix(in srgb, var(--pc) 28%, transparent);
}

.card-chip {
  font-size:0.5rem; font-weight:600; text-transform:uppercase;
  letter-spacing:0.18em; padding:3px 10px; border-radius:3px;
  background:var(--glass-border); color:var(--glass-text-muted);
  transition: background 0.35s, color 0.35s;
}
.model-card.is-center .card-chip {
  background: var(--pclo); color: var(--pc);
}
.card-img-tag {
  font-size:0.44rem; text-transform:uppercase; letter-spacing:0.14em;
  color:#e879f9; background:rgba(232,121,249,0.1);
  border:1px solid rgba(232,121,249,0.22); padding:2px 7px; border-radius:3px;
}

.card-name {
  font-family: var(--font-sans);
  font-size: 1.5rem; font-weight:800;
  letter-spacing:-0.025em; line-height:1.1;
  color:var(--glass-text-muted);
  transition: color 0.35s;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
@media (max-width: 640px) {
  .card-name {
    white-space: normal;
    font-size: 1.25rem;
  }
}
.model-card.is-center .card-name { color:var(--text-primary); }

.card-id {
  font-size:0.5rem; letter-spacing:0.05em;
  color:var(--glass-text-muted); font-weight:300;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.card-desc-text {
  font-size:0.7rem; color:var(--glass-text-muted);
  letter-spacing:0.04em; line-height:1.55;
  margin-top: 4px;
}

.card-check {
  width:26px; height:26px; border-radius:50%;
  border:1.5px solid var(--glass-border);
  display:flex; align-items:center; justify-content:center;
  font-size:0.58rem; color:transparent;
  transition: all 0.3s; flex-shrink:0;
}
.model-card.is-center .card-check { border-color:var(--pc); color:var(--pc); }
.model-card.is-confirmed .card-check { background:var(--pc); border-color:var(--pc); color:var(--bg-primary); }

.dot-v {
  width:5px; height:5px; border-radius:50%;
  background:var(--glass-border); cursor:pointer;
  transition: all 0.25s; flex-shrink:0;
}
.dot-v.active { transform:scale(1.6); box-shadow:0 0 7px var(--pc); }

.dot-h {
  width:5px; height:5px; border-radius:50%;
  background:var(--glass-border); cursor:pointer;
  transition: all 0.25s; flex-shrink:0;
}
.dot-h.active { width:22px; border-radius:3px; box-shadow:0 0 5px var(--pc); }

.hint-arr.bv { animation:bv 1.9s ease-in-out infinite; }
.hint-arr.bh { animation:bh 1.9s ease-in-out infinite; }
@keyframes bv { 0%,100%{transform:translateY(0)} 50%{transform:translateY(5px)} }
@keyframes bh { 0%,100%{transform:translateX(0)} 50%{transform:translateX(5px)} }

.flash {
  position:absolute; inset:0; pointer-events:none; z-index:5;
  opacity:0; background:radial-gradient(ellipse at 50% 50%, var(--pc) 0%, transparent 68%);
  transition: opacity 0.1s;
}
.flash.on { opacity:0.07; }

/* Scrollbar hide */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

export default function AIModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [pIdx, setPIdx] = useState(0);
  const [mIdx, setMIdx] = useState(0);
  const [confirmed, setConfirmed] = useState<{pIdx: number, mIdx: number} | null>(null);
  const [flash, setFlash] = useState(false);
  
  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('selectedAIModel');
    if (stored) {
      // Find the provider and model index
      for (let p = 0; p < PROVIDERS.length; p++) {
        const m = PROVIDERS[p].models.findIndex(m => m.id === stored);
        if (m !== -1) {
          setPIdx(p);
          setMIdx(m);
          setConfirmed({ pIdx: p, mIdx: m });
          break;
        }
      }
    }
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  // Sync CSS variables
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current) {
      const p = PROVIDERS[pIdx];
      containerRef.current.style.setProperty('--pc', p.color);
      containerRef.current.style.setProperty('--pclo', p.clo);
    }
  }, [pIdx, isOpen]);

  const handleConfirm = () => {
    const p = PROVIDERS[pIdx];
    const m = p.models[mIdx];
    setConfirmed({ pIdx, mIdx });
    localStorage.setItem('selectedAIModel', m.id);
    window.dispatchEvent(new Event('ai-model-changed'));
    setTimeout(() => setIsOpen(false), 400); // Wait for animation
  };

  const jumpProvider = (i: number) => {
    const target = Math.max(0, Math.min(PROVIDERS.length - 1, i));
    if (target === pIdx) return;
    setPIdx(target);
    setMIdx(0);
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
  };

  const jumpModel = (i: number) => {
    const max = PROVIDERS[pIdx].models.length - 1;
    setMIdx(Math.max(0, Math.min(max, i)));
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') { e.preventDefault(); jumpProvider(Math.max(0, pIdx - 1)); }
      if (e.key === 'ArrowDown') { e.preventDefault(); jumpProvider(Math.min(PROVIDERS.length - 1, pIdx + 1)); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); jumpModel(mIdx - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); jumpModel(mIdx + 1); }
      if (e.key === 'Enter') handleConfirm();
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pIdx, mIdx]);

  // Wheel navigation
  const wCoolRef = useRef(false);
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (wCoolRef.current) return;

    // Filter out small inertia movements
    if (Math.abs(e.deltaX) < 5 && Math.abs(e.deltaY) < 5) return;

    wCoolRef.current = true;
    setTimeout(() => wCoolRef.current = false, 600);
    
    const ax = Math.abs(e.deltaX);
    const ay = Math.abs(e.deltaY);
    if (ay > ax) jumpProvider(pIdx + (e.deltaY > 0 ? 1 : -1));
    else jumpModel(mIdx + (e.deltaX > 0 ? 1 : -1));
  }, [pIdx, mIdx]);

  // Current selection for trigger button
  const currentSelection = confirmed 
    ? PROVIDERS[confirmed.pIdx].models[confirmed.mIdx] 
    : PROVIDERS[0].models[0];
  
  const currentProvider = confirmed
    ? PROVIDERS[confirmed.pIdx]
    : PROVIDERS[0];

  return (
    <>
      <style>{STYLES}</style>

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-full hover:bg-[var(--bg-tertiary)] transition-colors group"
      >
        <div className={`p-1 rounded-full bg-[var(--glass-highlight)] group-hover:bg-[var(--glass-border)] transition-colors`}>
          <Sparkles className={`w-3.5 h-3.5`} style={{ color: currentProvider.color }} />
        </div>
        <span className="text-xs font-medium text-[var(--text-primary)] hidden sm:inline">{currentSelection.name}</span>
        <ChevronDown className="w-3 h-3 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" />
      </button>

      {/* Full Screen Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[var(--modal-bg)] text-[var(--text-primary)] font-mono overflow-hidden"
            ref={containerRef}
            onWheel={handleWheel}
          >
            {/* Background Orbs */}
            <div className="orb orb-a" id="orbA" style={{ background: PROVIDERS[pIdx].color }} />
            <div className="orb orb-b" id="orbB" style={{ background: PROVIDERS[pIdx].color }} />
            <div className={`flash ${flash ? 'on' : ''}`} />

            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 left-6 z-20 p-2 rounded-full bg-[var(--glass-bg)] hover:bg-[var(--glass-border)] transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" />
            </button>

            {/* Mobile Nav Buttons */}
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-primary)] md:hidden active:scale-95 transition-all backdrop-blur-md"
              onClick={(e) => { e.stopPropagation(); jumpModel(mIdx - 1); }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-primary)] md:hidden active:scale-95 transition-all backdrop-blur-md"
              onClick={(e) => { e.stopPropagation(); jumpModel(mIdx + 1); }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute top-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10 pointer-events-none">
              <div className="text-[0.44rem] uppercase tracking-[0.3em] text-[var(--text-tertiary)]">// provider</div>
              <div className="font-sans text-lg font-bold tracking-tight transition-colors duration-300" style={{ color: PROVIDERS[pIdx].color }}>
                {PROVIDERS[pIdx].name}
              </div>
              <div className="text-[0.48rem] uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                {PROVIDERS[pIdx].desc}
              </div>
            </div>

            {/* HUD Confirm */}
            <div className="absolute top-6 right-6 flex items-center gap-4 z-10">
              <div className="text-right hidden sm:block">
                <div className="text-[0.44rem] uppercase tracking-[0.18em] text-[var(--text-tertiary)] mb-1">
                  {PROVIDERS[pIdx].name}
                </div>
                <div className="text-[0.68rem] font-semibold text-[var(--text-primary)] max-w-[200px] truncate">
                  {PROVIDERS[pIdx].models[mIdx].name}
                </div>
              </div>
              <button 
                onClick={handleConfirm}
                className="px-5 py-2.5 rounded-lg text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[var(--bg-primary)] transition-transform hover:-translate-y-px hover:brightness-110 active:scale-95"
                style={{ background: PROVIDERS[pIdx].color }}
              >
                Confirm →
              </button>
            </div>

            {/* Vertical Rail (Providers) */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-10 hidden md:flex">
              <div className="text-[0.38rem] uppercase tracking-[0.22em] text-[var(--text-tertiary)] vertical-lr mb-1 writing-mode-vertical-lr" style={{ writingMode: 'vertical-lr' }}>
                Provider
              </div>
              {PROVIDERS.map((p, i) => (
                <div
                  key={p.id}
                  onClick={() => jumpProvider(i)}
                  className={`dot-v ${i === pIdx ? 'active' : ''}`}
                  style={i === pIdx ? { background: p.color, boxShadow: `0 0 7px ${p.color}` } : {}}
                  title={p.name}
                />
              ))}
            </div>

            {/* Hints */}
            <div className="absolute left-6 bottom-8 flex flex-col items-center gap-1 z-10 opacity-20 pointer-events-none hidden sm:flex">
              <span className="hint-arr bv text-[0.65rem]">↕</span>
              <span className="text-[0.38rem] uppercase tracking-[0.2em]">Provider</span>
            </div>
            <div className="absolute right-6 bottom-8 flex items-center gap-1 z-10 opacity-20 pointer-events-none hidden sm:flex">
              <span className="text-[0.38rem] uppercase tracking-[0.2em]">Model</span>
              <span className="hint-arr bh text-[0.65rem]">↔</span>
            </div>

            {/* Scene */}
            <div className="scene">
              <div className="card-stage">
                {[-2, -1, 0, 1, 2].map((offset) => {
                  const targetIdx = mIdx + offset;
                  const models = PROVIDERS[pIdx].models;
                  
                  if (targetIdx < 0 || targetIdx >= models.length) return null;

                  const m = models[targetIdx];
                  const abs = Math.abs(offset);
                  const isCenter = abs === 0;
                  const isConfirmed = confirmed?.pIdx === pIdx && confirmed?.mIdx === targetIdx;

                  // Styles for 3D positioning
                  const z = -abs * 55;
                  const sc = 1 - abs * 0.07;
                  const op = abs === 0 ? 1 : abs === 1 ? 0.42 : 0.18;
                  const blur = abs * 2;
                  const ry = offset * -5;

                  return (
                    <div
                      key={`${pIdx}-${targetIdx}`}
                      className={`model-card ${isCenter ? 'is-center' : ''} ${isConfirmed ? 'is-confirmed' : ''}`}
                      style={{
                        transform: `translate(-50%,-50%) translate3d(calc(${offset} * var(--card-offset)),0,${z}px) rotateY(${ry}deg) scale(${sc})`,
                        opacity: op,
                        filter: blur > 0 ? `blur(${blur}px)` : 'none',
                        zIndex: 10 - abs,
                        pointerEvents: abs <= 1 ? 'all' : 'none',
                        cursor: isCenter ? 'default' : 'pointer'
                      }}
                      onClick={() => !isCenter && jumpModel(targetIdx)}
                    >
                      <div className="card-face">
                        {/* Top */}
                        <div className="flex items-center gap-2">
                          <span className="card-chip">{PROVIDERS[pIdx].icon} {PROVIDERS[pIdx].name}</span>
                          {m.img && <span className="card-img-tag">🖼 Image</span>}
                        </div>
                        
                        {/* Mid */}
                        <div className="flex-1 flex flex-col justify-center gap-2 py-1">
                          <div className="card-name">{m.name}</div>
                          <div className="card-id">{m.id}</div>
                          <div className="card-desc-text">{m.desc || ''}</div>
                        </div>

                        {/* Bot */}
                        <div className="flex items-center justify-between">
                          <span className="text-[0.44rem] uppercase tracking-[0.24em] text-white/15">{m.cat}</span>
                          <span className="card-check">
                            <Check className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Counter */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[0.44rem] tracking-[0.2em] text-[var(--text-tertiary)] z-10 pointer-events-none">
              {mIdx + 1} / {PROVIDERS[pIdx].models.length}
            </div>

            {/* Horizontal Rail (Models) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 max-w-[60vw] overflow-hidden px-4">
              {PROVIDERS[pIdx].models.slice(0, 22).map((_, i) => (
                <div
                  key={i}
                  onClick={() => jumpModel(i)}
                  className={`dot-h ${i === mIdx ? 'active' : ''}`}
                  style={i === mIdx ? { background: PROVIDERS[pIdx].color, boxShadow: `0 0 5px ${PROVIDERS[pIdx].color}` } : {}}
                />
              ))}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
