import db from '../db';
import { smartRouteQuestion, generateWithProvider } from './aiRouter';

async function solveQuestion(table: string, row: any) {
  const { question_id, question, topic } = row;
  console.log(`[Background Solver] Solving ${question_id} from ${table}...`);

  try {
    const prompt = `You are an expert tutor. Solve the following problem step-by-step: ${question}
    
    Format the output using Markdown. 
    Use LaTeX for all mathematical equations and symbols.
    - Use $$ ... $$ for block equations.
    - Use $ ... $ for inline equations.
    
    Structure your response with clear headings (e.g., ## Step 1: ...), bullet points for explanations, and a bold "Final Answer" section at the end.`;

    // Use default keys if none provided (or empty object)
    const routing = await smartRouteQuestion(question, {});
    const solution = await generateWithProvider(routing.selectedProvider, routing.selectedModel, prompt, {});
    const modelUsed = `${routing.selectedProvider} (${routing.selectedModel}) [Complexity: ${routing.complexity}/10]`;

    await db.query(`
      UPDATE ${table}
      SET solution = $1, model_used = $2, solved = 1, updated_at = CURRENT_TIMESTAMP
      WHERE question_id = $3
    `, [solution, modelUsed, question_id]);

    console.log(`[Background Solver] Solved ${question_id} successfully.`);
  } catch (error) {
    console.error(`[Background Solver] Failed to solve ${question_id}:`, error);
    // If it fails, we might want to mark it as failed or just leave it for next time.
    // Let's leave it for next time.
  }
}

export async function startBackgroundSolver() {
  console.log('[Background Solver] Starting background solving process...');
  
  const tables = ['physics_solutions', 'math_solutions', 'programming_solutions'];
  
  while (true) {
    let found = false;
    
    for (const table of tables) {
      const { rows } = await db.query(`SELECT * FROM ${table} WHERE solved = 0 ORDER BY RANDOM() LIMIT 1`);
      const unsolved = rows[0];
      
      if (unsolved) {
        found = true;
        await solveQuestion(table, unsolved);
        // Add a small delay to be polite to APIs
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    if (!found) {
      console.log('[Background Solver] All questions solved. Sleeping...');
      await new Promise(resolve => setTimeout(resolve, 60000)); // Sleep for 1 minute
    }
  }
}
