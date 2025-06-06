
import { Router } from 'express';
import { WebSocketController } from '@/controllers/WebSocketController';
import { optionalAuth } from '@/middleware/auth';
import { catchAsync } from '@/middleware/errorHandler';

const router = Router();
const wsController = new WebSocketController();

// WebSocket connection info routes
router.get('/info', optionalAuth, catchAsync(wsController.getConnectionInfo));
router.get('/channels', optionalAuth, catchAsync(wsController.getAvailableChannels));

export default router;
