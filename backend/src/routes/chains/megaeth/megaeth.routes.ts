
import { Router } from 'express';
import { MegaETHController } from '@/controllers/chains/megaeth/MegaETHController';
import { authenticate, optionalAuth } from '@/middleware/auth';
import { tradingRateLimiter } from '@/middleware/rateLimiter';
import { catchAsync } from '@/middleware/errorHandler';

const router = Router();
const megaETHController = new MegaETHController();

// Apply trading rate limiter to trading routes
router.use('/trading', tradingRateLimiter);

// Token routes with MegaETH realtime features
router.post('/tokens/create', authenticate, catchAsync(megaETHController.createTokenWithRealtime));
router.get('/tokens/:address/price', optionalAuth, catchAsync(megaETHController.getTokenPrice));
router.get('/tokens/:address/price/realtime', optionalAuth, catchAsync(megaETHController.getRealtimePrice));
router.get('/tokens/trending', optionalAuth, catchAsync(megaETHController.getTrendingTokens));
router.get('/tokens/new', optionalAuth, catchAsync(megaETHController.getNewTokens));

// Enhanced trading routes with realtime features
router.post('/trading/buy', authenticate, catchAsync(megaETHController.buyTokenWithRealtime));
router.post('/trading/sell', authenticate, catchAsync(megaETHController.sellTokenWithRealtime));
router.get('/trading/history/:user', authenticate, catchAsync(megaETHController.getTradingHistory));
router.get('/trading/stats', optionalAuth, catchAsync(megaETHController.getTradingStats));
router.get('/trading/realtime/:token', optionalAuth, catchAsync(megaETHController.getRealtimeTradingData));

// Swap routes
router.post('/swap/execute', authenticate, catchAsync(megaETHController.executeSwap));
router.get('/swap/quote', optionalAuth, catchAsync(megaETHController.getSwapQuote));
router.get('/swap/history/:user', authenticate, catchAsync(megaETHController.getSwapHistory));

// Enhanced bridge routes with preconfirmation
router.post('/bridge/initiate', authenticate, catchAsync(megaETHController.initiateBridgeWithPreconf));
router.get('/bridge/history/:user', authenticate, catchAsync(megaETHController.getBridgeHistory));
router.get('/bridge/status/:transferId', optionalAuth, catchAsync(megaETHController.getBridgeStatus));

// Points routes (enhanced multipliers for MegaETH)
router.get('/points/:user', authenticate, catchAsync(megaETHController.getUserPoints));
router.get('/points/:user/daily', authenticate, catchAsync(megaETHController.getUserDailyStats));

// MegaETH specific realtime network routes
router.get('/network/stats', optionalAuth, catchAsync(megaETHController.getNetworkStats));
router.get('/network/realtime', optionalAuth, catchAsync(megaETHController.getRealtimeNetworkStats));
router.get('/network/miniblocks', optionalAuth, catchAsync(megaETHController.getMiniBlockInfo));
router.get('/network/validators', optionalAuth, catchAsync(megaETHController.getValidators));

// Preconfirmation routes
router.post('/preconf/enable', authenticate, catchAsync(megaETHController.enablePreconfirmation));
router.get('/preconf/status/:txHash', optionalAuth, catchAsync(megaETHController.getPreconfStatus));

export default router;
