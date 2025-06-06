
import { Request, Response } from 'express';
import { WebSocketService } from '@/services/websocket/WebSocketService';
import { config } from '@/config/environment';

export class WebSocketController {
  private wsService: WebSocketService;

  constructor() {
    // This will be initialized in the main app
    this.wsService = {} as WebSocketService;
  }

  async getConnectionInfo(req: Request, res: Response): Promise<void> {
    const connectionInfo = {
      wsUrl: `ws://localhost:${config.port}`,
      availableChannels: [
        'price-updates',
        'transaction-updates',
        'chain-updates',
        'user-notifications'
      ],
      heartbeatInterval: config.websocket.heartbeatInterval
    };

    res.status(200).json({
      success: true,
      data: connectionInfo
    });
  }

  async getAvailableChannels(req: Request, res: Response): Promise<void> {
    const channels = [
      {
        name: 'price-updates',
        description: 'Real-time token price updates',
        events: ['price-changed', 'volume-update']
      },
      {
        name: 'transaction-updates',
        description: 'Transaction status updates',
        events: ['transaction-confirmed', 'transaction-failed']
      },
      {
        name: 'chain-updates',
        description: 'Blockchain network status updates',
        events: ['block-mined', 'network-congestion']
      },
      {
        name: 'user-notifications',
        description: 'User-specific notifications',
        events: ['bridge-completed', 'order-filled']
      }
    ];

    res.status(200).json({
      success: true,
      data: channels
    });
  }
}
