
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { rateLimiter } from '@/middleware/rateLimiter';

// Import chain-specific routes
import riseChainRoutes from '@/routes/chains/risechain/risechain.routes';
import megaETHRoutes from '@/routes/chains/megaeth/megaeth.routes';

// Import shared routes
import healthRoutes from '@/routes/health';

// Import services for initialization
import { RiseChainService } from '@/services/chains/risechain/RiseChainService';
import { MegaETHService } from '@/services/chains/megaeth/MegaETHService';

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
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize blockchain services
async function initializeServices() {
  try {
    logger.info('Initializing blockchain services...');
    
    const riseChainService = new RiseChainService();
    const megaETHService = new MegaETHService();
    
    logger.info('All blockchain services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize blockchain services:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    await initializeServices();
    
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Scryptex Multi-Chain DEX API server running on port ${config.port}`);
      logger.info(`📝 API Documentation: http://localhost:${config.port}/health`);
      logger.info(`🔗 Supported Chains: RiseChain (${config.risechain.chainId}), MegaETH (${config.megaeth.chainId})`);
      logger.info(`🌐 Environment: ${config.nodeEnv}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();
