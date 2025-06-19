import { storage } from '../storage';
import type { InsertTrade } from '@shared/schema';

interface RiskCheck {
  allowed: boolean;
  reason: string;
  riskScore: number;
}

interface RiskSettings {
  maxRiskPerTrade: number; // Percentage of portfolio
  maxTotalRisk: number; // Total portfolio risk
  maxDrawdown: number; // Maximum acceptable drawdown
  maxPositionSize: number; // Maximum position size
  maxDailyLoss: number; // Maximum daily loss
}

class RiskManager {
  private riskSettings: RiskSettings = {
    maxRiskPerTrade: 2.0, // 2% per trade
    maxTotalRisk: 10.0, // 10% total portfolio risk
    maxDrawdown: 15.0, // 15% maximum drawdown
    maxPositionSize: 5.0, // 5% maximum position size
    maxDailyLoss: 5.0, // 5% maximum daily loss
  };

  async validateTrade(tradeData: InsertTrade): Promise<RiskCheck> {
    try {
      // Get user's portfolio
      const portfolio = await storage.getPortfolio(tradeData.userId);
      if (!portfolio) {
        return { allowed: false, reason: 'Portfolio not found', riskScore: 100 };
      }

      // Get active trades
      const activeTrades = await storage.getActiveTrades(tradeData.userId);

      // Perform risk checks
      const checks = [
        this.checkPositionSize(tradeData, portfolio),
        this.checkTotalRiskExposure(activeTrades, portfolio),
        this.checkDailyLoss(portfolio),
        this.checkDrawdown(portfolio),
        this.checkCorrelation(tradeData, activeTrades),
      ];

      const failedChecks = checks.filter(check => !check.allowed);
      
      if (failedChecks.length > 0) {
        return failedChecks[0]; // Return first failed check
      }

      // Calculate overall risk score
      const riskScore = this.calculateRiskScore(tradeData, portfolio, activeTrades);

      return { allowed: true, reason: 'Trade approved', riskScore };
    } catch (error) {
      console.error('Risk validation failed:', error);
      return { allowed: false, reason: 'Risk validation error', riskScore: 100 };
    }
  }

  private checkPositionSize(tradeData: InsertTrade, portfolio: any): RiskCheck {
    const totalValue = parseFloat(portfolio.totalValue);
    const tradeValue = parseFloat(tradeData.entryPrice) * parseFloat(tradeData.quantity);
    const positionSizePercent = (tradeValue / totalValue) * 100;

    if (positionSizePercent > this.riskSettings.maxPositionSize) {
      return {
        allowed: false,
        reason: `Position size (${positionSizePercent.toFixed(2)}%) exceeds maximum allowed (${this.riskSettings.maxPositionSize}%)`,
        riskScore: positionSizePercent * 2,
      };
    }

    return { allowed: true, reason: 'Position size acceptable', riskScore: positionSizePercent };
  }

  private checkTotalRiskExposure(activeTrades: any[], portfolio: any): RiskCheck {
    const totalValue = parseFloat(portfolio.totalValue);
    let totalRiskExposure = 0;

    // Calculate total risk from active trades
    activeTrades.forEach(trade => {
      const tradeValue = parseFloat(trade.entryPrice) * parseFloat(trade.quantity);
      const riskPercent = this.calculateTradeRisk(trade);
      totalRiskExposure += (tradeValue * riskPercent) / 100;
    });

    const riskExposurePercent = (totalRiskExposure / totalValue) * 100;

    if (riskExposurePercent > this.riskSettings.maxTotalRisk) {
      return {
        allowed: false,
        reason: `Total risk exposure (${riskExposurePercent.toFixed(2)}%) exceeds maximum allowed (${this.riskSettings.maxTotalRisk}%)`,
        riskScore: riskExposurePercent * 2,
      };
    }

    return { allowed: true, reason: 'Total risk exposure acceptable', riskScore: riskExposurePercent };
  }

  private checkDailyLoss(portfolio: any): RiskCheck {
    const totalValue = parseFloat(portfolio.totalValue);
    const dailyPnL = parseFloat(portfolio.dailyPnL);
    
    if (dailyPnL < 0) {
      const dailyLossPercent = Math.abs(dailyPnL / totalValue) * 100;
      
      if (dailyLossPercent > this.riskSettings.maxDailyLoss) {
        return {
          allowed: false,
          reason: `Daily loss (${dailyLossPercent.toFixed(2)}%) exceeds maximum allowed (${this.riskSettings.maxDailyLoss}%)`,
          riskScore: dailyLossPercent * 3,
        };
      }
    }

    return { allowed: true, reason: 'Daily loss within limits', riskScore: Math.abs(dailyPnL / totalValue) * 100 };
  }

  private checkDrawdown(portfolio: any): RiskCheck {
    const totalValue = parseFloat(portfolio.totalValue);
    const totalPnL = parseFloat(portfolio.totalPnL);
    
    // Calculate approximate peak value
    const peakValue = totalValue - totalPnL + Math.max(0, totalPnL);
    const drawdownPercent = ((peakValue - totalValue) / peakValue) * 100;

    if (drawdownPercent > this.riskSettings.maxDrawdown) {
      return {
        allowed: false,
        reason: `Current drawdown (${drawdownPercent.toFixed(2)}%) exceeds maximum allowed (${this.riskSettings.maxDrawdown}%)`,
        riskScore: drawdownPercent * 2,
      };
    }

    return { allowed: true, reason: 'Drawdown within limits', riskScore: drawdownPercent };
  }

  private checkCorrelation(tradeData: InsertTrade, activeTrades: any[]): RiskCheck {
    // Check for over-concentration in similar assets
    const sameSymbolTrades = activeTrades.filter(trade => trade.symbol === tradeData.symbol);
    const sameCategoryTrades = activeTrades.filter(trade => 
      this.getAssetCategory(trade.symbol) === this.getAssetCategory(tradeData.symbol)
    );

    if (sameSymbolTrades.length >= 3) {
      return {
        allowed: false,
        reason: `Too many open positions in ${tradeData.symbol} (${sameSymbolTrades.length})`,
        riskScore: sameSymbolTrades.length * 20,
      };
    }

    if (sameCategoryTrades.length >= 5) {
      const category = this.getAssetCategory(tradeData.symbol);
      return {
        allowed: false,
        reason: `Too many open positions in ${category} category (${sameCategoryTrades.length})`,
        riskScore: sameCategoryTrades.length * 15,
      };
    }

    return { allowed: true, reason: 'Correlation acceptable', riskScore: sameCategoryTrades.length * 5 };
  }

  private calculateTradeRisk(trade: any): number {
    const entryPrice = parseFloat(trade.entryPrice);
    const stopLoss = parseFloat(trade.stopLoss || '0');
    
    if (stopLoss === 0) return this.riskSettings.maxRiskPerTrade; // Default risk if no SL
    
    let riskPercent = 0;
    if (trade.type === 'BUY') {
      riskPercent = ((entryPrice - stopLoss) / entryPrice) * 100;
    } else {
      riskPercent = ((stopLoss - entryPrice) / entryPrice) * 100;
    }
    
    return Math.abs(riskPercent);
  }

  private calculateRiskScore(tradeData: InsertTrade, portfolio: any, activeTrades: any[]): number {
    const positionRisk = this.checkPositionSize(tradeData, portfolio).riskScore;
    const exposureRisk = this.checkTotalRiskExposure(activeTrades, portfolio).riskScore;
    const dailyRisk = this.checkDailyLoss(portfolio).riskScore;
    const correlationRisk = this.checkCorrelation(tradeData, activeTrades).riskScore;

    // Weighted risk score
    return (positionRisk * 0.3 + exposureRisk * 0.3 + dailyRisk * 0.2 + correlationRisk * 0.2);
  }

  private getAssetCategory(symbol: string): string {
    if (symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('USDT')) {
      return 'CRYPTO';
    } else if (symbol.includes('/')) {
      return 'FOREX';
    } else {
      return 'STOCKS';
    }
  }

  async generateRiskAlert(userId: number, alertType: string, details: any) {
    try {
      await storage.createActivity({
        userId,
        type: 'RISK_ALERT',
        title: `Risk Alert: ${alertType}`,
        description: details.description,
        severity: 'WARNING',
        metadata: details,
      });
    } catch (error) {
      console.error('Failed to generate risk alert:', error);
    }
  }

  async monitorPortfolioRisk() {
    try {
      // Monitor all user portfolios (for now just demo user)
      const portfolio = await storage.getPortfolio(1);
      if (!portfolio) return;

      const activeTrades = await storage.getActiveTrades(1);
      const riskExposure = parseFloat(portfolio.riskExposure);

      // Check if risk exposure is approaching limits
      if (riskExposure > this.riskSettings.maxTotalRisk * 0.8) {
        await this.generateRiskAlert(1, 'High Risk Exposure', {
          description: `Portfolio risk exposure (${riskExposure.toFixed(2)}%) approaching maximum limit`,
          exposure: riskExposure,
          limit: this.riskSettings.maxTotalRisk,
        });
      }

      // Check daily loss
      const dailyPnL = parseFloat(portfolio.dailyPnL);
      if (dailyPnL < 0) {
        const dailyLossPercent = Math.abs(dailyPnL / parseFloat(portfolio.totalValue)) * 100;
        if (dailyLossPercent > this.riskSettings.maxDailyLoss * 0.8) {
          await this.generateRiskAlert(1, 'Daily Loss Warning', {
            description: `Daily loss (${dailyLossPercent.toFixed(2)}%) approaching maximum limit`,
            loss: dailyLossPercent,
            limit: this.riskSettings.maxDailyLoss,
          });
        }
      }

      // Update portfolio risk exposure
      const totalRiskExposure = this.calculatePortfolioRiskExposure(activeTrades, portfolio);
      await storage.updatePortfolio(1, {
        riskExposure: totalRiskExposure.toFixed(2),
      });

    } catch (error) {
      console.error('Failed to monitor portfolio risk:', error);
    }
  }

  private calculatePortfolioRiskExposure(activeTrades: any[], portfolio: any): number {
    const totalValue = parseFloat(portfolio.totalValue);
    let totalRisk = 0;

    activeTrades.forEach(trade => {
      const tradeValue = parseFloat(trade.entryPrice) * parseFloat(trade.quantity);
      const riskPercent = this.calculateTradeRisk(trade);
      totalRisk += (tradeValue * riskPercent) / 100;
    });

    return (totalRisk / totalValue) * 100;
  }

  getRiskSettings(): RiskSettings {
    return { ...this.riskSettings };
  }

  updateRiskSettings(newSettings: Partial<RiskSettings>) {
    this.riskSettings = { ...this.riskSettings, ...newSettings };
  }
}

export const riskManager = new RiskManager();

// Monitor portfolio risk every 5 minutes
setInterval(() => {
  riskManager.monitorPortfolioRisk().catch(console.error);
}, 5 * 60 * 1000);
