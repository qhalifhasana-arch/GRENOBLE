/**
 * Vercel serverless entry point.
 * All /api/* requests are rewritten here by vercel.json.
 * Express is initialised once per cold start and reused across warm requests.
 */
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "../server/routes";

const app = express();
const httpServer = createServer(app);

// Extend IncomingMessage for rawBody (needed by some middleware)
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));

// Boot once — sets up auth, seeds DB, registers all /api routes
const ready = registerRoutes(httpServer, app).then(() => {
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return next(err);
    res.status(err.status || err.statusCode || 500).json({
      message: err.message || "Internal Server Error",
    });
  });
});

// Vercel calls this for every request
export default async function handler(req: Request, res: Response) {
  await ready;
  app(req, res);
}
