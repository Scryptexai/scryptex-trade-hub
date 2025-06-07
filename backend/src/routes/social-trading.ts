
import { Router } from 'express';
import { SocialTradingController } from '@/controllers/SocialTradingController';
import { authenticate, optionalAuth } from '@/middleware/auth';
import { catchAsync } from '@/middleware/errorHandler';

const router = Router();
const socialTradingController = new SocialTradingController();

// Profile management routes
router.post('/profile', authenticate, catchAsync(socialTradingController.createProfile));
router.put('/profile', authenticate, catchAsync(socialTradingController.updateProfile));
router.get('/profile/:userId', optionalAuth, catchAsync(socialTradingController.getProfile));

// Comment routes
router.post('/comments', authenticate, catchAsync(socialTradingController.postComment));
router.post('/comments/:commentId/like', authenticate, catchAsync(socialTradingController.likeComment));
router.get('/comments/token/:tokenAddress', optionalAuth, catchAsync(socialTradingController.getTokenComments));
router.get('/comments/trader/:userId', optionalAuth, catchAsync(socialTradingController.getTraderComments));

// Ranking routes
router.get('/traders/top', optionalAuth, catchAsync(socialTradingController.getTopTraders));
router.get('/traders/:userId/rank', optionalAuth, catchAsync(socialTradingController.getTraderRank));

export default router;
