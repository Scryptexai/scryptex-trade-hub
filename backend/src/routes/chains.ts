
import { Router } from 'express';
import { ChainController } from '@/controllers/ChainController';
import { optionalAuth } from '@/middleware/auth';
import { catchAsync } from '@/middleware/errorHandler';

const router = Router();
const chainController = new ChainController();

// Chain routes
router.get('/', optionalAuth, catchAsync(chainController.getAllChains));
router.get('/:chainId', optionalAuth, catchAsync(chainController.getChainById));
router.get('/:chainId/stats', optionalAuth, catchAsync(chainController.getChainStats));
router.get('/:chainId/health', optionalAuth, catchAsync(chainController.getChainHealth));

export default router;
