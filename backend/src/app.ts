
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { config } from '@/config/environment';
import { database } from '@/config/database';
import { redis } from '@/config/redis';
import { logger } from '@/utils/logger';
import { errorLoggingMiddleware } from '@/middleware/logging';
import { globalErrorHandler } from '@/middleware/errorHandler';

// Import route handlers
import mainRoutes from '@/routes/main';
import transactionRoutes from '@/routes/transactions';
import contractRoutes from '@/routes/contracts';

const app = express();

// Security middleware
if (config.security.helmetEnabled) {
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "wss:", "ws:"],
      },
    },
  }));
}

// Compression middleware
if (config.security.compressionEnabled) {
  app.use(compression());
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api/v1', mainRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1', contractRoutes);

// Error handling middleware
app.use(errorLoggingMiddleware);
app.use(globalErrorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  
  try {
    await database.close();
    await redis.close();
    logger.info('Database and Redis connections closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

export default app;
