/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

/**
 * High-performance LRU cache service for the Cargo Scale Pro API
 * This service provides caching capabilities to improve API performance
 */

import { lru } from 'tiny-lru';
import logger from '../../utils/logger.js';

// Default cache options
const DEFAULT_OPTIONS = {
  max: 5000, // Maximum number of items to store in the cache
  ttl: 600 * 1000, // Time to live in milliseconds (10 minutes)
};

/**
 * High-performance in-memory LRU caching service
 * Provides ultra-fast caching without external dependencies
 */
class CacheService {
  constructor(options = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    // Initialize in-memory LRU cache
    this.lruCache = lru(this.options.max, this.options.ttl);

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
  async set(key, value, _ttl = 3600) {
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
   * Check if a key exists in the cache
   * @param {string} key - The cache key
   * @returns {boolean} - True if the key exists
   */
  has(key) {
    return this.lruCache.has(key);
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

  /**
   * Get the number of items in the cache
   * @returns {number} - The number of items
   */
  size() {
    return this.lruCache.size;
  }

  /**
   * Get or set a value with a function if not in cache
   * @param {string} key - The cache key
   * @param {Function} fn - Function to call if key is not in cache
   * @param {Object} options - Optional cache options
   * @returns {Promise<any>} - The cached or computed value
   */
  async getOrSet(key, fn, options = {}) {
    if (this.has(key)) {
      return this.get(key);
    }

    const value = await fn();
    this.set(key, value, options);
    return value;
  }
}

// Create a singleton instance
const cacheService = new CacheService();

// Export the instance as default
export default cacheService;
