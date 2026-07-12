import { users, products, investments, transactions, settings, adminLogs, type User, type InsertUser, type Product, type Investment, type Transaction, type Setting, type AdminLog } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export class DatabaseStorage {
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
    const referralCode = `GRN${Math.floor(100000 + Math.random() * 900000)}`;
    const [user] = await db.insert(users).values({ ...insertUser, referralCode }).returning();
    return user;
  }
  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updatedUser;
  }
  async deleteUser(id: number): Promise<void> {
    await db.delete(transactions).where(eq(transactions.userId, id));
    await db.delete(investments).where(eq(investments.userId, id));
    await db.delete(users).where(eq(users.id, id));
  }
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.vipLevel);
  }
  async getActiveProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true)).orderBy(products.vipLevel);
  }
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  async createProduct(data: Omit<Product, 'id'>): Promise<Product> {
    const [product] = await db.insert(products).values(data).returning();
    return product;
  }
  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return product;
  }
  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async createInvestment(userId: number, productId: number): Promise<Investment> {
    const product = await this.getProduct(productId);
    if (!product) throw new Error("Product not found");
    const [investment] = await db.insert(investments).values({
      userId, productId, status: "active", startDate: new Date(), lastCollectionDate: new Date()
    }).returning();
    return investment;
  }
  async getInvestmentsByUser(userId: number): Promise<(Investment & { product: Product })[]> {
    const results = await db.select({ investment: investments, product: products })
      .from(investments).innerJoin(products, eq(investments.productId, products.id))
      .where(eq(investments.userId, userId)).orderBy(desc(investments.startDate));
    return results.map(r => ({ ...r.investment, product: r.product }));
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
  async updateTransactionStatus(id: number, status: string, note?: string): Promise<Transaction> {
    const updates: any = { status };
    if (note !== undefined) updates.note = note;
    const [transaction] = await db.update(transactions).set(updates).where(eq(transactions.id, id)).returning();
    return transaction;
  }
  async updateTransactionAmount(id: number, amount: number): Promise<Transaction> {
    const [transaction] = await db.update(transactions).set({ amount }).where(eq(transactions.id, id)).returning();
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
    const [setting] = await db.insert(settings).values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } }).returning();
    return setting;
  }

  async createAdminLog(adminId: number, adminName: string, action: string, targetUserId?: number, details?: string): Promise<AdminLog> {
    const [log] = await db.insert(adminLogs).values({ adminId, adminName, action, targetUserId, details }).returning();
    return log;
  }
  async getAdminLogs(): Promise<AdminLog[]> {
    return await db.select().from(adminLogs).orderBy(desc(adminLogs.createdAt));
  }

  async getAdminStats(): Promise<{ registrationsToday: number; depositsToday: number }> {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const usersToday = await db.select().from(users).where(sql`${users.createdAt} >= ${today}`);
    const depositsToday = await db.select().from(transactions).where(and(eq(transactions.type, "deposit"), sql`${transactions.createdAt} >= ${today}`));
    return { registrationsToday: usersToday.length, depositsToday: depositsToday.length };
  }

  async getFullAdminStats() {
    const allUsers = await db.select().from(users);
    const allTxs = await db.select().from(transactions);
    const allInvestments = await db.select().from(investments);

    const now = new Date();
    const today = new Date(now); today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1);

    const registrationsToday = allUsers.filter(u => new Date(u.createdAt!) >= today).length;
    const registrationsThisWeek = allUsers.filter(u => new Date(u.createdAt!) >= weekAgo).length;
    const registrationsThisMonth = allUsers.filter(u => new Date(u.createdAt!) >= monthAgo).length;

    const activeInvestmentUserIds = new Set(allInvestments.filter(i => i.status === 'active').map(i => i.userId));
    const activeUsers = activeInvestmentUserIds.size;

    const completedDeposits = allTxs.filter(t => t.type === 'deposit' && t.status === 'completed');
    const totalDeposits = completedDeposits.reduce((s, t) => s + t.amount, 0);

    const allWithdrawals = allTxs.filter(t => t.type === 'withdrawal');
    const completedWithdrawals = allWithdrawals.filter(t => t.status === 'completed');
    const pendingWithdrawals = allWithdrawals.filter(t => t.status === 'pending');
    const totalWithdrawalsCompleted = completedWithdrawals.reduce((s, t) => s + t.amount, 0);
    const totalWithdrawalsPending = pendingWithdrawals.reduce((s, t) => s + t.amount, 0);

    const pendingDeposits = allTxs.filter(t => t.type === 'deposit' && t.status === 'pending');

    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today); dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);
      dailyStats.push({
        date: dayStart.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        registrations: allUsers.filter(u => { const d = new Date(u.createdAt!); return d >= dayStart && d < dayEnd; }).length,
        deposits: allTxs.filter(t => { const d = new Date(t.createdAt!); return t.type === 'deposit' && t.status === 'completed' && d >= dayStart && d < dayEnd; }).reduce((s, t) => s + t.amount, 0),
        withdrawals: allTxs.filter(t => { const d = new Date(t.createdAt!); return t.type === 'withdrawal' && t.status === 'completed' && d >= dayStart && d < dayEnd; }).reduce((s, t) => s + t.amount, 0),
      });
    }

    return {
      totalUsers: allUsers.length,
      registrationsToday,
      registrationsThisWeek,
      registrationsThisMonth,
      activeUsers,
      vipUsers: activeUsers,
      totalDeposits,
      totalWithdrawalsCompleted,
      totalWithdrawalsPending,
      totalWithdrawalsRequested: totalWithdrawalsCompleted + totalWithdrawalsPending,
      estimatedProfit: totalDeposits - totalWithdrawalsCompleted,
      pendingDepositsCount: pendingDeposits.length,
      pendingWithdrawalsCount: pendingWithdrawals.length,
      dailyStats,
    };
  }

  async getUserDetail(id: number) {
    const user = await this.getUser(id);
    if (!user) return null;
    const userTransactions = await this.getTransactionsByUser(id);
    const userInvestments = await this.getInvestmentsByUser(id);
    const directReferrals = await this.getReferrals(id);
    let teamSize = directReferrals.length;
    for (const ref of directReferrals) {
      const l2 = await this.getReferrals(ref.id);
      teamSize += l2.length;
      for (const r2 of l2) {
        const l3 = await this.getReferrals(r2.id);
        teamSize += l3.length;
      }
    }
    let referrer = null;
    if (user.referrerId) referrer = await this.getUser(user.referrerId);
    const totalDeposits = userTransactions.filter(t => t.type === 'deposit' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
    const totalWithdrawals = userTransactions.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
    const activeVip = userInvestments.find(i => i.status === 'active');
    return {
      user: (({ password, ...rest }) => rest)(user as any),
      transactions: userTransactions,
      investments: userInvestments,
      referrer: referrer ? (({ password, ...rest }) => rest)(referrer as any) : null,
      directReferrals: directReferrals.length,
      teamSize,
      totalDeposits,
      totalWithdrawals,
      activeVipLevel: activeVip?.product ? (activeVip as any).product?.vipLevel : null,
    };
  }

  async getUserStats(userId: number): Promise<any> { return {}; }

  async processDailyEarnings(): Promise<void> {
    const activeInvestments = await db.select({ investment: investments, product: products })
      .from(investments).innerJoin(products, eq(investments.productId, products.id))
      .where(eq(investments.status, "active"));
    const now = new Date();
    let processed = 0;
    for (const item of activeInvestments) {
      const { investment, product } = item;
      const startDate = new Date(investment.startDate!);
      const expiryDate = new Date(startDate.getTime() + product.duration * 24 * 60 * 60 * 1000);
      if (now >= expiryDate) {
        await db.update(investments).set({ status: "completed" }).where(eq(investments.id, investment.id));
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
            await tx.update(users).set({ balance: user.balance + totalEarning }).where(eq(users.id, user.id));
            await tx.insert(transactions).values({ userId: user.id, type: "daily_earning", amount: totalEarning, status: "completed", method: `${product.name} (${daysToCredit}j)` });
            await tx.update(investments).set({ lastCollectionDate: newLastCollection }).where(eq(investments.id, investment.id));
          });
          processed++;
        } catch (error) { console.error(`Failed investment ${investment.id}:`, error); }
      }
    }
    if (processed > 0) console.log(`Daily earnings: ${processed} credited at ${now.toISOString()}`);
  }

  async processReferralCommission(buyerId: number, purchaseAmount: number, productName: string): Promise<void> {
    const commissionRates = [{ level: 1, rate: 0.25 }, { level: 2, rate: 0.02 }, { level: 3, rate: 0.03 }];
    let currentUserId: number | null = buyerId;
    for (const { level, rate } of commissionRates) {
      if (!currentUserId) break;
      const [currentUser] = await db.select().from(users).where(eq(users.id, currentUserId));
      if (!currentUser || !currentUser.referrerId) break;
      const referrerId = currentUser.referrerId;
      const [referrer] = await db.select().from(users).where(eq(users.id, referrerId));
      if (!referrer) break;
      const [hasDeposit] = await db.select().from(transactions).where(and(eq(transactions.userId, referrer.id), eq(transactions.type, "deposit"), eq(transactions.status, "completed")));
      if (!hasDeposit) { currentUserId = referrerId; continue; }
      const commission = Math.floor(purchaseAmount * rate);
      if (commission <= 0) { currentUserId = referrerId; continue; }
      await db.transaction(async (tx) => {
        await tx.update(users).set({ balance: referrer.balance + commission }).where(eq(users.id, referrer.id));
        await tx.insert(transactions).values({ userId: referrer.id, type: "referral_reward", amount: commission, status: "completed", method: `Niveau ${level} - ${productName}` });
      });
      currentUserId = referrerId;
    }
  }
}

export const storage = new DatabaseStorage();
