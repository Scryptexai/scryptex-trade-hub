
import { database } from '@/config/database';
import { blockchainService } from '@/services/blockchain.service';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export class ChainService {
  async getAllChains() {
    try {
      const query = `
        SELECT * FROM chains 
        WHERE is_active = true
        ORDER BY name
      `;
      
      const result = await database.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error getting all chains:', error);
      throw new CustomError('Failed to get chains', 500);
    }
  }

  async getChainById(chainId: number) {
    try {
      const query = `
        SELECT * FROM chains 
        WHERE chain_id = $1 AND is_active = true
      `;
      
      const result = await database.query(query, [chainId]);
      
      if (result.rows.length === 0) {
        throw new CustomError('Chain not found', 404);
      }
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting chain by ID:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get chain', 500);
    }
  }

  async getChainStats(chainId: number) {
    try {
      const stats = await blockchainService.getNetworkStats(chainId);
      return stats;
    } catch (error) {
      logger.error('Error getting chain stats:', error);
      throw new CustomError('Failed to get chain stats', 500);
    }
  }

  async getChainHealth(chainId: number) {
    try {
      const service = blockchainService.getChainService(chainId);
      
      // Check if the service is responsive
      const startTime = Date.now();
      
      try {
        await service.getNetworkStats();
        const responseTime = Date.now() - startTime;
        
        return {
          chainId,
          status: 'healthy',
          responseTime,
          lastChecked: new Date().toISOString()
        };
      } catch (serviceError) {
        return {
          chainId,
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          lastChecked: new Date().toISOString(),
          error: serviceError.message
        };
      }
    } catch (error) {
      logger.error('Error checking chain health:', error);
      throw new CustomError('Failed to check chain health', 500);
    }
  }
}
