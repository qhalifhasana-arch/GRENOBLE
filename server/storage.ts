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
  getInvestmentsByUser(userId: number): Promise<(Investment & { product: Product })[]>;
  
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
  
  // Background processes
  processDailyEarnings(): Promise<void>;
  processReferralCommission(buyerId: number, purchaseAmount: number, productName: string): Promise<void>;
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
    const product = await this.getProduct(productId);
    if (!product) throw new Error("Product not found");
    
    const [investment] = await db.insert(investments).values({
      userId,
      productId,
      status: "active",
      startDate: new Date(),
      lastCollectionDate: new Date()
    }).returning();
    return investment;
  }

  async getInvestmentsByUser(userId: number): Promise<(Investment & { product: Product })[]> {
    const results = await db.select({
      investment: investments,
      product: products
    })
    .from(investments)
    .innerJoin(products, eq(investments.productId, products.id))
    .where(eq(investments.userId, userId))
    .orderBy(desc(investments.startDate));

    return results.map(r => ({
      ...r.investment,
      product: r.product
    }));
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

  async processDailyEarnings(): Promise<void> {
    const activeInvestments = await db.select({
      investment: investments,
      product: products
    })
    .from(investments)
    .innerJoin(products, eq(investments.productId, products.id))
    .where(eq(investments.status, "active"));

    const now = new Date();
    let processed = 0;

    for (const item of activeInvestments) {
      const { investment, product } = item;
      const startDate = new Date(investment.startDate!);
      const expiryDate = new Date(startDate.getTime() + product.duration * 24 * 60 * 60 * 1000);

      if (now >= expiryDate) {
        await db.update(investments)
          .set({ status: "completed" })
          .where(eq(investments.id, investment.id));
        continue;
      }

      const lastCollection = new Date(investment.lastCollectionDate!);
      const hoursSinceLast = (now.getTime() - lastCollection.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLast >= 24) {
        const daysToCredit = Math.floor(hoursSinceLast / 24);
        const totalEarning = product.dailyRate * daysToCredit;
        const newLastCollection = new Date(lastCollection.getTime() + daysToCredit * 24 * 60 * 60 * 1000);

        try {
          await db.transaction(async (tx) => {
            const [user] = await tx.select().from(users).where(eq(users.id, investment.userId));
            if (!user) return;

            await tx.update(users)
              .set({ balance: user.balance + totalEarning })
              .where(eq(users.id, user.id));

            await tx.insert(transactions).values({
              userId: user.id,
              type: "daily_earning",
              amount: totalEarning,
              status: "completed",
              method: `${product.name} (${daysToCredit}j)`,
            });

            await tx.update(investments)
              .set({ lastCollectionDate: newLastCollection })
              .where(eq(investments.id, investment.id));
          });
          processed++;
        } catch (error) {
          console.error(`Failed to process earning for investment ${investment.id}:`, error);
        }
      }
    }

    if (processed > 0) {
      console.log(`Daily earnings: ${processed} investments credited at ${now.toISOString()}`);
    }
  }

  async processReferralCommission(buyerId: number, purchaseAmount: number, productName: string): Promise<void> {
    const commissionRates = [
      { level: 1, rate: 0.25 },
      { level: 2, rate: 0.02 },
      { level: 3, rate: 0.03 },
    ];

    let currentUserId: number | null = buyerId;

    for (const { level, rate } of commissionRates) {
      if (!currentUserId) break;

      const [currentUser] = await db.select().from(users).where(eq(users.id, currentUserId));
      if (!currentUser || !currentUser.referrerId) break;

      const referrerId = currentUser.referrerId;
      const [referrer] = await db.select().from(users).where(eq(users.id, referrerId));
      if (!referrer) break;

      const commission = Math.floor(purchaseAmount * rate);
      if (commission <= 0) {
        currentUserId = referrerId;
        continue;
      }

      await db.transaction(async (tx) => {
        await tx.update(users)
          .set({ balance: referrer.balance + commission })
          .where(eq(users.id, referrer.id));

        await tx.insert(transactions).values({
          userId: referrer.id,
          type: "referral_reward",
          amount: commission,
          status: "completed",
          method: `Niveau ${level} - ${productName}`,
        });
      });

      console.log(`Commission L${level}: ${commission} FCFA to user ${referrer.id} (${referrer.firstName})`);
      currentUserId = referrerId;
    }
  }

  async getUserStats(userId: number): Promise<any> {
    // Complex query to get referral stats would go here
    // For now returning basic implementation
    return {}; 
  }
}

export const storage = new DatabaseStorage();
