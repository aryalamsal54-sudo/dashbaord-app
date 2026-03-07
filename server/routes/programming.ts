/**
 * server/routes/programming.ts  — updated version
 */

import express from 'express';
import { GoogleGenAI } from "@google/genai";
import db from '../db';
import { PROGRAMMING_TOPICS } from '../data/programmingTopics';

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.get('/topics', (req, res) => {
  res.json(PROGRAMMING_TOPICS);
});

router.get('/solved-ids', (req, res) => {
  const rows = db.prepare('SELECT question_id FROM programming_solutions WHERE solved = 1').all() as any[];
  res.json({ ids: rows.map((r: any) => r.question_id) });
});

router.post('/solve', async (req, res) => {
  const { questionId, question, topic, type, forceRefresh, solution: precomputedSolution, modelUsed: precomputedModel } = req.body;

  if (precomputedSolution && precomputedModel) {
    try {
      db.prepare(`
        INSERT INTO programming_solutions (question_id, question, solution, model_used, solved, topic)
        VALUES (?, ?, ?, ?, 1, ?)
        ON CONFLICT(question_id) DO UPDATE SET
          solution = excluded.solution,
          model_used = excluded.model_used,
          solved = 1,
          updated_at = CURRENT_TIMESTAMP
      `).run(questionId, question, precomputedSolution, precomputedModel, topic || 'unknown');
      return res.json({ solution: precomputedSolution, modelUsed: precomputedModel, cached: false });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (!forceRefresh) {
    const cached = db.prepare('SELECT * FROM programming_solutions WHERE question_id = ?').get(questionId) as any;
    if (cached && cached.solution) {
      return res.json({ solution: cached.solution, modelUsed: cached.model_used, cached: true });
    }
  }

  try {
    const model = "gemini-2.5-flash";
    let prompt = "";

    if (type === 'theory') {
      prompt = `You are an expert CS teacher. Explain: "${question}"
      <div class="ai-solution"><div class="theory-explanation"><h3 class="text-lg font-semibold text-blue-300 mb-2">Explanation</h3><p class="mb-4">Your explanation...</p><ul class="list-disc pl-5 space-y-1 text-slate-300"><li>Key point 1</li></ul></div></div>
      Return raw HTML only.`;
    } else if (type === 'output') {
      prompt = `You are an expert C programmer. What is the output of: "${question}"
      <div class="ai-solution"><div class="output-result mb-6"><strong class="text-blue-300 block mb-2">Output:</strong><pre class="bg-black/30 p-4 rounded-lg border border-white/10 font-mono text-emerald-400">output</pre></div><div class="output-explanation"><h3 class="text-lg font-semibold text-blue-300 mb-2">Evaluation</h3><p class="text-slate-300">explanation</p></div></div>
      Return raw HTML only.`;
    } else {
      prompt = `You are an expert C programmer. Solve: "${question}"
      <div class="ai-solution"><div class="code-explanation mb-6"><p class="text-slate-300">Logic explanation.</p></div><div class="code-block mb-6 relative group"><pre class="bg-[#0b1120] p-4 rounded-xl border border-white/10 overflow-x-auto"><code class="language-c text-sm font-mono text-blue-100">// code here</code></pre></div><div class="code-output"><strong class="text-blue-300 block mb-2">Expected Output:</strong><pre class="bg-black/30 p-4 rounded-lg border border-white/10 font-mono text-sm text-slate-400">output</pre></div></div>
      Return raw HTML only.`;
    }

    const response = await ai.models.generateContent({ model, contents: prompt });
    const solution = response.text;
    const modelUsed = "Gemini 2.5 Flash";

    db.prepare(`
      INSERT INTO programming_solutions (question_id, question, solution, model_used, solved, topic)
      VALUES (?, ?, ?, ?, 1, ?)
      ON CONFLICT(question_id) DO UPDATE SET
        solution = excluded.solution,
        model_used = excluded.model_used,
        solved = 1,
        updated_at = CURRENT_TIMESTAMP
    `).run(questionId, question, solution, modelUsed, topic || 'unknown');

    res.json({ solution, modelUsed, cached: false });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
