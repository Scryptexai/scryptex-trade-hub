
import { database } from '@/config/database';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { redisClient } from '@/config/redis';

interface TraderProfile {
  id: string;
  username: string;
  bio: string;
  reputation: number;
  totalTrades: number;
  successfulTrades: number;
  totalVolume: number;
  isVerified: boolean;
  joinedAt: string;
}

interface TradeComment {
  id: string;
  traderId: string;
  tokenAddress: string;
  comment: string;
  timestamp: string;
  likes: number;
  isVisible: boolean;
}

export class SocialTradingService {
  private readonly CACHE_TTL = 300; // 5 minutes

  async createTraderProfile(userId: string, username: string, bio: string): Promise<TraderProfile> {
    try {
      // Check if profile already exists
      const existingProfile = await database.query(
        'SELECT * FROM trader_profiles WHERE user_id = $1',
        [userId]
      );

      if (existingProfile.rows.length > 0) {
        throw new CustomError('Profile already exists', 400);
      }

      // Check username uniqueness
      const usernameCheck = await database.query(
        'SELECT * FROM trader_profiles WHERE username = $1',
        [username]
      );

      if (usernameCheck.rows.length > 0) {
        throw new CustomError('Username already taken', 400);
      }

      const result = await database.query(`
        INSERT INTO trader_profiles (
          user_id, username, bio, reputation, total_trades,
          successful_trades, total_volume, is_verified, joined_at
        ) VALUES ($1, $2, $3, 100, 0, 0, 0, false, NOW())
        RETURNING *
      `, [userId, username, bio]);

      return this._formatTraderProfile(result.rows[0]);
    } catch (error) {
      logger.error('Failed to create trader profile:', error);
      throw error;
    }
  }

  async updateTraderProfile(userId: string, bio: string): Promise<TraderProfile> {
    try {
      const result = await database.query(`
        UPDATE trader_profiles 
        SET bio = $1, updated_at = NOW()
        WHERE user_id = $2
        RETURNING *
      `, [bio, userId]);

      if (result.rows.length === 0) {
        throw new CustomError('Profile not found', 404);
      }

      // Invalidate cache
      await redisClient.del(`trader_profile:${userId}`);

      return this._formatTraderProfile(result.rows[0]);
    } catch (error) {
      logger.error('Failed to update trader profile:', error);
      throw error;
    }
  }

  async postTradeComment(
    userId: string,
    tokenAddress: string,
    comment: string,
    tradeAmount: number,
    isSuccessful: boolean
  ): Promise<TradeComment> {
    try {
      // Insert comment
      const commentResult = await database.query(`
        INSERT INTO trade_comments (
          user_id, token_address, comment, timestamp, likes, is_visible
        ) VALUES ($1, $2, $3, NOW(), 0, true)
        RETURNING *
      `, [userId, tokenAddress, comment]);

      // Update trader stats
      await this._updateTraderStats(userId, tradeAmount, isSuccessful);

      // Update token social metrics
      await this._updateTokenSocialMetrics(tokenAddress);

      // Update reputation
      await this._updateReputation(userId, tradeAmount, isSuccessful);

      return this._formatTradeComment(commentResult.rows[0]);
    } catch (error) {
      logger.error('Failed to post trade comment:', error);
      throw error;
    }
  }

  async likeComment(userId: string, commentId: string): Promise<void> {
    try {
      // Check if already liked
      const existingLike = await database.query(
        'SELECT * FROM comment_likes WHERE user_id = $1 AND comment_id = $2',
        [userId, commentId]
      );

      if (existingLike.rows.length > 0) {
        throw new CustomError('Comment already liked', 400);
      }

      // Add like
      await database.query(
        'INSERT INTO comment_likes (user_id, comment_id, created_at) VALUES ($1, $2, NOW())',
        [userId, commentId]
      );

      // Update comment likes count
      await database.query(
        'UPDATE trade_comments SET likes = likes + 1 WHERE id = $1',
        [commentId]
      );

      // Reward comment author
      const comment = await database.query(
        'SELECT user_id FROM trade_comments WHERE id = $1',
        [commentId]
      );

      if (comment.rows.length > 0) {
        await database.query(
          'UPDATE trader_profiles SET reputation = reputation + 5 WHERE user_id = $1',
          [comment.rows[0].user_id]
        );
      }
    } catch (error) {
      logger.error('Failed to like comment:', error);
      throw error;
    }
  }

  async getTraderProfile(userId: string): Promise<TraderProfile | null> {
    try {
      const cacheKey = `trader_profile:${userId}`;
      const cached = await redisClient.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const result = await database.query(
        'SELECT * FROM trader_profiles WHERE user_id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const profile = this._formatTraderProfile(result.rows[0]);

      // Cache for 5 minutes
      await redisClient.setex(cacheKey, this.CACHE_TTL, JSON.stringify(profile));

      return profile;
    } catch (error) {
      logger.error('Failed to get trader profile:', error);
      throw error;
    }
  }

  async getTopTraders(limit: number = 10): Promise<TraderProfile[]> {
    try {
      const cacheKey = `top_traders:${limit}`;
      const cached = await redisClient.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const result = await database.query(`
        SELECT *,
          (reputation * 0.4 + total_volume * 0.3 + 
           CASE WHEN total_trades > 0 THEN (successful_trades::float / total_trades * 100) * 0.3 ELSE 0 END) as score
        FROM trader_profiles
        WHERE total_trades > 0
        ORDER BY score DESC
        LIMIT $1
      `, [limit]);

      const traders = result.rows.map(row => this._formatTraderProfile(row));

      // Cache for 5 minutes
      await redisClient.setex(cacheKey, this.CACHE_TTL, JSON.stringify(traders));

      return traders;
    } catch (error) {
      logger.error('Failed to get top traders:', error);
      throw error;
    }
  }

  async getTokenComments(tokenAddress: string, limit: number = 20): Promise<TradeComment[]> {
    try {
      const result = await database.query(`
        SELECT tc.*, tp.username
        FROM trade_comments tc
        JOIN trader_profiles tp ON tc.user_id = tp.user_id
        WHERE tc.token_address = $1 AND tc.is_visible = true
        ORDER BY tc.timestamp DESC
        LIMIT $2
      `, [tokenAddress, limit]);

      return result.rows.map(row => this._formatTradeComment(row));
    } catch (error) {
      logger.error('Failed to get token comments:', error);
      throw error;
    }
  }

  async getTraderComments(userId: string, limit: number = 20): Promise<TradeComment[]> {
    try {
      const result = await database.query(`
        SELECT * FROM trade_comments
        WHERE user_id = $1 AND is_visible = true
        ORDER BY timestamp DESC
        LIMIT $2
      `, [userId, limit]);

      return result.rows.map(row => this._formatTradeComment(row));
    } catch (error) {
      logger.error('Failed to get trader comments:', error);
      throw error;
    }
  }

  async calculateTraderRank(userId: string): Promise<number> {
    try {
      const profile = await this.getTraderProfile(userId);
      if (!profile) return 0;

      const reputationScore = profile.reputation * 0.4;
      const volumeScore = profile.totalVolume * 0.3;
      const successRateScore = profile.totalTrades > 0 ? 
        (profile.successfulTrades / profile.totalTrades * 100) * 0.3 : 0;

      return Math.round(reputationScore + volumeScore + successRateScore);
    } catch (error) {
      logger.error('Failed to calculate trader rank:', error);
      return 0;
    }
  }

  private async _updateTraderStats(userId: string, tradeAmount: number, isSuccessful: boolean): Promise<void> {
    const successIncrement = isSuccessful ? 1 : 0;
    
    await database.query(`
      UPDATE trader_profiles 
      SET 
        total_trades = total_trades + 1,
        successful_trades = successful_trades + $1,
        total_volume = total_volume + $2,
        updated_at = NOW()
      WHERE user_id = $3
    `, [successIncrement, tradeAmount, userId]);
  }

  private async _updateTokenSocialMetrics(tokenAddress: string): Promise<void> {
    await database.query(`
      INSERT INTO token_social_metrics (token_address, total_comments, last_activity)
      VALUES ($1, 1, NOW())
      ON CONFLICT (token_address)
      DO UPDATE SET 
        total_comments = token_social_metrics.total_comments + 1,
        last_activity = NOW()
    `, [tokenAddress]);
  }

  private async _updateReputation(userId: string, tradeAmount: number, isSuccessful: boolean): Promise<void> {
    const volumeBonus = Math.floor(tradeAmount / 1000); // 1 point per 1000 units
    const successBonus = isSuccessful ? 10 : 0;
    const totalBonus = volumeBonus + successBonus;

    await database.query(`
      UPDATE trader_profiles 
      SET reputation = reputation + $1
      WHERE user_id = $2
    `, [totalBonus, userId]);

    // Check for verification eligibility
    const result = await database.query(
      'SELECT reputation FROM trader_profiles WHERE user_id = $1',
      [userId]
    );

    if (result.rows[0] && result.rows[0].reputation >= 5000) {
      await database.query(
        'UPDATE trader_profiles SET is_verified = true WHERE user_id = $1 AND is_verified = false',
        [userId]
      );
    }
  }

  private _formatTraderProfile(row: any): TraderProfile {
    return {
      id: row.user_id,
      username: row.username,
      bio: row.bio || '',
      reputation: parseInt(row.reputation),
      totalTrades: parseInt(row.total_trades),
      successfulTrades: parseInt(row.successful_trades),
      totalVolume: parseFloat(row.total_volume),
      isVerified: row.is_verified,
      joinedAt: row.joined_at
    };
  }

  private _formatTradeComment(row: any): TradeComment {
    return {
      id: row.id,
      traderId: row.user_id,
      tokenAddress: row.token_address,
      comment: row.comment,
      timestamp: row.timestamp,
      likes: parseInt(row.likes),
      isVisible: row.is_visible
    };
  }
}
