import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start_server() {
  const app = express();
  const PORT = 3000;

  // Health endpoint
  app.get("/api/v1/health", (req, res) => {
    res.json({ status: "ok", version: "v1", app: "MathClavier" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const dist_path = path.join(process.cwd(), "dist");
    app.use(express.static(dist_path));
    app.get("*", (req, res) => {
      res.sendFile(path.join(dist_path, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MathClavier running on http://localhost:${PORT}`);
  });
}

start_server();
