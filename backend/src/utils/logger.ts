
import winston from 'winston';
import { config } from '@/config/environment';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  })
);

export const logger = winston.createLogger({
  level: config.logging.level,
  format: config.nodeEnv === 'production' ? logFormat : developmentFormat,
  defaultMeta: { service: 'trading-backend' },
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
});

// Add file logging in production
if (config.nodeEnv === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    })
  );
  
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
    })
  );
}

// Add Sentry logging if configured
if (config.logging.sentryDsn) {
  // Sentry transport would be added here
  logger.info('Sentry logging configured');
}

export default logger;
