
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config/environment';
import { CustomError } from './errorHandler';
import { UserService } from '@/services/user/UserService';
import { logger } from '@/utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    walletAddress: string;
    isActive: boolean;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError('No token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as {
      userId: string;
      walletAddress: string;
    };

    // Check if user exists and is active
    const userService = new UserService();
    const user = await userService.getUserById(decoded.userId);

    if (!user) {
      throw new CustomError('User not found', 401);
    }

    if (!user.isActive) {
      throw new CustomError('User account is deactivated', 401);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      walletAddress: user.walletAddress,
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token', {
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      next(new CustomError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Expired JWT token', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      next(new CustomError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwtSecret) as {
      userId: string;
      walletAddress: string;
    };

    const userService = new UserService();
    const user = await userService.getUserById(decoded.userId);

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        walletAddress: user.walletAddress,
        isActive: user.isActive,
      };
    }

    next();
  } catch (error) {
    // In optional auth, we don't throw errors for invalid tokens
    next();
  }
};

export const authorize = (...roles: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new CustomError('Authentication required', 401);
      }

      // For now, we don't have role-based authorization
      // This can be extended when user roles are implemented
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const generateTokens = (userId: string, walletAddress: string) => {
  const accessToken = jwt.sign(
    { userId, walletAddress },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  const refreshToken = jwt.sign(
    { userId, walletAddress },
    config.refreshTokenSecret,
    { expiresIn: config.refreshTokenExpiresIn }
  );

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, config.refreshTokenSecret) as {
    userId: string;
    walletAddress: string;
  };
};
