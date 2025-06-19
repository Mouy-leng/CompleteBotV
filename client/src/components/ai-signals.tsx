import { Button } from "@/components/ui/button";

interface AiSignalsProps {
  signals?: Array<{
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
}

export default function AiSignals({ signals = [] }: AiSignalsProps) {
  const formatPrice = (price: string) => {
    return parseFloat(price).toFixed(price.includes('.') && price.split('.')[1].length > 2 ? 5 : 2);
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'bg-trading-success';
      case 'SELL': return 'bg-trading-error';
      default: return 'bg-gray-600';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    const conf = parseFloat(confidence);
    if (conf >= 80) return 'text-trading-success';
    if (conf >= 60) return 'text-trading-warning';
    return 'text-trading-muted';
  };

  return (
    <div className="trading-surface rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-6">AI Trading Signals</h3>
      
      <div className="space-y-4">
        {signals.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-robot text-4xl text-trading-muted mb-4"></i>
            <p className="text-trading-muted">No active signals</p>
            <p className="text-sm text-trading-muted">AI models are analyzing market conditions</p>
          </div>
        ) : (
          signals.map((signal) => (
            <div key={signal.id} className="border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{signal.symbol}</span>
                <span className={`${getSignalColor(signal.signal)} text-white px-2 py-1 rounded text-xs font-medium`}>
                  {signal.signal}
                </span>
              </div>
              <div className="text-sm text-trading-muted mb-2">
                <p>Entry: {formatPrice(signal.entryPrice)}</p>
                <p>
                  SL: {signal.stopLoss ? formatPrice(signal.stopLoss) : 'N/A'} | 
                  TP: {signal.takeProfit ? formatPrice(signal.takeProfit) : 'N/A'}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${getConfidenceColor(signal.confidence)}`}>
                  Confidence: {signal.confidence}%
                </span>
                <span className="text-xs text-trading-muted">{signal.model}</span>
              </div>
              {signal.reasoning && (
                <div className="mt-2 text-xs text-trading-muted italic">
                  {signal.reasoning}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
        <h4 className="text-white font-medium mb-2">Model Performance</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-trading-muted">LSTM</p>
            <p className="text-trading-success font-semibold">84%</p>
          </div>
          <div className="text-center">
            <p className="text-trading-muted">XGBoost</p>
            <p className="text-trading-success font-semibold">78%</p>
          </div>
          <div className="text-center">
            <p className="text-trading-muted">CNN</p>
            <p className="text-trading-success font-semibold">81%</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Button 
          className="w-full bg-trading-primary hover:bg-blue-600 text-white"
          onClick={() => console.log('Generate new signals')}
        >
          <i className="fas fa-sync-alt mr-2"></i>
          Refresh Signals
        </Button>
      </div>
    </div>
  );
}
