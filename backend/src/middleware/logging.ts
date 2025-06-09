
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, url, headers, body } = req;
  
  // Log request
  logger.info('Incoming request', {
    method,
    url,
    userAgent: headers['user-agent'],
    ip: req.ip,
    body: method === 'POST' || method === 'PUT' ? body : undefined
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method,
      url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

export const errorLoggingMiddleware = (error: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Request error', {
    method: req.method,
    url: req.url,
    error: error.message,
    stack: error.stack,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  next(error);
};
