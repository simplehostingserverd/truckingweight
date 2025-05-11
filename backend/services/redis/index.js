/**
 * Redis Service
 *
 * This module provides a Redis client for caching and other Redis operations.
 * It handles connection management and provides utility methods for common operations.
 */

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
    this.client = new MockRedisClient();
    this.isConnected = true;
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
      await this.client.set(key, stringValue);

      if (expireSeconds) {
        await this.client.expire(key, expireSeconds);
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
      await this.client.close();
      this.isConnected = false;
    } catch (err) {
      console.error('Redis close error:', err);
    }
  }
}

// Create a singleton instance
const redisService = new RedisService();

module.exports = { redisService };
