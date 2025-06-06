
import { logger } from '@/utils/logger';
import { database } from '@/config/database';
import { addPriceUpdateJob } from '@/services/queue/queueManager';
import { WebSocketService } from '@/services/websocket/WebSocketService';

export class PriceService {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private wsService: WebSocketService | null = null;

  constructor(wsService?: WebSocketService) {
    this.wsService = wsService || null;
  }

  async startPriceMonitoring(): Promise<void> {
    try {
      logger.info('Starting price monitoring service');
      
      // Initial price update for all active tokens
      await this.updateAllTokenPrices();
      
      // Set up periodic price updates (every 30 seconds)
      this.monitoringInterval = setInterval(async () => {
        await this.updateAllTokenPrices();
      }, 30000);
      
      logger.info('Price monitoring service started successfully');
    } catch (error) {
      logger.error('Failed to start price monitoring:', error);
      throw error;
    }
  }

  async stopPriceMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info('Price monitoring service stopped');
    }
  }

  private async updateAllTokenPrices(): Promise<void> {
    try {
      const query = `
        SELECT contract_address, chain_id 
        FROM tokens 
        WHERE is_active = true
      `;
      
      const result = await database.query(query);
      
      for (const token of result.rows) {
        // Add price update job to queue
        await addPriceUpdateJob(token.contract_address, token.chain_id);
      }
      
      logger.debug(`Queued price updates for ${result.rows.length} tokens`);
    } catch (error) {
      logger.error('Error updating token prices:', error);
    }
  }

  async getPriceHistory(tokenAddress: string, chainId: number, timeframe: string = '24h'): Promise<any[]> {
    try {
      // This would typically fetch from a time-series database
      // For now, return mock data
      const hours = timeframe === '7d' ? 168 : 24;
      const mockData = [];
      
      for (let i = hours; i >= 0; i--) {
        const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
        const price = Math.random() * 1000 + 100;
        
        mockData.push({
          timestamp: timestamp.toISOString(),
          price,
          volume: Math.random() * 10000
        });
      }
      
      return mockData;
    } catch (error) {
      logger.error('Error getting price history:', error);
      throw error;
    }
  }

  broadcastPriceUpdate(tokenAddress: string, priceData: any): void {
    if (this.wsService) {
      this.wsService.broadcastPriceUpdate(tokenAddress, priceData);
    }
  }
}
