
import { Router } from 'express';
import { corsMiddleware } from '@/middleware/cors';
import { requestLoggingMiddleware } from '@/middleware/logging';

// Import route handlers
import healthRoutes from './health';
import authRoutes from './auth';
import swapRoutes from './swap';
import bridgeRoutes from './bridge';
import riseChainRoutes from './chains/risechain/risechain.routes';
import megaETHRoutes from './chains/megaeth/megaeth.routes';

const router = Router();

// Apply global middleware
router.use(corsMiddleware);
router.use(requestLoggingMiddleware);

// Mount routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/swap', swapRoutes);
router.use('/bridge', bridgeRoutes);

// Chain-specific routes
router.use('/risechain', riseChainRoutes);
router.use('/megaeth', megaETHRoutes);

// Generic chain routes that delegate to specific implementations
router.use('/chains/:chainId', (req, res, next) => {
  const chainId = parseInt(req.params.chainId);
  
  switch (chainId) {
    case 7569: // RiseChain
      req.url = req.url.replace('/chains/7569', '');
      riseChainRoutes(req, res, next);
      break;
    case 6342: // MegaETH
      req.url = req.url.replace('/chains/6342', '');
      megaETHRoutes(req, res, next);
      break;
    default:
      res.status(400).json({
        success: false,
        error: `Unsupported chain ID: ${chainId}`
      });
  }
});

export default router;
