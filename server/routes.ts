import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";

function isAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    return res.status(403).send("Unauthorized");
  }
  next();
}

import { hashPassword } from "./auth";

import { db } from "./db";
import { products as productsTable } from "@shared/schema";

import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";

async function seedDatabase() {
  const adminPhone = "99999992";
  const hashedPassword = await hashPassword("admin123");
  
  // Directly use db to ensure clean state for admin
  const [existingAdmin] = await db.select().from(schema.users).where(eq(schema.users.phoneNumber, adminPhone));
  
  if (!existingAdmin) {
    await db.insert(schema.users).values({
      phoneNumber: adminPhone,
      password: hashedPassword,
      firstName: "Admin",
      lastName: "System",
      country: "Togo",
      isAdmin: true,
      balance: 100000,
      referralCode: "ADMIN01",
    });
    console.log("Admin user created: 99999992");
  } else {
    await db.update(schema.users)
      .set({ 
        password: hashedPassword,
        isAdmin: true 
      })
      .where(eq(schema.users.id, existingAdmin.id));
    console.log("Admin user credentials forced to admin123");
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
  setupAuth(app);
  
  // Seed in background
  seedDatabase().catch(console.error);

  // Products
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getAllProducts();
    res.json(products);
  });

  app.post(api.products.invest.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const { productId, userId, bypassBalance } = req.body;
    
    const targetUserId = userId || req.user!.id;
    const user = await storage.getUser(targetUserId);
    const product = await storage.getProduct(productId);
    
    if (!product) return res.status(404).send("Product not found");
    
    // Admin bypass for manual VIP assignment
    if (!bypassBalance || !req.user!.isAdmin) {
      if (user!.balance < product.price) return res.status(400).send("Solde insuffisant");
      await storage.updateUser(user!.id, { balance: user!.balance - product.price });
      
      // Create transaction record for the purchase
      await storage.createTransaction({
        userId: user!.id,
        type: "withdrawal",
        amount: product.price,
        status: "completed",
        method: "VIP Purchase: " + product.name
      });
    }
    
    // Create investment
    const investment = await storage.createInvestment(user!.id, productId);
    
    res.status(201).json(investment);
  });

  // Transactions
  app.post(api.transactions.deposit.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
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
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const user = await storage.getUser(req.user!.id);
    
    if (user!.withdrawalBlocked) return res.status(403).send("Withdrawal blocked");
    if (user!.balance < req.body.amount) return res.status(400).send("Insufficient balance");

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
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const transactions = await storage.getTransactionsByUser(req.user!.id);
    res.json(transactions);
  });

  app.get(api.investments.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const investments = await storage.getInvestmentsByUser(req.user!.id);
    res.json(investments);
  });

  // Team
  app.get(api.team.stats.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    // Mocking stats for now, complex recursive queries needed for real 3-level depth
    const referrals = await storage.getReferrals(req.user!.id);
    
    res.json({
      referralLink: `${req.protocol}://${req.get('host')}/register?ref=${req.user!.referralCode}`,
      referralCode: req.user!.referralCode,
      totalReferrals: referrals.length,
      totalCommission: 0, // Calculate this
      level1: referrals.length,
      level2: 0,
      level3: 0,
      level1Earnings: 0,
      level2Earnings: 0,
      level3Earnings: 0,
    });
  });

  // Admin
  app.get(api.admin.stats.path, isAdmin, async (req, res) => {
    const stats = await storage.getAdminStats();
    res.json(stats);
  });

  // Background task for daily earnings
  setInterval(async () => {
    try {
      if ('processDailyEarnings' in storage) {
        await (storage as any).processDailyEarnings();
      }
    } catch (error) {
      console.error("Daily earnings processing failed:", error);
    }
  }, 10 * 60 * 1000); // Check every 10 minutes

  app.get(api.admin.users.path, isAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.get(api.admin.transactions.path, isAdmin, async (req, res) => {
    const transactions = await storage.getAllTransactions();
    res.json(transactions);
  });

  app.patch(api.admin.updateTransaction.path, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const transaction = await storage.updateTransactionStatus(Number(id), status);
    
    // Logic for referral commissions if deposit validated
    if (status === 'completed' && transaction.type === 'deposit') {
       const user = await storage.getUser(transaction.userId);
       // Simple Level 1 Commission (27%)
       if (user?.referrerId) {
         const referrer = await storage.getUser(user.referrerId);
         if (referrer) {
           const commission = Math.floor(transaction.amount * 0.27);
           await storage.updateUser(referrer.id, { balance: referrer.balance + commission });
           await storage.createTransaction({
             userId: referrer.id,
             type: "referral_reward",
             amount: commission,
             status: "completed",
             method: "system"
           });
         }
       }
       // Update user balance for deposit
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
    res.json(user);
  });

  app.get(api.admin.settings.path, isAdmin, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.put(api.admin.updateSetting.path, isAdmin, async (req, res) => {
    const { key } = req.params;
    const { value } = req.body;
    const setting = await storage.updateSetting(key, value);
    res.json(setting);
  });

  return httpServer;
}
