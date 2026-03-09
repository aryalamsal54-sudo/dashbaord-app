import { GoogleGenAI } from "@google/genai";

// Types
export type AIProvider = 'Groq' | 'Puter';
export type ImageModel = 'Imagen 3' | 'DALL-E 3' | 'Stable Diffusion XL';

export interface AIModelConfig {
  id: string;
  name: string;
  provider: AIProvider;
  icon: string; // Lucide icon name or custom string
  color: string;
}

export const AI_MODELS: AIModelConfig[] = [
  // Groq
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', provider: 'Groq', icon: 'Zap', color: 'text-orange-500' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', provider: 'Groq', icon: 'Zap', color: 'text-orange-500' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'Groq', icon: 'Zap', color: 'text-orange-500' },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B', provider: 'Groq', icon: 'Zap', color: 'text-orange-500' },
  
  // Puter
  { id: 'puter-model', name: 'Puter General', provider: 'Puter', icon: 'Cloud', color: 'text-blue-500' },
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
    const providers = ['Groq'];
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
          forceRefresh: true,
          apiKeys: this.getAllApiKeys()
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
