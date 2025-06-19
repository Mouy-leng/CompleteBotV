import { storage } from '../storage';
import { brokerApi } from './broker-apis';
import { riskManager } from './risk-management';
import type { InsertTrade, Trade } from '@shared/schema';

class TradingEngine {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Initialize broker connections
      await brokerApi.initialize();
      console.log('Trading engine initialized');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize trading engine:', error);
      throw error;
    }
  }

  async executeTrade(tradeData: InsertTrade): Promise<Trade> {
    if (!this.isInitialized) {
      throw new Error('Trading engine not initialized');
    }

    try {
      // Validate trade with risk management
      const riskCheck = await riskManager.validateTrade(tradeData);
      if (!riskCheck.allowed) {
        throw new Error(riskCheck.reason);
      }

      // Execute trade through broker API
      const executionResult = await brokerApi.executeTrade({
        symbol: tradeData.symbol,
        side: tradeData.type,
        quantity: parseFloat(tradeData.quantity),
        price: parseFloat(tradeData.entryPrice),
        stopLoss: tradeData.stopLoss ? parseFloat(tradeData.stopLoss) : undefined,
        takeProfit: tradeData.takeProfit ? parseFloat(tradeData.takeProfit) : undefined,
      });

      // Create trade record
      const trade = await storage.createTrade({
        ...tradeData,
        entryPrice: executionResult.executedPrice.toString(),
        currentPrice: executionResult.executedPrice.toString(),
      });

      // Log activity
      await storage.createActivity({
        userId: tradeData.userId,
        type: 'TRADE_EXECUTED',
        title: `Trade Executed: ${tradeData.symbol} ${tradeData.type}`,
        description: `Entry at ${executionResult.executedPrice} | Size: ${tradeData.quantity} | AI Confidence: ${tradeData.aiConfidence}%`,
        severity: 'SUCCESS',
        metadata: {
          symbol: tradeData.symbol,
          type: tradeData.type,
          price: executionResult.executedPrice,
          quantity: tradeData.quantity,
        },
      });

      // Update portfolio
      await this.updatePortfolioAfterTrade(tradeData.userId, trade);

      return trade;
    } catch (error) {
      console.error('Failed to execute trade:', error);
      throw error;
    }
  }

  async closeTrade(tradeId: number, userId: number): Promise<Trade> {
    try {
      const trade = await storage.getTrades(userId).then(trades => 
        trades.find(t => t.id === tradeId && t.status === 'OPEN')
      );

      if (!trade) {
        throw new Error('Trade not found or already closed');
      }

      // Get current market price
      const marketData = await storage.getMarketData(trade.symbol);
      if (!marketData) {
        throw new Error('Market data not available');
      }

      const closePrice = parseFloat(marketData.price);
      const entryPrice = parseFloat(trade.entryPrice);
      const quantity = parseFloat(trade.quantity);

      // Calculate P&L
      let pnl = 0;
      if (trade.type === 'BUY') {
        pnl = (closePrice - entryPrice) * quantity;
      } else {
        pnl = (entryPrice - closePrice) * quantity;
      }

      // Close trade through broker API
      await brokerApi.closeTrade(trade.id, closePrice);

      // Update trade record
      const closedTrade = await storage.closeTrade(tradeId, closePrice.toString(), pnl.toString());
      if (!closedTrade) {
        throw new Error('Failed to close trade');
      }

      // Log activity
      await storage.createActivity({
        userId,
        type: 'TRADE_CLOSED',
        title: `Trade Closed: ${trade.symbol} ${trade.type}`,
        description: `Closed at ${closePrice} | P&L: ${pnl > 0 ? '+' : ''}$${pnl.toFixed(2)}`,
        severity: pnl > 0 ? 'SUCCESS' : 'WARNING',
        metadata: {
          symbol: trade.symbol,
          type: trade.type,
          closePrice,
          pnl,
        },
      });

      // Update portfolio
      await this.updatePortfolioAfterTrade(userId, closedTrade);

      return closedTrade;
    } catch (error) {
      console.error('Failed to close trade:', error);
      throw error;
    }
  }

  private async updatePortfolioAfterTrade(userId: number, trade: Trade) {
    try {
      const portfolio = await storage.getPortfolio(userId);
      if (!portfolio) return;

      const tradePnL = parseFloat(trade.pnl || '0');
      const newTotalValue = parseFloat(portfolio.totalValue) + tradePnL;
      const newDailyPnL = parseFloat(portfolio.dailyPnL) + tradePnL;
      const newTotalPnL = parseFloat(portfolio.totalPnL) + tradePnL;

      await storage.updatePortfolio(userId, {
        totalValue: newTotalValue.toString(),
        dailyPnL: newDailyPnL.toString(),
        totalPnL: newTotalPnL.toString(),
      });
    } catch (error) {
      console.error('Failed to update portfolio:', error);
    }
  }

  async updateOpenTrades() {
    try {
      // Get all open trades
      const allTrades = Array.from(await storage.getTrades(1)); // Demo user
      const openTrades = allTrades.filter(t => t.status === 'OPEN');

      for (const trade of openTrades) {
        // Get current market price
        const marketData = await storage.getMarketData(trade.symbol);
        if (!marketData) continue;

        const currentPrice = parseFloat(marketData.price);
        const entryPrice = parseFloat(trade.entryPrice);
        const quantity = parseFloat(trade.quantity);

        // Calculate current P&L
        let pnl = 0;
        if (trade.type === 'BUY') {
          pnl = (currentPrice - entryPrice) * quantity;
        } else {
          pnl = (entryPrice - currentPrice) * quantity;
        }

        // Update trade
        await storage.updateTrade(trade.id, {
          currentPrice: currentPrice.toString(),
          pnl: pnl.toString(),
        });

        // Check stop loss and take profit
        await this.checkTradeExitConditions(trade, currentPrice);
      }
    } catch (error) {
      console.error('Failed to update open trades:', error);
    }
  }

  private async checkTradeExitConditions(trade: Trade, currentPrice: number) {
    let shouldClose = false;
    let reason = '';

    if (trade.stopLoss && trade.type === 'BUY' && currentPrice <= parseFloat(trade.stopLoss)) {
      shouldClose = true;
      reason = 'Stop Loss';
    } else if (trade.stopLoss && trade.type === 'SELL' && currentPrice >= parseFloat(trade.stopLoss)) {
      shouldClose = true;
      reason = 'Stop Loss';
    } else if (trade.takeProfit && trade.type === 'BUY' && currentPrice >= parseFloat(trade.takeProfit)) {
      shouldClose = true;
      reason = 'Take Profit';
    } else if (trade.takeProfit && trade.type === 'SELL' && currentPrice <= parseFloat(trade.takeProfit)) {
      shouldClose = true;
      reason = 'Take Profit';
    }

    if (shouldClose) {
      await this.closeTrade(trade.id, trade.userId);
      console.log(`Trade ${trade.id} closed automatically: ${reason}`);
    }
  }
}

export const tradingEngine = new TradingEngine();

// Update open trades every 10 seconds
setInterval(() => {
  tradingEngine.updateOpenTrades().catch(console.error);
}, 10000);
