import { GoogleGenAI } from "@google/genai";

// Initialize Gemini for complexity analysis (always available)
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

interface APIKeys {
  OpenAI?: string;
  Anthropic?: string;
  Groq?: string;
  Mistral?: string;
  Meta?: string;
}

export async function smartRouteQuestion(question: string, keys: APIKeys) {
  try {
    // 1. Analyze complexity using Gemini
    const analysisPrompt = `Analyze the complexity of the following question on a scale of 1 to 10.
    1-3: Simple factual recall or basic calculation.
    4-7: Multi-step problem solving, intermediate logic.
    8-10: Highly complex, advanced reasoning, coding, or abstract math.
    
    Question: "${question}"
    
    Return ONLY a JSON object with this exact structure:
    {"complexity": number, "reasoning": "string"}`;

    const analysisRes = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: analysisPrompt,
      config: { responseMimeType: "application/json" }
    });

    let complexity = 5;
    try {
      const parsed = JSON.parse(analysisRes.text);
      complexity = parsed.complexity || 5;
    } catch (e) {
      console.error("Failed to parse complexity:", e);
    }

    // 2. Ping APIs to see which are active
    // We'll do a quick check based on provided keys.
    // In a real scenario, we'd make a tiny request to validate the key, but to save time/latency,
    // we'll assume if the key is provided and looks valid (length > 10), it's active.
    // We also always have Gemini available.
    
    const activeAPIs = ['Gemini'];
    if (keys.OpenAI && keys.OpenAI.length > 10) activeAPIs.push('OpenAI');
    if (keys.Anthropic && keys.Anthropic.length > 10) activeAPIs.push('Anthropic');
    if (keys.Groq && keys.Groq.length > 10) activeAPIs.push('Groq');
    
    // 3. Choose the best model
    let selectedModel = 'gemini-2.5-flash';
    let selectedProvider = 'Gemini';

    if (complexity >= 8) {
      // High complexity: Prefer OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), or Gemini Pro
      if (activeAPIs.includes('Anthropic')) {
        selectedProvider = 'Anthropic';
        selectedModel = 'claude-3-5-sonnet-20241022';
      } else if (activeAPIs.includes('OpenAI')) {
        selectedProvider = 'OpenAI';
        selectedModel = 'gpt-4o';
      } else {
        selectedProvider = 'Gemini';
        selectedModel = 'gemini-3.1-pro-preview';
      }
    } else if (complexity >= 5) {
      // Medium complexity: Prefer Groq (fast Llama 3.3 70B) or Gemini Flash
      if (activeAPIs.includes('Groq')) {
        selectedProvider = 'Groq';
        selectedModel = 'llama-3.3-70b-versatile';
      } else {
        selectedProvider = 'Gemini';
        selectedModel = 'gemini-2.5-flash';
      }
    } else {
      // Low complexity: Prefer Groq (fast Llama 3.1 8B) or Gemini Flash Lite
      if (activeAPIs.includes('Groq')) {
        selectedProvider = 'Groq';
        selectedModel = 'llama-3.1-8b-instant';
      } else {
        selectedProvider = 'Gemini';
        selectedModel = 'gemini-2.5-flash-lite';
      }
    }

    return {
      complexity,
      activeAPIs,
      selectedProvider,
      selectedModel
    };
  } catch (error) {
    console.error("Smart routing failed, falling back to Gemini:", error);
    return {
      complexity: 5,
      activeAPIs: ['Gemini'],
      selectedProvider: 'Gemini',
      selectedModel: 'gemini-2.5-flash'
    };
  }
}

export async function generateWithProvider(provider: string, model: string, prompt: string, keys: APIKeys) {
  if (provider === 'Gemini') {
    const response = await gemini.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
  }
  
  if (provider === 'Groq') {
    const apiKey = keys.Groq || process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("Groq API key missing");
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    return data.choices[0].message.content;
  }

  if (provider === 'OpenAI') {
    const apiKey = keys.OpenAI || process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OpenAI API key missing");
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    return data.choices[0].message.content;
  }

  if (provider === 'Anthropic') {
    const apiKey = keys.Anthropic || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("Anthropic API key missing");
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    return data.content[0].text;
  }

  // Generic OpenAI-compatible fetcher for OpenRouter, etc.
  let apiUrl = '';
  let apiKey = '';
  
  switch (provider) {
    case 'OpenRouter':
      apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
      apiKey = process.env.OPENROUTER_API_KEY || '';
      break;
    case 'GitHub Models':
    case 'GitHub':
       apiUrl = 'https://models.inference.ai.azure.com/chat/completions';
       apiKey = process.env.GITHUB_MODELS_API_KEY || '';
       break;
    case 'AIMLAPI':
       apiUrl = 'https://api.aimlapi.com/chat/completions';
       apiKey = process.env.AIMLAPI_API_KEY || '';
       break;
    case 'SambaNova':
       apiUrl = 'https://api.sambanova.ai/v1/chat/completions';
       apiKey = process.env.SAMBANOVA_API_KEY || '';
       break;
  }

  if (apiUrl && apiKey) {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    return data.choices[0].message.content;
  }

  // Fallback
  const response = await gemini.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text;
}
