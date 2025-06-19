import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  data: any;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: WebSocketMessage) => void;
  reconnect: () => void;
}

export function useWebSocket(url?: string): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 3000; // 3 seconds

  const wsUrl = url || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;

  const connect = useCallback(() => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      console.log('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          console.log('WebSocket message received:', message.type);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(reconnectInterval * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`Attempting to reconnect in ${delay}ms... (${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setIsConnected(false);
    }
  }, [wsUrl]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
        console.log('WebSocket message sent:', message.type);
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    } else {
      console.warn('WebSocket is not connected. Cannot send message:', message.type);
    }
  }, []);

  const reconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [connect]);

  // Heartbeat to detect connection issues
  useEffect(() => {
    if (!isConnected) return;

    const heartbeatInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        sendMessage({ type: 'HEARTBEAT', data: {} });
      }
    }, 30000); // Send heartbeat every 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [isConnected, sendMessage]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    reconnect,
  };
}

// WebSocket message types
export const WS_MESSAGE_TYPES = {
  INITIAL_DATA: 'INITIAL_DATA',
  MARKET_DATA_UPDATE: 'MARKET_DATA_UPDATE',
  PORTFOLIO_UPDATE: 'PORTFOLIO_UPDATE',
  TRADE_UPDATE: 'TRADE_UPDATE',
  AI_SIGNAL_UPDATE: 'AI_SIGNAL_UPDATE',
  SYSTEM_STATUS_UPDATE: 'SYSTEM_STATUS_UPDATE',
  ACTIVITY_UPDATE: 'ACTIVITY_UPDATE',
  SUBSCRIBE_SYMBOL: 'SUBSCRIBE_SYMBOL',
  UNSUBSCRIBE_SYMBOL: 'UNSUBSCRIBE_SYMBOL',
  GET_PORTFOLIO: 'GET_PORTFOLIO',
  HEARTBEAT: 'HEARTBEAT',
} as const;

export type WSMessageType = typeof WS_MESSAGE_TYPES[keyof typeof WS_MESSAGE_TYPES];
