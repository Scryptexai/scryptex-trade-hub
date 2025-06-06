
import { ethers } from 'ethers';
import { CustomError } from '@/middleware/errorHandler';
import { generateTokens, verifyRefreshToken } from '@/middleware/auth';
import { UserService } from '@/services/user/UserService';
import { redis } from '@/config/redis';
import { logger } from '@/utils/logger';

interface WalletVerificationData {
  walletAddress: string;
  signature: string;
  message: string;
}

export class AuthService {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async getWalletNonce(walletAddress: string) {
    try {
      // Get or create user
      let user = await this.userService.getUserByWallet(walletAddress);
      
      if (!user) {
        user = await this.userService.createUser(walletAddress);
      }

      const nonce = user.nonce;
      const message = `Please sign this message to authenticate with our platform.\n\nNonce: ${nonce}`;

      return {
        nonce,
        message,
        walletAddress
      };
    } catch (error) {
      logger.error('Error getting wallet nonce:', error);
      throw new CustomError('Failed to generate nonce', 500);
    }
  }

  async verifyWalletSignature(data: WalletVerificationData) {
    try {
      const { walletAddress, signature, message } = data;

      // Verify the signature
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new CustomError('Invalid signature', 401);
      }

      // Get user and verify nonce
      const user = await this.userService.getUserByWallet(walletAddress);
      
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Extract nonce from message and verify
      const nonceMatch = message.match(/Nonce: (.+)/);
      if (!nonceMatch || nonceMatch[1] !== user.nonce) {
        throw new CustomError('Invalid nonce', 401);
      }

      // Generate new nonce for next authentication
      await this.userService.updateUserNonce(user.id);

      // Update last login
      await this.userService.updateLastLogin(user.id);

      // Generate tokens
      const tokens = generateTokens(user.id, user.walletAddress);

      // Store refresh token in Redis
      await redis.set(`refresh:${user.id}`, tokens.refreshToken, 7 * 24 * 60 * 60); // 7 days

      return {
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          isActive: user.isActive
        },
        ...tokens
      };
    } catch (error) {
      logger.error('Error verifying wallet signature:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Authentication failed', 401);
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      
      // Check if refresh token exists in Redis
      const storedToken = await redis.get(`refresh:${decoded.userId}`);
      
      if (!storedToken || storedToken !== refreshToken) {
        throw new CustomError('Invalid refresh token', 401);
      }

      // Get user
      const user = await this.userService.getUserById(decoded.userId);
      
      if (!user || !user.isActive) {
        throw new CustomError('User not found or inactive', 401);
      }

      // Generate new tokens
      const tokens = generateTokens(user.id, user.walletAddress);

      // Update refresh token in Redis
      await redis.set(`refresh:${user.id}`, tokens.refreshToken, 7 * 24 * 60 * 60);

      return {
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          isActive: user.isActive
        },
        ...tokens
      };
    } catch (error) {
      logger.error('Error refreshing token:', error);
      throw new CustomError('Failed to refresh token', 401);
    }
  }

  async logout(userId: string) {
    try {
      // Remove refresh token from Redis
      await redis.del(`refresh:${userId}`);
      
      return { success: true };
    } catch (error) {
      logger.error('Error during logout:', error);
      throw new CustomError('Logout failed', 500);
    }
  }

  async getCurrentUser(userId: string) {
    try {
      const user = await this.userService.getUserById(userId);
      
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      return {
        id: user.id,
        walletAddress: user.walletAddress,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      };
    } catch (error) {
      logger.error('Error getting current user:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get user', 500);
    }
  }

  async updateProfile(userId: string, profileData: any) {
    try {
      const updatedProfile = await this.userService.updateProfile(userId, profileData);
      return updatedProfile;
    } catch (error) {
      logger.error('Error updating profile:', error);
      throw new CustomError('Failed to update profile', 500);
    }
  }
}
