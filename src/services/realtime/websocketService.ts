
import { config } from '@/config/environment';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface WebSocketEventHandler {
  (data: any): void;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private eventHandlers = new Map<string, Set<WebSocketEventHandler>>();
  private subscriptions = new Set<string>();

  constructor() {
    if (config.features.realtime) {
      this.connect();
    }
  }

  private connect() {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(config.wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Resubscribe to all channels
        this.subscriptions.forEach(channel => {
          this.send({
            type: 'subscribe',
            data: { channel },
            timestamp: Date.now()
          });
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.ws = null;
        
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling WebSocket reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private handleMessage(message: WebSocketMessage) {
    const handlers = this.eventHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message.data);
        } catch (error) {
          console.error('Error in WebSocket event handler:', error);
        }
      });
    }
  }

  private send(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }

  // Public API
  subscribe(eventType: string, handler: WebSocketEventHandler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);
  }

  unsubscribe(eventType: string, handler: WebSocketEventHandler) {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(eventType);
      }
    }
  }

  subscribeToChannel(channel: string) {
    this.subscriptions.add(channel);
    this.send({
      type: 'subscribe',
      data: { channel },
      timestamp: Date.now()
    });
  }

  unsubscribeFromChannel(channel: string) {
    this.subscriptions.delete(channel);
    this.send({
      type: 'unsubscribe',
      data: { channel },
      timestamp: Date.now()
    });
  }

  // Blockchain-specific subscriptions
  subscribeToChainEvents(chainId: number) {
    this.subscribeToChannel(`chain_${chainId}`);
  }

  subscribeToTokenUpdates(chainId: number, tokenAddress: string) {
    this.subscribeToChannel(`token_${chainId}_${tokenAddress}`);
  }

  subscribeToUserNotifications(userId: string) {
    this.subscribeToChannel(`user_${userId}`);
  }

  subscribeToTradingUpdates(chainId: number) {
    this.subscribeToChannel(`trading_${chainId}`);
  }

  subscribeToBridgeUpdates(bridgeId: string) {
    this.subscribeToChannel(`bridge_${bridgeId}`);
  }

  // Connection status
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Cleanup
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    this.subscriptions.clear();
    this.eventHandlers.clear();
  }
}

export const websocketService = new WebSocketService();
