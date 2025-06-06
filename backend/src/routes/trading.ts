
import { Router } from 'express';
import { TradingController } from '@/controllers/TradingController';
import { authenticate } from '@/middleware/auth';
import { tradingRateLimiter } from '@/middleware/rateLimiter';
import { catchAsync } from '@/middleware/errorHandler';

const router = Router();
const tradingController = new TradingController();

// Apply trading rate limiter
router.use(tradingRateLimiter);

// Trading routes
router.get('/pairs', catchAsync(tradingController.getTradingPairs));
router.get('/pairs/:pairId', catchAsync(tradingController.getTradingPairById));
router.post('/orders', authenticate, catchAsync(tradingController.createOrder));
router.get('/orders', authenticate, catchAsync(tradingController.getUserOrders));
router.delete('/orders/:orderId', authenticate, catchAsync(tradingController.cancelOrder));

export default router;
