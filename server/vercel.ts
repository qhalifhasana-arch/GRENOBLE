/**
 * Vercel serverless entry point.
 * Ce fichier est bundlé par esbuild (voir vercel.json buildCommand).
 * Imports STATIQUES pour que le bundler inclue tout.
 */
import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "../server/routes";

const app = express();
const httpServer = createServer(app);

app.set("trust proxy", 1);

declare module "http" {
  interface IncomingMessage { rawBody: unknown; }
}

app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: false }));

// ─── PING : répond toujours, même si DB cassée ────────────────────────────────
app.get("/api/ping", (_req, res) => {
  res.json({
    ok: true,
    time: new Date().toISOString(),
    node: process.version,
    env: {
      DATABASE_URL: process.env.DATABASE_URL
        ? "✅ " + process.env.DATABASE_URL.replace(/:([^@]+)@/, ":****@")
        : "❌ MANQUANT",
      SESSION_SECRET: process.env.SESSION_SECRET ? "✅ défini" : "❌ MANQUANT",
      NODE_ENV: process.env.NODE_ENV || "non défini",
    },
    bootError: bootError?.message ?? null,
    booted,
  });
});

// ─── BOOT ─────────────────────────────────────────────────────────────────────
let bootError: Error | null = null;
let booted = false;

const ready = registerRoutes(httpServer, app)
  .then(() => {
    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
      if (res.headersSent) return next(err);
      const status = err.status || err.statusCode || 500;
      console.error("API Error:", err.message);
      res.status(status).json({ message: err.message || "Internal Server Error" });
    });
    booted = true;
    console.log("✅ App booted");
  })
  .catch((err: Error) => {
    bootError = err;
    console.error("❌ Boot failed:", err.message);
  });

// ─── HANDLER VERCEL ───────────────────────────────────────────────────────────
export default async function handler(req: Request, res: Response) {
  if (req.url?.startsWith("/api/ping")) {
    return app(req, res);
  }
  await ready;
  if (bootError) {
    return res.status(500).json({
      error: "Server failed to boot",
      message: bootError.message,
      stack: bootError.stack?.split("\n").slice(0, 8),
    });
  }
  app(req, res);
}
