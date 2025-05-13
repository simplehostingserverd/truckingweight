'use strict';

const Redis = require('ioredis');
const lru = require('tiny-lru');
const { logger } = require('../../utils/logger');

/**
 * Hybrid caching service that combines in-memory LRU cache with Redis
 * This provides extremely fast local caching with the distributed benefits of Redis
 */
class CacheService {
  constructor() {
    // Initialize in-memory LRU cache (much faster than Redis)
    // Default size: 1000 items, TTL: 5 minutes (300 seconds)
    this.lruCache = lru(1000, 300 * 1000);
    
    // Track if Redis is connected
    this.redisConnected = false;
    
    // Initialize Redis client
    this.initRedis();
  }
  
  /**
   * Initialize Redis connection
   */
  initRedis() {
    try {
      // Skip Redis if mock Redis is enabled
      if (process.env.USE_MOCK_REDIS === 'true') {
        logger.info('Using in-memory LRU cache only (Redis disabled)');
        return;
      }
      
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      const redisPassword = process.env.REDIS_PASSWORD || '';
      
      // Configure Redis client options
      const redisOptions = {
        maxRetriesPerRequest: 3,
        retryStrategy: times => {
          // After 3 retries, give up and use only LRU cache
          if (times >= 3) {
            logger.warn('Max Redis retries reached, using in-memory LRU cache only');
            return null; // Stop retrying
          }
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        connectTimeout: 3000, // 3 seconds
      };
      
      // Add password if provided
      if (redisPassword) {
        redisOptions.password = redisPassword;
      }
      
      // Create Redis client
      this.redis = new Redis(redisUrl, redisOptions);
      
      // Set up event handlers
      this.redis.on('connect', () => {
        this.redisConnected = true;
        logger.info('Redis connected for caching');
      });
      
      this.redis.on('error', err => {
        this.redisConnected = false;
        logger.error('Redis cache error:', err);
      });
      
      this.redis.on('end', () => {
        this.redisConnected = false;
        logger.info('Redis cache disconnected');
      });
    } catch (err) {
      logger.error('Error initializing Redis cache:', err);
      logger.info('Using in-memory LRU cache only');
    }
  }
  
  /**
   * Get a value from cache
   * First checks the ultra-fast in-memory LRU cache, then falls back to Redis
   * 
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Cached value or null
   */
  async get(key) {
    try {
      // First check LRU cache (extremely fast, no await needed)
      const lruValue = this.lruCache.get(key);
      if (lruValue !== undefined) {
        return JSON.parse(lruValue);
      }
      
      // If not in LRU cache and Redis is connected, check Redis
      if (this.redisConnected) {
        const redisValue = await this.redis.get(key);
        if (redisValue) {
          // Store in LRU cache for future fast access
          const parsed = JSON.parse(redisValue);
          this.lruCache.set(key, redisValue);
          return parsed;
        }
      }
      
      return null;
    } catch (err) {
      logger.error(`Error getting key ${key} from cache:`, err);
      return null;
    }
  }
  
  /**
   * Set a value in cache
   * Stores in both the in-memory LRU cache and Redis if available
   * 
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 3600)
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, ttl = 3600) {
    try {
      const serialized = JSON.stringify(value);
      
      // Always set in LRU cache (extremely fast)
      this.lruCache.set(key, serialized);
      
      // If Redis is connected, also set there for distributed caching
      if (this.redisConnected) {
        await this.redis.set(key, serialized, 'EX', ttl);
      }
      
      return true;
    } catch (err) {
      logger.error(`Error setting key ${key} in cache:`, err);
      return false;
    }
  }
  
  /**
   * Delete a value from cache
   * 
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Success status
   */
  async delete(key) {
    try {
      // Delete from LRU cache
      this.lruCache.delete(key);
      
      // If Redis is connected, also delete there
      if (this.redisConnected) {
        await this.redis.del(key);
      }
      
      return true;
    } catch (err) {
      logger.error(`Error deleting key ${key} from cache:`, err);
      return false;
    }
  }
  
  /**
   * Clear all cache entries
   * 
   * @returns {Promise<boolean>} - Success status
   */
  async clear() {
    try {
      // Clear LRU cache
      this.lruCache.clear();
      
      // If Redis is connected, also clear there (using pattern)
      if (this.redisConnected) {
        // This is a simplified approach - in production you might want to use SCAN instead
        const keys = await this.redis.keys('*');
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
      
      return true;
    } catch (err) {
      logger.error('Error clearing cache:', err);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new CacheService();
