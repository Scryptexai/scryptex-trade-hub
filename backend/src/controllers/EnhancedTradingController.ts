
import { Request, Response } from 'express';
import { EnhancedTradingService } from '@/services/trading/EnhancedTradingService';
import { CustomError } from '@/middleware/errorHandler';
import { AuthenticatedRequest } from '@/middleware/auth';
import { logger } from '@/utils/logger';

export class EnhancedTradingController {
  private tradingService: EnhancedTradingService;

  constructor() {
    this.tradingService = new EnhancedTradingService();
  }

  async executeBuyTrade(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const {
        tokenAddress,
        amount,
        maxSlippage = 5,
        deadline,
        socialNote,
        chainId = 11155931
      } = req.body;

      if (!tokenAddress || !amount) {
        throw new CustomError('Token address and amount are required', 400);
      }

      const tradeDeadline = deadline || Math.floor(Date.now() / 1000) + 1200; // 20 minutes default

      const result = await this.tradingService.executeBuyTrade(userId, {
        tokenAddress,
        amount,
        maxSlippage,
        deadline: tradeDeadline,
        socialNote,
        chainId
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Buy trade executed successfully'
      });
    } catch (error) {
      logger.error('Buy trade execution failed:', error);
      throw error;
    }
  }

  async executeSellTrade(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const {
        tokenAddress,
        amount,
        maxSlippage = 5,
        deadline,
        socialNote,
        chainId = 11155931
      } = req.body;

      if (!tokenAddress || !amount) {
        throw new CustomError('Token address and amount are required', 400);
      }

      const tradeDeadline = deadline || Math.floor(Date.now() / 1000) + 1200; // 20 minutes default

      const result = await this.tradingService.executeSellTrade(userId, {
        tokenAddress,
        amount,
        maxSlippage,
        deadline: tradeDeadline,
        socialNote,
        chainId
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Sell trade executed successfully'
      });
    } catch (error) {
      logger.error('Sell trade execution failed:', error);
      throw error;
    }
  }

  async executeBatchTrades(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const { trades, maxConcurrent = 5 } = req.body;

      if (!trades || !Array.isArray(trades) || trades.length === 0) {
        throw new CustomError('Trades array is required', 400);
      }

      if (trades.length > 50) {
        throw new CustomError('Maximum 50 trades per batch', 400);
      }

      const result = await this.tradingService.executeBatchTrades(userId, {
        trades,
        maxConcurrent
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Batch trades executed'
      });
    } catch (error) {
      logger.error('Batch trade execution failed:', error);
      throw error;
    }
  }

  async createLimitOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const {
        tokenAddress,
        amount,
        price,
        orderType = 'limit',
        side,
        timeInForce = 'GTC',
        expiration
      } = req.body;

      if (!tokenAddress || !amount || !price || !side) {
        throw new CustomError('Token address, amount, price, and side are required', 400);
      }

      if (!['buy', 'sell'].includes(side)) {
        throw new CustomError('Side must be either buy or sell', 400);
      }

      const result = await this.tradingService.createLimitOrder(userId, {
        tokenAddress,
        amount,
        price,
        orderType,
        side,
        timeInForce,
        expiration
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'Limit order created successfully'
      });
    } catch (error) {
      logger.error('Limit order creation failed:', error);
      throw error;
    }
  }

  async getMarketMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { tokenAddress } = req.params;

      if (!tokenAddress) {
        throw new CustomError('Token address is required', 400);
      }

      const metrics = await this.tradingService.getMarketMetrics(tokenAddress);

      res.status(200).json({
        success: true,
        data: metrics
      });
    } catch (error) {
      logger.error('Failed to get market metrics:', error);
      throw error;
    }
  }

  async getTrendingTokens(req: Request, res: Response): Promise<void> {
    try {
      const { chainId = 11155931, limit = 10 } = req.query;

      const tokens = await this.tradingService.getTrendingTokens(
        parseInt(chainId as string),
        parseInt(limit as string)
      );

      res.status(200).json({
        success: true,
        data: tokens
      });
    } catch (error) {
      logger.error('Failed to get trending tokens:', error);
      throw error;
    }
  }

  async getTradeHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const { 
        tokenAddress, 
        limit = 50, 
        offset = 0,
        startDate,
        endDate 
      } = req.query;

      // Implementation would fetch user's trade history
      // This is a placeholder implementation
      res.status(200).json({
        success: true,
        data: {
          trades: [],
          total: 0,
          hasMore: false
        }
      });
    } catch (error) {
      logger.error('Failed to get trade history:', error);
      throw error;
    }
  }

  async getUserTradingStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      // Implementation would fetch user's trading statistics
      // This is a placeholder implementation
      res.status(200).json({
        success: true,
        data: {
          totalVolume: 0,
          totalTrades: 0,
          totalProfit: 0,
          winRate: 0,
          reputation: 0,
          rank: 0
        }
      });
    } catch (error) {
      logger.error('Failed to get user trading stats:', error);
      throw error;
    }
  }

  async getTokenAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { tokenAddress } = req.params;
      const { timeframe = '24h' } = req.query;

      if (!tokenAddress) {
        throw new CustomError('Token address is required', 400);
      }

      // Implementation would fetch detailed token analytics
      // This is a placeholder implementation
      res.status(200).json({
        success: true,
        data: {
          priceHistory: [],
          volumeHistory: [],
          holderDistribution: {},
          socialMetrics: {},
          technicalIndicators: {}
        }
      });
    } catch (error) {
      logger.error('Failed to get token analytics:', error);
      throw error;
    }
  }
}
