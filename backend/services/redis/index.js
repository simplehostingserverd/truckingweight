/**
 * Redis Service
 *
 * This module provides a Redis client for caching and other Redis operations.
 * It handles connection management and provides utility methods for common operations.
 */

const Redis = require('ioredis');

// Use a mock implementation if Redis is not available
class MockRedisClient {
  constructor() {
    this.store = new Map();
    this.isConnected = true;
    console.log('Using mock Redis client');
  }

  async get(key) {
    return this.store.get(key);
  }

  async set(key, value, options = {}) {
    this.store.set(key, value);
    return 'OK';
  }

  async del(key) {
    return this.store.delete(key) ? 1 : 0;
  }

  async expire(key, seconds) {
    if (this.store.has(key)) {
      setTimeout(() => {
        this.store.delete(key);
      }, seconds * 1000);
      return 1;
    }
    return 0;
  }

  async close() {
    this.isConnected = false;
    this.store.clear();
    return true;
  }

  isReady() {
    return this.isConnected;
  }
}

class RedisService {
  constructor() {
    try {
      // Check if we should use mock Redis (for local development without Redis)
      if (process.env.USE_MOCK_REDIS === 'true') {
        console.log('Using mock Redis client (USE_MOCK_REDIS=true)');
        this.client = new MockRedisClient();
        this.isConnected = true;
        return;
      }

      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      const redisPassword = process.env.REDIS_PASSWORD || '';

      // Configure Redis client options
      const redisOptions = {
        maxRetriesPerRequest: 3,
        retryStrategy: times => {
          // After 5 retries, give up and use mock Redis
          if (times >= 5) {
            console.log('Max Redis retries reached, falling back to mock Redis client');
            this.client = new MockRedisClient();
            this.isConnected = true;
            return null; // Stop retrying
          }
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        connectTimeout: 5000, // 5 seconds
      };

      // Add password if provided
      if (redisPassword) {
        redisOptions.password = redisPassword;
      }

      console.log(`Attempting to connect to Redis at ${redisUrl.split('@').pop()}`);

      // Create Redis client
      this.client = new Redis(redisUrl, redisOptions);

      this.client.on('connect', () => {
        this.isConnected = true;
        console.log('Redis client connected');
      });

      this.client.on('error', err => {
        this.isConnected = false;
        console.error('Redis client error:', err);

        // If we can't connect to Redis, fall back to mock implementation
        if (!this.isConnected && !(this.client instanceof MockRedisClient)) {
          console.log('Falling back to mock Redis client due to connection error');
          this.client = new MockRedisClient();
          this.isConnected = true;

          // Log helpful information for debugging
          console.log('Redis connection failed. If running locally without Redis:');
          console.log('1. Set USE_MOCK_REDIS=true in your environment');
          console.log('2. Or install Redis locally: sudo apt install redis-server');
          console.log('3. Or start Redis in Docker: docker run -p 6379:6379 redis:alpine');
        }
      });

      this.client.on('reconnecting', () => {
        console.log('Redis client reconnecting');
      });

      this.client.on('end', () => {
        this.isConnected = false;
        console.log('Redis client disconnected');
      });
    } catch (err) {
      console.error('Error initializing Redis client:', err);
      console.log('Falling back to mock Redis client due to initialization error');
      this.client = new MockRedisClient();
      this.isConnected = true;

      // Log helpful information for debugging
      console.log('Redis initialization failed. If running locally without Redis:');
      console.log('1. Set USE_MOCK_REDIS=true in your environment');
      console.log('2. Or install Redis locally: sudo apt install redis-server');
      console.log('3. Or start Redis in Docker: docker run -p 6379:6379 redis:alpine');
    }
  }

  /**
   * Get a value from Redis
   * @param {string} key - The key to get
   * @returns {Promise<any>} The value, or null if not found
   */
  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      console.error('Redis get error:', err);
      return null;
    }
  }

  /**
   * Set a value in Redis
   * @param {string} key - The key to set
   * @param {any} value - The value to set
   * @param {number} expireSeconds - Optional expiration time in seconds
   * @returns {Promise<boolean>} True if successful
   */
  async set(key, value, expireSeconds = null) {
    try {
      const stringValue = JSON.stringify(value);

      if (expireSeconds) {
        await this.client.set(key, stringValue, 'EX', expireSeconds);
      } else {
        await this.client.set(key, stringValue);
      }

      return true;
    } catch (err) {
      console.error('Redis set error:', err);
      return false;
    }
  }

  /**
   * Delete a key from Redis
   * @param {string} key - The key to delete
   * @returns {Promise<boolean>} True if successful
   */
  async delete(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (err) {
      console.error('Redis delete error:', err);
      return false;
    }
  }

  /**
   * Check if Redis is connected
   * @returns {boolean} True if connected
   */
  isReady() {
    return this.client.isReady();
  }

  /**
   * Close the Redis connection
   * @returns {Promise<void>}
   */
  async close() {
    try {
      if (this.client.quit) {
        await this.client.quit();
      } else if (this.client.close) {
        await this.client.close();
      }
      this.isConnected = false;
    } catch (err) {
      console.error('Redis close error:', err);
    }
  }
}

// Create a singleton instance
const redisService = new RedisService();

module.exports = { redisService };
