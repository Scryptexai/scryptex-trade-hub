
import { Router } from 'express';
import { EnhancedTradingController } from '@/controllers/EnhancedTradingController';
import { authenticate, optionalAuth } from '@/middleware/auth';
import { tradingRateLimiter } from '@/middleware/rateLimiter';
import { catchAsync } from '@/middleware/errorHandler';

const router = Router();
const tradingController = new EnhancedTradingController();

// Apply trading rate limiter to all routes
router.use(tradingRateLimiter);

// Trading execution routes
router.post('/buy', authenticate, catchAsync(tradingController.executeBuyTrade));
router.post('/sell', authenticate, catchAsync(tradingController.executeSellTrade));
router.post('/batch', authenticate, catchAsync(tradingController.executeBatchTrades));

// Order management routes
router.post('/orders/limit', authenticate, catchAsync(tradingController.createLimitOrder));

// Market data routes
router.get('/metrics/:tokenAddress', optionalAuth, catchAsync(tradingController.getMarketMetrics));
router.get('/trending', optionalAuth, catchAsync(tradingController.getTrendingTokens));
router.get('/analytics/:tokenAddress', optionalAuth, catchAsync(tradingController.getTokenAnalytics));

// User-specific routes
router.get('/history', authenticate, catchAsync(tradingController.getTradeHistory));
router.get('/stats', authenticate, catchAsync(tradingController.getUserTradingStats));

export default router;
