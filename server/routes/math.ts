import express from 'express';
import { GoogleGenAI } from "@google/genai";
import db from '../db';
import { MATH_TOPICS } from '../data/mathTopics';

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.get('/topics', (req, res) => {
  res.json(MATH_TOPICS);
});

router.post('/solve', async (req, res) => {
  const { questionId, question, topic, forceRefresh } = req.body;
  
  if (!forceRefresh) {
    const cached = db.prepare('SELECT * FROM math_solutions WHERE question_id = ?').get(questionId) as any;
    if (cached && cached.solution) {
      return res.json({ solution: cached.solution, modelUsed: cached.model_used, cached: true });
    }
  }

  try {
    const model = "gemini-2.5-flash";
    const prompt = `You are a mathematics expert. Solve the following problem step-by-step: ${question}
    
    Format the output as HTML with the following structure:
    <div class="ai-solution">
      <div class="sol-step">
        <p class="sol-text">Explanation of the step</p>
        <div class="math-block">Equation (use LaTeX if needed, or plain text math)</div>
      </div>
      ...
      <div class="sol-result">
        <span class="sol-result-label">Final Answer</span>
        <span class="sol-result-val">Result</span>
      </div>
    </div>
    
    Use <code class="math"> for inline math.
    Do not use Markdown code blocks. Return raw HTML.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    
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
