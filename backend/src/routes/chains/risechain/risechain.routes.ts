
import { Router } from 'express';
import { RiseChainController } from '@/controllers/chains/risechain/RiseChainController';
import { authenticate, optionalAuth } from '@/middleware/auth';
import { tradingRateLimiter } from '@/middleware/rateLimiter';
import { catchAsync } from '@/middleware/errorHandler';

const router = Router();
const riseChainController = new RiseChainController();

// Apply trading rate limiter to trading routes
router.use('/trading', tradingRateLimiter);

// Token routes
router.post('/tokens/create', authenticate, catchAsync(riseChainController.createToken));
router.get('/tokens/:address/price', optionalAuth, catchAsync(riseChainController.getTokenPrice));
router.get('/tokens/trending', optionalAuth, catchAsync(riseChainController.getTrendingTokens));
router.get('/tokens/new', optionalAuth, catchAsync(riseChainController.getNewTokens));

// Trading routes
router.post('/trading/buy', authenticate, catchAsync(riseChainController.buyToken));
router.post('/trading/sell', authenticate, catchAsync(riseChainController.sellToken));
router.get('/trading/history/:user', authenticate, catchAsync(riseChainController.getTradingHistory));
router.get('/trading/stats', optionalAuth, catchAsync(riseChainController.getTradingStats));

// Swap routes
router.post('/swap/execute', authenticate, catchAsync(riseChainController.executeSwap));
router.get('/swap/quote', optionalAuth, catchAsync(riseChainController.getSwapQuote));
router.get('/swap/history/:user', authenticate, catchAsync(riseChainController.getSwapHistory));

// Bridge routes
router.post('/bridge/initiate', authenticate, catchAsync(riseChainController.initiateBridge));
router.get('/bridge/history/:user', authenticate, catchAsync(riseChainController.getBridgeHistory));
router.get('/bridge/status/:transferId', optionalAuth, catchAsync(riseChainController.getBridgeStatus));

// Points routes
router.get('/points/:user', authenticate, catchAsync(riseChainController.getUserPoints));
router.get('/points/:user/daily', authenticate, catchAsync(riseChainController.getUserDailyStats));

// Network routes
router.get('/network/stats', optionalAuth, catchAsync(riseChainController.getNetworkStats));
router.get('/network/validators', optionalAuth, catchAsync(riseChainController.getValidators));

export default router;
