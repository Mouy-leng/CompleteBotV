import { storage } from '../storage';
import type { InsertAiSignal, AiSignal } from '@shared/schema';

interface TechnicalIndicators {
  rsi: number;
  atr: number;
  support: number;
  resistance: number;
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
  macd: number;
  bollinger_upper: number;
  bollinger_lower: number;
}

interface PriceData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: Date;
}

class AIModels {
  private modelAccuracy = {
    LSTM: 84,
    XGBoost: 78,
    CNN: 81,
  };

  async generateSignal(symbol: string): Promise<AiSignal> {
    try {
      // Get current market data
      const marketData = await storage.getMarketData(symbol);
      if (!marketData) {
        throw new Error(`No market data available for ${symbol}`);
      }

      // Generate signals from different models
      const lstmSignal = await this.generateLSTMSignal(symbol, marketData);
      const xgboostSignal = await this.generateXGBoostSignal(symbol, marketData);
      const cnnSignal = await this.generateCNNSignal(symbol, marketData);

      // Combine signals using ensemble method
      const combinedSignal = this.combineSignals([lstmSignal, xgboostSignal, cnnSignal]);

      // Create and store the signal
      const signal = await storage.createAiSignal(combinedSignal);

      // Log activity
      await storage.createActivity({
        userId: null,
        type: 'AI_SIGNAL_GENERATED',
        title: `AI Signal Generated: ${symbol} ${combinedSignal.signal}`,
        description: `Confidence: ${combinedSignal.confidence}% | Model: ${combinedSignal.model}`,
        severity: 'INFO',
        metadata: {
          symbol,
          signal: combinedSignal.signal,
          confidence: combinedSignal.confidence,
          model: combinedSignal.model,
        },
      });

      return signal;
    } catch (error) {
      console.error('Failed to generate AI signal:', error);
      throw error;
    }
  }

  private async generateLSTMSignal(symbol: string, marketData: any): Promise<Partial<InsertAiSignal>> {
    // Simulate LSTM model prediction
    const indicators = marketData.indicators as TechnicalIndicators;
    const currentPrice = parseFloat(marketData.price);
    
    // LSTM focuses on time series patterns
    let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 50;
    let reasoning = 'Neutral market conditions';

    // Trend analysis
    if (indicators.ema12 > indicators.ema26 && indicators.rsi < 70) {
      signal = 'BUY';
      confidence = Math.min(85, 60 + (indicators.ema12 - indicators.ema26) * 1000);
      reasoning = 'Bullish trend with EMA crossover';
    } else if (indicators.ema12 < indicators.ema26 && indicators.rsi > 30) {
      signal = 'SELL';
      confidence = Math.min(85, 60 + (indicators.ema26 - indicators.ema12) * 1000);
      reasoning = 'Bearish trend with EMA crossover';
    }

    // Calculate stop loss and take profit
    const atr = indicators.atr;
    let stopLoss: string | undefined;
    let takeProfit: string | undefined;

    if (signal === 'BUY') {
      stopLoss = (currentPrice - atr * 2).toFixed(5);
      takeProfit = (currentPrice + atr * 3).toFixed(5);
    } else if (signal === 'SELL') {
      stopLoss = (currentPrice + atr * 2).toFixed(5);
      takeProfit = (currentPrice - atr * 3).toFixed(5);
    }

    return {
      symbol,
      signal,
      confidence: confidence.toString(),
      model: 'LSTM',
      entryPrice: currentPrice.toFixed(5),
      stopLoss,
      takeProfit,
      reasoning,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
    };
  }

  private async generateXGBoostSignal(symbol: string, marketData: any): Promise<Partial<InsertAiSignal>> {
    // Simulate XGBoost model prediction
    const indicators = marketData.indicators as TechnicalIndicators;
    const currentPrice = parseFloat(marketData.price);
    
    let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 50;
    let reasoning = 'Insufficient pattern strength';

    // Feature-based analysis
    const features = {
      rsi_oversold: indicators.rsi < 30,
      rsi_overbought: indicators.rsi > 70,
      price_near_support: currentPrice <= indicators.support * 1.01,
      price_near_resistance: currentPrice >= indicators.resistance * 0.99,
      macd_bullish: indicators.macd > 0,
      bollinger_squeeze: (indicators.bollinger_upper - indicators.bollinger_lower) < (currentPrice * 0.02),
    };

    // XGBoost decision tree logic
    if (features.rsi_oversold && features.price_near_support && features.macd_bullish) {
      signal = 'BUY';
      confidence = 78;
      reasoning = 'Oversold conditions at support with bullish MACD';
    } else if (features.rsi_overbought && features.price_near_resistance && !features.macd_bullish) {
      signal = 'SELL';
      confidence = 75;
      reasoning = 'Overbought conditions at resistance with bearish MACD';
    } else if (features.bollinger_squeeze) {
      // Prepare for breakout
      confidence = 65;
      reasoning = 'Bollinger squeeze detected, awaiting breakout';
    }

    const atr = indicators.atr;
    let stopLoss: string | undefined;
    let takeProfit: string | undefined;

    if (signal === 'BUY') {
      stopLoss = (indicators.support * 0.995).toFixed(5);
      takeProfit = (indicators.resistance * 1.005).toFixed(5);
    } else if (signal === 'SELL') {
      stopLoss = (indicators.resistance * 1.005).toFixed(5);
      takeProfit = (indicators.support * 0.995).toFixed(5);
    }

    return {
      symbol,
      signal,
      confidence: confidence.toString(),
      model: 'XGBoost',
      entryPrice: currentPrice.toFixed(5),
      stopLoss,
      takeProfit,
      reasoning,
      expiresAt: new Date(Date.now() + 3600000),
    };
  }

  private async generateCNNSignal(symbol: string, marketData: any): Promise<Partial<InsertAiSignal>> {
    // Simulate CNN pattern recognition
    const indicators = marketData.indicators as TechnicalIndicators;
    const currentPrice = parseFloat(marketData.price);
    
    let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 50;
    let reasoning = 'No clear pattern detected';

    // Pattern recognition (simplified)
    const patterns = {
      hammer: indicators.rsi < 40 && currentPrice > indicators.sma20 * 0.98,
      doji: Math.abs(indicators.macd) < 0.0001,
      engulfing_bullish: indicators.rsi < 50 && currentPrice > indicators.sma20,
      engulfing_bearish: indicators.rsi > 50 && currentPrice < indicators.sma20,
      triangle_breakout: currentPrice > indicators.resistance * 1.002,
      triangle_breakdown: currentPrice < indicators.support * 0.998,
    };

    if (patterns.hammer || patterns.engulfing_bullish) {
      signal = 'BUY';
      confidence = 81;
      reasoning = 'Bullish reversal pattern detected';
    } else if (patterns.engulfing_bearish) {
      signal = 'SELL';
      confidence = 79;
      reasoning = 'Bearish reversal pattern detected';
    } else if (patterns.triangle_breakout) {
      signal = 'BUY';
      confidence = 75;
      reasoning = 'Triangle breakout pattern';
    } else if (patterns.triangle_breakdown) {
      signal = 'SELL';
      confidence = 73;
      reasoning = 'Triangle breakdown pattern';
    }

    const atr = indicators.atr;
    let stopLoss: string | undefined;
    let takeProfit: string | undefined;

    if (signal === 'BUY') {
      stopLoss = (currentPrice - atr * 1.5).toFixed(5);
      takeProfit = (currentPrice + atr * 2.5).toFixed(5);
    } else if (signal === 'SELL') {
      stopLoss = (currentPrice + atr * 1.5).toFixed(5);
      takeProfit = (currentPrice - atr * 2.5).toFixed(5);
    }

    return {
      symbol,
      signal,
      confidence: confidence.toString(),
      model: 'CNN',
      entryPrice: currentPrice.toFixed(5),
      stopLoss,
      takeProfit,
      reasoning,
      expiresAt: new Date(Date.now() + 3600000),
    };
  }

  private combineSignals(signals: Partial<InsertAiSignal>[]): InsertAiSignal {
    // Weighted ensemble of signals
    const weights = { LSTM: 0.4, XGBoost: 0.35, CNN: 0.25 };
    
    let buyScore = 0;
    let sellScore = 0;
    let totalConfidence = 0;
    let bestModel = 'ENSEMBLE';
    let combinedReasoning = '';

    signals.forEach(signal => {
      const confidence = parseFloat(signal.confidence || '0');
      const weight = weights[signal.model as keyof typeof weights] || 0.33;
      
      if (signal.signal === 'BUY') {
        buyScore += confidence * weight;
      } else if (signal.signal === 'SELL') {
        sellScore += confidence * weight;
      }
      
      totalConfidence += confidence * weight;
      combinedReasoning += `${signal.model}: ${signal.reasoning}; `;
    });

    let finalSignal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let finalConfidence = Math.max(buyScore, sellScore);

    if (buyScore > sellScore && buyScore > 60) {
      finalSignal = 'BUY';
      finalConfidence = buyScore;
    } else if (sellScore > buyScore && sellScore > 60) {
      finalSignal = 'SELL';
      finalConfidence = sellScore;
    }

    // Use the first signal's price and levels as base
    const baseSignal = signals[0];
    
    return {
      symbol: baseSignal.symbol!,
      signal: finalSignal,
      confidence: finalConfidence.toFixed(1),
      model: finalConfidence > 70 ? bestModel : baseSignal.model!,
      entryPrice: baseSignal.entryPrice!,
      stopLoss: baseSignal.stopLoss,
      takeProfit: baseSignal.takeProfit,
      reasoning: combinedReasoning.trim(),
      expiresAt: baseSignal.expiresAt,
    };
  }

  async retrainModels() {
    try {
      // Simulate model retraining
      const symbols = ['EUR/USD', 'GBP/USD', 'BTC/USD', 'AAPL'];
      
      for (const symbol of symbols) {
        // Simulate accuracy improvement
        const improvements = {
          LSTM: Math.random() * 4 - 2, // -2% to +2%
          XGBoost: Math.random() * 4 - 2,
          CNN: Math.random() * 4 - 2,
        };

        Object.entries(improvements).forEach(([model, improvement]) => {
          const oldAccuracy = this.modelAccuracy[model as keyof typeof this.modelAccuracy];
          const newAccuracy = Math.min(95, Math.max(70, oldAccuracy + improvement));
          this.modelAccuracy[model as keyof typeof this.modelAccuracy] = Math.round(newAccuracy);

          // Log retraining activity
          storage.createActivity({
            userId: null,
            type: 'MODEL_RETRAINED',
            title: `Model Retrained: ${model} ${symbol}`,
            description: `Accuracy ${improvement > 0 ? 'improved' : 'adjusted'} from ${oldAccuracy}% to ${Math.round(newAccuracy)}%`,
            severity: 'INFO',
            metadata: {
              model,
              symbol,
              oldAccuracy,
              newAccuracy: Math.round(newAccuracy),
              improvement,
            },
          });
        });
      }

      console.log('Model retraining completed');
    } catch (error) {
      console.error('Failed to retrain models:', error);
    }
  }

  getModelPerformance() {
    return this.modelAccuracy;
  }
}

export const aiModels = new AIModels();

// Retrain models every 6 hours
setInterval(() => {
  aiModels.retrainModels().catch(console.error);
}, 6 * 60 * 60 * 1000);
