import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";

// Routes
import chatRoutes from "./routes/chat";
import uploadRoutes from "./routes/upload";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Ensure uploads directory exists
  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
  }

  // API Routes
  app.use("/api/chat", chatRoutes);
  app.use("/api/upload", uploadRoutes);

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "LOKEY-AI Backend is running" });
  });

  // API-only mode (Frontend is on Vercel)
  app.get('/', (req, res) => {
    res.json({ status: "ok", message: "LOKEY-AI API is active" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LOKEY-AI Backend running on http://localhost:${PORT}`);
  });
}

startServer();
