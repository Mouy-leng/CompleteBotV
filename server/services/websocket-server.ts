import { WebSocketServer } from 'ws';
import type { Server } from 'http';
import { storage } from '../storage';

interface WebSocketMessage {
  type: string;
  data: any;
}

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send initial data
    sendInitialData(ws);
    
    ws.on('message', async (message) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.toString());
        await handleMessage(ws, data);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Broadcast market data updates every 5 seconds
  setInterval(async () => {
    try {
      const marketData = await storage.getLatestMarketData(['EUR/USD', 'GBP/USD', 'BTC/USD', 'AAPL']);
      broadcast(wss, {
        type: 'MARKET_DATA_UPDATE',
        data: marketData,
      });
    } catch (error) {
      console.error('Failed to broadcast market data:', error);
    }
  }, 5000);

  // Broadcast system status updates every 30 seconds
  setInterval(async () => {
    try {
      const systemStatus = await storage.getSystemStatus();
      broadcast(wss, {
        type: 'SYSTEM_STATUS_UPDATE',
        data: systemStatus,
      });
    } catch (error) {
      console.error('Failed to broadcast system status:', error);
    }
  }, 30000);

  return wss;
}

async function sendInitialData(ws: any) {
  try {
    const [marketData, systemStatus, aiSignals] = await Promise.all([
      storage.getLatestMarketData(['EUR/USD', 'GBP/USD', 'BTC/USD', 'AAPL']),
      storage.getSystemStatus(),
      storage.getAiSignals(5),
    ]);

    ws.send(JSON.stringify({
      type: 'INITIAL_DATA',
      data: {
        marketData,
        systemStatus,
        aiSignals,
      },
    }));
  } catch (error) {
    console.error('Failed to send initial data:', error);
  }
}

async function handleMessage(ws: any, message: WebSocketMessage) {
  switch (message.type) {
    case 'SUBSCRIBE_SYMBOL':
      // Handle symbol subscription
      break;
    case 'UNSUBSCRIBE_SYMBOL':
      // Handle symbol unsubscription
      break;
    case 'GET_PORTFOLIO':
      try {
        const portfolio = await storage.getPortfolio(message.data.userId);
        ws.send(JSON.stringify({
          type: 'PORTFOLIO_UPDATE',
          data: portfolio,
        }));
      } catch (error) {
        console.error('Failed to get portfolio:', error);
      }
      break;
    default:
      console.log('Unknown message type:', message.type);
  }
}

function broadcast(wss: WebSocketServer, message: WebSocketMessage) {
  const messageStr = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(messageStr);
    }
  });
}
