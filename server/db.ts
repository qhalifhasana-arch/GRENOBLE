import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Ne pas throw au niveau module — sinon la fonction Vercel crashe silencieusement
  console.error("CRITICAL: DATABASE_URL is not set! All DB operations will fail.");
}

const isProduction = process.env.NODE_ENV === "production";

export const pool = new Pool({
  // Si DATABASE_URL manquant, on crée un pool invalide (échec à la connexion, pas au chargement)
  connectionString: connectionString || "postgresql://localhost:5432/missing",
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool, { schema });
