import tinyLRU from 'tiny-lru';
import { logger } from '../../utils/logger';

/**
 * High-performance in-memory LRU caching service
 * Provides ultra-fast caching without external dependencies
 */
class CacheService {
  private lruCache: ReturnType<typeof tinyLRU>;
  private readonly defaultTTL: number = 3600; // 1 hour in seconds

  constructor() {
    // Initialize in-memory LRU cache
    // Default size: 5000 items, TTL: 10 minutes (600 seconds)
    this.lruCache = tinyLRU(5000, 600 * 1000);

    logger.info('Initialized in-memory LRU cache service');
  }

  /**
   * Get a value from cache
   */
  public async get<T>(key: string): Promise<T | null> {
    try {
      // Get from LRU cache (extremely fast, no await needed)
      const lruValue = this.lruCache.get(key);
      if (lruValue !== undefined) {
        return JSON.parse(lruValue as string) as T;
      }

      return null;
    } catch (err) {
      logger.error(`Error getting key ${key} from cache:`, err);
      return null;
    }
  }

  /**
   * Set a value in cache
   */
  public async set<T>(key: string, value: T, ttl: number = this.defaultTTL): Promise<boolean> {
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
   */
  public async delete(key: string): Promise<boolean> {
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
   */
  public async clear(): Promise<boolean> {
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
export default new CacheService();
