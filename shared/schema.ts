import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  accountType: text("account_type").notNull().default("demo"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  totalValue: decimal("total_value", { precision: 15, scale: 2 }).notNull().default("0"),
  availableBalance: decimal("available_balance", { precision: 15, scale: 2 }).notNull().default("0"),
  dailyPnL: decimal("daily_pnl", { precision: 15, scale: 2 }).notNull().default("0"),
  totalPnL: decimal("total_pnl", { precision: 15, scale: 2 }).notNull().default("0"),
  riskExposure: decimal("risk_exposure", { precision: 5, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  symbol: text("symbol").notNull(),
  type: text("type").notNull(), // BUY, SELL
  status: text("status").notNull().default("OPEN"), // OPEN, CLOSED, PENDING
  entryPrice: decimal("entry_price", { precision: 15, scale: 5 }).notNull(),
  currentPrice: decimal("current_price", { precision: 15, scale: 5 }),
  quantity: decimal("quantity", { precision: 15, scale: 8 }).notNull(),
  stopLoss: decimal("stop_loss", { precision: 15, scale: 5 }),
  takeProfit: decimal("take_profit", { precision: 15, scale: 5 }),
  pnl: decimal("pnl", { precision: 15, scale: 2 }).default("0"),
  aiConfidence: decimal("ai_confidence", { precision: 5, scale: 2 }),
  aiModel: text("ai_model"),
  openedAt: timestamp("opened_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const aiSignals = pgTable("ai_signals", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  signal: text("signal").notNull(), // BUY, SELL, HOLD
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  model: text("model").notNull(), // LSTM, XGBoost, CNN
  entryPrice: decimal("entry_price", { precision: 15, scale: 5 }).notNull(),
  stopLoss: decimal("stop_loss", { precision: 15, scale: 5 }),
  takeProfit: decimal("take_profit", { precision: 15, scale: 5 }),
  reasoning: text("reasoning"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  price: decimal("price", { precision: 15, scale: 5 }).notNull(),
  bid: decimal("bid", { precision: 15, scale: 5 }),
  ask: decimal("ask", { precision: 15, scale: 5 }),
  volume: decimal("volume", { precision: 15, scale: 2 }),
  change: decimal("change", { precision: 5, scale: 2 }),
  changePercent: decimal("change_percent", { precision: 5, scale: 2 }),
  indicators: jsonb("indicators"), // RSI, ATR, Support, Resistance, etc.
  timestamp: timestamp("timestamp").defaultNow(),
});

export const systemStatus = pgTable("system_status", {
  id: serial("id").primaryKey(),
  component: text("component").notNull(),
  status: text("status").notNull(), // ACTIVE, INACTIVE, ERROR, WARNING
  message: text("message"),
  metrics: jsonb("metrics"), // CPU, Memory, etc.
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // TRADE_EXECUTED, RISK_ALERT, MODEL_UPDATE, etc.
  title: text("title").notNull(),
  description: text("description"),
  severity: text("severity").notNull().default("INFO"), // INFO, WARNING, ERROR, SUCCESS
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  accountType: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  updatedAt: true,
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  openedAt: true,
  closedAt: true,
});

export const insertAiSignalSchema = createInsertSchema(aiSignals).omit({
  id: true,
  createdAt: true,
});

export const insertMarketDataSchema = createInsertSchema(marketData).omit({
  id: true,
  timestamp: true,
});

export const insertSystemStatusSchema = createInsertSchema(systemStatus).omit({
  id: true,
  lastUpdated: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;

export type Trade = typeof trades.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;

export type AiSignal = typeof aiSignals.$inferSelect;
export type InsertAiSignal = z.infer<typeof insertAiSignalSchema>;

export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;

export type SystemStatus = typeof systemStatus.$inferSelect;
export type InsertSystemStatus = z.infer<typeof insertSystemStatusSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
