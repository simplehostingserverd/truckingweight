/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * 
 * This file contains proprietary and confidential information of 
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */


/**
 * Performance optimization utilities for the TruckingWeight application
 * This file contains functions to optimize the application's performance
 */

/**
 * Debounce function to limit the rate at which a function can fire
 * @param fn The function to debounce
 * @param ms The debounce delay in milliseconds
 * @returns A debounced function
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, ms = 300) {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

/**
 * Throttle function to limit the rate at which a function can fire
 * @param fn The function to throttle
 * @param ms The throttle delay in milliseconds
 * @returns A throttled function
 */
export function throttle<T extends (...args: any[]) => any>(fn: T, ms = 300) {
  let lastCall = 0;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall < ms) return;

    lastCall = now;
    return fn.apply(this, args);
  };
}

/**
 * Memoize function to cache the results of expensive function calls
 * @param fn The function to memoize
 * @returns A memoized function
 */
export function memoize<T extends (...args: any[]) => any>(fn: T) {
  const cache = new Map();

  return function (this: any, ...args: Parameters<T>) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Batch multiple state updates to reduce renders
 * @param callback Function containing multiple state updates
 */
export function batchUpdates(callback: () => void) {
  // React 18+ automatically batches all state updates
  callback();
}

/**
 * Create a resource loader with retry logic
 * @param loadFn The function to load the resource
 * @param options Options for the loader
 * @returns A function that loads the resource with retry logic
 */
export function createResourceLoader<T>(
  loadFn: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    onError?: (error: Error, retryCount: number) => void;
  } = {}
) {
  const { maxRetries = 3, retryDelay = 1000, onError } = options;

  return async function load(): Promise<T> {
    let retries = 0;

    while (true) {
      try {
        return await loadFn();
      } catch (error) {
        if (retries >= maxRetries) throw error;

        retries++;
        if (onError) onError(error as Error, retries);

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * retries));
      }
    }
  };
}

/**
 * Lazy load an image with a placeholder
 * @param src The image source URL
 * @param placeholder The placeholder image URL
 * @returns An object with the image source and loading state
 */
export function useLazyImage(src: string, placeholder: string) {
  if (typeof window === 'undefined') {
    return { currentSrc: placeholder, isLoading: true };
  }

  const image = new Image();
  let currentSrc = placeholder;
  let isLoading = true;

  image.onload = () => {
    currentSrc = src;
    isLoading = false;
  };

  image.src = src;

  return { currentSrc, isLoading };
}

/**
 * Check if the Intersection Observer API is supported
 * @returns Whether the Intersection Observer API is supported
 */
export function isIntersectionObserverSupported(): boolean {
  return typeof window !== 'undefined' && 'IntersectionObserver' in window;
}

/**
 * Create a virtual list renderer for large lists
 * @param items The list items
 * @param itemHeight The height of each item
 * @param visibleItems The number of visible items
 * @returns The visible items and scroll handlers
 */
export function createVirtualList<T>(items: T[], itemHeight: number, visibleItems: number) {
  if (typeof window === 'undefined') {
    return {
      visibleItems: items.slice(0, visibleItems),
      totalHeight: items.length * itemHeight,
      onScroll: () => {},
    };
  }

  let startIndex = 0;
  let endIndex = Math.min(startIndex + visibleItems, items.length);

  const onScroll = (scrollTop: number) => {
    startIndex = Math.floor(scrollTop / itemHeight);
    endIndex = Math.min(startIndex + visibleItems, items.length);
  };

  return {
    visibleItems: items.slice(startIndex, endIndex),
    totalHeight: items.length * itemHeight,
    onScroll,
  };
}

/**
 * Cache API wrapper for browser caching
 */
export const cacheAPI = {
  /**
   * Store data in the cache
   * @param key The cache key
   * @param data The data to cache
   * @param ttl Time to live in seconds
   */
  async set(key: string, data: any, ttl = 3600): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const cache = {
        data,
        expires: Date.now() + ttl * 1000,
      };

      localStorage.setItem(`cache_${key}`, JSON.stringify(cache));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  /**
   * Get data from the cache
   * @param key The cache key
   * @returns The cached data or null if not found or expired
   */
  get(key: string): any {
    if (typeof window === 'undefined') return null;

    try {
      const cacheJson = localStorage.getItem(`cache_${key}`);
      if (!cacheJson) return null;

      const cache = JSON.parse(cacheJson);
      if (cache.expires < Date.now()) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return cache.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  /**
   * Remove data from the cache
   * @param key The cache key
   */
  remove(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  },

  /**
   * Clear all cached data
   */
  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith('cache_'))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  },
};

/**
 * Measure the execution time of a function
 * @param fn The function to measure
 * @param label A label for the measurement
 * @returns The function result
 */
export function measurePerformance<T>(fn: () => T, label: string): T {
  if (typeof performance === 'undefined') return fn();

  const start = performance.now();
  const result = fn();
  const end = performance.now();

  console.log(`${label}: ${end - start}ms`);

  return result;
}

/**
 * Create a cached fetch function with SWR-like behavior
 * @param fetcher The fetch function
 * @param options Options for the cached fetch
 * @returns A function that fetches data with caching
 */
export function createCachedFetch<T>(
  fetcher: () => Promise<T>,
  options: {
    key: string;
    ttl?: number;
    staleWhileRevalidate?: boolean;
  }
) {
  const { key, ttl = 3600, staleWhileRevalidate = true } = options;

  return async function cachedFetch(): Promise<T> {
    // Try to get from cache first
    const cachedData = cacheAPI.get(key);

    // If we have cached data and we're not revalidating, return it
    if (cachedData && !staleWhileRevalidate) {
      return cachedData;
    }

    // If we have cached data and we're revalidating, return it and fetch in background
    if (cachedData && staleWhileRevalidate) {
      // Fetch in background
      fetcher()
        .then(newData => {
          cacheAPI.set(key, newData, ttl);
        })
        .catch(console.error);

      return cachedData;
    }

    // If we don't have cached data, fetch it
    const data = await fetcher();
    cacheAPI.set(key, data, ttl);
    return data;
  };
}
