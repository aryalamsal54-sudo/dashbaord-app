import express from 'express';
import db from '../db';

const router = express.Router();

async function callGroq(systemPrompt: string, userContent: string, model = 'llama-3.3-70b-versatile'): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ]
    })
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.choices[0].message.content;
}

router.post('/solve', async (req, res) => {
  const { questionId, question, topic, tab, forceRefresh } = req.body;
  
  if (!forceRefresh) {
    const cached = db.prepare('SELECT * FROM physics_solutions WHERE question_id = ?').get(questionId) as any;
    if (cached && cached.solution) {
      return res.json({ solution: cached.solution, modelUsed: cached.model_used, cached: true });
    }
  }

  const systemPrompt = topic === 'General Chat' 
    ? "You are a helpful AI assistant. Answer the following question. Format your response using Markdown. Use headings, bullet points, and bold text for clarity. If you include any math, use LaTeX ($ for inline, $$ for block)."
    : "You are a physics expert. Derive the following. Format the output using Markdown. Use LaTeX for all mathematical equations and symbols. Use $$ ... $$ for block equations. Use $ ... $ for inline equations. Structure your response with clear headings (e.g., ## Step 1: ...), bullet points for explanations, and a bold \"Final Result\" section at the end.";

  try {
    const solution = await callGroq(systemPrompt, question);
    const modelUsed = 'Groq (llama-3.3-70b-versatile)';

    if (topic !== 'General Chat') {
      db.prepare(`
        INSERT INTO physics_solutions (question_id, question, solution, model_used, solved, topic, tab, topic_title, num)
        VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?)
        ON CONFLICT(question_id) DO UPDATE SET
          solution = excluded.solution,
          model_used = excluded.model_used,
          solved = 1,
          updated_at = CURRENT_TIMESTAMP
      `).run(questionId, question, solution, modelUsed, topic || 'unknown', tab || 'unknown', 'Physics', '0');
    }

    res.json({ solution, modelUsed, cached: false });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/solution/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM physics_solutions WHERE question_id = ?').get(req.params.id);
  res.json(row || { solution: null });
});

router.get('/solved-ids', (req, res) => {
  const rows = db.prepare('SELECT question_id FROM physics_solutions WHERE solved = 1').all() as any[];
  res.json({ ids: rows.map(r => r.question_id) });
});

router.get('/admin/users', (req, res) => {
    try {
        const users = db.prepare(`
            SELECT id, first_name, last_name, username, created_at, last_seen_at,
            (SELECT SUM(duration_sec) FROM user_sessions WHERE user_id = users.id) as total_seconds
            FROM users
        `).all();
        res.json({ users });
    } catch (e) {
        res.json({ users: [] });
    }
});

router.get('/admin/user/:id/sessions', (req, res) => {
    try {
        const sessions = db.prepare('SELECT * FROM user_sessions WHERE user_id = ? ORDER BY session_start DESC').all(req.params.id);
        res.json({ sessions });
    } catch (e) {
        res.json({ sessions: [] });
    }
});

export default router;
