
import { database } from '@/config/database';
import { logger } from '@/utils/logger';

interface PointsAwardParams {
  userId: string;
  amount: number;
  reason: string;
  txHash: string;
  chainId: number;
}

interface DailyLimit {
  token_creation: number;
  token_trading: number;
  bridge_transfer: number;
  swap: number;
}

export class PointsService {
  private dailyLimits: DailyLimit = {
    token_creation: 3,
    token_trading: 3,
    bridge_transfer: 3,
    swap: 3
  };

  async awardPoints(params: PointsAwardParams): Promise<boolean> {
    try {
      // Check daily limits first
      const canAward = await this.checkDailyLimit(params.userId, params.reason);
      if (!canAward) {
        logger.info(`Daily limit reached for user ${params.userId}, reason: ${params.reason}`);
        return false;
      }

      // Award points
      const query = `
        INSERT INTO user_points (
          user_id, amount, reason, tx_hash, chain_id, awarded_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (tx_hash, chain_id) DO NOTHING
        RETURNING id
      `;

      const result = await database.query(query, [
        params.userId,
        params.amount,
        params.reason,
        params.txHash,
        params.chainId
      ]);

      if (result.rows.length > 0) {
        // Update user total points
        await this.updateUserTotalPoints(params.userId, params.amount);
        
        logger.info(`Points awarded: ${params.amount} to user ${params.userId} for ${params.reason}`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Failed to award points:', error);
      return false;
    }
  }

  private async checkDailyLimit(userId: string, reason: string): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Map reason to category
      let category = reason;
      if (reason.includes('token_buy') || reason.includes('token_sell')) {
        category = 'token_trading';
      } else if (reason.includes('token_creation')) {
        category = 'token_creation';
      } else if (reason.includes('bridge')) {
        category = 'bridge_transfer';
      } else if (reason.includes('swap')) {
        category = 'swap';
      }

      const query = `
        SELECT COUNT(*) as count
        FROM user_points 
        WHERE user_id = $1 
        AND reason LIKE $2
        AND DATE(awarded_at) = $3
      `;

      const result = await database.query(query, [
        userId,
        `%${category}%`,
        today
      ]);

      const dailyCount = parseInt(result.rows[0].count);
      const limit = this.dailyLimits[category as keyof DailyLimit] || 3;

      return dailyCount < limit;
    } catch (error) {
      logger.error('Failed to check daily limit:', error);
      return false; // Fail safe - don't award if we can't check
    }
  }

  private async updateUserTotalPoints(userId: string, pointsToAdd: number): Promise<void> {
    try {
      const query = `
        INSERT INTO user_total_points (user_id, total_points, last_updated)
        VALUES ($1, $2, NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          total_points = user_total_points.total_points + $2,
          last_updated = NOW()
      `;

      await database.query(query, [userId, pointsToAdd]);
    } catch (error) {
      logger.error('Failed to update user total points:', error);
      throw error;
    }
  }

  async getUserPoints(userId: string): Promise<any> {
    try {
      const query = `
        SELECT 
          utp.total_points,
          (SELECT COUNT(*) FROM user_points up WHERE up.user_id = $1 AND DATE(up.awarded_at) = CURRENT_DATE) as today_activities,
          (SELECT COUNT(DISTINCT DATE(up.awarded_at)) FROM user_points up WHERE up.user_id = $1) as active_days,
          (SELECT RANK() OVER (ORDER BY total_points DESC) FROM user_total_points WHERE user_id = $1) as rank
        FROM user_total_points utp
        WHERE utp.user_id = $1
      `;

      const result = await database.query(query, [userId]);
      
      if (result.rows.length > 0) {
        return result.rows[0];
      }

      return {
        total_points: 0,
        today_activities: 0,
        active_days: 0,
        rank: null
      };
    } catch (error) {
      logger.error('Failed to get user points:', error);
      throw error;
    }
  }

  async getLeaderboard(limit: number = 100): Promise<any[]> {
    try {
      const query = `
        SELECT 
          utp.user_id,
          utp.total_points,
          utp.last_updated,
          RANK() OVER (ORDER BY utp.total_points DESC) as rank
        FROM user_total_points utp
        ORDER BY utp.total_points DESC
        LIMIT $1
      `;

      const result = await database.query(query, [limit]);
      return result.rows;
    } catch (error) {
      logger.error('Failed to get leaderboard:', error);
      throw error;
    }
  }

  async getUserDailyStats(userId: string): Promise<any> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const query = `
        SELECT 
          reason,
          COUNT(*) as count,
          SUM(amount) as total_points
        FROM user_points 
        WHERE user_id = $1 
        AND DATE(awarded_at) = $2
        GROUP BY reason
      `;

      const result = await database.query(query, [userId, today]);
      
      const stats = {
        token_creation: 0,
        token_trading: 0,
        bridge_transfer: 0,
        swap: 0,
        total_today: 0
      };

      result.rows.forEach(row => {
        if (row.reason.includes('token_creation')) {
          stats.token_creation = parseInt(row.count);
        } else if (row.reason.includes('token_buy') || row.reason.includes('token_sell')) {
          stats.token_trading += parseInt(row.count);
        } else if (row.reason.includes('bridge')) {
          stats.bridge_transfer = parseInt(row.count);
        } else if (row.reason.includes('swap')) {
          stats.swap = parseInt(row.count);
        }
        stats.total_today += parseInt(row.total_points);
      });

      return {
        ...stats,
        limits: this.dailyLimits,
        remaining: {
          token_creation: Math.max(0, this.dailyLimits.token_creation - stats.token_creation),
          token_trading: Math.max(0, this.dailyLimits.token_trading - stats.token_trading),
          bridge_transfer: Math.max(0, this.dailyLimits.bridge_transfer - stats.bridge_transfer),
          swap: Math.max(0, this.dailyLimits.swap - stats.swap)
        }
      };
    } catch (error) {
      logger.error('Failed to get user daily stats:', error);
      throw error;
    }
  }
}
