import { GoogleGenAI } from "@google/genai";

// Initialize Gemini for complexity analysis (always available)
const getGemini = () => {
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is missing");
  return new GoogleGenAI({ apiKey: key });
};

interface APIKeys {
  OpenAI?: string;
  Anthropic?: string;
  Groq?: string;
  Mistral?: string;
  Meta?: string;
}

export async function smartRouteQuestion(question: string, keys: APIKeys) {
  try {
    const geminiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!geminiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please configure it in the Secrets panel.");
    }

    // 1. Analyze complexity using Gemini with a more detailed prompt
    const analysisPrompt = `Analyze the following engineering/academic question.
    
    Question: "${question}"
    
    Evaluate based on:
    1. Mathematical depth (calculus, differential equations, etc.)
    2. Logical reasoning required (multi-step derivation vs simple fact)
    3. Domain specificity (specialized engineering knowledge)
    4. Coding/Algorithm complexity (if applicable)
    
    Rate complexity from 1 to 10:
    1-3: Basic definitions, simple arithmetic, or common facts.
    4-6: Intermediate problems, single-formula applications, basic explanations.
    7-8: Advanced derivations, complex multi-part problems, specialized engineering topics.
    9-10: Extremely difficult theoretical proofs, complex system design, or advanced research-level questions.
    
    Return ONLY a JSON object:
    {"complexity": number, "reasoning": "string", "category": "math" | "physics" | "coding" | "general"}`;

    const analysisRes = await getGemini().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: analysisPrompt,
      config: { responseMimeType: "application/json" }
    });

    let complexity = 5;
    let category = 'general';
    try {
      const parsed = JSON.parse(analysisRes.text);
      complexity = parsed.complexity || 5;
      category = parsed.category || 'general';
    } catch (e) {
      console.error("Failed to parse complexity:", e);
    }

    // 2. Identify available APIs
    const activeAPIs = ['Gemini'];
    if ((keys.OpenAI && keys.OpenAI.length > 10) || process.env.OPENAI_API_KEY) activeAPIs.push('OpenAI');
    if ((keys.Anthropic && keys.Anthropic.length > 10) || process.env.ANTHROPIC_API_KEY) activeAPIs.push('Anthropic');
    if ((keys.Groq && keys.Groq.length > 10) || process.env.GROQ_API_KEY) activeAPIs.push('Groq');
    if (process.env.OPENROUTER_API_KEY) activeAPIs.push('OpenRouter');
    if (process.env.SAMBANOVA_API_KEY) activeAPIs.push('SambaNova');
    if (process.env.DEEPSEEK_API_KEY) activeAPIs.push('DeepSeek');
    
    // 3. Optimized Routing Logic
    let selectedModel = 'gemini-2.5-flash';
    let selectedProvider = 'Gemini';

    if (complexity >= 8) {
      // Tier 1: Reasoning Heavyweights
      if (activeAPIs.includes('Anthropic')) {
        selectedProvider = 'Anthropic';
        selectedModel = 'claude-3-5-sonnet-20241022';
      } else if (activeAPIs.includes('OpenAI')) {
        selectedProvider = 'OpenAI';
        selectedModel = 'gpt-4o';
      } else if (activeAPIs.includes('DeepSeek')) {
        selectedProvider = 'DeepSeek';
        selectedModel = 'deepseek-chat'; // DeepSeek V3 is excellent for reasoning
      } else if (activeAPIs.includes('OpenRouter')) {
        selectedProvider = 'OpenRouter';
        selectedModel = 'anthropic/claude-3.5-sonnet';
      } else {
        selectedProvider = 'Gemini';
        selectedModel = 'gemini-3.1-pro-preview';
      }
    } else if (complexity >= 5) {
      // Tier 2: Balanced Performance
      if (category === 'coding' && activeAPIs.includes('DeepSeek')) {
        selectedProvider = 'DeepSeek';
        selectedModel = 'deepseek-chat';
      } else if (activeAPIs.includes('Groq')) {
        selectedProvider = 'Groq';
        selectedModel = 'llama-3.3-70b-versatile';
      } else if (activeAPIs.includes('SambaNova')) {
        selectedProvider = 'SambaNova';
        selectedModel = 'Meta-Llama-3.1-70B-Instruct';
      } else {
        selectedProvider = 'Gemini';
        selectedModel = 'gemini-2.5-flash';
      }
    } else {
      // Tier 3: Speed Optimized
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
      category,
      activeAPIs,
      selectedProvider,
      selectedModel
    };
  } catch (error) {
    console.error("Smart routing failed, falling back to Gemini:", error);
    return {
      complexity: 5,
      category: 'general',
      activeAPIs: ['Gemini'],
      selectedProvider: 'Gemini',
      selectedModel: 'gemini-2.5-flash'
    };
  }
}

export async function generateWithProvider(provider: string, model: string, prompt: string, keys: APIKeys) {
  if (provider === 'Gemini') {
    const response = await getGemini().models.generateContent({
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
    case 'DeepSeek':
       apiUrl = 'https://api.deepseek.com/chat/completions';
       apiKey = process.env.DEEPSEEK_API_KEY || '';
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
  const response = await getGemini().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text;
}
