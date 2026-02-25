import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { type User } from "@shared/schema";
import { pool } from "./db";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) return false;
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (err) {
    console.error("Password comparison error:", err);
    return false;
  }
}

export function setupAuth(app: Express) {
  const isProduction = app.get("env") === "production" || process.env.REPL_SLUG;

  if (isProduction) {
    app.set("trust proxy", 1);
  }

  const PgStore = connectPgSimple(session);

  const sessionSettings: session.SessionOptions = {
    store: new PgStore({
      pool: pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "greenix_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: isProduction ? true : false,
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
    },
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: "phoneNumber" }, async (username, password, done) => {
      try {
        const user = await storage.getUserByPhone(username);
        if (!user) {
          return done(null, false, { message: "Identifiants invalides" });
        }
        const isMatch = await comparePasswords(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Identifiants invalides" });
        }
        return done(null, user);
      } catch (err) {
        console.error("Auth error:", err);
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, (user as User).id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id as number);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByPhone(req.body.phoneNumber);
      if (existingUser) {
        return res.status(400).json({ message: "Ce numéro de téléphone est déjà enregistré" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      
      let referrerId = null;
      if (req.body.referralCode) {
        const referrer = await storage.getUserByReferralCode(req.body.referralCode);
        if (referrer) referrerId = referrer.id;
      }

      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        referrerId,
        balance: 700,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        const { password: _, ...safeUser } = user;
        res.status(201).json(safeUser);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Identifiants invalides" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        const { password: _, ...safeUser } = user;
        res.status(200).json(safeUser);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Non authentifié" });
    const user = await storage.getUser(req.user!.id);
    if (!user) return res.status(401).json({ message: "Non authentifié" });
    if (user.isBanned) {
      req.logout(() => {});
      return res.status(403).json({ message: "Votre compte a été bloqué." });
    }
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });
}
