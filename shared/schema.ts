import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  country: text("country").notNull(),
  balance: integer("balance").notNull().default(700),
  referralCode: text("referral_code").notNull().unique(),
  referrerId: integer("referrer_id"),
  isAdmin: boolean("is_admin").notNull().default(false),
  isPromoter: boolean("is_promoter").notNull().default(false),
  isBanned: boolean("is_banned").notNull().default(false),
  bannedUntil: timestamp("banned_until"),
  withdrawalBlocked: boolean("withdrawal_blocked").notNull().default(false),
  paymentPhone: text("payment_phone"),
  paymentMethod: text("payment_method"),
  paymentName: text("payment_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  dailyRate: integer("daily_rate").notNull(),
  duration: integer("duration").notNull().default(60),
  totalReturn: integer("total_return").notNull(),
  vipLevel: integer("vip_level").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
});

export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  startDate: timestamp("start_date").defaultNow(),
  status: text("status").notNull().default("active"),
  lastCollectionDate: timestamp("last_collection_date").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"),
  method: text("method"),
  mobileDetails: text("mobile_details"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const adminLogs = pgTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull(),
  adminName: text("admin_name").notNull(),
  action: text("action").notNull(),
  targetUserId: integer("target_user_id"),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true, balance: true, referralCode: true, isAdmin: true, isPromoter: true,
  isBanned: true, withdrawalBlocked: true, createdAt: true, bannedUntil: true,
});
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true, status: true });

export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Investment = typeof investments.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
