
export const CHAIN_IDS = {
  RISECHAIN: 11155931,
  MEGAETH: 6342,
  ETHEREUM: 1,
  POLYGON: 137,
} as const;

export const CHAIN_NAMES = {
  [CHAIN_IDS.RISECHAIN]: 'RiseChain',
  [CHAIN_IDS.MEGAETH]: 'MegaETH',
  [CHAIN_IDS.ETHEREUM]: 'Ethereum',
  [CHAIN_IDS.POLYGON]: 'Polygon',
} as const;

// Trading Constants
export const TRADING_CONFIG = {
  DEFAULT_SLIPPAGE_TOLERANCE: 5, // 5%
  MAX_SLIPPAGE_TOLERANCE: 15, // 15%
  TRADING_FEE_RATE: 30, // 0.30%
  MIN_TRADE_AMOUNT: '0.001', // ETH
  MAX_TRADE_AMOUNT: '1000', // ETH
  TOKEN_CREATION_FEE: '0.01', // ETH
  GRADUATION_THRESHOLD: 69000, // USD
} as const;

// Bridge Constants
export const BRIDGE_CONFIG = {
  MIN_BRIDGE_AMOUNT: '0.01', // ETH
  MAX_BRIDGE_AMOUNT: '1000', // ETH
  BRIDGE_FEE_RATE: 50, // 0.50%
  CONFIRMATION_BLOCKS: {
    [CHAIN_IDS.RISECHAIN]: 3,
    [CHAIN_IDS.MEGAETH]: 1,
    [CHAIN_IDS.ETHEREUM]: 12,
    [CHAIN_IDS.POLYGON]: 20,
  },
} as const;

// Points System Constants
export const POINTS_CONFIG = {
  DAILY_LIMITS: {
    TOKEN_CREATION: 3,
    TRADING: 10,
    BRIDGE: 5,
    SWAP: 15,
    GM: 1,
  },
  POINT_REWARDS: {
    TOKEN_CREATION: 50,
    TOKEN_CREATION_MEGAETH: 60,
    TOKEN_BUY: 10,
    TOKEN_SELL: 10,
    BRIDGE_TRANSFER: 25,
    SWAP: 15,
    REFERRAL: 50,
    DAILY_GM: 5,
  },
  MULTIPLIERS: {
    VOLUME_THRESHOLD_1: 1, // ETH
    VOLUME_THRESHOLD_2: 10, // ETH
    VOLUME_MULTIPLIER_1: 1.5,
    VOLUME_MULTIPLIER_2: 2.0,
    MEGAETH_REALTIME: 1.2,
    SUCCESS_TRADE: 1.2,
  },
} as const;

// API Response Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication
  AUTH_REQUIRED: 'Authentication required',
  INVALID_TOKEN: 'Invalid authentication token',
  TOKEN_EXPIRED: 'Authentication token has expired',
  ACCESS_DENIED: 'Access denied',
  
  // Validation
  INVALID_ADDRESS: 'Invalid wallet address',
  INVALID_AMOUNT: 'Invalid amount specified',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  AMOUNT_TOO_LOW: 'Amount too low',
  AMOUNT_TOO_HIGH: 'Amount too high',
  
  // Trading
  TRADING_DISABLED: 'Trading is currently disabled',
  TOKEN_NOT_FOUND: 'Token not found',
  PRICE_EXPIRED: 'Price quote has expired',
  SLIPPAGE_EXCEEDED: 'Slippage tolerance exceeded',
  
  // Bridge
  BRIDGE_DISABLED: 'Bridge is currently disabled',
  UNSUPPORTED_CHAIN: 'Unsupported blockchain',
  BRIDGE_LIMIT_EXCEEDED: 'Bridge transfer limit exceeded',
  
  // Points
  DAILY_LIMIT_REACHED: 'Daily limit reached for this activity',
  INSUFFICIENT_POINTS: 'Insufficient points',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  TOO_MANY_REQUESTS: 'Too many requests',
  
  // Server Errors
  INTERNAL_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  DATABASE_ERROR: 'Database connection error',
  BLOCKCHAIN_ERROR: 'Blockchain connection error',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  TOKEN_CREATED: 'Token created successfully',
  TRADE_EXECUTED: 'Trade executed successfully',
  BRIDGE_INITIATED: 'Bridge transfer initiated successfully',
  POINTS_AWARDED: 'Points awarded successfully',
  USER_AUTHENTICATED: 'User authenticated successfully',
  SETTINGS_UPDATED: 'Settings updated successfully',
} as const;

// Time Constants (in milliseconds)
export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  
  // Cache TTL
  PRICE_CACHE_TTL: 60 * 1000, // 1 minute
  NETWORK_STATS_CACHE_TTL: 30 * 1000, // 30 seconds
  TOKEN_LIST_CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  
  // Timeouts
  BLOCKCHAIN_TIMEOUT: 30 * 1000, // 30 seconds
  API_TIMEOUT: 10 * 1000, // 10 seconds
  WEBSOCKET_TIMEOUT: 5 * 1000, // 5 seconds
} as const;

// Event Types
export const EVENT_TYPES = {
  // Blockchain Events
  TOKEN_CREATED: 'TokenCreated',
  TOKEN_PURCHASED: 'TokenPurchased',
  TOKEN_SOLD: 'TokenSold',
  TRANSFER_INITIATED: 'TransferInitiated',
  TRANSFER_COMPLETED: 'TransferCompleted',
  POINTS_AWARDED: 'PointsAwarded',
  
  // WebSocket Events
  PRICE_UPDATE: 'price_update',
  TRADE_UPDATE: 'trade_update',
  CHAIN_UPDATE: 'chain_update',
  NOTIFICATION: 'notification',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
} as const;

// Validation Patterns
export const VALIDATION_PATTERNS = {
  ETHEREUM_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  TRANSACTION_HASH: /^0x[a-fA-F0-9]{64}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  TOKEN_SYMBOL: /^[A-Z]{1,10}$/,
  TOKEN_NAME: /^[a-zA-Z0-9\s]{1,50}$/,
} as const;

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
} as const;

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// WebSocket Constants
export const WEBSOCKET_CONFIG = {
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  CONNECTION_TIMEOUT: 60000, // 60 seconds
  MAX_CONNECTIONS_PER_IP: 10,
  MAX_MESSAGE_SIZE: 1024 * 1024, // 1MB
} as const;

// Security Constants
export const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_MIN_LENGTH: 8,
  JWT_EXPIRES_IN: '24h',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
} as const;

// Gas Price Constants (in gwei)
export const GAS_PRICES = {
  SLOW: 10,
  STANDARD: 20,
  FAST: 30,
  RAPID: 50,
} as const;

// Contract Event Topics (keccak256 hashes)
export const EVENT_TOPICS = {
  TOKEN_CREATED: '0x...',
  TOKEN_PURCHASED: '0x...',
  TOKEN_SOLD: '0x...',
  TRANSFER_INITIATED: '0x...',
  TRANSFER_COMPLETED: '0x...',
  POINTS_AWARDED: '0x...',
} as const;

export default {
  CHAIN_IDS,
  CHAIN_NAMES,
  TRADING_CONFIG,
  BRIDGE_CONFIG,
  POINTS_CONFIG,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TIME_CONSTANTS,
  EVENT_TYPES,
  VALIDATION_PATTERNS,
  FILE_UPLOAD,
  PAGINATION,
  WEBSOCKET_CONFIG,
  SECURITY_CONFIG,
  GAS_PRICES,
  EVENT_TOPICS,
};
