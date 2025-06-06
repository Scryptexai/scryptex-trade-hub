
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v1',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/trading_db',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'refresh-secret',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',

  // RiseChain
  risechain: {
    rpcUrl: process.env.RISECHAIN_RPC_URL || 'https://testnet-rpc.risechain.ai',
    chainId: parseInt(process.env.RISECHAIN_CHAIN_ID || '11155931', 10),
    privateKey: process.env.RISECHAIN_PRIVATE_KEY || '',
    contracts: {
      bridge: process.env.RISECHAIN_BRIDGE_CONTRACT || '',
      swap: process.env.RISECHAIN_SWAP_CONTRACT || '',
      tokenFactory: process.env.RISECHAIN_TOKEN_FACTORY || '',
      trading: process.env.RISECHAIN_TRADING_CONTRACT || ''
    }
  },

  // MegaETH
  megaeth: {
    rpcUrl: process.env.MEGAETH_RPC_URL || 'https://6342.rpc.thirdweb.com',
    wsUrl: process.env.MEGAETH_WS_URL || 'wss://6342.rpc.thirdweb.com',
    chainId: parseInt(process.env.MEGAETH_CHAIN_ID || '6342', 10),
    privateKey: process.env.MEGAETH_PRIVATE_KEY || '',
    contracts: {
      bridge: process.env.MEGAETH_BRIDGE_CONTRACT || '',
      swap: process.env.MEGAETH_SWAP_CONTRACT || '',
      tokenFactory: process.env.MEGAETH_TOKEN_FACTORY || '',
      trading: process.env.MEGAETH_TRADING_CONTRACT || ''
    },
    realtime: {
      enabled: process.env.MEGAETH_REALTIME_ENABLED === 'true',
      miniBlockSubscription: process.env.MEGAETH_MINI_BLOCK_SUBSCRIPTION === 'true',
      preconfirmationEnabled: process.env.MEGAETH_PRECONFIRMATION_ENABLED === 'true',
      targetMiniBlockTime: parseInt(process.env.MEGAETH_TARGET_MINI_BLOCK_TIME || '10', 10),
      targetEvmBlockTime: parseInt(process.env.MEGAETH_TARGET_EVM_BLOCK_TIME || '1000', 10)
    }
  },

  // External APIs
  externalApis: {
    coingeckoApiKey: process.env.COINGECKO_API_KEY || '',
    etherscanApiKey: process.env.ETHERSCAN_API_KEY || '',
    infuraProjectId: process.env.INFURA_PROJECT_ID || '',
    alchemyApiKey: process.env.ALCHEMY_API_KEY || ''
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },

  // WebSocket
  websocket: {
    port: parseInt(process.env.WS_PORT || '3002', 10),
    heartbeatInterval: parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000', 10)
  },

  // Security
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  helmetEnabled: process.env.HELMET_ENABLED !== 'false',
  compressionEnabled: process.env.COMPRESSION_ENABLED !== 'false',

  // Cache
  cache: {
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '300', 10),
    priceCacheTtl: parseInt(process.env.PRICE_CACHE_TTL || '60', 10),
    networkStatsCacheTtl: parseInt(process.env.NETWORK_STATS_CACHE_TTL || '30', 10)
  },

  // Background Jobs
  queue: {
    redisUrl: process.env.QUEUE_REDIS_URL || 'redis://localhost:6379',
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5', 10),
    retryAttempts: parseInt(process.env.JOB_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.JOB_RETRY_DELAY || '5000', 10)
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    sentryDsn: process.env.SENTRY_DSN || '',
    enablePrometheus: process.env.ENABLE_PROMETHEUS === 'true',
    prometheusPort: parseInt(process.env.PROMETHEUS_PORT || '9090', 10)
  },

  // File Upload
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/gif']
  }
};

// Validation
if (config.nodeEnv === 'production') {
  const requiredEnvVars = [
    'JWT_SECRET',
    'DATABASE_URL',
    'RISECHAIN_PRIVATE_KEY',
    'MEGAETH_PRIVATE_KEY'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Required environment variable ${envVar} is not set`);
    }
  }
}

export default config;
