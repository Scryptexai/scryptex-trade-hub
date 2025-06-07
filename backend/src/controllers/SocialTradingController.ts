
import { Request, Response } from 'express';
import { SocialTradingService } from '@/services/trading/SocialTradingService';
import { CustomError } from '@/middleware/errorHandler';
import { AuthenticatedRequest } from '@/middleware/auth';
import { logger } from '@/utils/logger';

export class SocialTradingController {
  private socialTradingService: SocialTradingService;

  constructor() {
    this.socialTradingService = new SocialTradingService();
  }

  async createProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const { username, bio } = req.body;

      if (!username || username.length < 3 || username.length > 50) {
        throw new CustomError('Username must be between 3 and 50 characters', 400);
      }

      if (bio && bio.length > 200) {
        throw new CustomError('Bio must be less than 200 characters', 400);
      }

      const profile = await this.socialTradingService.createTraderProfile(userId, username, bio);

      res.status(201).json({
        success: true,
        data: profile,
        message: 'Trader profile created successfully'
      });
    } catch (error) {
      logger.error('Profile creation failed:', error);
      throw error;
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const { bio } = req.body;

      if (bio && bio.length > 200) {
        throw new CustomError('Bio must be less than 200 characters', 400);
      }

      const profile = await this.socialTradingService.updateTraderProfile(userId, bio);

      res.status(200).json({
        success: true,
        data: profile,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      logger.error('Profile update failed:', error);
      throw error;
    }
  }

  async postComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const { tokenAddress, comment, tradeAmount, isSuccessful } = req.body;

      if (!tokenAddress || !comment) {
        throw new CustomError('Token address and comment are required', 400);
      }

      if (comment.length > 500) {
        throw new CustomError('Comment must be less than 500 characters', 400);
      }

      const tradeComment = await this.socialTradingService.postTradeComment(
        userId,
        tokenAddress,
        comment,
        parseFloat(tradeAmount) || 0,
        Boolean(isSuccessful)
      );

      res.status(201).json({
        success: true,
        data: tradeComment,
        message: 'Comment posted successfully'
      });
    } catch (error) {
      logger.error('Comment posting failed:', error);
      throw error;
    }
  }

  async likeComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const { commentId } = req.params;

      if (!commentId) {
        throw new CustomError('Comment ID is required', 400);
      }

      await this.socialTradingService.likeComment(userId, commentId);

      res.status(200).json({
        success: true,
        message: 'Comment liked successfully'
      });
    } catch (error) {
      logger.error('Comment like failed:', error);
      throw error;
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        throw new CustomError('User ID is required', 400);
      }

      const profile = await this.socialTradingService.getTraderProfile(userId);

      if (!profile) {
        throw new CustomError('Profile not found', 404);
      }

      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      logger.error('Failed to get profile:', error);
      throw error;
    }
  }

  async getTopTraders(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query;

      const traders = await this.socialTradingService.getTopTraders(parseInt(limit as string));

      res.status(200).json({
        success: true,
        data: traders
      });
    } catch (error) {
      logger.error('Failed to get top traders:', error);
      throw error;
    }
  }

  async getTokenComments(req: Request, res: Response): Promise<void> {
    try {
      const { tokenAddress } = req.params;
      const { limit = 20 } = req.query;

      if (!tokenAddress) {
        throw new CustomError('Token address is required', 400);
      }

      const comments = await this.socialTradingService.getTokenComments(
        tokenAddress,
        parseInt(limit as string)
      );

      res.status(200).json({
        success: true,
        data: comments
      });
    } catch (error) {
      logger.error('Failed to get token comments:', error);
      throw error;
    }
  }

  async getTraderComments(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { limit = 20 } = req.query;

      if (!userId) {
        throw new CustomError('User ID is required', 400);
      }

      const comments = await this.socialTradingService.getTraderComments(
        userId,
        parseInt(limit as string)
      );

      res.status(200).json({
        success: true,
        data: comments
      });
    } catch (error) {
      logger.error('Failed to get trader comments:', error);
      throw error;
    }
  }

  async getTraderRank(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        throw new CustomError('User ID is required', 400);
      }

      const rank = await this.socialTradingService.calculateTraderRank(userId);

      res.status(200).json({
        success: true,
        data: { rank }
      });
    } catch (error) {
      logger.error('Failed to get trader rank:', error);
      throw error;
    }
  }
}
