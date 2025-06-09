
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import { database } from '@/config/database';
import { redis } from '@/config/redis';
import { errorHandler } from '@/middleware/errorHandler';
import { rateLimiter } from '@/middleware/rateLimiter';
import { requestLoggingMiddleware, errorLoggingMiddleware } from '@/middleware/logging';
import { corsMiddleware } from '@/middleware/cors';

// Import chain-specific routes
import riseChainRoutes from '@/routes/chains/risechain/risechain.routes';
import megaETHRoutes from '@/routes/chains/megaeth/megaeth.routes';

// Import shared routes
import healthRoutes from '@/routes/health';

// Import services for initialization
import { RiseChainService } from '@/services/chains/risechain/RiseChainService';
import { MegaETHService } from '@/services/chains/megaeth/MegaETHService';
import { initializeQueues } from '@/services/queue/queueManager';

const app = express();

// Security middleware
if (config.helmetEnabled) {
  app.use(helmet());
}

// Compression middleware
if (config.compressionEnabled) {
  app.use(compression());
}

// CORS configuration
app.use(corsMiddleware);

// Request logging
app.use(requestLoggingMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

// Health check route
app.use('/health', healthRoutes);

// Chain-specific API routes
app.use('/api/v1/risechain', riseChainRoutes);
app.use('/api/v1/megaeth', megaETHRoutes);

// Global API routes
app.use('/api/v1/status', (req, res) => {
  res.json({
    success: true,
    message: 'Scryptex Multi-Chain DEX API',
    version: config.apiVersion,
    chains: ['RiseChain', 'MegaETH'],
    features: [
      'Token Creation (Pump.fun style)',
      'Real-time Trading',
      'Cross-chain Bridge',
      'Points & Rewards System',
      'DEX Aggregation'
    ],
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorLoggingMiddleware);
app.use(errorHandler);

// Initialize all services
async function initializeServices() {
  try {
    logger.info('Initializing core services...');
    
    // Initialize database connection
    await database.connect();
    logger.info('✅ Database connected');
    
    // Initialize Redis connection
    // Redis connection is established in constructor, just verify it's working
    await redis.set('startup', 'true', 10);
    await redis.get('startup');
    logger.info('✅ Redis connected');
    
    // Initialize queue system
    await initializeQueues();
    logger.info('✅ Queue system initialized');
    
    // Initialize blockchain services
    logger.info('Initializing blockchain services...');
    const riseChainService = new RiseChainService();
    const megaETHService = new MegaETHService();
    logger.info('✅ Blockchain services initialized');
    
    logger.info('🚀 All services initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
}

// Graceful shutdown handler
async function gracefulShutdown() {
  logger.info('Shutting down gracefully...');
  
  try {
    await database.close();
    await redis.close();
    logger.info('All connections closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    await initializeServices();
    
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Scryptex Multi-Chain DEX API server running on port ${config.port}`);
      logger.info(`📝 Health Check: http://localhost:${config.port}/health`);
      logger.info(`🔗 Supported Chains: RiseChain (${config.risechain.chainId}), MegaETH (${config.megaeth.chainId})`);
      logger.info(`🌐 Environment: ${config.nodeEnv}`);
      logger.info(`📊 Features: Trading, Bridge, Points, Real-time (MegaETH)`);
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();
