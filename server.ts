import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import db from "./server/db";
import { initSchema } from "./server/schema";
import { startBackgroundSolver } from "./server/utils/backgroundSolver";
import authRoutes from "./server/routes/auth";
import physicsRoutes from "./server/routes/physics";
import mathRoutes from "./server/routes/math";
import programmingRoutes from "./server/routes/programming";
import derivationsRoutes from "./server/routes/derivations";
import electricalRoutes from "./server/routes/electrical";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Initialize DB Schema
  await initSchema();
  
  // Start background solver
  startBackgroundSolver().catch(console.error);

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/physics", physicsRoutes);
  app.use("/api/math", mathRoutes);
  app.use("/api/programming", programmingRoutes);
  app.use("/api/electrical", electricalRoutes);
  
  // Derivations App Routes (mounted at root /api to match frontend expectations)
  app.use("/api", derivationsRoutes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/ai/status", (req, res) => {
    res.json({
      gemini: !!(process.env.GEMINI_API_KEY || process.env.API_KEY),
      groq: !!process.env.GROQ_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY,
      github: !!process.env.GITHUB_MODELS_API_KEY,
      aimlapi: !!process.env.AIMLAPI_API_KEY,
      sambanova: !!process.env.SAMBANOVA_API_KEY,
      puter: true,
      pollinations: true
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
