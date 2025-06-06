
import { Request, Response } from 'express';
import { AuthService } from '@/services/auth/AuthService';
import { CustomError } from '@/middleware/errorHandler';
import { AuthenticatedRequest } from '@/middleware/auth';
import { logger } from '@/utils/logger';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async getWalletNonce(req: Request, res: Response): Promise<void> {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      throw new CustomError('Wallet address is required', 400);
    }

    const result = await this.authService.getWalletNonce(walletAddress);
    
    res.status(200).json({
      success: true,
      data: result
    });
  }

  async verifyWalletSignature(req: Request, res: Response): Promise<void> {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
      throw new CustomError('Wallet address, signature, and message are required', 400);
    }

    const result = await this.authService.verifyWalletSignature({
      walletAddress,
      signature,
      message
    });

    res.status(200).json({
      success: true,
      data: result
    });
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new CustomError('Refresh token is required', 400);
    }

    const result = await this.authService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      data: result
    });
  }

  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    await this.authService.logout(userId);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const user = await this.authService.getCurrentUser(userId);

    res.status(200).json({
      success: true,
      data: user
    });
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const profileData = req.body;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const updatedProfile = await this.authService.updateProfile(userId, profileData);

    res.status(200).json({
      success: true,
      data: updatedProfile
    });
  }
}
