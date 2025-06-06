
import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController';
import { authRateLimiter } from '@/middleware/rateLimiter';
import { authenticate, optionalAuth } from '@/middleware/auth';
import { catchAsync } from '@/middleware/errorHandler';

const router = Router();
const authController = new AuthController();

// Apply auth rate limiter to all auth routes
router.use(authRateLimiter);

// Auth routes
router.post('/wallet/nonce', catchAsync(authController.getWalletNonce));
router.post('/wallet/verify', catchAsync(authController.verifyWalletSignature));
router.post('/refresh', catchAsync(authController.refreshToken));
router.post('/logout', authenticate, catchAsync(authController.logout));
router.get('/me', authenticate, catchAsync(authController.getCurrentUser));
router.put('/profile', authenticate, catchAsync(authController.updateProfile));

export default router;
