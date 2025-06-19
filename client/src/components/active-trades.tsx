import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ActiveTradesProps {
  trades?: Array<{
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
}

export default function ActiveTrades({ trades = [] }: ActiveTradesProps) {
  const formatPrice = (price: string) => {
    return parseFloat(price).toFixed(price.includes('.') && price.split('.')[1].length > 2 ? 5 : 2);
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return `${num >= 0 ? '+' : ''}$${num.toFixed(2)}`;
  };

  const getPnLColor = (pnl: string) => {
    const value = parseFloat(pnl);
    return value >= 0 ? 'text-trading-success' : 'text-trading-error';
  };

  const getTradeTypeColor = (type: string) => {
    return type === 'BUY' ? 'status-buy' : 'status-sell';
  };

  const calculateProgress = (entry: string, current: string, sl: string, tp: string, type: string) => {
    const entryPrice = parseFloat(entry);
    const currentPrice = parseFloat(current);
    const stopLoss = parseFloat(sl);
    const takeProfit = parseFloat(tp);

    if (type === 'BUY') {
      const totalRange = takeProfit - stopLoss;
      const currentRange = currentPrice - stopLoss;
      return Math.max(0, Math.min(100, (currentRange / totalRange) * 100));
    } else {
      const totalRange = stopLoss - takeProfit;
      const currentRange = stopLoss - currentPrice;
      return Math.max(0, Math.min(100, (currentRange / totalRange) * 100));
    }
  };

  return (
    <div className="trading-surface rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Active Trades</h3>
        <Button className="bg-trading-primary text-white hover:bg-blue-600">
          <i className="fas fa-plus mr-2"></i>New Trade
        </Button>
      </div>
      
      <div className="space-y-4">
        {trades.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-chart-area text-4xl text-trading-muted mb-4"></i>
            <p className="text-trading-muted">No active trades</p>
            <p className="text-sm text-trading-muted">Waiting for AI signals to generate trades</p>
          </div>
        ) : (
          trades.filter(trade => trade.status === 'OPEN').map((trade) => {
            const progress = trade.currentPrice && trade.stopLoss && trade.takeProfit 
              ? calculateProgress(trade.entryPrice, trade.currentPrice, trade.stopLoss, trade.takeProfit, trade.type)
              : 0;

            return (
              <div key={trade.id} className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-medium">{trade.symbol}</span>
                    <Badge className={`${getTradeTypeColor(trade.type)} text-xs`}>
                      {trade.type}
                    </Badge>
                    <span className="text-xs text-trading-muted">{trade.quantity} Lot</span>
                  </div>
                  <span className={`text-sm font-medium ${getPnLColor(trade.pnl || '0')}`}>
                    {formatCurrency(trade.pnl || '0')}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-trading-muted">Entry</p>
                    <p className="text-white">{formatPrice(trade.entryPrice)}</p>
                  </div>
                  <div>
                    <p className="text-trading-muted">Current</p>
                    <p className="text-white">{trade.currentPrice ? formatPrice(trade.currentPrice) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-trading-muted">SL/TP</p>
                    <p className="text-white">
                      {trade.stopLoss ? formatPrice(trade.stopLoss) : 'N/A'}/
                      {trade.takeProfit ? formatPrice(trade.takeProfit) : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 bg-gray-800 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${parseFloat(trade.pnl || '0') >= 0 ? 'bg-trading-success' : 'bg-trading-error'}`}
                    style={{ width: `${Math.abs(progress)}%` }}
                  ></div>
                </div>
                
                {trade.aiConfidence && (
                  <div className="mt-2 text-xs text-trading-muted">
                    AI Confidence: {trade.aiConfidence}%
                  </div>
                )}
                
                <div className="mt-3 flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                  >
                    Modify
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
