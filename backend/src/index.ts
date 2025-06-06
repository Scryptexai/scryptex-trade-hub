
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

import { errorHandler } from '@/middleware/errorHandler';
import { rateLimiter } from '@/middleware/rateLimiter';
import { logger } from '@/utils/logger';
import { config } from '@/config/environment';
import { initializeDatabase } from '@/config/database';
import { initializeRedis } from '@/config/redis';
import { initializeQueues } from '@/services/queue/queueManager';

// Routes
import authRoutes from '@/routes/auth';
import chainRoutes from '@/routes/chains';
import tokenRoutes from '@/routes/tokens';
import tradingRoutes from '@/routes/trading';
import bridgeRoutes from '@/routes/bridge';
import swapRoutes from '@/routes/swap';
import analyticsRoutes from '@/routes/analytics';
import websocketRoutes from '@/routes/websocket';

// Services
import { WebSocketService } from '@/services/websocket/WebSocketService';
import { PriceService } from '@/services/price/PriceService';
import { NetworkMonitoringService } from '@/services/monitoring/NetworkMonitoringService';

dotenv.config();

class App {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private wsService: WebSocketService;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: config.corsOrigins,
        methods: ["GET", "POST"]
      }
    });
    
    this.wsService = new WebSocketService(this.io);
  }

  private async setupMiddleware(): Promise<void> {
    // Security middleware
    if (config.helmetEnabled) {
      this.app.use(helmet());
    }

    // Compression middleware
    if (config.compressionEnabled) {
      this.app.use(compression());
    }

    // CORS middleware
    this.app.use(cors({
      origin: config.corsOrigins,
      credentials: true
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting
    this.app.use(rateLimiter);

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }

  private setupRoutes(): void {
    const apiPrefix = `/api/${config.apiVersion}`;

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: config.apiVersion
      });
    });

    // API routes
    this.app.use(`${apiPrefix}/auth`, authRoutes);
    this.app.use(`${apiPrefix}/chains`, chainRoutes);
    this.app.use(`${apiPrefix}/tokens`, tokenRoutes);
    this.app.use(`${apiPrefix}/trading`, tradingRoutes);
    this.app.use(`${apiPrefix}/bridge`, bridgeRoutes);
    this.app.use(`${apiPrefix}/swap`, swapRoutes);
    this.app.use(`${apiPrefix}/analytics`, analyticsRoutes);
    this.app.use(`${apiPrefix}/ws`, websocketRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
      });
    });

    // Error handling middleware
    this.app.use(errorHandler);
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize database
      await initializeDatabase();
      logger.info('Database connected successfully');

      // Initialize Redis
      await initializeRedis();
      logger.info('Redis connected successfully');

      // Initialize queue system
      await initializeQueues();
      logger.info('Queue system initialized');

      // Start price monitoring
      const priceService = new PriceService();
      await priceService.startPriceMonitoring();
      logger.info('Price monitoring started');

      // Start network monitoring
      const networkMonitoring = new NetworkMonitoringService();
      await networkMonitoring.startMonitoring();
      logger.info('Network monitoring started');

      // Initialize WebSocket service
      this.wsService.initialize();
      logger.info('WebSocket service initialized');

    } catch (error) {
      logger.error('Failed to initialize services:', error);
      throw error;
    }
  }

  public async start(): Promise<void> {
    try {
      await this.setupMiddleware();
      this.setupRoutes();
      await this.initializeServices();

      this.server.listen(config.port, () => {
        logger.info(`Server is running on port ${config.port}`);
        logger.info(`Environment: ${config.nodeEnv}`);
        logger.info(`API Version: ${config.apiVersion}`);
      });

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    logger.info('Gracefully shutting down server...');
    
    if (this.server) {
      this.server.close(() => {
        logger.info('Server closed');
      });
    }

    // Close WebSocket connections
    this.io.close();
    
    // Additional cleanup can be added here
    process.exit(0);
  }
}

// Handle process termination
const app = new App();

process.on('SIGTERM', () => app.stop());
process.on('SIGINT', () => app.stop());

// Start the application
app.start().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});
