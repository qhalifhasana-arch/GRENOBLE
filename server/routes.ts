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

async function seedDatabase() {
  const users = await storage.getAllUsers();
  if (users.length === 0) {
    const hashedPassword = await hashPassword("admin123");
    await storage.createUser({
      phoneNumber: "99999999",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "System",
      country: "Togo",
      isAdmin: true,
      balance: 100000,
    });
    console.log("Admin user seeded");
  }

  const existingProducts = await storage.getAllProducts();
  if (existingProducts.length === 0) {
    const productsData = [
      { name: "VIP 1 - Starter", price: 3000, dailyRate: 150, duration: 3, totalReturn: 3450, vipLevel: 1, description: "Projet agricole débutant" },
      { name: "VIP 2 - Basic", price: 5000, dailyRate: 300, duration: 3, totalReturn: 5900, vipLevel: 2, description: "Petit élevage de poulets" },
      { name: "VIP 3 - Silver", price: 15000, dailyRate: 1000, duration: 3, totalReturn: 18000, vipLevel: 3, description: "Culture de maïs" },
      { name: "VIP 4 - Gold", price: 50000, dailyRate: 3500, duration: 3, totalReturn: 60500, vipLevel: 4, description: "Plantation de cacao" },
      { name: "VIP 5 - Platinum", price: 100000, dailyRate: 7500, duration: 3, totalReturn: 122500, vipLevel: 5, description: "Ferme laitière" },
      { name: "VIP 6 - Diamond", price: 300000, dailyRate: 25000, duration: 3, totalReturn: 375000, vipLevel: 6, description: "Exportation de fruits" },
    ];
    
    await db.insert(productsTable).values(productsData);
    console.log("Products seeded");
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
    const { productId } = req.body;
    
    const user = await storage.getUser(req.user!.id);
    const product = await storage.getProduct(productId);
    
    if (!product) return res.status(404).send("Product not found");
    if (user!.balance < product.price) return res.status(400).send("Insufficient balance");

    // Deduct balance
    await storage.updateUser(user!.id, { balance: user!.balance - product.price });
    
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
