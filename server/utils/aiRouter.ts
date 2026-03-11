import db from "../db";

// Rate limit tracking
export async function markModelAsRateLimited(provider: string, model: string) {
  const today = new Date().toISOString().split('T')[0];
  try {
    await db.query(`
      INSERT INTO rate_limits (provider, model, date)
      VALUES ($1, $2, $3)
      ON CONFLICT (provider, model, date) DO NOTHING
    `, [provider, model, today]);
  } catch (e) {
    console.error("Error marking rate limit", e);
  }
}

export async function isModelRateLimited(provider: string, model: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  try {
    const { rows } = await db.query(`
      SELECT 1 FROM rate_limits 
      WHERE provider = $1 AND model = $2 AND date = $3
    `, [provider, model, today]);
    return rows.length > 0;
  } catch (e) {
    return false;
  }
}

interface APIKeys {
  Groq?: string;
}

export async function smartRouteQuestion(question: string, keys: APIKeys) {
  try {
    // Simplified complexity analysis using Groq
    const analysisPrompt = `Analyze the following engineering/academic question.
    
    Question: "${question}"
    
    Return ONLY a JSON object:
    {"complexity": number (1-10), "category": "math" | "physics" | "coding" | "general"}`;

    const solution = await generateWithProvider('Groq', 'llama-3.3-70b-versatile', analysisPrompt, keys);
    
    let complexity = 5;
    let category = 'general';
    try {
      const parsed = JSON.parse(solution);
      complexity = parsed.complexity || 5;
      category = parsed.category || 'general';
    } catch (e) {
      console.error("Failed to parse complexity:", e);
    }

    // 2. Identify available APIs
    const activeAPIs = ['Groq', 'Puter'];
    
    // 3. Optimized Routing Logic
    let selectedModel = 'llama-3.3-70b-versatile';
    let selectedProvider = 'Groq';

    // Helper to check if a model is available (not rate limited)
    const isAvailable = async (provider: string, model: string) => !(await isModelRateLimited(provider, model));

    if (complexity >= 5) {
      if (activeAPIs.includes('Groq') && await isAvailable('Groq', 'llama-3.3-70b-versatile')) {
        selectedProvider = 'Groq';
        selectedModel = 'llama-3.3-70b-versatile';
      } else {
        selectedProvider = 'Puter';
        selectedModel = 'puter-model';
      }
    } else {
      if (activeAPIs.includes('Groq') && await isAvailable('Groq', 'llama-3.1-8b-instant')) {
        selectedProvider = 'Groq';
        selectedModel = 'llama-3.1-8b-instant';
      } else {
        selectedProvider = 'Puter';
        selectedModel = 'puter-model';
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
    console.error("Smart routing failed, falling back to Groq:", error);
    return {
      complexity: 5,
      category: 'general',
      activeAPIs: ['Groq'],
      selectedProvider: 'Groq',
      selectedModel: 'llama-3.3-70b-versatile'
    };
  }
}

export async function generateWithProvider(provider: string, model: string, prompt: string, keys: APIKeys) {
  try {
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
      if (!res.ok) throw data.error || new Error('Groq API error');
      return data.choices[0].message.content;
    }

    if (provider === 'Puter') {
      const res = await fetch('https://api.puter.com/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await res.json();
      if (!res.ok) throw data.error || new Error('Puter API error');
      return data.choices[0].message.content;
    }

    throw new Error(`Unsupported provider: ${provider}`);
    
  } catch (error: any) {
    if (error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED') || error.message?.includes('quota') || error.message?.includes('rate limit')) {
      await markModelAsRateLimited(provider, model);
    }
    throw error;
  }
}
