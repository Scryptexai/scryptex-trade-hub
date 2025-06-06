
import { database } from '@/config/database';
import { redis } from '@/config/redis';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

interface VolumeDataOptions {
  chainId?: number;
  timeframe?: string;
}

interface TopTokensOptions {
  chainId?: number;
  limit?: number;
  sortBy?: string;
}

export class AnalyticsService {
  async getOverview() {
    try {
      // Check cache first
      const cached = await redis.get('analytics:overview');
      if (cached) {
        return JSON.parse(cached);
      }

      const [totalTokens, totalTransactions, totalVolume, activeChains] = await Promise.all([
        this.getTotalTokens(),
        this.getTotalTransactions(),
        this.getTotalVolume(),
        this.getActiveChains()
      ]);

      const overview = {
        totalTokens,
        totalTransactions,
        totalVolume,
        activeChains,
        lastUpdated: new Date().toISOString()
      };

      // Cache for 5 minutes
      await redis.set('analytics:overview', JSON.stringify(overview), 300);

      return overview;
    } catch (error) {
      logger.error('Error getting analytics overview:', error);
      throw new CustomError('Failed to get analytics overview', 500);
    }
  }

  async getVolumeData(options: VolumeDataOptions = {}) {
    try {
      const cacheKey = `analytics:volume:${options.chainId || 'all'}:${options.timeframe || '24h'}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      let query = `
        SELECT 
          DATE_TRUNC('hour', created_at) as hour,
          SUM(COALESCE(value, 0)) as volume
        FROM transactions 
        WHERE created_at >= NOW() - INTERVAL '24 hours'
      `;

      const params: any[] = [];

      if (options.chainId) {
        query += ` AND chain_id = $${params.length + 1}`;
        params.push(options.chainId);
      }

      query += ` GROUP BY hour ORDER BY hour`;

      const result = await database.query(query, params);
      
      // Cache for 10 minutes
      await redis.set(cacheKey, JSON.stringify(result.rows), 600);

      return result.rows;
    } catch (error) {
      logger.error('Error getting volume data:', error);
      throw new CustomError('Failed to get volume data', 500);
    }
  }

  async getTopTokens(options: TopTokensOptions = {}) {
    try {
      const cacheKey = `analytics:top_tokens:${options.chainId || 'all'}:${options.sortBy || 'volume'}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      let query = `
        SELECT t.*, c.name as chain_name
        FROM tokens t
        JOIN chains c ON t.chain_id = c.chain_id
        WHERE t.is_active = true
      `;

      const params: any[] = [];

      if (options.chainId) {
        query += ` AND t.chain_id = $${params.length + 1}`;
        params.push(options.chainId);
      }

      const sortField = options.sortBy === 'price' ? 'current_price' : 'volume_24h';
      query += ` ORDER BY ${sortField} DESC NULLS LAST`;

      if (options.limit) {
        query += ` LIMIT $${params.length + 1}`;
        params.push(options.limit);
      }

      const result = await database.query(query, params);
      
      // Cache for 15 minutes
      await redis.set(cacheKey, JSON.stringify(result.rows), 900);

      return result.rows;
    } catch (error) {
      logger.error('Error getting top tokens:', error);
      throw new CustomError('Failed to get top tokens', 500);
    }
  }

  async getChainMetrics(chainId: number, timeframe: string = '24h') {
    try {
      const cacheKey = `analytics:chain_metrics:${chainId}:${timeframe}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const [tokenCount, txCount, volume] = await Promise.all([
        this.getChainTokenCount(chainId),
        this.getChainTransactionCount(chainId, timeframe),
        this.getChainVolume(chainId, timeframe)
      ]);

      const metrics = {
        chainId,
        tokenCount,
        transactionCount: txCount,
        volume,
        timeframe,
        lastUpdated: new Date().toISOString()
      };

      // Cache for 10 minutes
      await redis.set(cacheKey, JSON.stringify(metrics), 600);

      return metrics;
    } catch (error) {
      logger.error('Error getting chain metrics:', error);
      throw new CustomError('Failed to get chain metrics', 500);
    }
  }

  private async getTotalTokens(): Promise<number> {
    const result = await database.query('SELECT COUNT(*) FROM tokens WHERE is_active = true');
    return parseInt(result.rows[0].count);
  }

  private async getTotalTransactions(): Promise<number> {
    const result = await database.query('SELECT COUNT(*) FROM transactions');
    return parseInt(result.rows[0].count);
  }

  private async getTotalVolume(): Promise<number> {
    const result = await database.query('SELECT SUM(COALESCE(volume_24h, 0)) FROM tokens WHERE is_active = true');
    return parseFloat(result.rows[0].sum || '0');
  }

  private async getActiveChains(): Promise<number> {
    const result = await database.query('SELECT COUNT(*) FROM chains WHERE is_active = true');
    return parseInt(result.rows[0].count);
  }

  private async getChainTokenCount(chainId: number): Promise<number> {
    const result = await database.query('SELECT COUNT(*) FROM tokens WHERE chain_id = $1 AND is_active = true', [chainId]);
    return parseInt(result.rows[0].count);
  }

  private async getChainTransactionCount(chainId: number, timeframe: string): Promise<number> {
    const hours = timeframe === '7d' ? 168 : 24;
    const result = await database.query(
      'SELECT COUNT(*) FROM transactions WHERE chain_id = $1 AND created_at >= NOW() - INTERVAL $2 HOURS',
      [chainId, hours]
    );
    return parseInt(result.rows[0].count);
  }

  private async getChainVolume(chainId: number, timeframe: string): Promise<number> {
    const result = await database.query('SELECT SUM(COALESCE(volume_24h, 0)) FROM tokens WHERE chain_id = $1 AND is_active = true', [chainId]);
    return parseFloat(result.rows[0].sum || '0');
  }
}
