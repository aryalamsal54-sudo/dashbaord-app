/**
 * server/routes/math.ts  — updated version
 * Same pattern: if frontend sends a pre-computed solution, just persist it.
 */

import express from 'express';
import { GoogleGenAI } from "@google/genai";
import db from '../db';
import { MATH_TOPICS } from '../data/mathTopics';

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.get('/topics', (req, res) => {
  res.json(MATH_TOPICS);
});

router.get('/solved-ids', (req, res) => {
  const rows = db.prepare('SELECT question_id FROM math_solutions WHERE solved = 1').all() as any[];
  res.json({ ids: rows.map((r: any) => r.question_id) });
});

router.post('/solve', async (req, res) => {
  const { questionId, question, topic, forceRefresh, solution: precomputedSolution, modelUsed: precomputedModel } = req.body;

  if (precomputedSolution && precomputedModel) {
    try {
      db.prepare(`
        INSERT INTO math_solutions (question_id, question, solution, model_used, solved, topic)
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
    const cached = db.prepare('SELECT * FROM math_solutions WHERE question_id = ?').get(questionId) as any;
    if (cached && cached.solution) {
      return res.json({ solution: cached.solution, modelUsed: cached.model_used, cached: true });
    }
  }

  try {
    const model = "gemini-2.5-flash";
    const prompt = `You are a mathematics expert. Solve the following problem step-by-step: ${question}

    Format the output as HTML:
    <div class="ai-solution">
      <div class="sol-step">
        <p class="sol-text">Explanation</p>
        <div class="math-block">Equation</div>
      </div>
      <div class="sol-result">
        <span class="sol-result-label">Final Answer</span>
        <span class="sol-result-val">Result</span>
      </div>
    </div>
    Use <code class="math"> for inline math. Return raw HTML only.`;

    const response = await ai.models.generateContent({ model, contents: prompt });
    const solution = response.text;
    const modelUsed = "Gemini 2.5 Flash";

    db.prepare(`
      INSERT INTO math_solutions (question_id, question, solution, model_used, solved, topic)
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
