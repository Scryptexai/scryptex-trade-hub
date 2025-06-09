
import Redis from 'ioredis';
import { config } from './environment';
import { logger } from '@/utils/logger';

class RedisConnection {
  private client: Redis;
  private isConnected: boolean = false;

  constructor() {
    this.client = new Redis(config.redisUrl, {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      logger.info('Redis connected successfully');
    });

    this.client.on('error', (error) => {
      this.isConnected = false;
      logger.error('Redis connection error:', error);
    });

    this.client.on('close', () => {
      this.isConnected = false;
      logger.warn('Redis connection closed');
    });
  }

  async set(key: string, value: string | number | object, ttlSeconds?: number): Promise<void> {
    try {
      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
      
      logger.debug(`Redis SET: ${key}`);
    } catch (error) {
      logger.error('Redis SET error:', error);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const result = await this.client.get(key);
      logger.debug(`Redis GET: ${key}`);
      return result;
    } catch (error) {
      logger.error('Redis GET error:', error);
      throw error;
    }
  }

  async getObject(key: string): Promise<any | null> {
    try {
      const result = await this.client.get(key);
      if (!result) return null;
      return JSON.parse(result);
    } catch (error) {
      logger.error('Redis GET object error:', error);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
      logger.debug(`Redis DEL: ${key}`);
    } catch (error) {
      logger.error('Redis DEL error:', error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error('Redis INCR error:', error);
      throw error;
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      logger.error('Redis EXPIRE error:', error);
      throw error;
    }
  }

  isHealthy(): boolean {
    return this.isConnected;
  }

  async close(): Promise<void> {
    await this.client.quit();
    this.isConnected = false;
    logger.info('Redis connection closed');
  }
}

export const redis = new RedisConnection();
