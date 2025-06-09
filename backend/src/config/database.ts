
import { Pool } from 'pg';
import { config } from './environment';
import { logger } from '@/utils/logger';

class DatabaseConnection {
  private pool: Pool;
  private isConnected: boolean = false;

  constructor() {
    this.pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
      max: 20, // Maximum number of clients in the pool
      min: 2,  // Minimum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    this.pool.on('connect', () => {
      logger.info('Database client connected');
    });

    this.pool.on('error', (err) => {
      logger.error('Database connection error:', err);
    });
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      this.isConnected = true;
      logger.info('Database connected successfully');
    } catch (error) {
      this.isConnected = false;
      logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      logger.debug('Database query executed', { 
        query: text, 
        duration, 
        rows: result.rowCount 
      });
      return result;
    } catch (error) {
      logger.error('Database query error:', error);
      throw error;
    }
  }

  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction rolled back:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  isHealthy(): boolean {
    return this.isConnected;
  }

  async close(): Promise<void> {
    await this.pool.end();
    this.isConnected = false;
    logger.info('Database connection closed');
  }
}

export const database = new DatabaseConnection();
