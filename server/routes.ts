import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { type User as SchemaUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SchemaUser {}
  }
}

function stripPassword(user: any) {
  if (!user) return user;
  const { password, ...safe } = user;
  return safe;
}

function isAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    return res.status(403).json({ message: "Non autorisé" });
  }
  next();
}

import { hashPassword } from "./auth";

import { db } from "./db";
import { products as productsTable } from "@shared/schema";

import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";

async function seedDatabase() {
  const [existingAdmin] = await db.select().from(schema.users).where(eq(schema.users.phoneNumber, "99999992"));
  
  if (!existingAdmin) {
    const hashedPassword = await hashPassword("admin123");
    await db.insert(schema.users).values({
      phoneNumber: "99999992",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "System",
      country: "Togo",
      isAdmin: true,
      balance: 100000,
      referralCode: "ADMIN01",
    });
    console.log("Admin user created: 99999992");
  } else if (!existingAdmin.isAdmin) {
    await db.update(schema.users)
      .set({ isAdmin: true })
      .where(eq(schema.users.id, existingAdmin.id));
    console.log("Admin 1 promoted");
  } else {
    console.log("Admin 1 ready");
  }

  const [existingAdmin2] = await db.select().from(schema.users).where(eq(schema.users.phoneNumber, "77606149"));
  
  if (!existingAdmin2) {
    const hashedPassword2 = await hashPassword("aabb11##");
    await db.insert(schema.users).values({
      phoneNumber: "77606149",
      password: hashedPassword2,
      firstName: "Admin",
      lastName: "Principal",
      country: "Burkina Faso",
      isAdmin: true,
      balance: 0,
      referralCode: "ADMIN02",
    });
    console.log("Admin 2 created: 77606149");
  } else if (!existingAdmin2.isAdmin) {
    await db.update(schema.users)
      .set({ isAdmin: true, country: "Burkina Faso" })
      .where(eq(schema.users.id, existingAdmin2.id));
    console.log("Admin 2 promoted");
  } else {
    console.log("Admin 2 ready");
  }

  const existingProducts = await storage.getAllProducts();
  if (existingProducts.length === 0 || existingProducts.length < 10) {
    // Delete existing products to refresh with new ones if needed, 
    // but the instruction implies a definitive update. 
    // For simplicity in this environment, we'll append/update.
    const productsData = [
      { name: "VIP 1", price: 3000, dailyRate: 450, duration: 60, totalReturn: 27000, vipLevel: 1, description: "Investissement Agricole Niveau 1" },
      { name: "VIP 2", price: 6000, dailyRate: 950, duration: 60, totalReturn: 57000, vipLevel: 2, description: "Investissement Agricole Niveau 2" },
      { name: "VIP 3", price: 15000, dailyRate: 1900, duration: 60, totalReturn: 140000, vipLevel: 3, description: "Investissement Agricole Niveau 3" },
      { name: "VIP 4", price: 20000, dailyRate: 2900, duration: 60, totalReturn: 174000, vipLevel: 4, description: "Investissement Agricole Niveau 4" },
      { name: "VIP 5", price: 30000, dailyRate: 3600, duration: 60, totalReturn: 216000, vipLevel: 5, description: "Investissement Agricole Niveau 5" },
      { name: "VIP 6", price: 40000, dailyRate: 4900, duration: 60, totalReturn: 294000, vipLevel: 6, description: "Investissement Agricole Niveau 6" },
      { name: "VIP 7", price: 95000, dailyRate: 8900, duration: 60, totalReturn: 534000, vipLevel: 7, description: "Investissement Agricole Niveau 7" },
      { name: "VIP 8", price: 150000, dailyRate: 19000, duration: 60, totalReturn: 1140000, vipLevel: 8, description: "Investissement Agricole Niveau 8" },
      { name: "VIP 9", price: 250000, dailyRate: 25000, duration: 60, totalReturn: 1500000, vipLevel: 9, description: "Investissement Agricole Niveau 9" },
      { name: "VIP 10", price: 300000, dailyRate: 39000, duration: 60, totalReturn: 2340000, vipLevel: 10, description: "Investissement Agricole Niveau 10" },
    ];
    
    // Clear old products if any and insert new ones
    await db.delete(productsTable);
    await db.insert(productsTable).values(productsData);
    console.log("VIP Products updated successfully");
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    res.set("Surrogate-Control", "no-store");
    next();
  });

  setupAuth(app);
  
  // Seed in background
  seedDatabase().catch(console.error);

  // Products
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getAllProducts();
    res.json(products);
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
      
      await storage.createTransaction({
        userId: user!.id,
        type: "withdrawal",
        amount: product.price,
        status: "completed",
        method: "Achat " + product.name
      });
    }
    
    const investment = await storage.createInvestment(user!.id, productId);
    
    try {
      await storage.processReferralCommission(user!.id, product.price, product.name);
    } catch (error) {
      console.error("Referral commission error:", error);
    }
    
    res.status(201).json(investment);
  });

  // Transactions
  app.post(api.transactions.deposit.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Non autorisé" });
    const transaction = await storage.createTransaction({
      userId: req.user!.id,
      type: "deposit",
      amount: req.body.amount,
      status: "pending",
      method: req.body.method,
    });
    
    // In a real app, here we would return a payment link from settings
    res.status(201).json(transaction);
  });

  app.post(api.transactions.withdraw.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Non autorisé" });
    const user = await storage.getUser(req.user!.id);
    
    if (user!.withdrawalBlocked) return res.status(403).json({ message: "Retraits bloqués" });
    if (user!.balance < req.body.amount) return res.status(400).json({ message: "Solde insuffisant" });

    // Deduct balance immediately
    await storage.updateUser(user!.id, { balance: user!.balance - req.body.amount });

    const transaction = await storage.createTransaction({
      userId: req.user!.id,
      type: "withdrawal",
      amount: req.body.amount,
      status: "pending",
      method: req.body.method,
      mobileDetails: req.body.mobileNumber
    });
    res.status(201).json(transaction);
  });

  app.get(api.transactions.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Non autorisé" });
    const transactions = await storage.getTransactionsByUser(req.user!.id);
    res.json(transactions);
  });

  app.get(api.investments.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Non autorisé" });
    const investments = await storage.getInvestmentsByUser(req.user!.id);
    res.json(investments);
  });

  app.get(api.team.stats.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Non autorisé" });
    
    const level1 = await storage.getReferrals(req.user!.id);
    
    let level2: any[] = [];
    for (const l1 of level1) {
      const l2refs = await storage.getReferrals(l1.id);
      level2 = level2.concat(l2refs);
    }
    
    let level3: any[] = [];
    for (const l2 of level2) {
      const l3refs = await storage.getReferrals(l2.id);
      level3 = level3.concat(l3refs);
    }
    
    const commissionTxs = await storage.getTransactionsByUser(req.user!.id);
    const referralTxs = commissionTxs.filter(t => t.type === "referral_reward" && t.status === "completed");
    
    let level1Earnings = 0;
    let level2Earnings = 0;
    let level3Earnings = 0;
    
    for (const tx of referralTxs) {
      const method = tx.method || "";
      if (method.includes("Niveau 1")) {
        level1Earnings += tx.amount;
      } else if (method.includes("Niveau 2")) {
        level2Earnings += tx.amount;
      } else if (method.includes("Niveau 3")) {
        level3Earnings += tx.amount;
      } else {
        level1Earnings += tx.amount;
      }
    }
    
    const totalCommission = level1Earnings + level2Earnings + level3Earnings;
    const host = req.get('host') || '';
    const protocol = host.includes('replit') ? 'https' : req.protocol;
    
    res.json({
      referralLink: `${protocol}://${host}/register?ref=${req.user!.referralCode}`,
      referralCode: req.user!.referralCode,
      totalReferrals: level1.length + level2.length + level3.length,
      totalCommission,
      level1: level1.length,
      level2: level2.length,
      level3: level3.length,
      level1Earnings,
      level2Earnings,
      level3Earnings,
    });
  });

  // Public settings (payment_link, telegram links - accessible to all authenticated users)
  app.get(api.settings.public.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Non autorisé" });
    const allSettings = await storage.getSettings();
    res.json(allSettings);
  });

  // User payment info
  app.put(api.profile.updatePayment.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Non autorisé" });
    const { paymentPhone, paymentMethod, paymentName } = req.body;
    const updated = await storage.updateUser(req.user!.id, {
      paymentPhone,
      paymentMethod,
      paymentName,
    });
    res.json(stripPassword(updated));
  });

  // Admin
  app.get(api.admin.stats.path, isAdmin, async (req, res) => {
    const stats = await storage.getAdminStats();
    res.json(stats);
  });

  const runDailyEarnings = async () => {
    try {
      await storage.processDailyEarnings();
    } catch (error) {
      console.error("Daily earnings processing failed:", error);
    }
  };

  setTimeout(runDailyEarnings, 5000);
  setInterval(runDailyEarnings, 5 * 60 * 1000);

  app.get(api.admin.users.path, isAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    const safeUsers = users.map(({ password, ...u }) => u);
    res.json(safeUsers);
  });

  app.get(api.admin.transactions.path, isAdmin, async (req, res) => {
    const allTransactions = await storage.getAllTransactions();
    const allUsers = await storage.getAllUsers();
    const userMap = new Map(allUsers.map(u => [u.id, u]));
    const enriched = allTransactions.map(tx => ({
      ...tx,
      userPhone: userMap.get(tx.userId)?.phoneNumber || 'N/A',
      userCountry: userMap.get(tx.userId)?.country || 'N/A',
      userName: `${userMap.get(tx.userId)?.firstName || ''} ${userMap.get(tx.userId)?.lastName || ''}`.trim() || 'N/A',
    }));
    res.json(enriched);
  });

  app.patch(api.admin.updateTransaction.path, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const transaction = await storage.updateTransactionStatus(Number(id), status);
    
    if (status === 'completed' && transaction.type === 'deposit') {
       const user = await storage.getUser(transaction.userId);
       if (user) {
         await storage.updateUser(user.id, { balance: user.balance + transaction.amount });
       }
    } else if (status === 'rejected' && transaction.type === 'withdrawal') {
       // Refund balance if withdrawal rejected
       const user = await storage.getUser(transaction.userId);
       if (user) {
         await storage.updateUser(user.id, { balance: user.balance + transaction.amount });
       }
    }

    res.json(transaction);
  });

  app.patch(api.admin.updateUser.path, isAdmin, async (req, res) => {
    const { id } = req.params;
    const user = await storage.updateUser(Number(id), req.body);
    res.json(stripPassword(user));
  });

  app.get(api.admin.settings.path, isAdmin, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.put(api.admin.updateSetting.path, isAdmin, async (req, res) => {
    const key = req.params.key as string;
    const { value } = req.body;
    const setting = await storage.updateSetting(key, value);
    res.json(setting);
  });

  app.post(api.admin.adjustBalance.path, isAdmin, async (req, res) => {
    const userId = Number(req.params.id);
    const { action, amount } = req.body;

    const targetUser = await storage.getUser(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    let newBalance: number;
    let txAmount: number;
    let txType: string;

    if (action === 'credit') {
      if (amount <= 0) return res.status(400).json({ message: "Le montant doit être positif" });
      newBalance = targetUser.balance + amount;
      txAmount = amount;
      txType = 'admin_credit';
    } else if (action === 'debit') {
      if (amount <= 0) return res.status(400).json({ message: "Le montant doit être positif" });
      if (amount > targetUser.balance) return res.status(400).json({ message: "Solde insuffisant" });
      newBalance = targetUser.balance - amount;
      txAmount = amount;
      txType = 'admin_debit';
    } else {
      txAmount = targetUser.balance;
      newBalance = 0;
      txType = 'admin_empty';
    }

    const updatedUser = await storage.updateUser(userId, { balance: newBalance });

    if (txAmount > 0) {
      await storage.createTransaction({
        userId,
        type: txType,
        amount: txAmount,
        method: `Admin: ${req.user!.firstName} ${req.user!.lastName}`,
      });
    }

    res.json(stripPassword(updatedUser));
  });

  return httpServer;
}
