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
      
      Format the output as HTML with the following structure:
      <div class="ai-solution">
        <div class="theory-explanation">
          <h3 class="text-lg font-semibold text-blue-300 mb-2">Explanation</h3>
          <p class="mb-4">Your detailed explanation here...</p>
          <ul class="list-disc pl-5 space-y-1 text-slate-300">
            <li>Key point 1</li>
            <li>Key point 2</li>
          </ul>
        </div>
      </div>
      
      Do not use Markdown. Return raw HTML. Use Tailwind CSS classes for styling where appropriate (text-slate-300, etc.).`;
    } else if (type === 'output') {
      prompt = `You are an expert C programmer. Determine the output of the following C code snippet or expression: "${question}"
      
      Format the output as HTML with the following structure:
      <div class="ai-solution">
        <div class="output-result mb-6">
          <strong class="text-blue-300 block mb-2">Output:</strong>
          <pre class="bg-black/30 p-4 rounded-lg border border-white/10 font-mono text-emerald-400">The output value</pre>
        </div>
        <div class="output-explanation">
          <h3 class="text-lg font-semibold text-blue-300 mb-2">Step-by-Step Evaluation</h3>
          <p class="text-slate-300">Explanation of how the output was derived...</p>
        </div>
      </div>
      
      Do not use Markdown. Return raw HTML.`;
    } else {
      prompt = `You are an expert C programmer and teacher. Write a complete, compilable C program to solve the following problem: "${question}"
      
      If the problem explicitly mentions Fortran, write a Fortran program instead.

      Format the output as HTML with the following structure:
      <div class="ai-solution">
        <div class="code-explanation mb-6">
          <p class="text-slate-300">Brief explanation of the logic.</p>
        </div>
        <div class="code-block mb-6 relative group">
          <pre class="bg-[#0b1120] p-4 rounded-xl border border-white/10 overflow-x-auto"><code class="language-c text-sm font-mono text-blue-100">
// Your code here
#include <stdio.h>
...
          </code></pre>
        </div>
        <div class="code-output">
          <strong class="text-blue-300 block mb-2">Expected Output:</strong>
          <pre class="bg-black/30 p-4 rounded-lg border border-white/10 font-mono text-sm text-slate-400">Sample output...</pre>
        </div>
      </div>
      
      Do not use Markdown code blocks (like \`\`\`c). Return raw HTML. Ensure the code is clean, commented, and follows standard practices.`;
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
