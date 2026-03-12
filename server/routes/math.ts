import express from 'express';
import db from '../db';
import { MATH_TOPICS } from '../data/mathTopics';

const router = express.Router();

const SOLVER_PROMPT = `You are an expert mathematician. Solve the given problem 
with full working, showing every single intermediate step. Do not skip any step 
no matter how trivial. Show all substitutions, simplifications, integrations, 
differentiations, and transformations clearly. If an indeterminate form exists 
(0/0, inf/inf, 0*inf etc), identify it explicitly. Output only the complete 
mathematical working — no commentary, no introduction, no conclusion.`;

const FORMATTER_PROMPT = `You are a LaTeX math formatter.

YOUR ONLY JOB: Take a math solution and reformat it.

OUTPUT RULES — ZERO EXCEPTIONS:
- Every single step on its OWN line
- Every line MUST start with $$ and end with $$
- Put a real newline character \\n between every line
- ONE mathematical transformation per line — never combine two steps
- NO words, NO labels, NO "Step 1", NO "Therefore", NO English text
- NO explanations anywhere
- If indeterminate form, write it as its own line:
  $$\\left[\\frac{\\infty}{\\infty}\\text{ — apply L'Hôpital}\\right]$$
- Last line is ALWAYS: $$\\therefore \\text{ans} = [answer]$$
- Do NOT put multiple = signs chained on one line
  WRONG:  $$a = b = c = d$$
  RIGHT:  $$a = b$$
          $$= c$$
          $$= d$$

EXAMPLE OF PERFECT OUTPUT (copy this exact style):
$$\\lim_{x \\to \\infty} \\frac{\\ln x}{\\sqrt{x}}$$
$$\\left[\\frac{\\infty}{\\infty}\\text{ — apply L'Hôpital's Rule}\\right]$$
$$= \\lim_{x \\to \\infty} \\frac{\\frac{d}{dx}(\\ln x)}{\\frac{d}{dx}(\\sqrt{x})}$$
$$= \\lim_{x \\to \\infty} \\frac{\\frac{1}{x}}{\\frac{1}{2\\sqrt{x}}}$$
$$= \\lim_{x \\to \\infty} \\frac{2\\sqrt{x}}{x}$$
$$= \\lim_{x \\to \\infty} \\frac{2}{\\sqrt{x}}$$
$$= \\frac{2}{\\infty}$$
$$\\therefore \\text{ans} = 0$$

Each $$ block is on its own line. That is the entire output.
Nothing before the first $$. Nothing after the last $$.`;

const EXPLAINER_PROMPT = `You are a friendly math tutor explaining a solution 
out loud to a confused student. You are given a LaTeX math solution.

STRICT RULES:
- Convert every step into natural spoken English
- NEVER use LaTeX or symbols — this will be read aloud by TTS
- Say "y squared" not "y^2"
- Say "dy by dx" not "dy/dx"
- Say "the natural log of x" not "ln x"  
- Say "plus" "minus" "divided by" "multiplied by" — spell everything out
- Keep each step to maximum 2 simple sentences
- Speak like a calm, clear tutor — not a textbook
- End with: "And that is our final answer."
- No bullet points, no numbering, just flowing spoken sentences.`;

async function solveWithGroq(question: string): Promise<{ formatted: string, explanation: string }> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set');

  const groqFetch = async (model: string, systemPrompt: string, userContent: string) => {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        temperature: model === 'qwen/qwen3-32b' ? 0.6 : 0.3,
        top_p: 0.95,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userContent }
        ]
      })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq API error: ${err}`);
    }
    const data = await res.json();
    return data.choices[0].message.content as string;
  };

  // Phase 1 — Solve
  const rawSolution = await groqFetch('qwen/qwen3-32b', SOLVER_PROMPT, question);

  // Phase 2 — Format into LaTeX
  const formatted = await groqFetch('llama-3.3-70b-versatile', FORMATTER_PROMPT, rawSolution);

  // Phase 3 — Explain in spoken English (for voice button)
  const explanation = await groqFetch('llama-3.3-70b-versatile', EXPLAINER_PROMPT, formatted);

  return { formatted, explanation };
}

router.get('/topics', (req, res) => {
  res.json(MATH_TOPICS);
});

router.post('/solve', async (req, res) => {
  const { questionId, question, topic, forceRefresh } = req.body;
  
  if (!forceRefresh) {
    const { rows } = await db.query('SELECT * FROM math_solutions WHERE question_id = $1', [questionId]);
    const cached = rows[0];
    if (cached && cached.solution) {
      try {
        const parsed = JSON.parse(cached.solution);
        return res.json({ 
          solution: parsed.formattedSolution || cached.solution, 
          explanation: parsed.voiceExplanation, 
          source: 'groq',
          cached: true 
        });
      } catch (e) {
        return res.json({ solution: cached.solution, source: 'groq', cached: true });
      }
    }
  }

  try {
    const { formatted, explanation } = await solveWithGroq(question);

    await db.query(`
      INSERT INTO math_solutions (question_id, question, solution, model_used, solved, topic)
      VALUES ($1, $2, $3, $4, 1, $5)
      ON CONFLICT(question_id) DO UPDATE SET
        solution = EXCLUDED.solution,
        model_used = EXCLUDED.model_used,
        solved = 1,
        updated_at = CURRENT_TIMESTAMP
    `, [questionId, question, JSON.stringify({ formattedSolution: formatted, voiceExplanation: explanation }), 'Groq (3-Phase Pipeline)', topic || 'unknown']);

    res.json({ solution: formatted, explanation, source: 'groq', cached: false });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

async function generateVoice(text: string): Promise<Buffer> {
  const response = await fetch(
    'https://api.groq.com/openai/v1/audio/speech',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'canopylabs/orpheus-v1-english',
        voice: 'troy',
        input: text,
        response_format: 'wav'
      })
    }
  );
  
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq TTS error: ${err}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

router.post('/tts', async (req, res) => {
  try {
    const { explanation } = req.body;
    if (!explanation) {
      return res.status(400).json({ error: 'Explanation is required' });
    }
    const audioBuffer = await generateVoice(explanation);
    res.set('Content-Type', 'audio/wav');
    res.send(audioBuffer);
  } catch (error: any) {
    console.error("TTS Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
