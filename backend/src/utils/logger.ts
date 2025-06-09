
import winston from 'winston';
import { config } from '@/config/environment';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which log level to use based on environment
const level = () => {
  const env = config.nodeEnv || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define format for production logs (JSON format)
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: config.nodeEnv === 'production' ? productionFormat : format,
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: productionFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: productionFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Create the logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ],
  exitOnError: false, // Do not exit on handled exceptions
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (config.nodeEnv !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Create a stream object with a 'write' function that will be used by `morgan`
const loggerStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Additional logger functions for different contexts
export const loggerMethods = {
  // Trading specific logging
  logTrade: (action: string, data: any) => {
    logger.info(`TRADE: ${action}`, {
      type: 'trading',
      action,
      data,
      timestamp: new Date().toISOString()
    });
  },

  // Bridge specific logging
  logBridge: (action: string, data: any) => {
    logger.info(`BRIDGE: ${action}`, {
      type: 'bridge',
      action,
      data,
      timestamp: new Date().toISOString()
    });
  },

  // Blockchain specific logging
  logBlockchain: (chain: string, action: string, data: any) => {
    logger.info(`BLOCKCHAIN: ${chain} - ${action}`, {
      type: 'blockchain',
      chain,
      action,
      data,
      timestamp: new Date().toISOString()
    });
  },

  // Security logging
  logSecurity: (event: string, data: any) => {
    logger.warn(`SECURITY: ${event}`, {
      type: 'security',
      event,
      data,
      timestamp: new Date().toISOString(),
      severity: 'high'
    });
  },

  // Performance logging
  logPerformance: (operation: string, duration: number, data?: any) => {
    logger.info(`PERFORMANCE: ${operation} - ${duration}ms`, {
      type: 'performance',
      operation,
      duration,
      data,
      timestamp: new Date().toISOString()
    });
  },

  // API request logging
  logRequest: (method: string, url: string, statusCode: number, duration: number, userAgent?: string) => {
    logger.http(`API: ${method} ${url} - ${statusCode} - ${duration}ms`, {
      type: 'api',
      method,
      url,
      statusCode,
      duration,
      userAgent,
      timestamp: new Date().toISOString()
    });
  },

  // Points system logging
  logPoints: (action: string, userId: string, points: number, reason: string) => {
    logger.info(`POINTS: ${action} - User: ${userId}, Points: ${points}, Reason: ${reason}`, {
      type: 'points',
      action,
      userId,
      points,
      reason,
      timestamp: new Date().toISOString()
    });
  },

  // WebSocket logging
  logWebSocket: (event: string, data: any) => {
    logger.info(`WEBSOCKET: ${event}`, {
      type: 'websocket',
      event,
      data,
      timestamp: new Date().toISOString()
    });
  },

  // Database logging
  logDatabase: (operation: string, table: string, duration?: number, error?: any) => {
    if (error) {
      logger.error(`DATABASE ERROR: ${operation} on ${table}`, {
        type: 'database',
        operation,
        table,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    } else {
      logger.debug(`DATABASE: ${operation} on ${table} - ${duration}ms`, {
        type: 'database',
        operation,
        table,
        duration,
        timestamp: new Date().toISOString()
      });
    }
  }
};

export { logger, loggerStream };
export default logger;
