import { pgTable, text, serial, integer, boolean, timestamp, numeric, varchar, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  country: text("country").notNull(),
  balance: integer("balance").notNull().default(700), // Bonus 700 FCFA
  referralCode: text("referral_code").notNull().unique(),
  referrerId: integer("referrer_id"), // ID of the user who referred this user
  isAdmin: boolean("is_admin").notNull().default(false),
  isBanned: boolean("is_banned").notNull().default(false),
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
  dailyRate: integer("daily_rate").notNull(), // Daily earnings
  duration: integer("duration").notNull().default(3), // Days
  totalReturn: integer("total_return").notNull(), // Total after duration
  vipLevel: integer("vip_level").notNull(),
  description: text("description"),
});

export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  startDate: timestamp("start_date").defaultNow(),
  status: text("status").notNull().default("active"), // active, completed
  lastCollectionDate: timestamp("last_collection_date").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // deposit, withdrawal, referral_reward, daily_earning
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, rejected
  method: text("method"), // Mobile Money, etc.
  mobileDetails: text("mobile_details"), // Number for withdrawal
  createdAt: timestamp("created_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

// Zod Schemas
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  balance: true, 
  referralCode: true, 
  isAdmin: true, 
  isBanned: true, 
  withdrawalBlocked: true, 
  createdAt: true 
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true, status: true });

// Explicitly export types
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Investment = typeof investments.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Verified export: User
// End of schema
