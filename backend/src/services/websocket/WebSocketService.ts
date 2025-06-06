
import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '@/utils/logger';
import { redis } from '@/config/redis';

interface SocketUser {
  userId?: string;
  walletAddress?: string;
}

export class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, SocketUser> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  initialize(): void {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Handle user authentication
      socket.on('authenticate', (data: { userId?: string; walletAddress?: string }) => {
        this.connectedUsers.set(socket.id, data);
        
        if (data.userId) {
          socket.join(`user:${data.userId}`);
          logger.info(`User ${data.userId} authenticated on socket ${socket.id}`);
        }
        
        socket.emit('authenticated', { success: true });
      });

      // Handle subscription to price updates
      socket.on('subscribe:prices', (data: { tokens: string[] }) => {
        data.tokens.forEach(token => {
          socket.join(`price:${token}`);
        });
        
        logger.info(`Socket ${socket.id} subscribed to price updates for ${data.tokens.length} tokens`);
      });

      // Handle subscription to chain updates
      socket.on('subscribe:chain', (data: { chainId: number }) => {
        socket.join(`chain:${data.chainId}`);
        logger.info(`Socket ${socket.id} subscribed to chain ${data.chainId} updates`);
      });

      // Handle subscription to transaction updates
      socket.on('subscribe:transactions', (data: { address: string }) => {
        socket.join(`transactions:${data.address}`);
        logger.info(`Socket ${socket.id} subscribed to transaction updates for ${data.address}`);
      });

      // Handle unsubscription
      socket.on('unsubscribe', (data: { channel: string }) => {
        socket.leave(data.channel);
        logger.info(`Socket ${socket.id} unsubscribed from ${data.channel}`);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        this.connectedUsers.delete(socket.id);
        logger.info(`Client disconnected: ${socket.id}`);
      });

      // Handle ping-pong for heartbeat
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });
  }

  // Broadcast price update
  broadcastPriceUpdate(tokenAddress: string, priceData: any): void {
    this.io.to(`price:${tokenAddress}`).emit('price-update', {
      token: tokenAddress,
      ...priceData,
      timestamp: Date.now()
    });
  }

  // Broadcast transaction update
  broadcastTransactionUpdate(address: string, transactionData: any): void {
    this.io.to(`transactions:${address}`).emit('transaction-update', {
      address,
      ...transactionData,
      timestamp: Date.now()
    });
  }

  // Broadcast chain update
  broadcastChainUpdate(chainId: number, chainData: any): void {
    this.io.to(`chain:${chainId}`).emit('chain-update', {
      chainId,
      ...chainData,
      timestamp: Date.now()
    });
  }

  // Send notification to specific user
  sendUserNotification(userId: string, notification: any): void {
    this.io.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: Date.now()
    });
  }

  // Broadcast to all connected clients
  broadcastToAll(event: string, data: any): void {
    this.io.emit(event, {
      ...data,
      timestamp: Date.now()
    });
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Get user rooms
  getUserRooms(socketId: string): string[] {
    const socket = this.io.sockets.sockets.get(socketId);
    return socket ? Array.from(socket.rooms) : [];
  }
}
