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
    const { rows } = await db.query('SELECT * FROM math_solutions WHERE question_id = $1', [questionId]);
    const cached = rows[0];
    if (cached && cached.solution) {
      try {
        const parsed = JSON.parse(cached.solution);
        return res.json({ 
          solution: parsed.formattedSolution, 
          explanation: parsed.voiceExplanation, 
          audioBase64: parsed.audioBase64,
          modelUsed: cached.model_used, 
          cached: true 
        });
      } catch (e) {
        // Fallback for old cached solutions
        return res.json({ solution: cached.solution, modelUsed: cached.model_used, cached: true });
      }
    }
  }

  try {
    // Step 1: Solver
    const solverPrompt = `You are an expert mathematician. Solve the given problem with full working, 
showing every single intermediate step. Do not skip any step no matter how 
trivial. Show all substitutions, simplifications, integrations, and 
transformations clearly. Output only the solution — no commentary, no 
introduction, no conclusion. Just the complete mathematical working.

Problem: ${question}`;

    const rawSolution = await generateWithProvider('Groq', 'qwen-qwq-32b', solverPrompt, apiKeys);

    // Step 2: Formatter
    const formatterPrompt = `You are a LaTeX math formatter. You receive a solved math solution and 
reformat it into clean LaTeX.

STRICT RULES — no exceptions:
- Output ONLY LaTeX math, one transformation per line
- Every line must be wrapped in \\[ ... \\]
- NO words. NO labels. NO "Step 1". NO "Therefore". NO "Simplifying". 
  NO "We get". NO "Substituting". NOTHING like that.
- NO explanations. NO descriptions. NO text of any kind.
- Each line shows exactly one mathematical transformation from the previous
- Final line must always be: \\[\\therefore \\text{ans} = ...\\]
- Do not render the same expression twice on one line

Example output:
\\[\\frac{dy}{dx} + \\frac{y}{x} = y^2\\]
\\[w = y^{-1},\\quad y = \\frac{1}{w}\\]
\\[\\frac{dw}{dx} - \\frac{w}{x} = -1\\]
\\[\\mu = \\frac{1}{x}\\]
\\[\\frac{d}{dx}\\left(\\frac{w}{x}\\right) = -\\frac{1}{x}\\]
\\[\\frac{w}{x} = -\\ln x + C\\]
\\[y = \\frac{1}{x(C - \\ln x)}\\]
\\[\\therefore y = \\frac{1}{x(C - \\ln x)}\\]

That is the entire output. Nothing before it. Nothing after it.

Solution to format:
${rawSolution}`;

    const formattedSolution = await generateWithProvider('Groq', 'llama-3.3-70b-versatile', formatterPrompt, apiKeys);

    // Step 3: Voice Explainer
    const explainerPrompt = `You are a friendly math tutor explaining a solution out loud to a student 
who is confused. You are given a LaTeX math solution.

STRICT RULES:
- Convert every step into natural spoken English
- NEVER use LaTeX or symbols in your output — it will be read aloud by TTS
- Say "y squared" not "y^2"
- Say "dy by dx" not "dy/dx" or "\\frac{dy}{dx}"
- Say "plus" "minus" "divided by" "multiplied by" — spell it all out
- Say "the natural log of x" not "ln x"
- Keep each step to maximum 2 simple sentences
- Speak like a calm, clear tutor — not a textbook
- End with: "And that is our final answer."
- No bullet points. No numbering. Just flowing spoken sentences.

LaTeX Solution:
${formattedSolution}`;

    const voiceExplanation = await generateWithProvider('Groq', 'llama-3.3-70b-versatile', explainerPrompt, apiKeys);

    // Generate Audio using Gemini TTS
    let audioBase64 = null;
    try {
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: voiceExplanation }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (ttsError) {
      console.error("TTS Generation Error:", ttsError);
    }

    const modelUsed = `Qwen QwQ 32B (Solver) + Llama 3.3 (Formatter) + Llama 3.3 & Gemini TTS (Voice)`;

    await db.query(`
      INSERT INTO math_solutions (question_id, question, solution, model_used, solved, topic)
      VALUES ($1, $2, $3, $4, 1, $5)
      ON CONFLICT(question_id) DO UPDATE SET
        solution = EXCLUDED.solution,
        model_used = EXCLUDED.model_used,
        solved = 1,
        updated_at = CURRENT_TIMESTAMP
    `, [questionId, question, JSON.stringify({ formattedSolution, voiceExplanation, audioBase64 }), modelUsed, topic || 'unknown']);

    res.json({ solution: formattedSolution, explanation: voiceExplanation, audioBase64, modelUsed, cached: false, complexity: 10 });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
