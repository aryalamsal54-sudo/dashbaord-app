/**
 * server/routes/aiProviders.ts
 *
 * Multi-provider AI backend route.
 * Drop this file into server/routes/ then register it in server.ts:
 *
 *   import aiRoutes from './server/routes/aiProviders';
 *   app.use('/api/ai', aiRoutes);
 *
 * The frontend sends:  POST /api/ai/solve
 * with body:
 *   { provider, modelId, prompt, systemPrompt? }
 *
 * Returns: { text: string }
 */

import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

// ─── provider configs ────────────────────────────────────────────────────────

const PROVIDER_BASE_URLS: Record<string, string> = {
  Groq:           'https://api.groq.com/openai/v1',
  OpenRouter:     'https://openrouter.ai/api/v1',
  'GitHub Models':'https://models.inference.ai.azure.com',
  SambaNova:      'https://api.sambanova.ai/v1',
  AIMLAPI:        'https://api.aimlapi.com/v1',
};

const PROVIDER_KEYS: Record<string, string | undefined> = {
  Groq:           process.env.GROQ_API_KEY,
  OpenRouter:     process.env.OPENROUTER_API_KEY,
  'GitHub Models':process.env.GITHUB_TOKEN,
  SambaNova:      process.env.SAMBANOVA_API_KEY,
  AIMLAPI:        process.env.AIMLAPI_KEY,
  Gemini:         process.env.GEMINI_API_KEY,
};

// ─── OpenAI-compatible call ───────────────────────────────────────────────────

async function callOpenAICompatible(
  provider: string,
  modelId: string,
  messages: { role: string; content: string }[],
): Promise<string> {
  const baseUrl = PROVIDER_BASE_URLS[provider];
  const apiKey  = PROVIDER_KEYS[provider];
  if (!baseUrl) throw new Error(`Unknown provider: ${provider}`);
  if (!apiKey)  throw new Error(`No API key configured for ${provider}. Set ${provider.toUpperCase().replace(/ /g,'_')}_API_KEY in .env`);

  const extraHeaders: Record<string, string> = {};
  if (provider === 'OpenRouter') {
    extraHeaders['HTTP-Referer'] = 'https://ioe-hub.app';
    extraHeaders['X-Title']      = 'IOE First Year Hub';
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      Authorization:   `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({ model: modelId, messages, max_tokens: 4096, temperature: 0.3 }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${provider} error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json() as any;
  return data.choices?.[0]?.message?.content ?? '';
}

// ─── Gemini call ──────────────────────────────────────────────────────────────

async function callGemini(modelId: string, prompt: string): Promise<string> {
  const apiKey = PROVIDER_KEYS['Gemini'];
  if (!apiKey) throw new Error('No GEMINI_API_KEY set');
  const ai  = new GoogleGenAI({ apiKey });
  const res = await ai.models.generateContent({ model: modelId, contents: prompt });
  return res.text ?? '';
}

// ─── Main solve endpoint ──────────────────────────────────────────────────────

router.post('/solve', async (req, res) => {
  const { provider, modelId, prompt, systemPrompt } = req.body as {
    provider: string;
    modelId:  string;
    prompt:   string;
    systemPrompt?: string;
  };

  if (!provider || !modelId || !prompt) {
    return res.status(400).json({ error: 'provider, modelId, and prompt are required' });
  }

  try {
    let text = '';

    if (provider === 'Gemini') {
      const full = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      text = await callGemini(modelId, full);
    } else {
      const messages: { role: string; content: string }[] = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: prompt });
      text = await callOpenAICompatible(provider, modelId, messages);
    }

    res.json({ text });
  } catch (err: any) {
    console.error('[AI Providers]', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
