import { GoogleGenAI } from "@google/genai";

// Types
export type AIProvider = 'Gemini' | 'OpenAI' | 'Anthropic' | 'Mistral' | 'Meta' | 'Groq' | 'OpenRouter' | 'GitHub' | 'SambaNova' | 'AIMLAPI' | 'Puter' | 'Pollinations';
export type ImageModel = 'Imagen 3' | 'DALL-E 3' | 'Stable Diffusion XL';

export interface AIModelConfig {
  id: string;
  name: string;
  provider: AIProvider;
  icon: string; // Lucide icon name or custom string
  color: string;
}

export const AI_MODELS: AIModelConfig[] = [
  // Gemini
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Gemini', icon: 'Sparkles', color: 'text-teal-400' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', provider: 'Gemini', icon: 'Sparkles', color: 'text-teal-400' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Gemini', icon: 'Sparkles', color: 'text-teal-400' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Gemini', icon: 'Sparkles', color: 'text-teal-400' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', provider: 'Gemini', icon: 'Sparkles', color: 'text-teal-400' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', provider: 'Gemini', icon: 'Sparkles', color: 'text-teal-400' },
  { id: 'gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash Lite', provider: 'Gemini', icon: 'Sparkles', color: 'text-teal-400' },
  
  // Groq
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', provider: 'Groq', icon: 'Zap', color: 'text-orange-500' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', provider: 'Groq', icon: 'Zap', color: 'text-orange-500' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'Groq', icon: 'Zap', color: 'text-orange-500' },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B', provider: 'Groq', icon: 'Zap', color: 'text-orange-500' },
  
  // OpenRouter
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'OpenRouter', icon: 'Workflow', color: 'text-violet-500' },
  { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', provider: 'OpenRouter', icon: 'Workflow', color: 'text-violet-500' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenRouter', icon: 'Workflow', color: 'text-violet-500' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenRouter', icon: 'Workflow', color: 'text-violet-500' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'OpenRouter', icon: 'Workflow', color: 'text-violet-500' },
  
  // GitHub
  { id: 'gpt-4o', name: 'GPT-4o (GitHub)', provider: 'GitHub', icon: 'Github', color: 'text-slate-400' },
  { id: 'Phi-4', name: 'Phi-4', provider: 'GitHub', icon: 'Github', color: 'text-slate-400' },
  
  // SambaNova
  { id: 'Meta-Llama-3.1-405B-Instruct', name: 'Llama 3.1 405B', provider: 'SambaNova', icon: 'Flame', color: 'text-red-500' },
  
  // AIMLAPI
  { id: 'mistral-large-latest', name: 'Mistral Large', provider: 'AIMLAPI', icon: 'Bot', color: 'text-green-500' },
  
  // Puter (Images)
  { id: 'gpt-image-1', name: 'GPT Image 1', provider: 'Puter', icon: 'Cloud', color: 'text-blue-500' },
  { id: 'dall-e-3', name: 'DALL-E 3', provider: 'Puter', icon: 'Cloud', color: 'text-blue-500' },
  { id: 'flux-1.1-pro', name: 'Flux 1.1 Pro', provider: 'Puter', icon: 'Cloud', color: 'text-blue-500' },
  
  // Pollinations (Images)
  { id: 'flux', name: 'Flux', provider: 'Pollinations', icon: 'Palette', color: 'text-pink-500' },
  { id: 'turbo', name: 'Turbo', provider: 'Pollinations', icon: 'Palette', color: 'text-pink-500' },
  
  // Legacy/Fallbacks
  { id: 'claude-3-5-sonnet', name: 'Anthropic Claude', provider: 'Anthropic', icon: 'Diamond', color: 'text-purple-400' },
  { id: 'mistral-large', name: 'Mistral', provider: 'Mistral', icon: 'Waves', color: 'text-orange-400' },
  { id: 'llama-3', name: 'Meta LLaMA', provider: 'Meta', icon: 'Flame', color: 'text-red-400' },
];

export const IMAGE_MODELS: ImageModel[] = ['Imagen 3', 'DALL-E 3', 'Stable Diffusion XL'];

// Service Class
class AIService {
  private getStoredModel(): string {
    return localStorage.getItem('selectedAIModel') || 'gemini-2.0-flash';
  }

  private getStoredImageModel(): string {
    return localStorage.getItem('selectedImageModel') || 'Imagen 3';
  }

  public getApiKey(provider: AIProvider): string | null {
    return localStorage.getItem(`${provider}_API_KEY`);
  }

  public getAllApiKeys(): Record<string, string> {
    const keys: Record<string, string> = {};
    const providers = ['OpenAI', 'Anthropic', 'Groq', 'Mistral', 'Meta'];
    providers.forEach(p => {
      const k = localStorage.getItem(`${p}_API_KEY`);
      if (k) keys[p] = k;
    });
    return keys;
  }

  public getSelectedModelConfig(): AIModelConfig {
    const id = this.getStoredModel();
    return AI_MODELS.find(m => m.id === id) || AI_MODELS[0];
  }

  public getSelectedImageModel(): string {
    return this.getStoredImageModel();
  }

  public async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const modelConfig = this.getSelectedModelConfig();
    const apiKey = this.getApiKey(modelConfig.provider);

    // If using Gemini and no custom key, we might use the backend proxy or default env key
    // For this implementation, we'll route everything through our backend proxy to keep keys secure
    // if they are server-side, OR pass the client-side key if provided.

    try {
      const response = await fetch('/api/solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Pass client-side key if available, backend will prefer it over env var if logic permits
          // We need to update backend to accept this header if we want client-side keys to work
          'X-AI-API-Key': apiKey || '', 
        },
        body: JSON.stringify({
          questionId: 'chat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          question: prompt,
          provider: modelConfig.provider,
          model: modelConfig.id,
          topic: 'General Chat', // Context
          forceRefresh: true
        })
      });

      if (!response.ok) {
        throw new Error(`AI Service Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.solution; // The backend returns 'solution' field
    } catch (error) {
      console.error('AI Generation failed:', error);
      return "I'm having trouble connecting to the AI right now. Please check your settings or try again later.";
    }
  }

  public async generateImage(prompt: string, style: string): Promise<string> {
    const model = this.getSelectedImageModel();
    // For image generation, we might need specific endpoints. 
    // Since the previous implementation used client-side calls for images (Puter.js/Pollinations),
    // we can keep that or route through backend.
    // For now, let's mock the routing or use a placeholder if no backend support exists yet.
    
    // Placeholder logic for now, assuming we might implement a real backend endpoint later
    // or use the existing client-side logic from previous turns if available.
    // Let's use a simple Pollinations URL for now as a fallback/demo since it requires no key.
    
    const encodedPrompt = encodeURIComponent(`${style} style: ${prompt}`);
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true`;
  }
}

export const aiService = new AIService();
