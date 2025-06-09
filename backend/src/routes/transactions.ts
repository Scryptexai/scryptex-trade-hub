
import { Router } from 'express';
import { TransactionController } from '@/controllers/TransactionController';
import { authenticate } from '@/middleware/auth';
import { catchAsync } from '@/middleware/errorHandler';

const router = Router();
const transactionController = new TransactionController();

// Transaction monitoring and notification routes
router.post('/notify', authenticate, catchAsync(transactionController.notifyTransaction));
router.get('/status/:chainId/:txHash', catchAsync(transactionController.getTransactionStatus));
router.get('/history', authenticate, catchAsync(transactionController.getTransactionHistory));
router.post('/estimate-gas', authenticate, catchAsync(transactionController.estimateGas));

export default router;
