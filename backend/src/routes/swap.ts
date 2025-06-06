
import { Router } from 'express';
import { SwapController } from '@/controllers/SwapController';
import { authenticate } from '@/middleware/auth';
import { catchAsync } from '@/middleware/errorHandler';

const router = Router();
const swapController = new SwapController();

// Swap routes
router.post('/quote', catchAsync(swapController.getSwapQuote));
router.post('/execute', authenticate, catchAsync(swapController.executeSwap));
router.get('/history', authenticate, catchAsync(swapController.getSwapHistory));

export default router;
