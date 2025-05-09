import Redis from 'ioredis';
import { logger } from '../../utils/logger';

class RedisService {
  private client: Redis;
  private isConnected: boolean = false;
  private readonly defaultTTL: number = 3600; // 1 hour in seconds

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      logger.info('Redis client connected');
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      logger.error('Redis client error:', err);
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis client reconnecting');
    });

    this.client.on('end', () => {
      this.isConnected = false;
      logger.info('Redis client disconnected');
    });
  }

  /**
   * Check if Redis is connected
   */
  public isReady(): boolean {
    return this.isConnected;
  }

  /**
   * Get a value from Redis
   */
  public async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error(`Error getting key ${key} from Redis:`, error);
      return null;
    }
  }

  /**
   * Set a value in Redis with optional TTL
   */
  public async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const serializedValue = JSON.stringify(value);
      
      if (ttl) {
        await this.client.set(key, serializedValue, 'EX', ttl);
      } else {
        await this.client.set(key, serializedValue, 'EX', this.defaultTTL);
      }
      
      return true;
    } catch (error) {
      logger.error(`Error setting key ${key} in Redis:`, error);
      return false;
    }
  }

  /**
   * Delete a key from Redis
   */
  public async delete(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Error deleting key ${key} from Redis:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  public async deletePattern(pattern: string): Promise<boolean> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return true;
    } catch (error) {
      logger.error(`Error deleting keys matching pattern ${pattern} from Redis:`, error);
      return false;
    }
  }

  /**
   * Check if a key exists in Redis
   */
  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Error checking if key ${key} exists in Redis:`, error);
      return false;
    }
  }

  /**
   * Get the TTL of a key in Redis
   */
  public async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error(`Error getting TTL for key ${key} from Redis:`, error);
      return -1;
    }
  }

  /**
   * Set a hash in Redis
   */
  public async hset(key: string, field: string, value: any): Promise<boolean> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.hset(key, field, serializedValue);
      return true;
    } catch (error) {
      logger.error(`Error setting hash field ${field} for key ${key} in Redis:`, error);
      return false;
    }
  }

  /**
   * Get a hash field from Redis
   */
  public async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      const data = await this.client.hget(key, field);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error(`Error getting hash field ${field} for key ${key} from Redis:`, error);
      return null;
    }
  }

  /**
   * Get all hash fields from Redis
   */
  public async hgetall<T>(key: string): Promise<Record<string, T> | null> {
    try {
      const data = await this.client.hgetall(key);
      if (!data || Object.keys(data).length === 0) return null;
      
      const result: Record<string, T> = {};
      for (const field in data) {
        result[field] = JSON.parse(data[field]) as T;
      }
      
      return result;
    } catch (error) {
      logger.error(`Error getting all hash fields for key ${key} from Redis:`, error);
      return null;
    }
  }

  /**
   * Delete a hash field from Redis
   */
  public async hdel(key: string, field: string): Promise<boolean> {
    try {
      await this.client.hdel(key, field);
      return true;
    } catch (error) {
      logger.error(`Error deleting hash field ${field} for key ${key} from Redis:`, error);
      return false;
    }
  }

  /**
   * Add a value to a Redis set
   */
  public async sadd(key: string, value: string): Promise<boolean> {
    try {
      await this.client.sadd(key, value);
      return true;
    } catch (error) {
      logger.error(`Error adding value to set ${key} in Redis:`, error);
      return false;
    }
  }

  /**
   * Get all members of a Redis set
   */
  public async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key);
    } catch (error) {
      logger.error(`Error getting members of set ${key} from Redis:`, error);
      return [];
    }
  }

  /**
   * Close the Redis connection
   */
  public async close(): Promise<void> {
    try {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Error closing Redis connection:', error);
    }
  }
}

// Export singleton instance
export const redisService = new RedisService();
