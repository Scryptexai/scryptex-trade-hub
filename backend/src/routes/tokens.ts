
import { Router } from 'express';
import { TokenController } from '@/controllers/TokenController';
import { authenticate, optionalAuth } from '@/middleware/auth';
import { catchAsync } from '@/middleware/errorHandler';

const router = Router();
const tokenController = new TokenController();

// Token routes
router.get('/', optionalAuth, catchAsync(tokenController.getAllTokens));
router.get('/new', optionalAuth, catchAsync(tokenController.getNewTokens));
router.get('/trending', optionalAuth, catchAsync(tokenController.getTrendingTokens));
router.post('/create', authenticate, catchAsync(tokenController.createToken));
router.get('/:tokenId', optionalAuth, catchAsync(tokenController.getTokenById));
router.put('/:tokenId', authenticate, catchAsync(tokenController.updateToken));

export default router;
