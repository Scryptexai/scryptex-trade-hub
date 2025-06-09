
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export class CustomError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429);
  }
}

export class BlockchainError extends CustomError {
  constructor(message: string, statusCode: number = 500) {
    super(message, statusCode);
  }
}

// Async wrapper to catch errors in async route handlers
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Development error response
const sendErrorDev = (err: CustomError, res: Response) => {
  res.status(err.statusCode).json({
    success: false,
    error: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
};

// Production error response
const sendErrorProd = (err: CustomError, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      statusCode: err.statusCode,
      timestamp: new Date().toISOString()
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR 💥', err);
    
    res.status(500).json({
      success: false,
      error: 'Something went wrong!',
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
};

// Handle specific error types
const handleCastErrorDB = (err: any): CustomError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ValidationError(message);
};

const handleDuplicateFieldsDB = (err: any): CustomError => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new ConflictError(message);
};

const handleValidationErrorDB = (err: any): CustomError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new ValidationError(message);
};

const handleJWTError = (): CustomError => {
  return new AuthenticationError('Invalid token. Please log in again!');
};

const handleJWTExpiredError = (): CustomError => {
  return new AuthenticationError('Your token has expired! Please log in again.');
};

const handleBlockchainError = (err: any): CustomError => {
  let message = 'Blockchain transaction failed';
  
  if (err.reason) {
    message = `Blockchain error: ${err.reason}`;
  } else if (err.message) {
    if (err.message.includes('insufficient funds')) {
      message = 'Insufficient funds for this transaction';
    } else if (err.message.includes('gas')) {
      message = 'Transaction failed due to gas estimation error';
    } else if (err.message.includes('revert')) {
      message = 'Transaction reverted by smart contract';
    } else if (err.message.includes('nonce')) {
      message = 'Transaction nonce error. Please try again.';
    }
  }
  
  return new BlockchainError(message, 400);
};

// Main error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  logger.error('Error Handler:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
  
  // Handle blockchain-specific errors
  if (err.code === 'CALL_EXCEPTION' || err.code === 'UNPREDICTABLE_GAS_LIMIT' || err.reason) {
    error = handleBlockchainError(err);
  }

  // Default error handling
  if (!error.statusCode) {
    error.statusCode = 500;
    error.isOperational = false;
  }

  // Send error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Can't find ${req.originalUrl} on this server!`);
  next(error);
};

// Unhandled promise rejection handler
export const unhandledRejectionHandler = (err: Error) => {
  logger.error('UNHANDLED PROMISE REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
};

// Uncaught exception handler
export const uncaughtExceptionHandler = (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
};
