import { users, products, investments, transactions, settings, type User, type InsertUser, type Product, type Investment, type Transaction, type Setting } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Products
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createInvestment(userId: number, productId: number): Promise<Investment>;
  
  // Transactions
  createTransaction(transaction: Partial<Transaction>): Promise<Transaction>;
  getTransactionsByUser(userId: number): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction>;
  
  // Referrals
  getReferrals(userId: number): Promise<User[]>;

  // Settings
  getSettings(): Promise<Setting[]>;
  getSetting(key: string): Promise<Setting | undefined>;
  updateSetting(key: string, value: string): Promise<Setting>;
  
  // Stats
  getAdminStats(): Promise<{ registrationsToday: number; depositsToday: number }>;
  getUserStats(userId: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
    return user;
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, code));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Generate unique referral code if not provided (simple logic)
    const referralCode = `GRN${Math.floor(100000 + Math.random() * 900000)}`;
    const [user] = await db.insert(users).values({ ...insertUser, referralCode }).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.price);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createInvestment(userId: number, productId: number): Promise<Investment> {
    const [investment] = await db.insert(investments).values({
      userId,
      productId,
      status: "active"
    }).returning();
    return investment;
  }

  async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction as any).returning();
    return newTransaction;
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction> {
    const [transaction] = await db.update(transactions).set({ status }).where(eq(transactions.id, id)).returning();
    return transaction;
  }

  async getReferrals(userId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.referrerId, userId));
  }
  
  async getSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async updateSetting(key: string, value: string): Promise<Setting> {
    const [setting] = await db.insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } })
      .returning();
    return setting;
  }

  async getAdminStats(): Promise<{ registrationsToday: number; depositsToday: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usersToday = await db.select().from(users).where(sql`${users.createdAt} >= ${today}`);
    const depositsToday = await db.select().from(transactions).where(
      and(
        eq(transactions.type, "deposit"),
        sql`${transactions.createdAt} >= ${today}`
      )
    );

    return {
      registrationsToday: usersToday.length,
      depositsToday: depositsToday.length
    };
  }

  async getUserStats(userId: number): Promise<any> {
    // Complex query to get referral stats would go here
    // For now returning basic implementation
    return {}; 
  }
}

export const storage = new DatabaseStorage();
