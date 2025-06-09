
import app from './app';
import { config } from '@/config/environment';
import { database } from '@/config/database';
import { redis } from '@/config/redis';
import { blockchainService } from '@/services/blockchain.service';
import { logger } from '@/utils/logger';

async function startServer() {
  try {
    // Initialize database connection
    await database.connect();
    logger.info('Database connected successfully');

    // Initialize blockchain services
    await blockchainService.initialize();
    logger.info('Blockchain services initialized');

    // Test Redis connection
    await redis.set('server_start', new Date().toISOString(), 60);
    logger.info('Redis connected successfully');

    // Start HTTP server
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`API Version: ${config.apiVersion}`);
      
      // Log supported chains
      logger.info('Supported chains:');
      logger.info(`- RiseChain (${config.risechain.chainId}): ${config.risechain.rpcUrl}`);
      logger.info(`- MegaETH (${config.megaeth.chainId}): ${config.megaeth.rpcUrl}`);
      
      if (config.megaeth.realtime.enabled) {
        logger.info('MegaETH real-time features enabled');
      }
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          logger.error(`Port ${config.port} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`Port ${config.port} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer();
}

export { startServer };
