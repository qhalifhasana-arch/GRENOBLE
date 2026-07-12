/**
 * Vercel serverless entry point.
 * All /api/* requests are rewritten here by vercel.json.
 */
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

app.set("trust proxy", 1);

declare module "http" {
  interface IncomingMessage { rawBody: unknown; }
}

app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: false }));

// ─── DIAGNOSTIC IMMÉDIAT (fonctionne même si le boot échoue) ─────────────────
app.get("/api/ping", (_req, res) => {
  res.json({
    ok: true,
    time: new Date().toISOString(),
    node: process.version,
    env: {
      DATABASE_URL: process.env.DATABASE_URL
        ? "✅ défini → " + process.env.DATABASE_URL.replace(/:([^@]+)@/, ":****@")
        : "❌ MANQUANT",
      SESSION_SECRET: process.env.SESSION_SECRET ? "✅ défini" : "❌ MANQUANT",
      NODE_ENV: process.env.NODE_ENV || "non défini",
    },
    bootError: bootError?.message ?? null,
    booted,
  });
});

// ─── BOOT (async, ne bloque pas le module) ────────────────────────────────────
let bootError: Error | null = null;
let booted = false;

const ready = (async () => {
  try {
    const { registerRoutes } = await import("../server/routes");
    await registerRoutes(httpServer, app);
    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
      if (res.headersSent) return next(err);
      const status = err.status || err.statusCode || 500;
      console.error("API Error:", err.message);
      res.status(status).json({ message: err.message || "Internal Server Error" });
    });
    booted = true;
    console.log("✅ App booted successfully");
  } catch (err: any) {
    bootError = err;
    console.error("❌ Fatal boot error:", err?.message, err?.stack);
  }
})();

// ─── HANDLER VERCEL ───────────────────────────────────────────────────────────
export default async function handler(req: Request, res: Response) {
  // /api/ping répond toujours — même si le boot a échoué
  if (req.url?.startsWith("/api/ping")) {
    return app(req, res);
  }

  await ready;

  // Si le boot a échoué, retourner l'erreur en JSON lisible
  if (bootError) {
    return res.status(500).json({
      error: "Server failed to boot",
      message: bootError.message,
      stack: bootError.stack?.split("\n").slice(0, 8),
    });
  }

  app(req, res);
}
