
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { redis } from '@/config/redis';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';

// Create rate limiter instance
const rateLimiter = new RateLimiterRedis({
  storeClient: redis.getClient(),
  keyPrefix: 'middleware',
  points: config.rateLimit.maxRequests, // Number of requests
  duration: config.rateLimit.windowMs / 1000, // Per seconds
  blockDuration: 60, // Block for 60 seconds if limit exceeded
});

// Special rate limiters for different endpoints
const authLimiter = new RateLimiterRedis({
  storeClient: redis.getClient(),
  keyPrefix: 'auth',
  points: 5, // 5 requests
  duration: 60 * 15, // per 15 minutes
  blockDuration: 60 * 15, // block for 15 minutes
});

const tradingLimiter = new RateLimiterRedis({
  storeClient: redis.getClient(),
  keyPrefix: 'trading',
  points: 50, // 50 requests
  duration: 60, // per minute
  blockDuration: 60, // block for 1 minute
});

const bridgeLimiter = new RateLimiterRedis({
  storeClient: redis.getClient(),
  keyPrefix: 'bridge',
  points: 10, // 10 requests
  duration: 60, // per minute
  blockDuration: 60 * 5, // block for 5 minutes
});

export const createRateLimiter = (limiter: RateLimiterRedis) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = req.ip || 'unknown';
      await limiter.consume(key);
      next();
    } catch (rateLimiterRes) {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
      });

      const remainingPoints = rateLimiterRes?.remainingPoints || 0;
      const msBeforeNext = rateLimiterRes?.msBeforeNext || 0;

      res.set({
        'Retry-After': Math.round(msBeforeNext / 1000) || 1,
        'X-RateLimit-Limit': config.rateLimit.maxRequests,
        'X-RateLimit-Remaining': remainingPoints,
        'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext).toISOString(),
      });

      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.round(msBeforeNext / 1000),
      });
    }
  };
};

// Export specific rate limiters
export const generalRateLimiter = createRateLimiter(rateLimiter);
export const authRateLimiter = createRateLimiter(authLimiter);
export const tradingRateLimiter = createRateLimiter(tradingLimiter);
export const bridgeRateLimiter = createRateLimiter(bridgeLimiter);

// Default export for general use
export default generalRateLimiter;
