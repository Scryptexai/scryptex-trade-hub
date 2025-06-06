
import { logger } from '@/utils/logger';
import { blockchainService } from '@/services/blockchain.service';
import { database } from '@/config/database';
import { WebSocketService } from '@/services/websocket/WebSocketService';

export class NetworkMonitoringService {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private wsService: WebSocketService | null = null;

  constructor(wsService?: WebSocketService) {
    this.wsService = wsService || null;
  }

  async startMonitoring(): Promise<void> {
    try {
      logger.info('Starting network monitoring service');
      
      // Initial monitoring check
      await this.checkAllNetworks();
      
      // Set up periodic monitoring (every 60 seconds)
      this.monitoringInterval = setInterval(async () => {
        await this.checkAllNetworks();
      }, 60000);
      
      logger.info('Network monitoring service started successfully');
    } catch (error) {
      logger.error('Failed to start network monitoring:', error);
      throw error;
    }
  }

  async stopMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info('Network monitoring service stopped');
    }
  }

  private async checkAllNetworks(): Promise<void> {
    try {
      const query = `
        SELECT chain_id, name 
        FROM chains 
        WHERE is_active = true
      `;
      
      const result = await database.query(query);
      
      for (const chain of result.rows) {
        await this.checkNetworkHealth(chain.chain_id, chain.name);
      }
      
      logger.debug(`Checked health for ${result.rows.length} networks`);
    } catch (error) {
      logger.error('Error checking network health:', error);
    }
  }

  private async checkNetworkHealth(chainId: number, chainName: string): Promise<void> {
    try {
      const startTime = Date.now();
      const stats = await blockchainService.getNetworkStats(chainId);
      const responseTime = Date.now() - startTime;
      
      const healthData = {
        chainId,
        chainName,
        status: 'healthy',
        responseTime,
        blockNumber: stats.blockNumber,
        timestamp: new Date().toISOString()
      };
      
      // Broadcast health update
      if (this.wsService) {
        this.wsService.broadcastChainUpdate(chainId, healthData);
      }
      
      logger.debug(`Network ${chainName} (${chainId}) is healthy - Response time: ${responseTime}ms`);
    } catch (error) {
      logger.warn(`Network ${chainName} (${chainId}) health check failed:`, error.message);
      
      const healthData = {
        chainId,
        chainName,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      // Broadcast health update
      if (this.wsService) {
        this.wsService.broadcastChainUpdate(chainId, healthData);
      }
    }
  }
}
