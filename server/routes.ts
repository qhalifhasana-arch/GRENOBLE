import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { type User as SchemaUser } from "@shared/schema";
import { hashPassword } from "./auth";
import { db, pool } from "./db";
import { products as productsTable } from "@shared/schema";
import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";

declare global { namespace Express { interface User extends SchemaUser {} } }

function stripPassword(user: any) {
  if (!user) return user;
  const { password, ...safe } = user;
  return safe;
}

function isAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || !req.user.isAdmin) return res.status(403).json({ message: "Non autorisé" });
  next();
}

async function logAdminAction(req: any, action: string, targetUserId?: number, details?: string) {
  try {
    await storage.createAdminLog(req.user!.id, `${req.user!.firstName} ${req.user!.lastName}`, action, targetUserId, details);
  } catch (e) { console.error("Log error:", e); }
}

async function seedDatabase() {
  const [existingAdmin] = await db.select().from(schema.users).where(eq(schema.users.phoneNumber, "99999992"));
  if (!existingAdmin) {
    const hashedPassword = await hashPassword("admin123");
    await db.insert(schema.users).values({ phoneNumber: "99999992", password: hashedPassword, firstName: "Admin", lastName: "System", country: "Tchad", isAdmin: true, balance: 100000, referralCode: "ADMIN01" });
    console.log("Admin user created: 99999992");
  } else if (!existingAdmin.isAdmin) {
    await db.update(schema.users).set({ isAdmin: true }).where(eq(schema.users.id, existingAdmin.id));
    console.log("Admin 1 promoted");
  } else { console.log("Admin 1 ready"); }

  const [existingAdmin2] = await db.select().from(schema.users).where(eq(schema.users.phoneNumber, "77606149"));
  if (!existingAdmin2) {
    const hashedPassword2 = await hashPassword("aabb11##");
    await db.insert(schema.users).values({ phoneNumber: "77606149", password: hashedPassword2, firstName: "Admin", lastName: "Principal", country: "Niger", isAdmin: true, balance: 0, referralCode: "ADMIN02" });
    console.log("Admin 2 created: 77606149");
  } else if (!existingAdmin2.isAdmin) {
    await db.update(schema.users).set({ isAdmin: true, country: "Niger" }).where(eq(schema.users.id, existingAdmin2.id));
    console.log("Admin 2 promoted");
  } else { console.log("Admin 2 ready"); }

  const productsData = [
    { name: "VIP 1", price: 3000, dailyRate: 450, duration: 60, totalReturn: 27000, vipLevel: 1, description: "Investissement Agricole Niveau 1", isActive: true },
    { name: "VIP 2", price: 8000, dailyRate: 1300, duration: 60, totalReturn: 78000, vipLevel: 2, description: "Investissement Agricole Niveau 2", isActive: true },
    { name: "VIP 3", price: 15000, dailyRate: 1900, duration: 60, totalReturn: 140000, vipLevel: 3, description: "Investissement Agricole Niveau 3", isActive: true },
    { name: "VIP 4", price: 20000, dailyRate: 2900, duration: 60, totalReturn: 174000, vipLevel: 4, description: "Investissement Agricole Niveau 4", isActive: true },
    { name: "VIP 5", price: 30000, dailyRate: 3600, duration: 60, totalReturn: 216000, vipLevel: 5, description: "Investissement Agricole Niveau 5", isActive: true },
    { name: "VIP 6", price: 40000, dailyRate: 4900, duration: 60, totalReturn: 294000, vipLevel: 6, description: "Investissement Agricole Niveau 6", isActive: true },
    { name: "VIP 7", price: 95000, dailyRate: 8900, duration: 60, totalReturn: 534000, vipLevel: 7, description: "Investissement Agricole Niveau 7", isActive: true },
    { name: "VIP 8", price: 150000, dailyRate: 19000, duration: 60, totalReturn: 1140000, vipLevel: 8, description: "Investissement Agricole Niveau 8", isActive: true },
    { name: "VIP 9", price: 250000, dailyRate: 25000, duration: 60, totalReturn: 1500000, vipLevel: 9, description: "Investissement Agricole Niveau 9", isActive: true },
    { name: "VIP 10", price: 300000, dailyRate: 39000, duration: 60, totalReturn: 2340000, vipLevel: 10, description: "Investissement Agricole Niveau 10", isActive: true },
  ];
  for (const p of productsData) {
    const [existing] = await db.select().from(productsTable).where(eq(productsTable.vipLevel, p.vipLevel));
    if (existing) {
      await db.update(productsTable).set({ price: p.price, dailyRate: p.dailyRate, totalReturn: p.totalReturn, name: p.name, description: p.description, duration: p.duration }).where(eq(productsTable.vipLevel, p.vipLevel));
    } else { await db.insert(productsTable).values(p); }
  }
  console.log("VIP Products synced");
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache"); res.set("Expires", "0"); res.set("Surrogate-Control", "no-store");
    next();
  });

  // ─── DEBUG ENDPOINT ───────────────────────────────────────────────────────
  app.get("/api/debug", async (_req, res) => {
    const results: Record<string, any> = {
      timestamp: new Date().toISOString(),
      node_version: process.version,
      env: {
        NODE_ENV: process.env.NODE_ENV || "❌ non défini",
        DATABASE_URL: process.env.DATABASE_URL
          ? "✅ défini (" + process.env.DATABASE_URL.replace(/:([^@]+)@/, ":****@") + ")"
          : "❌ MANQUANT",
        SESSION_SECRET: process.env.SESSION_SECRET ? "✅ défini" : "❌ MANQUANT",
      },
      database: { status: "⏳ test en cours..." },
      tables: {},
      session_store: { status: "⏳ test en cours..." },
    };

    // Test connexion DB
    try {
      const dbPool = pool;
      const client = await dbPool.connect();
      const result = await client.query("SELECT NOW() as time, version() as version");
      results.database = {
        status: "✅ connecté",
        time: result.rows[0].time,
        version: result.rows[0].version.split(" ").slice(0, 2).join(" "),
      };

      // Test tables
      const tables = ["users", "products", "transactions", "investments", "settings", "user_sessions"];
      for (const table of tables) {
        try {
          const r = await client.query(`SELECT COUNT(*) as count FROM public.${table}`);
          results.tables[table] = `✅ ${r.rows[0].count} lignes`;
        } catch (e: any) {
          results.tables[table] = `❌ ${e.message}`;
        }
      }

      // Test insert session
      try {
        await client.query(
          `INSERT INTO public.user_sessions (sid, sess, expire) VALUES ($1, $2, $3) ON CONFLICT (sid) DO NOTHING`,
          ["debug-test", JSON.stringify({ test: true }), new Date(Date.now() + 60000)]
        );
        await client.query(`DELETE FROM public.user_sessions WHERE sid = 'debug-test'`);
        results.session_store = { status: "✅ lecture/écriture OK" };
      } catch (e: any) {
        results.session_store = { status: `❌ ${e.message}` };
      }

      client.release();
    } catch (e: any) {
      results.database = { status: `❌ ${e.message}` };
      results.session_store = { status: "❌ impossible (DB non connectée)" };
    }

    // Test hachage mot de passe
    try {
      // hashPassword déjà importé statiquement en haut
      const hash = await hashPassword("test123");
      results.password_hashing = hash.includes(".") ? "✅ fonctionne" : "❌ format invalide";
    } catch (e: any) {
      results.password_hashing = `❌ ${e.message}`;
    }

    // Résumé
    const allOk =
      results.database.status?.startsWith("✅") &&
      results.session_store.status?.startsWith("✅") &&
      results.env.DATABASE_URL?.startsWith("✅") &&
      results.env.SESSION_SECRET?.startsWith("✅");

    results.summary = allOk
      ? "✅ Tout est opérationnel — connexion et inscription devraient fonctionner"
      : "❌ Des problèmes détectés — voir les détails ci-dessus";

    res.json(results);
  });
  // ─────────────────────────────────────────────────────────────────────────

  setupAuth(app);
  seedDatabase().catch(console.error);

  // Products (user-facing - active only)
  app.get(api.products.list.path, async (req, res) => {
    const prods = await storage.getActiveProducts();
    res.json(prods);
  });

  app.post(api.products.invest.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Non autorisé" });
    const { productId, userId, bypassBalance } = req.body;
    const targetUserId = userId || req.user!.id;
    const user = await storage.getUser(targetUserId);
    const product = await storage.getProduct(productId);
    if (!product) return res.status(404).json({ message: "Produit non trouvé" });
    if (!bypassBalance || !req.user!.isAdmin) {
      if (user!.balance < product.price) return res.status(400).json({ message: "Solde insuffisant" });
      await storage.updateUser(user!.id, { balance: user!.balance - product.price });
      await storage.createTransaction({ userId: user!.id, type: "withdrawal", amount: product.price, status: "completed", method: "Achat " + product.name });
    }
    const investment = await storage.createInvestment(user!.id, productId);
    try { await storage.processReferralCommission(user!.id, product.price, product.name); } catch (e) { console.error("Referral error:", e); }
    res.status(201).json(investment);
  });

  // Transactions
  app.post(api.transactions.deposit.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Non autorisé" });
    const transaction = await storage.createTransaction({ userId: req.user!.id, type: "deposit", amount: req.body.amount, status: "pending", method: req.body.method });
    res.status(201).json(transaction);
  });

  app.post(api.transactions.withdraw.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Non autorisé" });
    const user = await storage.getUser(req.user!.id);
    if (user!.withdrawalBlocked) return res.status(403).json({ message: "Retraits bloqués" });
    if (user!.balance < req.body.amount) return res.status(400).json({ message: "Solde insuffisant" });
    await storage.updateUser(user!.id, { balance: user!.balance - req.body.amount });
    const transaction = await storage.createTransaction({ userId: req.user!.id, type: "withdrawal", amount: req.body.amount, status: "pending", method: req.body.method, mobileDetails: req.body.mobileNumber });
    res.status(201).json(transaction);
  });

  app.get(api.transactions.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Non autorisé" });
    res.json(await storage.getTransactionsByUser(req.user!.id));
  });

  app.get(api.investments.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Non autorisé" });
    res.json(await storage.getInvestmentsByUser(req.user!.id));
  });

  app.get(api.team.stats.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Non autorisé" });
    const level1 = await storage.getReferrals(req.user!.id);
    let level2: any[] = [], level3: any[] = [];
    for (const l1 of level1) { const l2refs = await storage.getReferrals(l1.id); level2 = level2.concat(l2refs); }
    for (const l2 of level2) { const l3refs = await storage.getReferrals(l2.id); level3 = level3.concat(l3refs); }
    const commissionTxs = await storage.getTransactionsByUser(req.user!.id);
    const referralTxs = commissionTxs.filter(t => t.type === "referral_reward" && t.status === "completed");
    let l1E = 0, l2E = 0, l3E = 0;
    for (const tx of referralTxs) {
      const m = tx.method || "";
      if (m.includes("Niveau 1")) l1E += tx.amount;
      else if (m.includes("Niveau 2")) l2E += tx.amount;
      else if (m.includes("Niveau 3")) l3E += tx.amount;
      else l1E += tx.amount;
    }
    const host = req.get('host') || '';
    const protocol = host.includes('replit') ? 'https' : req.protocol;
    res.json({ referralLink: `${protocol}://${host}/register?ref=${req.user!.referralCode}`, referralCode: req.user!.referralCode, totalReferrals: level1.length + level2.length + level3.length, totalCommission: l1E + l2E + l3E, level1: level1.length, level2: level2.length, level3: level3.length, level1Earnings: l1E, level2Earnings: l2E, level3Earnings: l3E });
  });

  app.get(api.settings.public.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Non autorisé" });
    res.json(await storage.getSettings());
  });

  app.put(api.profile.updatePayment.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Non autorisé" });
    const updated = await storage.updateUser(req.user!.id, { paymentPhone: req.body.paymentPhone, paymentMethod: req.body.paymentMethod, paymentName: req.body.paymentName });
    res.json(stripPassword(updated));
  });

  // ===================== ADMIN ROUTES =====================
  app.get("/api/admin/stats/full", isAdmin, async (req, res) => {
    res.json(await storage.getFullAdminStats());
  });

  app.get(api.admin.stats.path, isAdmin, async (req, res) => {
    res.json(await storage.getAdminStats());
  });

  const runDailyEarnings = async () => {
    try { await storage.processDailyEarnings(); } catch (error) { console.error("Daily earnings error:", error); }
  };
  setTimeout(runDailyEarnings, 5000);
  setInterval(runDailyEarnings, 5 * 60 * 1000);

  app.get(api.admin.users.path, isAdmin, async (req, res) => {
    const allUsers = await storage.getAllUsers();
    res.json(allUsers.map(({ password, ...u }) => u));
  });

  app.get("/api/admin/users/:id", isAdmin, async (req, res) => {
    const detail = await storage.getUserDetail(Number(req.params.id));
    if (!detail) return res.status(404).json({ message: "Utilisateur introuvable" });
    res.json(detail);
  });

  app.get(api.admin.transactions.path, isAdmin, async (req, res) => {
    const allTransactions = await storage.getAllTransactions();
    const allUsers = await storage.getAllUsers();
    const userMap = new Map(allUsers.map(u => [u.id, u]));
    const enriched = allTransactions.map(tx => ({ ...tx, userPhone: userMap.get(tx.userId)?.phoneNumber || 'N/A', userCountry: userMap.get(tx.userId)?.country || 'N/A', userName: `${userMap.get(tx.userId)?.firstName || ''} ${userMap.get(tx.userId)?.lastName || ''}`.trim() || 'N/A' }));
    res.json(enriched);
  });

  app.patch(api.admin.updateTransaction.path, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { status, note, amount } = req.body;
    let transaction = await storage.updateTransactionStatus(Number(id), status, note);
    if (amount !== undefined) transaction = await storage.updateTransactionAmount(Number(id), amount);
    if (status === 'completed' && transaction.type === 'deposit') {
      const user = await storage.getUser(transaction.userId);
      if (user) await storage.updateUser(user.id, { balance: user.balance + transaction.amount });
    } else if (status === 'rejected' && transaction.type === 'withdrawal') {
      const user = await storage.getUser(transaction.userId);
      if (user) await storage.updateUser(user.id, { balance: user.balance + transaction.amount });
    }
    await logAdminAction(req, `Transaction #${id} → ${status}${note ? ` (note: ${note})` : ''}`, transaction.userId);
    res.json(transaction);
  });

  app.patch(api.admin.updateUser.path, isAdmin, async (req, res) => {
    const { id } = req.params;
    const user = await storage.updateUser(Number(id), req.body);
    const keys = Object.keys(req.body).join(', ');
    await logAdminAction(req, `Mise à jour utilisateur: ${keys}`, Number(id));
    res.json(stripPassword(user));
  });

  app.post("/api/admin/users/:id/reset-password", isAdmin, async (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ message: "Mot de passe trop court" });
    const hashed = await hashPassword(newPassword);
    await storage.updateUser(Number(req.params.id), { password: hashed });
    await logAdminAction(req, "Réinitialisation mot de passe", Number(req.params.id));
    res.json({ message: "Mot de passe réinitialisé" });
  });

  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    const userId = Number(req.params.id);
    await logAdminAction(req, "Suppression compte utilisateur", userId);
    await storage.deleteUser(userId);
    res.json({ message: "Compte supprimé" });
  });

  app.get(api.admin.settings.path, isAdmin, async (req, res) => {
    res.json(await storage.getSettings());
  });

  app.put(api.admin.updateSetting.path, isAdmin, async (req, res) => {
    const key = req.params.key as string;
    const { value } = req.body;
    const setting = await storage.updateSetting(key, value);
    await logAdminAction(req, `Paramètre modifié: ${key} = ${value}`);
    res.json(setting);
  });

  app.post(api.admin.adjustBalance.path, isAdmin, async (req, res) => {
    const userId = Number(req.params.id);
    const { action, amount } = req.body;
    const targetUser = await storage.getUser(userId);
    if (!targetUser) return res.status(404).json({ message: "Utilisateur introuvable" });
    let newBalance: number, txAmount: number, txType: string;
    if (action === 'credit') {
      if (amount <= 0) return res.status(400).json({ message: "Montant invalide" });
      newBalance = targetUser.balance + amount; txAmount = amount; txType = 'admin_credit';
    } else if (action === 'debit') {
      if (amount <= 0) return res.status(400).json({ message: "Montant invalide" });
      if (amount > targetUser.balance) return res.status(400).json({ message: "Solde insuffisant" });
      newBalance = targetUser.balance - amount; txAmount = amount; txType = 'admin_debit';
    } else {
      txAmount = targetUser.balance; newBalance = 0; txType = 'admin_empty';
    }
    const updatedUser = await storage.updateUser(userId, { balance: newBalance });
    if (txAmount > 0) await storage.createTransaction({ userId, type: txType, amount: txAmount, method: `Admin: ${req.user!.firstName} ${req.user!.lastName}`, status: "completed" });
    await logAdminAction(req, `Solde ${action}: ${txAmount} FCFA`, userId);
    res.json(stripPassword(updatedUser));
  });

  // Products admin
  app.get("/api/admin/products", isAdmin, async (req, res) => {
    res.json(await storage.getAllProducts());
  });

  app.post("/api/admin/products", isAdmin, async (req, res) => {
    const product = await storage.createProduct(req.body);
    await logAdminAction(req, `Création produit: ${product.name}`);
    res.status(201).json(product);
  });

  app.patch("/api/admin/products/:id", isAdmin, async (req, res) => {
    const product = await storage.updateProduct(Number(req.params.id), req.body);
    await logAdminAction(req, `Modification produit #${req.params.id}: ${Object.keys(req.body).join(', ')}`);
    res.json(product);
  });

  app.delete("/api/admin/products/:id", isAdmin, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    await logAdminAction(req, `Suppression produit #${req.params.id}`);
    res.json({ message: "Produit supprimé" });
  });

  // Admin logs
  app.get("/api/admin/logs", isAdmin, async (req, res) => {
    res.json(await storage.getAdminLogs());
  });

  return httpServer;
}
