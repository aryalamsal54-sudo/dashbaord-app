import express from 'express';
import db from '../db';
import { PROGRAMMING_TOPICS } from '../data/programmingTopics';

const router = express.Router();

const SOLVER_PROMPT = `You are an expert computer scientist and programmer. 
Solve the given problem with full working, showing logic and code.
If the problem asks for theory, provide a detailed explanation.
If it asks for a program, provide complete, commented code.
Output only the complete solution — no commentary, no introduction, no conclusion.`;

const FORMATTER_PROMPT = `You are a technical document formatter. You receive a 
programming solution and reformat it into clean Markdown.

STRICT RULES — no exceptions:
- Use clear headings (## Logic, ## Code, ## Output)
- Use code blocks with appropriate language tags (e.g., \`\`\`c)
- If there is math, use LaTeX ($ for inline, $$ for block) — use dollar signs, not square brackets, not \[ \]
- NO conversational filler. NO "Here is the solution".
- Output only the formatted content.`;

const EXPLAINER_PROMPT = `You are a friendly programming tutor explaining a 
solution out loud to a confused student. You are given a technical solution.

STRICT RULES:
- Convert the logic and code purpose into natural spoken English
- NEVER use code blocks or symbols — this will be read aloud by TTS
- Explain the "why" behind the code in simple terms
- Keep each step to maximum 2 simple sentences
- Speak like a calm, clear tutor
- End with: "And that is how we solve this programming problem."
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

  // Phase 2 — Format into Markdown
  const formatted = await groqFetch('llama-3.3-70b-versatile', FORMATTER_PROMPT, rawSolution);

  // Phase 3 — Explain in spoken English
  const explanation = await groqFetch('llama-3.3-70b-versatile', EXPLAINER_PROMPT, formatted);

  return { formatted, explanation };
}

router.get('/topics', (req, res) => {
  res.json(PROGRAMMING_TOPICS);
});

router.post('/solve', async (req, res) => {
  const { questionId, question, topic, forceRefresh } = req.body;
  
  if (!forceRefresh) {
    const { rows } = await db.query('SELECT * FROM programming_solutions WHERE question_id = $1', [questionId]);
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
      INSERT INTO programming_solutions (question_id, question, solution, model_used, solved, topic)
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

export default router;
