import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import db from "./server/db";
import { initSchema } from "./server/schema";
import authRoutes from "./server/routes/auth";
import physicsRoutes from "./server/routes/physics";
import mathRoutes from "./server/routes/math";
import programmingRoutes from "./server/routes/programming";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize DB Schema
  initSchema();

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/physics", physicsRoutes);
  app.use("/api/math", mathRoutes);
  app.use("/api/programming", programmingRoutes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
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
