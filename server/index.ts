import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// For Vercel serverless
export default async function handler(req: any, res: any) {
  if (!app.locals.initialized) {
    await registerRoutes(app);
    app.locals.initialized = true;
  }
  
  return app(req, res);
}

// For local development
if (process.env.NODE_ENV === 'development') {
  (async () => {
    const server = await registerRoutes(app);
    const port = 5000;
    server.listen(port, '127.0.0.1', () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  })();
}
