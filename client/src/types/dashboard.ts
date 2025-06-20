// Dashboard data types
export interface DashboardData {
  portfolio: {
    totalValue: string;
    dailyPnL: string;
    riskExposure: string;
  };
  activeTrades: Array<{
    id: number;
    symbol: string;
    type: string;
    status: string;
    entryPrice: string;
    currentPrice?: string;
    quantity: string;
    stopLoss?: string;
    takeProfit?: string;
    pnl?: string;
    aiConfidence?: string;
    openedAt?: string;
  }>;
  aiSignals: Array<{
    id: number;
    symbol: string;
    signal: string;
    confidence: string;
    model: string;
    entryPrice: string;
    stopLoss?: string;
    takeProfit?: string;
    reasoning?: string;
  }>;
  systemStatus: Array<{
    id: number;
    component: string;
    status: string;
    message?: string;
    metrics?: any;
    lastUpdated?: string;
  }>;
  activities: Array<{
    id: number;
    userId?: number;
    type: string;
    title: string;
    description?: string;
    severity: string;
    metadata?: any;
    createdAt?: string;
  }>;
}

export interface MarketData {
  symbol: string;
  price: string;
  change: string;
  indicators: {
    support: string;
    resistance: string;
    rsi: string;
    atr: string;
    sma20: string;
    sma50: string;
  };
  timestamp: string;
}