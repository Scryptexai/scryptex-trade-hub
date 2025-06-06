
import { createClient, RedisClientType } from 'redis';
import { config } from './environment';
import { logger } from '@/utils/logger';

class RedisClient {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: config.redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
      },
    });

    this.client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      logger.info('Redis Client Connected');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      logger.warn('Redis Client Disconnected');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setEx(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    return await this.client.exists(key);
  }

  async setHash(key: string, field: string, value: string): Promise<number> {
    return await this.client.hSet(key, field, value);
  }

  async getHash(key: string, field: string): Promise<string | undefined> {
    return await this.client.hGet(key, field);
  }

  async getAllHash(key: string): Promise<Record<string, string>> {
    return await this.client.hGetAll(key);
  }

  async setJSON(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const jsonString = JSON.stringify(value);
    await this.set(key, jsonString, ttlSeconds);
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const jsonString = await this.get(key);
    if (!jsonString) return null;
    
    try {
      return JSON.parse(jsonString) as T;
    } catch (error) {
      logger.error('Failed to parse JSON from Redis:', error);
      return null;
    }
  }

  async lpush(key: string, ...values: string[]): Promise<number> {
    return await this.client.lPush(key, values);
  }

  async rpop(key: string): Promise<string | null> {
    return await this.client.rPop(key);
  }

  async llen(key: string): Promise<number> {
    return await this.client.lLen(key);
  }

  async publish(channel: string, message: string): Promise<number> {
    return await this.client.publish(channel, message);
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    const subscriber = this.client.duplicate();
    await subscriber.connect();
    
    await subscriber.subscribe(channel, (message) => {
      callback(message);
    });
  }

  async flushCache(pattern?: string): Promise<void> {
    if (pattern) {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } else {
      await this.client.flushDb();
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }

  get connected(): boolean {
    return this.isConnected;
  }
}

export const redis = new RedisClient();

export async function initializeRedis(): Promise<void> {
  try {
    await redis.connect();
    logger.info('Redis connection established successfully');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
}

export default redis;
