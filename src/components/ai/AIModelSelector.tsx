import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, X, Check, Search } from 'lucide-react';
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
.beam-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: var(--modal-bg);
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.beam-ring {
  position: absolute;
  border-radius: 50%;
  animation: spin linear infinite;
}
.beam-ring::before {
  content: '';
  position: absolute;
  inset: -40px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent 0%, transparent 60%, var(--pc) 100%);
  mask-image: radial-gradient(transparent 60%, black 65%);
  -webkit-mask-image: radial-gradient(transparent 60%, black 65%);
  opacity: 0.6;
  filter: blur(8px);
}
.beam-1 { width: 120vh; height: 120vh; animation-duration: 12s; }
.beam-2 { width: 90vh; height: 90vh; animation-duration: 8s; animation-direction: reverse; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* Custom Scrollbar */
.model-scroll::-webkit-scrollbar { width: 6px; }
.model-scroll::-webkit-scrollbar-track { background: transparent; }
.model-scroll::-webkit-scrollbar-thumb { background: var(--border-primary); border-radius: 10px; }
.model-scroll::-webkit-scrollbar-thumb:hover { background: var(--text-tertiary); }
`;

export default function AIModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeProviderId, setActiveProviderId] = useState(PROVIDERS[0].id);
  const [search, setSearch] = useState('');
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [providerStatus, setProviderStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/ai/status');
        const data = await res.json();
        setProviderStatus(data);
      } catch (e) {
        console.error('Failed to fetch AI status', e);
      }
    };
    fetchStatus();

    const stored = localStorage.getItem('selectedAIModel');
    if (stored) {
      setConfirmedId(stored);
      const p = PROVIDERS.find(p => p.models.some(m => m.id === stored));
      if (p) setActiveProviderId(p.id);
    } else {
      setConfirmedId(PROVIDERS[0].models[0].id);
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

  const activeProvider = PROVIDERS.find(p => p.id === activeProviderId) || PROVIDERS[0];
  
  const handleSelect = (modelId: string) => {
    setConfirmedId(modelId);
    localStorage.setItem('selectedAIModel', modelId);
    window.dispatchEvent(new Event('ai-model-changed'));
    setTimeout(() => setIsOpen(false), 300);
  };

  const currentProviderForColor = PROVIDERS.find(p => p.models.some(m => m.id === confirmedId)) || PROVIDERS[0];
  const currentModel = currentProviderForColor.models.find(m => m.id === confirmedId) || currentProviderForColor.models[0];

  const filteredModels = activeProvider.models.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.desc?.toLowerCase().includes(search.toLowerCase()) ||
    m.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{STYLES}</style>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-full hover:bg-[var(--bg-tertiary)] transition-colors group"
      >
        <div className="p-1 rounded-full bg-[var(--glass-highlight)] group-hover:bg-[var(--glass-border)] transition-colors">
          <Sparkles className="w-3.5 h-3.5" style={{ color: currentProviderForColor.color }} />
        </div>
        <span className="text-xs font-medium text-[var(--text-primary)] hidden sm:inline">{currentModel.name}</span>
        <ChevronDown className="w-3 h-3 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
            style={{ '--pc': activeProvider.color } as any}
          >
            {/* Background Beams */}
            <div className="beam-bg">
              <div className="beam-ring beam-1" />
              <div className="beam-ring beam-2" />
              <div className="absolute inset-0 bg-[var(--modal-bg)] opacity-80 backdrop-blur-3xl" />
            </div>

            {/* Main Dashboard Modal */}
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-6xl h-[85vh] bg-[var(--bg-primary)]/90 backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
              style={{ boxShadow: `0 0 40px ${activeProvider.clo}` }}
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Sidebar: Companies */}
              <div className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-[var(--border-primary)] bg-[var(--bg-secondary)]/50 flex flex-col z-10">
                <div className="p-6 border-b border-[var(--border-primary)]">
                  <h2 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                    <Sparkles className="w-5 h-5" style={{ color: activeProvider.color }} />
                    AI Models
                  </h2>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">Select your intelligence</p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1 model-scroll flex flex-row md:flex-col">
                  {PROVIDERS.map(p => {
                    const isProviderActive = providerStatus[p.id];
                    return (
                      <button
                        key={p.id}
                        onClick={() => { setActiveProviderId(p.id); setSearch(''); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          activeProviderId === p.id 
                            ? 'bg-[var(--bg-primary)] shadow-sm border border-[var(--border-primary)]' 
                            : 'hover:bg-[var(--bg-tertiary)] border border-transparent text-[var(--text-secondary)]'
                        }`}
                      >
                        <div className="relative">
                          <span className="text-xl">{p.icon}</span>
                          <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-secondary)] ${isProviderActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        </div>
                        <div className="text-left flex-1 hidden md:block">
                          <div className={`text-sm font-semibold ${activeProviderId === p.id ? 'text-[var(--text-primary)]' : ''}`}>
                            {p.name}
                          </div>
                          <div className="text-[10px] text-[var(--text-tertiary)] truncate">{p.models.length} models</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Window: Models */}
              <div className="flex-1 flex flex-col z-10 bg-gradient-to-br from-transparent to-[var(--bg-secondary)]/30 overflow-hidden">
                <div className="p-6 border-b border-[var(--border-primary)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] transition-colors duration-300" style={{ color: activeProvider.color }}>
                      {activeProvider.name}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{activeProvider.desc}</p>
                  </div>
                  <div className="relative w-full sm:w-64 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      type="text"
                      placeholder="Search models..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-secondary)] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 model-scroll">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredModels.map(m => {
                      const isSelected = confirmedId === m.id;
                      const isProviderActive = providerStatus[activeProvider.id];
                      return (
                        <div
                          key={m.id}
                          onClick={() => handleSelect(m.id)}
                          className={`relative group p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col h-full ${
                            isSelected 
                              ? 'bg-[var(--bg-secondary)] shadow-lg' 
                              : 'bg-[var(--bg-primary)]/50 hover:bg-[var(--bg-secondary)] hover:shadow-md border-[var(--border-primary)]'
                          } ${!isProviderActive ? 'border-red-500/30' : ''}`}
                          style={isSelected ? { 
                            borderColor: isProviderActive ? activeProvider.color : '#ef4444', 
                            boxShadow: `0 4px 20px ${isProviderActive ? activeProvider.clo : 'rgba(239,68,68,0.15)'}` 
                          } : {}}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex flex-col gap-1">
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-primary)]">
                                {m.cat}
                              </span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${isProviderActive ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                                <span className={`text-[8px] uppercase font-bold tracking-widest ${isProviderActive ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {isProviderActive ? 'Active' : 'Missing Key'}
                                </span>
                              </div>
                            </div>
                            {m.img && <span className="text-lg" title="Image Generation">🖼️</span>}
                          </div>
                          <h4 className={`text-lg font-bold mb-1 ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
                            {m.name}
                          </h4>
                          <p className="text-[10px] text-[var(--text-tertiary)] font-mono mb-3 truncate">{m.id}</p>
                          <p className="text-sm text-[var(--text-secondary)] mt-auto leading-relaxed">
                            {m.desc}
                          </p>
                          
                          {isSelected && (
                            <div className="absolute top-5 right-5 w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: isProviderActive ? activeProvider.color : '#ef4444' }}>
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {filteredModels.length === 0 && (
                      <div className="col-span-full py-12 text-center text-[var(--text-tertiary)]">
                        No models found matching "{search}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
