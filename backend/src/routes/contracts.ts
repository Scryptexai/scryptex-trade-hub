
import { Router } from 'express';
import { ContractController } from '@/controllers/ContractController';
import { optionalAuth } from '@/middleware/auth';
import { catchAsync } from '@/middleware/errorHandler';

const router = Router();
const contractController = new ContractController();

// Contract information routes
router.get('/:chainId/contracts', optionalAuth, catchAsync(contractController.getChainContracts));
router.get('/:chainId/contracts/:contractType', optionalAuth, catchAsync(contractController.getContractInfo));
router.get('/:chainId/contracts/:contractType/abi', optionalAuth, catchAsync(contractController.getContractABI));

export default router;
