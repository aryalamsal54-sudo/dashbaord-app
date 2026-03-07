/**
 * server/routes/physics.ts  — updated version
 *
 * Changes from original:
 *   The /solve endpoint now also accepts a `solution` and `modelUsed` in the
 *   POST body. When those are provided, it skips calling Gemini and goes
 *   straight to persisting the solution to the DB.
 *
 *   This allows the frontend to:
 *     1. Call /api/ai/solve (multi-provider) → get text
 *     2. POST /api/physics/solve { solution: text, modelUsed: ... } → persist
 *
 *   The original Gemini fallback is preserved when `solution` is absent.
 */

import express from 'express';
import { GoogleGenAI } from "@google/genai";
import db from '../db';
import { PHYSICS_TOPICS } from '../data/physicsTopics';
import { PHYSICS_NUMERICALS } from '../data/physicsNumericals';

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.get('/topics', (req, res) => {
  res.json(PHYSICS_TOPICS);
});

router.get('/numericals', (req, res) => {
  res.json(PHYSICS_NUMERICALS);
});

router.get('/solution/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM physics_solutions WHERE question_id = ?').get(req.params.id);
  res.json(row || { solution: null });
});

router.get('/solved-ids', (req, res) => {
  const rows = db.prepare('SELECT question_id FROM physics_solutions WHERE solved = 1').all() as any[];
  res.json({ ids: rows.map(r => r.question_id) });
});

router.post('/solve', async (req, res) => {
  const { questionId, question, topic, tab, forceRefresh, solution: precomputedSolution, modelUsed: precomputedModel } = req.body;

  // ── If frontend already solved it with a multi-provider model, just persist ──
  if (precomputedSolution && precomputedModel) {
    try {
      db.prepare(`
        INSERT INTO physics_solutions (question_id, question, solution, model_used, solved, topic, tab, topic_title, num)
        VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?)
        ON CONFLICT(question_id) DO UPDATE SET
          solution = excluded.solution,
          model_used = excluded.model_used,
          solved = 1,
          updated_at = CURRENT_TIMESTAMP
      `).run(questionId, question, precomputedSolution, precomputedModel, topic || 'unknown', tab || 'unknown', 'Physics', '0');

      return res.json({ solution: precomputedSolution, modelUsed: precomputedModel, cached: false });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ── Check DB cache (unless forceRefresh) ─────────────────────────────────
  if (!forceRefresh) {
    const cached = db.prepare('SELECT * FROM physics_solutions WHERE question_id = ?').get(questionId) as any;
    if (cached && cached.solution) {
      return res.json({ solution: cached.solution, modelUsed: cached.model_used, cached: true });
    }
  }

  // ── Gemini fallback ───────────────────────────────────────────────────────
  try {
    const model = "gemini-2.5-flash";
    let prompt = "";

    if (tab === 'derivations') {
      prompt = `You are a physics expert. Derive the following: ${question}

      Format the output as HTML with the following structure:
      <div class="ai-solution">
        <div class="sol-step">
          <p class="sol-text">Explanation of the step</p>
          <div class="math-block">Equation</div>
        </div>
        <div class="sol-result">
          <span class="sol-result-label">Final Result</span>
          <span class="sol-result-val">Equation</span>
        </div>
      </div>
      Use <code class="math"> for inline math. Return raw HTML only.`;
    } else {
      prompt = `You are an expert university physics solver. Solve: ${question}

      Format the output as HTML:
      <div class="ai-solution">
        <div class="sol-step"><p class="sol-text">GIVEN:</p><div class="math-block">List knowns</div></div>
        <div class="sol-step"><p class="sol-text">FORMULA:</p><div class="math-block">Equations</div></div>
        <div class="sol-step"><p class="sol-text">WORKING:</p><div class="math-block">Calculation</div></div>
        <div class="sol-result">
          <span class="sol-result-label">Answer</span>
          <span class="sol-result-val">Result with units</span>
        </div>
      </div>
      Use <code class="math"> for inline math. Return raw HTML only.`;
    }

    const response = await ai.models.generateContent({ model, contents: prompt });
    const solution = response.text;
    const modelUsed = "Gemini 2.5 Flash";

    db.prepare(`
      INSERT INTO physics_solutions (question_id, question, solution, model_used, solved, topic, tab, topic_title, num)
      VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?)
      ON CONFLICT(question_id) DO UPDATE SET
        solution = excluded.solution,
        model_used = excluded.model_used,
        solved = 1,
        updated_at = CURRENT_TIMESTAMP
    `).run(questionId, question, solution, modelUsed, topic || 'unknown', tab || 'unknown', 'Physics', '0');

    res.json({ solution, modelUsed, cached: false });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
