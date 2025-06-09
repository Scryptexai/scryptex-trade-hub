
import { logger } from '@/utils/logger';

export interface PointsAwardParams {
  userId: string;
  amount: number;
  reason: string;
  txHash: string;
  chainId: number;
  tokenAddress?: string;
  tradeAmount?: string;
}

export interface UserPoints {
  currentPoints: number;
  totalEarned: number;
  weeklyPoints: number;
  monthlyPoints: number;
  rank: number;
  level: number;
  lastActivity: Date;
}

export interface DailyStats {
  tokenCreations: number;
  trades: number;
  bridges: number;
  swaps: number;
  pointsEarned: number;
  maxTokenCreations: number;
  maxTrades: number;
  maxBridges: number;
  maxSwaps: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalPoints: number;
  weeklyPoints: number;
  rank: number;
  avatar?: string;
}

export class PointsService {
  private readonly DAILY_LIMITS = {
    TOKEN_CREATION: 3,
    TRADING: 10,
    BRIDGE: 5,
    SWAP: 15,
    GM: 1
  };

  private readonly POINT_REWARDS = {
    TOKEN_CREATION: 50,
    TOKEN_CREATION_MEGAETH: 60,
    TOKEN_BUY: 10,
    TOKEN_SELL: 10,
    BRIDGE_TRANSFER: 25,
    SWAP: 15,
    REFERRAL: 50,
    DAILY_GM: 5
  };

  private readonly MULTIPLIERS = {
    VOLUME_THRESHOLD_1: 1, // ETH
    VOLUME_THRESHOLD_2: 10, // ETH
    VOLUME_MULTIPLIER_1: 1.5,
    VOLUME_MULTIPLIER_2: 2.0,
    MEGAETH_REALTIME: 1.2,
    SUCCESS_TRADE: 1.2
  };

  async awardPoints(params: PointsAwardParams): Promise<boolean> {
    try {
      // Check daily limits first
      const dailyStats = await this.getUserDailyStats(params.userId);
      
      if (!this.canAwardPoints(params.reason, dailyStats)) {
        logger.warn(`Daily limit reached for user ${params.userId}, reason: ${params.reason}`);
        return false;
      }

      // Calculate base points
      let basePoints = this.getBasePoints(params.reason, params.chainId);
      
      // Apply multipliers
      const multiplier = this.calculateMultiplier(params);
      const finalPoints = Math.floor(basePoints * multiplier);

      // Store points in database (this would integrate with Supabase)
      await this.storePointsTransaction({
        userId: params.userId,
        points: finalPoints,
        reason: params.reason,
        txHash: params.txHash,
        chainId: params.chainId,
        multiplier,
        tokenAddress: params.tokenAddress,
        tradeAmount: params.tradeAmount
      });

      // Update user summary
      await this.updateUserPointsSummary(params.userId, finalPoints);

      logger.info(`Awarded ${finalPoints} points to user ${params.userId} for ${params.reason}`);
      return true;
    } catch (error) {
      logger.error('Failed to award points:', error);
      return false;
    }
  }

  async getUserPoints(userId: string): Promise<UserPoints> {
    try {
      // This would query the database for user points
      // For now, returning mock data structure
      const mockPoints: UserPoints = {
        currentPoints: 1250,
        totalEarned: 2800,
        weeklyPoints: 450,
        monthlyPoints: 1250,
        rank: 15,
        level: 3,
        lastActivity: new Date()
      };

      logger.info(`Retrieved points for user ${userId}: ${mockPoints.currentPoints}`);
      return mockPoints;
    } catch (error) {
      logger.error(`Failed to get user points for ${userId}:`, error);
      throw error;
    }
  }

  async getUserDailyStats(userId: string): Promise<DailyStats> {
    try {
      // This would query today's activities for the user
      const mockStats: DailyStats = {
        tokenCreations: 1,
        trades: 5,
        bridges: 2,
        swaps: 8,
        pointsEarned: 180,
        maxTokenCreations: this.DAILY_LIMITS.TOKEN_CREATION,
        maxTrades: this.DAILY_LIMITS.TRADING,
        maxBridges: this.DAILY_LIMITS.BRIDGE,
        maxSwaps: this.DAILY_LIMITS.SWAP
      };

      return mockStats;
    } catch (error) {
      logger.error(`Failed to get daily stats for ${userId}:`, error);
      throw error;
    }
  }

  async getLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    try {
      // This would query the database for top users
      const mockLeaderboard: LeaderboardEntry[] = [];
      
      for (let i = 1; i <= limit; i++) {
        mockLeaderboard.push({
          userId: `user_${i}`,
          username: `Trader${i}`,
          totalPoints: 5000 - (i * 50),
          weeklyPoints: 1000 - (i * 10),
          rank: i
        });
      }

      return mockLeaderboard;
    } catch (error) {
      logger.error('Failed to get leaderboard:', error);
      throw error;
    }
  }

  private canAwardPoints(reason: string, dailyStats: DailyStats): boolean {
    switch (reason) {
      case 'token_creation':
      case 'token_creation_realtime':
        return dailyStats.tokenCreations < this.DAILY_LIMITS.TOKEN_CREATION;
      case 'token_buy':
      case 'token_sell':
        return dailyStats.trades < this.DAILY_LIMITS.TRADING;
      case 'bridge_transfer':
        return dailyStats.bridges < this.DAILY_LIMITS.BRIDGE;
      case 'swap':
        return dailyStats.swaps < this.DAILY_LIMITS.SWAP;
      default:
        return true;
    }
  }

  private getBasePoints(reason: string, chainId: number): number {
    switch (reason) {
      case 'token_creation':
        return chainId === 6342 ? this.POINT_REWARDS.TOKEN_CREATION_MEGAETH : this.POINT_REWARDS.TOKEN_CREATION;
      case 'token_creation_realtime':
        return this.POINT_REWARDS.TOKEN_CREATION_MEGAETH;
      case 'token_buy':
        return this.POINT_REWARDS.TOKEN_BUY;
      case 'token_sell':
        return this.POINT_REWARDS.TOKEN_SELL;
      case 'bridge_transfer':
        return this.POINT_REWARDS.BRIDGE_TRANSFER;
      case 'swap':
        return this.POINT_REWARDS.SWAP;
      case 'referral':
        return this.POINT_REWARDS.REFERRAL;
      case 'daily_gm':
        return this.POINT_REWARDS.DAILY_GM;
      default:
        return 5;
    }
  }

  private calculateMultiplier(params: PointsAwardParams): number {
    let multiplier = 1.0;

    // Volume-based multiplier
    if (params.tradeAmount) {
      const volume = parseFloat(params.tradeAmount);
      if (volume >= this.MULTIPLIERS.VOLUME_THRESHOLD_2) {
        multiplier *= this.MULTIPLIERS.VOLUME_MULTIPLIER_2;
      } else if (volume >= this.MULTIPLIERS.VOLUME_THRESHOLD_1) {
        multiplier *= this.MULTIPLIERS.VOLUME_MULTIPLIER_1;
      }
    }

    // Chain-specific multiplier (MegaETH gets bonus)
    if (params.chainId === 6342) {
      multiplier *= this.MULTIPLIERS.MEGAETH_REALTIME;
    }

    // Success multiplier for successful trades
    if (params.reason.includes('buy') || params.reason.includes('sell')) {
      multiplier *= this.MULTIPLIERS.SUCCESS_TRADE;
    }

    return multiplier;
  }

  private async storePointsTransaction(data: {
    userId: string;
    points: number;
    reason: string;
    txHash: string;
    chainId: number;
    multiplier: number;
    tokenAddress?: string;
    tradeAmount?: string;
  }): Promise<void> {
    // This would integrate with database to store the points transaction
    logger.info(`Storing points transaction: ${data.points} points for ${data.userId}`);
  }

  private async updateUserPointsSummary(userId: string, points: number): Promise<void> {
    // This would update the user's total points in the database
    logger.info(`Updating user ${userId} points summary with ${points} points`);
  }
}
