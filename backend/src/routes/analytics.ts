
import { Router } from 'express';
import { AnalyticsController } from '@/controllers/AnalyticsController';
import { optionalAuth } from '@/middleware/auth';
import { catchAsync } from '@/middleware/errorHandler';

const router = Router();
const analyticsController = new AnalyticsController();

// Analytics routes
router.get('/overview', optionalAuth, catchAsync(analyticsController.getOverview));
router.get('/volume', optionalAuth, catchAsync(analyticsController.getVolumeData));
router.get('/tokens/top', optionalAuth, catchAsync(analyticsController.getTopTokens));
router.get('/chains/:chainId/metrics', optionalAuth, catchAsync(analyticsController.getChainMetrics));

export default router;
