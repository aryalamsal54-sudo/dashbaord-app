import express from 'express';
import { GoogleGenAI } from "@google/genai";
import db from '../db';
import { MATH_TOPICS } from '../data/mathTopics';
import { smartRouteQuestion, generateWithProvider } from '../utils/aiRouter';

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

router.get('/topics', (req, res) => {
  res.json(MATH_TOPICS);
});

router.post('/solve', async (req, res) => {
  const { questionId, question, topic, forceRefresh, apiKeys = {} } = req.body;
  
  if (!forceRefresh) {
    const cached = db.prepare('SELECT * FROM math_solutions WHERE question_id = ?').get(questionId) as any;
    if (cached && cached.solution) {
      return res.json({ solution: cached.solution, modelUsed: cached.model_used, cached: true });
    }
  }

  try {
    const prompt = `You are a mathematics expert. Solve the following problem step-by-step: ${question}
    
    Format the output using Markdown. 
    Use LaTeX for all mathematical equations and symbols.
    - Use $$ ... $$ for block equations.
    - Use $ ... $ for inline equations.
    
    Structure your response with clear headings (e.g., ## Step 1: ...), bullet points for explanations, and a bold "Final Answer" section at the end.`;

    // Smart Routing
    const routing = await smartRouteQuestion(question, apiKeys);
    console.log(`[Smart Route Math] Complexity: ${routing.complexity}/10 | Selected: ${routing.selectedProvider} (${routing.selectedModel})`);
    
    const solution = await generateWithProvider(routing.selectedProvider, routing.selectedModel, prompt, apiKeys);
    const modelUsed = `${routing.selectedProvider} (${routing.selectedModel}) [Complexity: ${routing.complexity}/10]`;

    db.prepare(`
      INSERT INTO math_solutions (question_id, question, solution, model_used, solved, topic)
      VALUES (?, ?, ?, ?, 1, ?)
      ON CONFLICT(question_id) DO UPDATE SET
        solution = excluded.solution,
        model_used = excluded.model_used,
        solved = 1,
        updated_at = CURRENT_TIMESTAMP
    `).run(questionId, question, solution, modelUsed, topic || 'unknown');

    res.json({ solution, modelUsed, cached: false, complexity: routing.complexity });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
