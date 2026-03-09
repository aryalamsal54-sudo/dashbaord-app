import express from 'express';
import { GoogleGenAI } from "@google/genai";
import db from '../db';
import { PROGRAMMING_TOPICS } from '../data/programmingTopics';
import { smartRouteQuestion, generateWithProvider } from '../utils/aiRouter';

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

router.get('/topics', (req, res) => {
  res.json(PROGRAMMING_TOPICS);
});

router.post('/solve', async (req, res) => {
  const { questionId, question, topic, type, forceRefresh, apiKeys = {} } = req.body;
  
  if (!forceRefresh) {
    const cached = db.prepare('SELECT * FROM programming_solutions WHERE question_id = ?').get(questionId) as any;
    if (cached && cached.solution) {
      return res.json({ solution: cached.solution, modelUsed: cached.model_used, cached: true });
    }
  }

  try {
    let prompt = "";

    if (type === 'theory') {
      prompt = `You are an expert Computer Science teacher. Provide a detailed theoretical explanation for the following question: "${question}"
      
      Format the output using Markdown. 
      Use clear headings, bullet points, and bold text for emphasis.
      If you include any math, use LaTeX ($ for inline, $$ for block).`;
    } else if (type === 'output') {
      prompt = `You are an expert C programmer. Determine the output of the following C code snippet or expression: "${question}"
      
      Format the output using Markdown.
      Structure your response as follows:
      ## Output:
      \`\`\`text
      (The expected output)
      \`\`\`
      
      ## Explanation:
      (Step-by-step evaluation of the code)`;
    } else {
      prompt = `You are an expert C programmer and teacher. Write a complete, compilable C program to solve the following problem: "${question}"
      
      If the problem explicitly mentions Fortran, write a Fortran program instead.

      Format the output using Markdown.
      Structure your response as follows:
      ## Logic:
      (Brief explanation of the algorithm/logic)
      
      ## Code:
      \`\`\`c
      (Your complete, commented code)
      \`\`\`
      
      ## Expected Output:
      \`\`\`text
      (Sample output of the program)
      \`\`\``;
    }

    // Smart Routing
    const routing = await smartRouteQuestion(question, apiKeys);
    console.log(`[Smart Route Programming] Complexity: ${routing.complexity}/10 | Selected: ${routing.selectedProvider} (${routing.selectedModel})`);
    
    const solution = await generateWithProvider(routing.selectedProvider, routing.selectedModel, prompt, apiKeys);
    const modelUsed = `${routing.selectedProvider} (${routing.selectedModel}) [Complexity: ${routing.complexity}/10]`;

    db.prepare(`
      INSERT INTO programming_solutions (question_id, question, solution, model_used, solved, topic)
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
