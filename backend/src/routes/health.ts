
import { Router } from 'express';
import { database } from '@/config/database';
import { redis } from '@/config/redis';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';

const router = Router();

// Basic health check
router.get('/', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: config.apiVersion,
      environment: config.nodeEnv,
      services: {
        database: database.isHealthy(),
        redis: redis.isHealthy(),
      }
    };

    const statusCode = healthStatus.services.database && healthStatus.services.redis ? 200 : 503;
    
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const checks = await Promise.allSettled([
      checkDatabase(),
      checkRedis(),
      checkBlockchainConnections(),
    ]);

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: checks[0].status === 'fulfilled' ? checks[0].value : { status: 'error', error: checks[0].reason },
        redis: checks[1].status === 'fulfilled' ? checks[1].value : { status: 'error', error: checks[1].reason },
        blockchain: checks[2].status === 'fulfilled' ? checks[2].value : { status: 'error', error: checks[2].reason },
      }
    };

    const allHealthy = Object.values(healthStatus.checks).every(check => check.status === 'healthy');
    const statusCode = allHealthy ? 200 : 503;

    res.status(statusCode).json(healthStatus);
  } catch (error) {
    logger.error('Detailed health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Detailed health check failed'
    });
  }
});

// Contract addresses endpoint
router.get('/contracts', async (req, res) => {
  try {
    const contracts = {
      risechain: {
        chainId: config.risechain.chainId,
        rpcUrl: config.risechain.rpcUrl,
        contracts: config.risechain.contracts
      },
      megaeth: {
        chainId: config.megaeth.chainId,
        rpcUrl: config.megaeth.rpcUrl,
        wsUrl: config.megaeth.wsUrl,
        contracts: config.megaeth.contracts,
        realtimeEnabled: config.megaeth.realtime.enabled
      }
    };

    res.json({
      success: true,
      data: contracts
    });
  } catch (error) {
    logger.error('Contract addresses error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get contract addresses'
    });
  }
});

// Database connectivity check
async function checkDatabase() {
  try {
    const start = Date.now();
    await database.query('SELECT 1');
    const responseTime = Date.now() - start;
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
}

// Redis connectivity check
async function checkRedis() {
  try {
    const start = Date.now();
    await redis.set('health_check', '1', 10);
    await redis.get('health_check');
    const responseTime = Date.now() - start;
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
}

// Blockchain connectivity check
async function checkBlockchainConnections() {
  try {
    // This would check RPC connectivity
    // For now, return basic status
    return {
      status: 'healthy',
      chains: {
        risechain: config.risechain.chainId,
        megaeth: config.megaeth.chainId
      }
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
}

export default router;
