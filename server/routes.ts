import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupWebSocketServer } from "./services/websocket-server";
import { tradingEngine } from "./services/trading-engine";
import { aiModels } from "./services/ai-models";
import { riskManager } from "./services/risk-management";
import { insertTradeSchema, insertAiSignalSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  setupWebSocketServer(httpServer);
  
  // Initialize trading engine
  await tradingEngine.initialize();
  
  // Portfolio routes
  app.get("/api/portfolio/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const portfolio = await storage.getPortfolio(userId);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  // Trading routes
  app.get("/api/trades/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const trades = await storage.getTrades(userId);
      res.json(trades);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trades" });
    }
  });

  app.get("/api/trades/:userId/active", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const trades = await storage.getActiveTrades(userId);
      res.json(trades);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active trades" });
    }
  });

  app.post("/api/trades", async (req, res) => {
    try {
      const tradeData = insertTradeSchema.parse(req.body);
      
      // Risk management check
      const riskCheck = await riskManager.validateTrade(tradeData);
      if (!riskCheck.allowed) {
        return res.status(400).json({ message: riskCheck.reason });
      }
      
      // Execute trade through trading engine
      const trade = await tradingEngine.executeTrade(tradeData);
      res.json(trade);
    } catch (error) {
      res.status(400).json({ message: "Failed to create trade" });
    }
  });

  app.patch("/api/trades/:id/close", async (req, res) => {
    try {
      const tradeId = parseInt(req.params.id);
      const { closePrice, pnl } = req.body;
      
      const trade = await storage.closeTrade(tradeId, closePrice, pnl);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      
      res.json(trade);
    } catch (error) {
      res.status(500).json({ message: "Failed to close trade" });
    }
  });

  // AI Signals routes
  app.get("/api/ai-signals", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const signals = await storage.getAiSignals(limit);
      res.json(signals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI signals" });
    }
  });

  app.post("/api/ai-signals/generate", async (req, res) => {
    try {
      const { symbol } = req.body;
      const signal = await aiModels.generateSignal(symbol);
      res.json(signal);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate AI signal" });
    }
  });

  // Market Data routes
  app.get("/api/market-data/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol;
      const data = await storage.getMarketData(symbol);
      if (!data) {
        return res.status(404).json({ message: "Market data not found" });
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  app.get("/api/market-data", async (req, res) => {
    try {
      const symbols = (req.query.symbols as string)?.split(',') || [];
      const data = await storage.getLatestMarketData(symbols);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  // System Status routes
  app.get("/api/system-status", async (req, res) => {
    try {
      const status = await storage.getSystemStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system status" });
    }
  });

  // Activities routes
  app.get("/api/activities", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const activities = await storage.getActivities(userId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Dashboard summary route
  app.get("/api/dashboard/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const [portfolio, activeTrades, aiSignals, systemStatus, activities] = await Promise.all([
        storage.getPortfolio(userId),
        storage.getActiveTrades(userId),
        storage.getAiSignals(5),
        storage.getSystemStatus(),
        storage.getActivities(userId, 10),
      ]);

      res.json({
        portfolio,
        activeTrades,
        aiSignals,
        systemStatus,
        activities,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  return httpServer;
}
