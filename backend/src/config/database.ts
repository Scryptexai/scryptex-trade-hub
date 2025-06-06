
import { Pool } from 'pg';
import { config } from './environment';
import { logger } from '@/utils/logger';

class Database {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', err);
    });
  }

  async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    const client = await this.pool.connect();
    
    try {
      const res = await client.query(text, params);
      const duration = Date.now() - start;
      
      logger.debug('Executed query', {
        text,
        duration,
        rows: res.rowCount
      });
      
      return res;
    } catch (error) {
      logger.error('Database query error', {
        text,
        error: error.message,
        params
      });
      throw error;
    } finally {
      client.release();
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
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  get isConnected(): boolean {
    return this.pool.totalCount > 0;
  }
}

export const database = new Database();

export async function initializeDatabase(): Promise<void> {
  try {
    await database.query('SELECT NOW()');
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

export default database;
