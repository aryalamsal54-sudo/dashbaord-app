import express from 'express';
import { GoogleGenAI } from "@google/genai";
import db from '../db';
import { PHYSICS_TOPICS } from '../data/physicsTopics';
import { PHYSICS_NUMERICALS } from '../data/physicsNumericals';
import { smartRouteQuestion, generateWithProvider } from '../utils/aiRouter';

const router = express.Router();
// Initialize AI with API key from environment
// Note: In AI Studio, the key is injected as GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

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
  const { questionId, question, topic, tab, forceRefresh, apiKeys = {} } = req.body;
  
  if (!forceRefresh) {
    const cached = db.prepare('SELECT * FROM physics_solutions WHERE question_id = ?').get(questionId) as any;
    if (cached && cached.solution) {
      return res.json({ solution: cached.solution, modelUsed: cached.model_used, cached: true });
    }
  }

  try {
    let prompt = "";
    
    if (tab === 'derivations') {
        prompt = `You are a physics expert. Derive the following: ${question}
        
        Format the output using Markdown. 
        Use LaTeX for all mathematical equations and symbols.
        - Use $$ ... $$ for block equations.
        - Use $ ... $ for inline equations.
        
        Structure your response with clear headings (e.g., ## Step 1: ...), bullet points for explanations, and a bold "Final Result" section at the end.`;
    } else {
        // Numerical prompt
        prompt = `You are an expert university physics solver. Solve the following problem step-by-step: ${question}

        Format the output using Markdown. 
        Use LaTeX for all mathematical equations and symbols.
        - Use $$ ... $$ for block equations.
        - Use $ ... $ for inline equations.

        Structure your response with the following sections:
        ## Given:
        (List known quantities with symbols and units)
        
        ## Formula:
        (State the relevant equations used)
        
        ## Working:
        (Step-by-step calculation with explanations)
        
        ## Answer:
        (Final numerical result with units in bold)`;
    }

    // Smart Routing
    const routing = await smartRouteQuestion(question, apiKeys);
    console.log(`[Smart Route] Complexity: ${routing.complexity}/10 | Selected: ${routing.selectedProvider} (${routing.selectedModel})`);
    
    const solution = await generateWithProvider(routing.selectedProvider, routing.selectedModel, prompt, apiKeys);
    const modelUsed = `${routing.selectedProvider} (${routing.selectedModel}) [Complexity: ${routing.complexity}/10]`;

    db.prepare(`
      INSERT INTO physics_solutions (question_id, question, solution, model_used, solved, topic, tab, topic_title, num)
      VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?)
      ON CONFLICT(question_id) DO UPDATE SET
        solution = excluded.solution,
        model_used = excluded.model_used,
        solved = 1,
        updated_at = CURRENT_TIMESTAMP
    `).run(questionId, question, solution, modelUsed, topic || 'unknown', tab || 'unknown', 'Physics', '0');

    res.json({ solution, modelUsed, cached: false, complexity: routing.complexity });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
