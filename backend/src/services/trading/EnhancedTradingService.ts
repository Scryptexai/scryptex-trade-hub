
import { database } from '@/config/database';
import { blockchainService } from '@/services/blockchain.service';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { redisClient } from '@/config/redis';

interface TradingParams {
  tokenAddress: string;
  amount: string;
  maxSlippage: number;
  deadline: number;
  socialNote?: string;
  chainId: number;
}

interface OrderParams {
  tokenAddress: string;
  amount: string;
  price: string;
  orderType: 'limit' | 'market' | 'stop';
  side: 'buy' | 'sell';
  timeInForce: 'GTC' | 'IOC' | 'FOK';
  expiration?: number;
}

interface BatchTradeParams {
  trades: TradingParams[];
  maxConcurrent: number;
}

interface MarketMetrics {
  volume24h: number;
  trades24h: number;
  uniqueTraders24h: number;
  priceChange24h: number;
  marketCap: number;
  liquidity: number;
  volatility: number;
}

export class EnhancedTradingService {
  private readonly CACHE_TTL = 60; // 1 minute
  private readonly MEV_PROTECTION_DELAY = 3; // 3 seconds
  private readonly MAX_SLIPPAGE = 15; // 15%
  private readonly GRADUATION_THRESHOLD = 69000; // $69k

  async executeBuyTrade(userId: string, params: TradingParams) {
    try {
      logger.info('Executing buy trade', { userId, params });

      // Validate parameters
      this._validateTradeParams(params);

      // MEV Protection
      await this._applyMEVProtection(userId, params.tokenAddress);

      // Bot Detection
      await this._checkBotActivity(userId);

      // Execute trade on blockchain
      const result = await blockchainService.buyTokens(params.chainId, {
        tokenAddress: params.tokenAddress,
        amount: params.amount,
        maxSlippage: params.maxSlippage,
        deadline: params.deadline,
        socialNote: params.socialNote,
        userId
      });

      // Update database
      await this._recordTrade(userId, {
        ...params,
        side: 'buy',
        txHash: result.tx?.hash,
        executedPrice: result.executedPrice,
        actualAmount: result.actualAmount
      });

      // Update user stats
      await this._updateUserStats(userId, params);

      // Check graduation status
      await this._checkGraduationStatus(params.tokenAddress, params.chainId);

      // Update cache
      await this._updateMarketCache(params.tokenAddress);

      return result;
    } catch (error) {
      logger.error('Buy trade execution failed:', error);
      throw new CustomError('Failed to execute buy trade', 500);
    }
  }

  async executeSellTrade(userId: string, params: TradingParams) {
    try {
      logger.info('Executing sell trade', { userId, params });

      // Validate parameters
      this._validateTradeParams(params);

      // Check balance
      await this._validateUserBalance(userId, params.tokenAddress, params.amount);

      // MEV Protection
      await this._applyMEVProtection(userId, params.tokenAddress);

      // Execute trade on blockchain
      const result = await blockchainService.sellTokens(params.chainId, {
        tokenAddress: params.tokenAddress,
        amount: params.amount,
        maxSlippage: params.maxSlippage,
        deadline: params.deadline,
        socialNote: params.socialNote,
        userId
      });

      // Update database
      await this._recordTrade(userId, {
        ...params,
        side: 'sell',
        txHash: result.tx?.hash,
        executedPrice: result.executedPrice,
        actualAmount: result.actualAmount
      });

      // Update user stats
      await this._updateUserStats(userId, params);

      // Update cache
      await this._updateMarketCache(params.tokenAddress);

      return result;
    } catch (error) {
      logger.error('Sell trade execution failed:', error);
      throw new CustomError('Failed to execute sell trade', 500);
    }
  }

  async executeBatchTrades(userId: string, params: BatchTradeParams) {
    try {
      logger.info('Executing batch trades', { userId, tradeCount: params.trades.length });

      const results = [];
      const errors = [];

      // Process trades with concurrency limit
      for (let i = 0; i < params.trades.length; i += params.maxConcurrent) {
        const batch = params.trades.slice(i, i + params.maxConcurrent);
        
        const batchPromises = batch.map(async (trade, index) => {
          try {
            if (trade.amount && parseFloat(trade.amount) > 0) {
              return await this.executeBuyTrade(userId, trade);
            } else {
              return await this.executeSellTrade(userId, trade);
            }
          } catch (error) {
            errors.push({ index: i + index, error: error.message });
            return null;
          }
        });

        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults);
      }

      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
      const failureCount = results.length - successCount;

      logger.info('Batch trades completed', { 
        userId, 
        successful: successCount, 
        failed: failureCount 
      });

      return {
        successful: successCount,
        failed: failureCount,
        errors,
        results: results.map(r => r.status === 'fulfilled' ? r.value : null)
      };
    } catch (error) {
      logger.error('Batch trade execution failed:', error);
      throw new CustomError('Failed to execute batch trades', 500);
    }
  }

  async createLimitOrder(userId: string, params: OrderParams) {
    try {
      logger.info('Creating limit order', { userId, params });

      // Validate order
      this._validateOrderParams(params);

      // Store order in database
      const order = await database.query(`
        INSERT INTO limit_orders (
          user_id, token_address, amount, price, order_type, side,
          time_in_force, expiration, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open', NOW())
        RETURNING *
      `, [
        userId, params.tokenAddress, params.amount, params.price,
        params.orderType, params.side, params.timeInForce, 
        params.expiration ? new Date(params.expiration * 1000) : null
      ]);

      // Add to order matching queue
      await this._addToOrderQueue(order.rows[0]);

      return order.rows[0];
    } catch (error) {
      logger.error('Limit order creation failed:', error);
      throw new CustomError('Failed to create limit order', 500);
    }
  }

  async getMarketMetrics(tokenAddress: string): Promise<MarketMetrics> {
    try {
      const cacheKey = `market_metrics:${tokenAddress}`;
      const cached = await redisClient.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const metrics = await this._calculateMarketMetrics(tokenAddress);
      
      // Cache for 1 minute
      await redisClient.setex(cacheKey, this.CACHE_TTL, JSON.stringify(metrics));
      
      return metrics;
    } catch (error) {
      logger.error('Failed to get market metrics:', error);
      throw new CustomError('Failed to get market metrics', 500);
    }
  }

  async getTrendingTokens(chainId: number, limit: number = 10) {
    try {
      const cacheKey = `trending_tokens:${chainId}`;
      const cached = await redisClient.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const query = `
        SELECT 
          t.*,
          COALESCE(tm.volume_24h, 0) as volume_24h,
          COALESCE(tm.trades_24h, 0) as trades_24h,
          COALESCE(tm.unique_traders_24h, 0) as unique_traders_24h,
          COALESCE(tm.price_change_24h, 0) as price_change_24h,
          (
            COALESCE(tm.volume_24h, 0) * 0.4 +
            COALESCE(tm.unique_traders_24h, 0) * 0.3 +
            COALESCE(t.social_score, 0) * 0.2 +
            CASE 
              WHEN (EXTRACT(EPOCH FROM NOW()) - EXTRACT(EPOCH FROM t.created_at)) < 604800 
              THEN (604800 - (EXTRACT(EPOCH FROM NOW()) - EXTRACT(EPOCH FROM t.created_at))) / 604800 * 100 * 0.1
              ELSE 0
            END
          ) as trending_score
        FROM tokens t
        LEFT JOIN token_metrics tm ON t.contract_address = tm.token_address
        WHERE t.chain_id = $1 AND t.is_active = true
        ORDER BY trending_score DESC
        LIMIT $2
      `;

      const result = await database.query(query, [chainId, limit]);
      
      // Cache for 5 minutes
      await redisClient.setex(cacheKey, 300, JSON.stringify(result.rows));
      
      return result.rows;
    } catch (error) {
      logger.error('Failed to get trending tokens:', error);
      throw new CustomError('Failed to get trending tokens', 500);
    }
  }

  private _validateTradeParams(params: TradingParams) {
    if (!params.tokenAddress || !params.amount) {
      throw new CustomError('Invalid trade parameters', 400);
    }

    if (params.maxSlippage > this.MAX_SLIPPAGE) {
      throw new CustomError(`Slippage too high. Max: ${this.MAX_SLIPPAGE}%`, 400);
    }

    if (params.deadline < Math.floor(Date.now() / 1000)) {
      throw new CustomError('Trade deadline has passed', 400);
    }
  }

  private _validateOrderParams(params: OrderParams) {
    if (!params.tokenAddress || !params.amount || !params.price) {
      throw new CustomError('Invalid order parameters', 400);
    }

    if (parseFloat(params.amount) <= 0 || parseFloat(params.price) <= 0) {
      throw new CustomError('Amount and price must be positive', 400);
    }
  }

  private async _applyMEVProtection(userId: string, tokenAddress: string) {
    const key = `mev_protection:${userId}:${tokenAddress}`;
    const lastTrade = await redisClient.get(key);
    
    if (lastTrade) {
      const timeSinceLastTrade = Date.now() - parseInt(lastTrade);
      if (timeSinceLastTrade < this.MEV_PROTECTION_DELAY * 1000) {
        const waitTime = this.MEV_PROTECTION_DELAY * 1000 - timeSinceLastTrade;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    await redisClient.setex(key, this.MEV_PROTECTION_DELAY, Date.now().toString());
  }

  private async _checkBotActivity(userId: string) {
    // Implement bot detection logic
    const recentTrades = await database.query(`
      SELECT COUNT(*) as trade_count
      FROM transactions 
      WHERE from_address = (SELECT wallet_address FROM users WHERE id = $1)
      AND created_at > NOW() - INTERVAL '1 hour'
    `, [userId]);

    if (parseInt(recentTrades.rows[0].trade_count) > 100) {
      throw new CustomError('Suspicious trading activity detected', 429);
    }
  }

  private async _validateUserBalance(userId: string, tokenAddress: string, amount: string) {
    const balance = await database.query(`
      SELECT balance FROM user_balances 
      WHERE user_id = $1 AND token_id = (
        SELECT id FROM tokens WHERE contract_address = $2
      )
    `, [userId, tokenAddress]);

    if (!balance.rows[0] || parseFloat(balance.rows[0].balance) < parseFloat(amount)) {
      throw new CustomError('Insufficient balance', 400);
    }
  }

  private async _recordTrade(userId: string, tradeData: any) {
    await database.query(`
      INSERT INTO transactions (
        user_id, token_address, amount, side, tx_hash,
        executed_price, actual_amount, social_note, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `, [
      userId, tradeData.tokenAddress, tradeData.amount, tradeData.side,
      tradeData.txHash, tradeData.executedPrice, tradeData.actualAmount, tradeData.socialNote
    ]);
  }

  private async _updateUserStats(userId: string, params: TradingParams) {
    const volume = parseFloat(params.amount);
    
    await database.query(`
      INSERT INTO user_stats (user_id, total_volume, total_trades, last_trade_time)
      VALUES ($1, $2, 1, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        total_volume = user_stats.total_volume + $2,
        total_trades = user_stats.total_trades + 1,
        last_trade_time = NOW()
    `, [userId, volume]);
  }

  private async _checkGraduationStatus(tokenAddress: string, chainId: number) {
    try {
      const marketCap = await blockchainService.getMarketCap(chainId, tokenAddress);
      
      if (marketCap >= this.GRADUATION_THRESHOLD) {
        // Trigger graduation process
        await blockchainService.executeGraduation(chainId, tokenAddress);
        
        // Update database
        await database.query(`
          UPDATE tokens 
          SET is_graduated = true, graduated_at = NOW()
          WHERE contract_address = $1 AND chain_id = $2
        `, [tokenAddress, chainId]);
      }
    } catch (error) {
      logger.error('Graduation check failed:', error);
    }
  }

  private async _updateMarketCache(tokenAddress: string) {
    // Invalidate related cache entries
    const keys = [
      `market_metrics:${tokenAddress}`,
      `trending_tokens:*`,
      `token_price:${tokenAddress}`
    ];

    for (const key of keys) {
      await redisClient.del(key);
    }
  }

  private async _calculateMarketMetrics(tokenAddress: string): Promise<MarketMetrics> {
    const query = `
      SELECT 
        COALESCE(SUM(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN amount ELSE 0 END), 0) as volume_24h,
        COALESCE(COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END), 0) as trades_24h,
        COALESCE(COUNT(DISTINCT CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN from_address END), 0) as unique_traders_24h,
        COALESCE(t.current_price, 0) as current_price,
        COALESCE(t.market_cap, 0) as market_cap
      FROM transactions tr
      RIGHT JOIN tokens t ON tr.token_id = t.id
      WHERE t.contract_address = $1
      GROUP BY t.current_price, t.market_cap
    `;

    const result = await database.query(query, [tokenAddress]);
    const row = result.rows[0] || {};

    return {
      volume24h: parseFloat(row.volume_24h || '0'),
      trades24h: parseInt(row.trades_24h || '0'),
      uniqueTraders24h: parseInt(row.unique_traders_24h || '0'),
      priceChange24h: 0, // Calculate based on price history
      marketCap: parseFloat(row.market_cap || '0'),
      liquidity: 0, // Calculate from DEX data
      volatility: 0 // Calculate from price movements
    };
  }

  private async _addToOrderQueue(order: any) {
    // Add order to matching queue for processing
    await redisClient.zadd(
      `order_queue:${order.token_address}:${order.side}`,
      order.price,
      JSON.stringify(order)
    );
  }
}
