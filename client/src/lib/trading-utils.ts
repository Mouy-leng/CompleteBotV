export interface PriceFormat {
  symbol: string;
  decimals: number;
  multiplier: number;
}

// Common trading symbols and their formatting rules
const SYMBOL_FORMATS: Record<string, PriceFormat> = {
  'EUR/USD': { symbol: 'EUR/USD', decimals: 5, multiplier: 1 },
  'GBP/USD': { symbol: 'GBP/USD', decimals: 5, multiplier: 1 },
  'USD/JPY': { symbol: 'USD/JPY', decimals: 3, multiplier: 1 },
  'GBP/JPY': { symbol: 'GBP/JPY', decimals: 3, multiplier: 1 },
  'AUD/USD': { symbol: 'AUD/USD', decimals: 5, multiplier: 1 },
  'USD/CAD': { symbol: 'USD/CAD', decimals: 5, multiplier: 1 },
  'BTC/USD': { symbol: 'BTC/USD', decimals: 2, multiplier: 1 },
  'ETH/USD': { symbol: 'ETH/USD', decimals: 2, multiplier: 1 },
  'AAPL': { symbol: 'AAPL', decimals: 2, multiplier: 1 },
  'GOOGL': { symbol: 'GOOGL', decimals: 2, multiplier: 1 },
  'TSLA': { symbol: 'TSLA', decimals: 2, multiplier: 1 },
};

/**
 * Format price based on symbol conventions
 */
export function formatPrice(price: string | number, symbol: string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return 'N/A';

  const format = SYMBOL_FORMATS[symbol] || { symbol, decimals: 2, multiplier: 1 };
  return (numPrice * format.multiplier).toFixed(format.decimals);
}

/**
 * Format currency values
 */
export function formatCurrency(value: string | number, currency: string = 'USD'): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return 'N/A';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
}

/**
 * Format percentage values
 */
export function formatPercentage(value: string | number, showSign: boolean = true): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return 'N/A';

  const sign = showSign && numValue >= 0 ? '+' : '';
  return `${sign}${numValue.toFixed(2)}%`;
}

/**
 * Format quantity/lot size
 */
export function formatQuantity(quantity: string | number, symbol: string): string {
  const numQuantity = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  if (isNaN(numQuantity)) return 'N/A';

  // For forex, show lot size
  if (symbol.includes('/')) {
    return `${numQuantity.toFixed(2)} lot${numQuantity !== 1 ? 's' : ''}`;
  }
  
  // For stocks/crypto, show shares/units
  return numQuantity.toFixed(4);
}

/**
 * Calculate profit/loss
 */
export function calculatePnL(
  entryPrice: string | number,
  currentPrice: string | number,
  quantity: string | number,
  tradeType: 'BUY' | 'SELL'
): number {
  const entry = typeof entryPrice === 'string' ? parseFloat(entryPrice) : entryPrice;
  const current = typeof currentPrice === 'string' ? parseFloat(currentPrice) : currentPrice;
  const qty = typeof quantity === 'string' ? parseFloat(quantity) : quantity;

  if (isNaN(entry) || isNaN(current) || isNaN(qty)) return 0;

  if (tradeType === 'BUY') {
    return (current - entry) * qty;
  } else {
    return (entry - current) * qty;
  }
}

/**
 * Calculate risk percentage
 */
export function calculateRiskPercentage(
  entryPrice: string | number,
  stopLoss: string | number,
  tradeType: 'BUY' | 'SELL'
): number {
  const entry = typeof entryPrice === 'string' ? parseFloat(entryPrice) : entryPrice;
  const sl = typeof stopLoss === 'string' ? parseFloat(stopLoss) : stopLoss;

  if (isNaN(entry) || isNaN(sl) || sl === 0) return 0;

  if (tradeType === 'BUY') {
    return Math.abs(((entry - sl) / entry) * 100);
  } else {
    return Math.abs(((sl - entry) / entry) * 100);
  }
}

/**
 * Calculate reward-to-risk ratio
 */
export function calculateRiskRewardRatio(
  entryPrice: string | number,
  stopLoss: string | number,
  takeProfit: string | number,
  tradeType: 'BUY' | 'SELL'
): number {
  const entry = typeof entryPrice === 'string' ? parseFloat(entryPrice) : entryPrice;
  const sl = typeof stopLoss === 'string' ? parseFloat(stopLoss) : stopLoss;
  const tp = typeof takeProfit === 'string' ? parseFloat(takeProfit) : takeProfit;

  if (isNaN(entry) || isNaN(sl) || isNaN(tp)) return 0;

  let risk: number, reward: number;

  if (tradeType === 'BUY') {
    risk = entry - sl;
    reward = tp - entry;
  } else {
    risk = sl - entry;
    reward = entry - tp;
  }

  return risk !== 0 ? reward / risk : 0;
}

/**
 * Determine asset category
 */
export function getAssetCategory(symbol: string): 'FOREX' | 'CRYPTO' | 'STOCKS' | 'COMMODITIES' {
  if (symbol.includes('/')) {
    if (symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('USDT')) {
      return 'CRYPTO';
    }
    return 'FOREX';
  }
  
  if (symbol.includes('BTC') || symbol.includes('ETH') || symbol.endsWith('USDT')) {
    return 'CRYPTO';
  }
  
  // Common commodity symbols
  if (['GOLD', 'SILVER', 'OIL', 'XAUUSD', 'XAGUSD'].includes(symbol.toUpperCase())) {
    return 'COMMODITIES';
  }
  
  return 'STOCKS';
}

/**
 * Get market status based on time
 */
export function getMarketStatus(symbol: string): 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'AFTER_HOURS' {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  
  const category = getAssetCategory(symbol);
  
  // Forex market (24/5)
  if (category === 'FOREX') {
    if (day === 0 || (day === 6 && hour >= 22) || (day === 1 && hour < 22)) {
      return 'CLOSED';
    }
    return 'OPEN';
  }
  
  // Crypto market (24/7)
  if (category === 'CRYPTO') {
    return 'OPEN';
  }
  
  // Stock market (weekdays 9:30 AM - 4:00 PM ET)
  if (category === 'STOCKS') {
    if (day === 0 || day === 6) return 'CLOSED';
    
    if (hour >= 4 && hour < 9.5) return 'PRE_MARKET';
    if (hour >= 9.5 && hour < 16) return 'OPEN';
    if (hour >= 16 && hour < 20) return 'AFTER_HOURS';
    return 'CLOSED';
  }
  
  return 'CLOSED';
}

/**
 * Format large numbers (K, M, B notation)
 */
export function formatLargeNumber(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return 'N/A';

  if (Math.abs(numValue) >= 1e9) {
    return (numValue / 1e9).toFixed(1) + 'B';
  }
  if (Math.abs(numValue) >= 1e6) {
    return (numValue / 1e6).toFixed(1) + 'M';
  }
  if (Math.abs(numValue) >= 1e3) {
    return (numValue / 1e3).toFixed(1) + 'K';
  }
  return numValue.toFixed(2);
}

/**
 * Get trend direction from price data
 */
export function getTrendDirection(
  currentPrice: number,
  previousPrice: number,
  threshold: number = 0.001
): 'UP' | 'DOWN' | 'SIDEWAYS' {
  const change = (currentPrice - previousPrice) / previousPrice;
  
  if (Math.abs(change) < threshold) return 'SIDEWAYS';
  return change > 0 ? 'UP' : 'DOWN';
}

/**
 * Calculate position size based on risk management
 */
export function calculatePositionSize(
  accountBalance: number,
  riskPercentage: number,
  entryPrice: number,
  stopLoss: number,
  tradeType: 'BUY' | 'SELL'
): number {
  const riskAmount = accountBalance * (riskPercentage / 100);
  const priceRisk = Math.abs(entryPrice - stopLoss);
  
  if (priceRisk === 0) return 0;
  
  return riskAmount / priceRisk;
}

/**
 * Validate trading parameters
 */
export interface TradeValidation {
  isValid: boolean;
  errors: string[];
}

export function validateTradeParameters(params: {
  symbol: string;
  quantity: number;
  entryPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  tradeType: 'BUY' | 'SELL';
}): TradeValidation {
  const errors: string[] = [];
  
  if (!params.symbol || params.symbol.trim() === '') {
    errors.push('Symbol is required');
  }
  
  if (params.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }
  
  if (params.entryPrice <= 0) {
    errors.push('Entry price must be greater than 0');
  }
  
  if (params.stopLoss && params.stopLoss <= 0) {
    errors.push('Stop loss must be greater than 0');
  }
  
  if (params.takeProfit && params.takeProfit <= 0) {
    errors.push('Take profit must be greater than 0');
  }
  
  // Validate stop loss and take profit levels
  if (params.stopLoss && params.takeProfit) {
    if (params.tradeType === 'BUY') {
      if (params.stopLoss >= params.entryPrice) {
        errors.push('Stop loss must be below entry price for BUY orders');
      }
      if (params.takeProfit <= params.entryPrice) {
        errors.push('Take profit must be above entry price for BUY orders');
      }
    } else {
      if (params.stopLoss <= params.entryPrice) {
        errors.push('Stop loss must be above entry price for SELL orders');
      }
      if (params.takeProfit >= params.entryPrice) {
        errors.push('Take profit must be below entry price for SELL orders');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
