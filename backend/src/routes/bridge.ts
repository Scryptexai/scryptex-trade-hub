
import { Router } from 'express';
import { BridgeController } from '@/controllers/BridgeController';
import { authenticate } from '@/middleware/auth';
import { bridgeRateLimiter } from '@/middleware/rateLimiter';
import { catchAsync } from '@/middleware/errorHandler';

const router = Router();
const bridgeController = new BridgeController();

// Apply bridge rate limiter
router.use(bridgeRateLimiter);

// Bridge routes
router.post('/transfer', authenticate, catchAsync(bridgeController.initiateTransfer));
router.get('/requests', authenticate, catchAsync(bridgeController.getBridgeRequests));
router.get('/requests/:requestId', authenticate, catchAsync(bridgeController.getBridgeRequestById));
router.post('/requests/:requestId/retry', authenticate, catchAsync(bridgeController.retryBridgeRequest));

export default router;
