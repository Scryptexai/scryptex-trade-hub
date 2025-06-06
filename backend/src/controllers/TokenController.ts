
import { Request, Response } from 'express';
import { TokenService } from '@/services/token/TokenService';
import { CustomError } from '@/middleware/errorHandler';
import { AuthenticatedRequest } from '@/middleware/auth';

export class TokenController {
  private tokenService: TokenService;

  constructor() {
    this.tokenService = new TokenService();
  }

  async getAllTokens(req: Request, res: Response): Promise<void> {
    const { chainId, limit, offset } = req.query;
    
    const tokens = await this.tokenService.getAllTokens({
      chainId: chainId ? parseInt(chainId as string) : undefined,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0
    });

    res.status(200).json({
      success: true,
      data: tokens
    });
  }

  async getNewTokens(req: Request, res: Response): Promise<void> {
    const { chainId, limit } = req.query;

    if (!chainId) {
      throw new CustomError('Chain ID is required', 400);
    }

    const tokens = await this.tokenService.getNewTokens(
      parseInt(chainId as string),
      limit ? parseInt(limit as string) : 10
    );

    res.status(200).json({
      success: true,
      data: tokens
    });
  }

  async getTrendingTokens(req: Request, res: Response): Promise<void> {
    const { chainId, limit } = req.query;

    if (!chainId) {
      throw new CustomError('Chain ID is required', 400);
    }

    const tokens = await this.tokenService.getTrendingTokens(
      parseInt(chainId as string),
      limit ? parseInt(limit as string) : 10
    );

    res.status(200).json({
      success: true,
      data: tokens
    });
  }

  async createToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const tokenData = req.body;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const token = await this.tokenService.createToken(userId, tokenData);

    res.status(201).json({
      success: true,
      data: token
    });
  }

  async getTokenById(req: Request, res: Response): Promise<void> {
    const { tokenId } = req.params;

    if (!tokenId) {
      throw new CustomError('Token ID is required', 400);
    }

    const token = await this.tokenService.getTokenById(tokenId);

    res.status(200).json({
      success: true,
      data: token
    });
  }

  async updateToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { tokenId } = req.params;
    const updateData = req.body;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    if (!tokenId) {
      throw new CustomError('Token ID is required', 400);
    }

    const token = await this.tokenService.updateToken(userId, tokenId, updateData);

    res.status(200).json({
      success: true,
      data: token
    });
  }
}
