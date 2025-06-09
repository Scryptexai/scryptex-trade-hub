
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';

export interface User {
  id: string;
  walletAddress: string;
  isActive: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface JWTPayload {
  userId: string;
  walletAddress: string;
  iat: number;
  exp: number;
}

export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Generate JWT tokens
export function generateTokens(userId: string, walletAddress: string) {
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

  return {
    accessToken,
    refreshToken,
    expiresIn: config.jwtExpiresIn
  };
}

// Verify refresh token
export function verifyRefreshToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, config.refreshTokenSecret) as JWTPayload;
  } catch (error) {
    throw new CustomError('Invalid refresh token', 401);
  }
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError('Access token required', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      throw new CustomError('Access token required', 401);
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
      
      // In a real implementation, you would query the database to verify the user still exists and is active
      const user: User = {
        id: decoded.userId,
        walletAddress: decoded.walletAddress,
        isActive: true
      };

      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        throw new CustomError('Token expired', 401);
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        throw new CustomError('Invalid token', 401);
      } else {
        throw new CustomError('Token verification failed', 401);
      }
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
};

export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No auth provided, continue without user
      next();
      return;
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      next();
      return;
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
      
      const user: User = {
        id: decoded.userId,
        walletAddress: decoded.walletAddress,
        isActive: true
      };

      req.user = user;
    } catch (jwtError) {
      // Invalid token, but don't fail the request for optional auth
      logger.warn('Optional auth failed:', jwtError);
    }

    next();
  } catch (error) {
    logger.error('Optional authentication error:', error);
    // For optional auth, continue even if there's an error
    next();
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new CustomError('Refresh token required', 401);
    }

    try {
      const decoded = jwt.verify(refreshToken, config.refreshTokenSecret) as JWTPayload;
      
      // Generate new access token
      const accessToken = jwt.sign(
        {
          userId: decoded.userId,
          walletAddress: decoded.walletAddress
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      res.json({
        success: true,
        data: {
          accessToken,
          expiresIn: config.jwtExpiresIn
        }
      });
    } catch (jwtError) {
      throw new CustomError('Invalid refresh token', 401);
    }
  } catch (error) {
    logger.error('Token refresh error:', error);
    
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
};

// Middleware to check if user has admin privileges
export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    // In a real implementation, you would check the user's role in the database
    // For now, checking if the user ID matches certain admin IDs
    const adminUsers = ['admin_user_1', 'admin_user_2']; // This should come from database
    
    if (!adminUsers.includes(req.user.id)) {
      throw new CustomError('Admin privileges required', 403);
    }

    next();
  } catch (error) {
    logger.error('Admin check error:', error);
    
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
};

// Middleware to check if user owns a resource
export const requireOwnership = (resourceUserField: string = 'userId') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError('Authentication required', 401);
      }

      const resourceUserId = req.params[resourceUserField] || req.body[resourceUserField];
      
      if (!resourceUserId) {
        throw new CustomError('Resource user ID not found', 400);
      }

      if (req.user.id !== resourceUserId) {
        throw new CustomError('Access denied: You can only access your own resources', 403);
      }

      next();
    } catch (error) {
      logger.error('Ownership check error:', error);
      
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  };
};
