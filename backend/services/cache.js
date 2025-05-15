/**
 * High-performance LRU cache service for the TruckingSemis API
 * This service provides caching capabilities to improve API performance
 */

import { LRUCache } from 'lru-cache';

// Default cache options
const DEFAULT_OPTIONS = {
  max: 500, // Maximum number of items to store in the cache
  ttl: 1000 * 60 * 5, // Time to live in milliseconds (5 minutes)
  updateAgeOnGet: true, // Update the age of an item when it is retrieved
  allowStale: false, // Don't serve stale items
};

class CacheService {
  constructor(options = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.cache = new LRUCache(this.options);
  }

  /**
   * Set a value in the cache
   * @param {string} key - The cache key
   * @param {any} value - The value to store
   * @param {Object} options - Optional cache options for this specific item
   * @returns {boolean} - True if the item was added successfully
   */
  set(key, value, options = {}) {
    return this.cache.set(key, value, options);
  }

  /**
   * Get a value from the cache
   * @param {string} key - The cache key
   * @returns {any} - The cached value or undefined if not found
   */
  get(key) {
    return this.cache.get(key);
  }

  /**
   * Check if a key exists in the cache
   * @param {string} key - The cache key
   * @returns {boolean} - True if the key exists
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Delete a value from the cache
   * @param {string} key - The cache key
   * @returns {boolean} - True if the item was removed
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get the number of items in the cache
   * @returns {number} - The number of items
   */
  size() {
    return this.cache.size;
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

// Export individual methods
export const set = cacheService.set.bind(cacheService);
export const get = cacheService.get.bind(cacheService);
export const has = cacheService.has.bind(cacheService);
export const remove = cacheService.delete.bind(cacheService); // Renamed from delete (reserved keyword)
export const clear = cacheService.clear.bind(cacheService);
export const size = cacheService.size.bind(cacheService);
export const getOrSet = cacheService.getOrSet.bind(cacheService);

// Also export the instance as default
export default cacheService;
