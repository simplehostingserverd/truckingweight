'use strict';

// Import tiny-lru correctly - it exports an object with lru factory function
const { lru } = require('tiny-lru');
const logger = require('../../utils/logger');

/**
 * High-performance in-memory LRU caching service
 * Provides ultra-fast caching without external dependencies
 */
class CacheService {
  constructor() {
    // Initialize in-memory LRU cache
    // Default size: 5000 items, TTL: 10 minutes (600 seconds)
    this.lruCache = lru(5000, 600 * 1000);

    logger.info('Initialized in-memory LRU cache service');
  }

  /**
   * Get a value from cache
   *
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Cached value or null
   */
  async get(key) {
    try {
      // Get from LRU cache (extremely fast, no await needed)
      const lruValue = this.lruCache.get(key);
      if (lruValue !== undefined) {
        return JSON.parse(lruValue);
      }

      return null;
    } catch (err) {
      logger.error(`Error getting key ${key} from cache:`, err);
      return null;
    }
  }

  /**
   * Set a value in cache
   *
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 3600)
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, /* ttl */ = 3600) {
    try {
      const serialized = JSON.stringify(value);

      // Set in LRU cache (extremely fast)
      this.lruCache.set(key, serialized);

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

      return true;
    } catch (err) {
      logger.error('Error clearing cache:', err);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new CacheService();
