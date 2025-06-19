import { 
  users, portfolios, trades, aiSignals, marketData, systemStatus, activities,
  type User, type InsertUser, type Portfolio, type InsertPortfolio, 
  type Trade, type InsertTrade, type AiSignal, type InsertAiSignal,
  type MarketData, type InsertMarketData, type SystemStatus, type InsertSystemStatus,
  type Activity, type InsertActivity
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Portfolio operations
  getPortfolio(userId: number): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(userId: number, updates: Partial<InsertPortfolio>): Promise<Portfolio | undefined>;

  // Trade operations
  getTrades(userId: number): Promise<Trade[]>;
  getActiveTrades(userId: number): Promise<Trade[]>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  updateTrade(id: number, updates: Partial<InsertTrade>): Promise<Trade | undefined>;
  closeTrade(id: number, closePrice: string, pnl: string): Promise<Trade | undefined>;

  // AI Signal operations
  getAiSignals(limit?: number): Promise<AiSignal[]>;
  createAiSignal(signal: InsertAiSignal): Promise<AiSignal>;
  deleteExpiredSignals(): Promise<void>;

  // Market Data operations
  getMarketData(symbol: string): Promise<MarketData | undefined>;
  getLatestMarketData(symbols: string[]): Promise<MarketData[]>;
  createMarketData(data: InsertMarketData): Promise<MarketData>;

  // System Status operations
  getSystemStatus(): Promise<SystemStatus[]>;
  updateSystemStatus(component: string, status: InsertSystemStatus): Promise<SystemStatus>;

  // Activity operations
  getActivities(userId?: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private portfolios: Map<number, Portfolio> = new Map();
  private trades: Map<number, Trade> = new Map();
  private aiSignals: Map<number, AiSignal> = new Map();
  private marketData: Map<string, MarketData> = new Map();
  private systemStatuses: Map<string, SystemStatus> = new Map();
  private activities: Map<number, Activity> = new Map();
  
  private currentUserId = 1;
  private currentPortfolioId = 1;
  private currentTradeId = 1;
  private currentSignalId = 1;
  private currentMarketDataId = 1;
  private currentSystemStatusId = 1;
  private currentActivityId = 1;

  constructor() {
    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create demo user
    const demoUser: User = {
      id: 1,
      username: "demo_trader",
      password: "hashed_password",
      email: "demo@trader.com",
      accountType: "demo",
      createdAt: new Date(),
    };
    this.users.set(1, demoUser);
    this.currentUserId = 2;

    // Create demo portfolio
    const demoPortfolio: Portfolio = {
      id: 1,
      userId: 1,
      totalValue: "127850.00",
      availableBalance: "25000.00",
      dailyPnL: "1450.00",
      totalPnL: "12850.00",
      riskExposure: "2.5",
      updatedAt: new Date(),
    };
    this.portfolios.set(1, demoPortfolio);
    this.currentPortfolioId = 2;

    // Create demo trades
    const demoTrades: Trade[] = [
      {
        id: 1,
        userId: 1,
        symbol: "EUR/USD",
        type: "BUY",
        status: "OPEN",
        entryPrice: "1.08750",
        currentPrice: "1.08900",
        quantity: "0.10",
        stopLoss: "1.08200",
        takeProfit: "1.09300",
        pnl: "125.50",
        aiConfidence: "92.0",
        aiModel: "LSTM",
        openedAt: new Date(Date.now() - 3600000),
        closedAt: null,
      },
      {
        id: 2,
        userId: 1,
        symbol: "GBP/JPY",
        type: "SELL",
        status: "OPEN",
        entryPrice: "184.500",
        currentPrice: "184.950",
        quantity: "0.05",
        stopLoss: "186.200",
        takeProfit: "182.800",
        pnl: "-45.20",
        aiConfidence: "78.0",
        aiModel: "XGBoost",
        openedAt: new Date(Date.now() - 7200000),
        closedAt: null,
      },
    ];
    demoTrades.forEach(trade => this.trades.set(trade.id, trade));
    this.currentTradeId = 3;

    // Create demo AI signals
    const demoSignals: AiSignal[] = [
      {
        id: 1,
        symbol: "EUR/USD",
        signal: "BUY",
        confidence: "92.0",
        model: "LSTM",
        entryPrice: "1.08750",
        stopLoss: "1.08200",
        takeProfit: "1.09300",
        reasoning: "Strong bullish momentum detected",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
      },
      {
        id: 2,
        symbol: "BTC/USD",
        signal: "SELL",
        confidence: "78.0",
        model: "CNN",
        entryPrice: "43250.00",
        stopLoss: "44100.00",
        takeProfit: "42000.00",
        reasoning: "Bearish pattern formation",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
      },
    ];
    demoSignals.forEach(signal => this.aiSignals.set(signal.id, signal));
    this.currentSignalId = 3;

    // Create demo market data
    const marketSymbols = ["EUR/USD", "GBP/USD", "BTC/USD", "AAPL"];
    marketSymbols.forEach((symbol, index) => {
      const marketData: MarketData = {
        id: index + 1,
        symbol,
        price: symbol === "EUR/USD" ? "1.08900" : symbol === "BTC/USD" ? "43250.00" : "185.50",
        bid: "1.08885",
        ask: "1.08915",
        volume: "1250000.00",
        change: "0.0015",
        changePercent: "0.14",
        indicators: {
          rsi: 65.4,
          atr: 0.0045,
          support: 1.0850,
          resistance: 1.0920,
        },
        timestamp: new Date(),
      };
      this.marketData.set(symbol, marketData);
    });
    this.currentMarketDataId = marketSymbols.length + 1;

    // Create demo system status
    const systemComponents = [
      { component: "capital_com_api", status: "ACTIVE", message: "Connected", metrics: { latency: 45 } },
      { component: "binance_api", status: "ACTIVE", message: "Connected", metrics: { latency: 32 } },
      { component: "metatrader_api", status: "WARNING", message: "Reconnecting", metrics: { latency: 150 } },
      { component: "lstm_model", status: "ACTIVE", message: "Running", metrics: { accuracy: 84 } },
      { component: "xgboost_model", status: "ACTIVE", message: "Running", metrics: { accuracy: 78 } },
      { component: "cnn_model", status: "ACTIVE", message: "Running", metrics: { accuracy: 81 } },
      { component: "system_resources", status: "ACTIVE", message: "Normal", metrics: { cpu: 45, memory: 62 } },
    ];
    
    systemComponents.forEach((comp, index) => {
      const status: SystemStatus = {
        id: index + 1,
        component: comp.component,
        status: comp.status,
        message: comp.message,
        metrics: comp.metrics,
        lastUpdated: new Date(),
      };
      this.systemStatuses.set(comp.component, status);
    });
    this.currentSystemStatusId = systemComponents.length + 1;

    // Create demo activities
    const demoActivities: Activity[] = [
      {
        id: 1,
        userId: 1,
        type: "TRADE_EXECUTED",
        title: "Trade Executed: EUR/USD BUY",
        description: "Entry at 1.0875 | Size: 0.1 lot | AI Confidence: 92%",
        severity: "SUCCESS",
        metadata: { symbol: "EUR/USD", type: "BUY", price: "1.0875" },
        createdAt: new Date(Date.now() - 120000),
      },
      {
        id: 2,
        userId: 1,
        type: "RISK_ALERT",
        title: "Risk Alert: Portfolio Exposure",
        description: "Current risk exposure approaching 3% limit",
        severity: "WARNING",
        metadata: { exposure: 2.5, limit: 3.0 },
        createdAt: new Date(Date.now() - 900000),
      },
      {
        id: 3,
        userId: null,
        type: "MODEL_UPDATE",
        title: "Model Retrained: LSTM EUR/USD",
        description: "Accuracy improved from 82% to 84%",
        severity: "INFO",
        metadata: { model: "LSTM", symbol: "EUR/USD", oldAccuracy: 82, newAccuracy: 84 },
        createdAt: new Date(Date.now() - 3600000),
      },
    ];
    demoActivities.forEach(activity => this.activities.set(activity.id, activity));
    this.currentActivityId = 4;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Portfolio operations
  async getPortfolio(userId: number): Promise<Portfolio | undefined> {
    return Array.from(this.portfolios.values()).find(p => p.userId === userId);
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const id = this.currentPortfolioId++;
    const portfolio: Portfolio = {
      ...insertPortfolio,
      id,
      updatedAt: new Date(),
    };
    this.portfolios.set(id, portfolio);
    return portfolio;
  }

  async updatePortfolio(userId: number, updates: Partial<InsertPortfolio>): Promise<Portfolio | undefined> {
    const portfolio = await this.getPortfolio(userId);
    if (!portfolio) return undefined;
    
    const updated: Portfolio = {
      ...portfolio,
      ...updates,
      updatedAt: new Date(),
    };
    this.portfolios.set(portfolio.id, updated);
    return updated;
  }

  // Trade operations
  async getTrades(userId: number): Promise<Trade[]> {
    return Array.from(this.trades.values()).filter(t => t.userId === userId);
  }

  async getActiveTrades(userId: number): Promise<Trade[]> {
    return Array.from(this.trades.values()).filter(t => t.userId === userId && t.status === "OPEN");
  }

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const id = this.currentTradeId++;
    const trade: Trade = {
      ...insertTrade,
      id,
      openedAt: new Date(),
      closedAt: null,
    };
    this.trades.set(id, trade);
    return trade;
  }

  async updateTrade(id: number, updates: Partial<InsertTrade>): Promise<Trade | undefined> {
    const trade = this.trades.get(id);
    if (!trade) return undefined;
    
    const updated: Trade = { ...trade, ...updates };
    this.trades.set(id, updated);
    return updated;
  }

  async closeTrade(id: number, closePrice: string, pnl: string): Promise<Trade | undefined> {
    const trade = this.trades.get(id);
    if (!trade) return undefined;
    
    const updated: Trade = {
      ...trade,
      status: "CLOSED",
      currentPrice: closePrice,
      pnl,
      closedAt: new Date(),
    };
    this.trades.set(id, updated);
    return updated;
  }

  // AI Signal operations
  async getAiSignals(limit: number = 10): Promise<AiSignal[]> {
    const signals = Array.from(this.aiSignals.values())
      .filter(s => !s.expiresAt || s.expiresAt > new Date())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
    return signals;
  }

  async createAiSignal(insertSignal: InsertAiSignal): Promise<AiSignal> {
    const id = this.currentSignalId++;
    const signal: AiSignal = {
      ...insertSignal,
      id,
      createdAt: new Date(),
    };
    this.aiSignals.set(id, signal);
    return signal;
  }

  async deleteExpiredSignals(): Promise<void> {
    const now = new Date();
    for (const [id, signal] of this.aiSignals.entries()) {
      if (signal.expiresAt && signal.expiresAt <= now) {
        this.aiSignals.delete(id);
      }
    }
  }

  // Market Data operations
  async getMarketData(symbol: string): Promise<MarketData | undefined> {
    return this.marketData.get(symbol);
  }

  async getLatestMarketData(symbols: string[]): Promise<MarketData[]> {
    return symbols.map(symbol => this.marketData.get(symbol)).filter(Boolean) as MarketData[];
  }

  async createMarketData(insertData: InsertMarketData): Promise<MarketData> {
    const id = this.currentMarketDataId++;
    const data: MarketData = {
      ...insertData,
      id,
      timestamp: new Date(),
    };
    this.marketData.set(insertData.symbol, data);
    return data;
  }

  // System Status operations
  async getSystemStatus(): Promise<SystemStatus[]> {
    return Array.from(this.systemStatuses.values());
  }

  async updateSystemStatus(component: string, updates: InsertSystemStatus): Promise<SystemStatus> {
    const existing = this.systemStatuses.get(component);
    const id = existing?.id || this.currentSystemStatusId++;
    
    const status: SystemStatus = {
      ...updates,
      id,
      component,
      lastUpdated: new Date(),
    };
    this.systemStatuses.set(component, status);
    return status;
  }

  // Activity operations
  async getActivities(userId?: number, limit: number = 20): Promise<Activity[]> {
    let activities = Array.from(this.activities.values());
    
    if (userId !== undefined) {
      activities = activities.filter(a => a.userId === userId || a.userId === null);
    }
    
    return activities
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = {
      ...insertActivity,
      id,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
