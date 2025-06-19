interface TradeRequest {
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  stopLoss?: number;
  takeProfit?: number;
}

interface ExecutionResult {
  orderId: string;
  executedPrice: number;
  executedQuantity: number;
  timestamp: Date;
}

interface BrokerConnection {
  name: string;
  connected: boolean;
  lastPing: Date;
  latency: number;
}

class BrokerAPI {
  private connections: Map<string, BrokerConnection> = new Map();
  private apiKeys = {
    capitalCom: process.env.CAPITAL_COM_API_KEY || 'demo_key',
    binance: process.env.BINANCE_API_KEY || 'demo_key',
    metaTrader: process.env.METATRADER_API_KEY || 'demo_key',
  };

  async initialize() {
    try {
      // Initialize broker connections
      await this.connectToCapitalCom();
      await this.connectToBinance();
      await this.connectToMetaTrader();
      
      console.log('Broker APIs initialized');
    } catch (error) {
      console.error('Failed to initialize broker APIs:', error);
      throw error;
    }
  }

  private async connectToCapitalCom() {
    try {
      // Simulate Capital.com connection
      this.connections.set('capital_com', {
        name: 'Capital.com',
        connected: true,
        lastPing: new Date(),
        latency: 45,
      });
      
      console.log('Connected to Capital.com API');
    } catch (error) {
      this.connections.set('capital_com', {
        name: 'Capital.com',
        connected: false,
        lastPing: new Date(),
        latency: 0,
      });
      console.error('Failed to connect to Capital.com:', error);
    }
  }

  private async connectToBinance() {
    try {
      // Simulate Binance connection
      this.connections.set('binance', {
        name: 'Binance',
        connected: true,
        lastPing: new Date(),
        latency: 32,
      });
      
      console.log('Connected to Binance API');
    } catch (error) {
      this.connections.set('binance', {
        name: 'Binance',
        connected: false,
        lastPing: new Date(),
        latency: 0,
      });
      console.error('Failed to connect to Binance:', error);
    }
  }

  private async connectToMetaTrader() {
    try {
      // Simulate MetaTrader connection with occasional issues
      const connected = Math.random() > 0.2; // 80% success rate
      
      this.connections.set('metatrader', {
        name: 'MetaTrader',
        connected,
        lastPing: new Date(),
        latency: connected ? 150 : 0,
      });
      
      if (connected) {
        console.log('Connected to MetaTrader API');
      } else {
        console.log('MetaTrader connection unstable, will retry');
      }
    } catch (error) {
      this.connections.set('metatrader', {
        name: 'MetaTrader',
        connected: false,
        lastPing: new Date(),
        latency: 0,
      });
      console.error('Failed to connect to MetaTrader:', error);
    }
  }

  async executeTrade(request: TradeRequest): Promise<ExecutionResult> {
    try {
      // Determine which broker to use based on symbol
      const broker = this.selectBroker(request.symbol);
      
      if (!broker.connected) {
        throw new Error(`Broker ${broker.name} is not connected`);
      }

      // Simulate trade execution
      const executionResult: ExecutionResult = {
        orderId: `${broker.name.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        executedPrice: request.price + (Math.random() * 0.0002 - 0.0001), // Small slippage
        executedQuantity: request.quantity,
        timestamp: new Date(),
      };

      console.log(`Trade executed via ${broker.name}:`, executionResult);
      return executionResult;
    } catch (error) {
      console.error('Failed to execute trade:', error);
      throw error;
    }
  }

  async closeTrade(tradeId: number, closePrice: number): Promise<void> {
    try {
      // Simulate trade closure
      console.log(`Trade ${tradeId} closed at ${closePrice}`);
    } catch (error) {
      console.error('Failed to close trade:', error);
      throw error;
    }
  }

  private selectBroker(symbol: string): BrokerConnection {
    // Select broker based on symbol type
    if (symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('USDT')) {
      return this.connections.get('binance')!;
    } else if (symbol.includes('/')) {
      // Forex pairs
      return this.connections.get('capital_com')!;
    } else {
      // Stocks
      return this.connections.get('metatrader')!;
    }
  }

  async getConnectionStatus(): Promise<BrokerConnection[]> {
    return Array.from(this.connections.values());
  }

  async updateConnectionStatus() {
    // Simulate connection monitoring
    for (const [key, connection] of this.connections.entries()) {
      const random = Math.random();
      
      // Simulate occasional connection issues for MetaTrader
      if (key === 'metatrader' && random < 0.1) {
        connection.connected = false;
        connection.latency = 0;
      } else if (!connection.connected && random > 0.7) {
        // Reconnection logic
        connection.connected = true;
        connection.latency = key === 'metatrader' ? 150 : key === 'capital_com' ? 45 : 32;
      }
      
      connection.lastPing = new Date();
      
      // Add some latency variation
      if (connection.connected) {
        const baseLatency = key === 'metatrader' ? 150 : key === 'capital_com' ? 45 : 32;
        connection.latency = baseLatency + Math.floor(Math.random() * 20 - 10);
      }
    }
  }
}

export const brokerApi = new BrokerAPI();

// Update connection status every 30 seconds
setInterval(() => {
  brokerApi.updateConnectionStatus().catch(console.error);
}, 30000);
