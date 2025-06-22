import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

const app = express();
// Increase payload size limits for image uploads (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Serve Service Worker and PWA files in development mode
app.get('/sw.js', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Service-Worker-Allowed', '/');
    res.sendFile(path.resolve(process.cwd(), 'sw.js'));
  } catch (error) {
    console.error('Error serving sw.js:', error);
    res.status(404).send('Service Worker not found');
  }
});

app.get('/manifest.webmanifest', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/manifest+json');
    res.sendFile(path.resolve(process.cwd(), 'manifest.webmanifest'));
  } catch (error) {
    console.error('Error serving manifest:', error);
    res.status(404).send('Manifest not found');
  }
});

app.get('/offline.html', (req, res) => {
  try {
    res.sendFile(path.resolve(process.cwd(), 'offline.html'));
  } catch (error) {
    console.error('Error serving offline.html:', error);
    res.status(404).send('Offline page not found');
  }
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${port}`);
  console.log(`📱 Mobile access: http://192.168.1.4:${port}`);
});
})();
