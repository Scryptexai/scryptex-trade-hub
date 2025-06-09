
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '@/utils/logger';

// General rate limiter for all requests
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Strict rate limiter for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Trading rate limiter to prevent rapid trading abuse
export const tradingRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 trading requests per minute
  message: {
    success: false,
    error: 'Trading rate limit exceeded. Please wait before making another trade.',
    retryAfter: '1 minute'
  },
  keyGenerator: (req: Request) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    return (req as any).user?.id || req.ip;
  },
  handler: (req: Request, res: Response) => {
    const identifier = (req as any).user?.id || req.ip;
    logger.warn(`Trading rate limit exceeded for: ${identifier}, Path: ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'Trading rate limit exceeded. Please wait before making another trade.',
      retryAfter: '1 minute'
    });
  }
});

// Bridge rate limiter for cross-chain transfers
export const bridgeRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit each user to 10 bridge requests per 5 minutes
  message: {
    success: false,
    error: 'Bridge rate limit exceeded. Please wait before initiating another transfer.',
    retryAfter: '5 minutes'
  },
  keyGenerator: (req: Request) => {
    return (req as any).user?.id || req.ip;
  },
  handler: (req: Request, res: Response) => {
    const identifier = (req as any).user?.id || req.ip;
    logger.warn(`Bridge rate limit exceeded for: ${identifier}, Path: ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'Bridge rate limit exceeded. Please wait before initiating another transfer.',
      retryAfter: '5 minutes'
    });
  }
});

// Swap rate limiter
export const swapRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each user to 30 swap requests per minute
  message: {
    success: false,
    error: 'Swap rate limit exceeded. Please wait before making another swap.',
    retryAfter: '1 minute'
  },
  keyGenerator: (req: Request) => {
    return (req as any).user?.id || req.ip;
  },
  handler: (req: Request, res: Response) => {
    const identifier = (req as any).user?.id || req.ip;
    logger.warn(`Swap rate limit exceeded for: ${identifier}, Path: ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'Swap rate limit exceeded. Please wait before making another swap.',
      retryAfter: '1 minute'
    });
  }
});

// Price query rate limiter
export const priceRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 price requests per minute
  message: {
    success: false,
    error: 'Price query rate limit exceeded. Please reduce request frequency.',
    retryAfter: '1 minute'
  },
  handler: (req: Request, res: Response) => {
    logger.warn(`Price query rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'Price query rate limit exceeded. Please reduce request frequency.',
      retryAfter: '1 minute'
    });
  }
});

// API rate limiter for general API endpoints
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 API requests per 15 minutes
  message: {
    success: false,
    error: 'API rate limit exceeded. Please reduce request frequency.',
    retryAfter: '15 minutes'
  },
  handler: (req: Request, res: Response) => {
    logger.warn(`API rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'API rate limit exceeded. Please reduce request frequency.',
      retryAfter: '15 minutes'
    });
  }
});

// Dynamic rate limiter that adjusts based on server load
export const adaptiveRateLimit = (baseMax: number = 100) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req: Request) => {
      // In a real implementation, you would check server load and adjust accordingly
      const serverLoad = 0.5; // Mock server load (0-1)
      const adjustedMax = Math.floor(baseMax * (1 - serverLoad * 0.5));
      return Math.max(adjustedMax, 10); // Minimum of 10 requests
    },
    message: {
      success: false,
      error: 'Rate limit exceeded. Server is under high load.',
      retryAfter: '15 minutes'
    },
    handler: (req: Request, res: Response) => {
      logger.warn(`Adaptive rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Server is under high load.',
        retryAfter: '15 minutes'
      });
    }
  });
};

// Rate limiter with different limits for authenticated vs anonymous users
export const tieredRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req: Request) => {
    const isAuthenticated = !!(req as any).user;
    return isAuthenticated ? 300 : 100; // Higher limit for authenticated users
  },
  keyGenerator: (req: Request) => {
    return (req as any).user?.id || req.ip;
  },
  message: {
    success: false,
    error: 'Rate limit exceeded. Consider authenticating for higher limits.',
    retryAfter: '15 minutes'
  },
  handler: (req: Request, res: Response) => {
    const identifier = (req as any).user?.id || req.ip;
    logger.warn(`Tiered rate limit exceeded for: ${identifier}, Path: ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Consider authenticating for higher limits.',
      retryAfter: '15 minutes'
    });
  }
});
