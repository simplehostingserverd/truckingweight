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

import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { useEffect, useState } from 'react';
import { cacheAPI } from '@/lib/performance';

/**
 * Custom SWR hook with optimizations for better performance
 * - Local caching with localStorage
 * - Deduplication of requests
 * - Stale-while-revalidate pattern
 * - Automatic error retry
 * - Focus revalidation
 * - Polling
 *
 * @param key The key for the data
 * @param fetcher The function to fetch the data
 * @param options Configuration options
 * @returns SWR response with data, error, and loading state
 */
export function useSWROptimized<Data = unknown, Error = unknown>(
  key: string | null,
  fetcher: (key: string) => Promise<Data>,
  _options: SWRConfiguration & {
    localCache?: boolean;
    localCacheTtl?: number;
  } = {}
): SWRResponse<Data, Error> & { _isLoading: boolean } {
  const {
    localCache = true,
    localCacheTtl = 3600, // 1 hour in seconds
    ...swrOptions
  } = options;

  // State for loading indicator
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true);

  // Check local cache first if enabled
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [initialData, setInitialData] = useState<Data | undefined>(undefined);

  useEffect(() => {
    if (!key || !localCache) return;

    // Try to get data from local cache
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cachedData = cacheAPI.get(key);
    if (cachedData) {
      setInitialData(cachedData);
      setIsLoading(false);
    }
  }, [key, localCache]);

  // Custom fetcher that updates local cache
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const customFetcher = async (k: string) => {
    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _data = await fetcher(k);

      // Update local cache if enabled
      if (localCache) {
        cacheAPI.set(k, data, localCacheTtl);
      }

      setIsLoading(false);
      return data;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  // Use SWR with our custom fetcher and initial data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const swr = useSWR<Data, Error>(key, customFetcher, {
    fallbackData: initialData,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000, // 5 seconds
    ...swrOptions,
  });

  return {
    ...swr,
    isLoading,
  };
}

/**
 * Hook for fetching paginated data with optimizations
 *
 * @param baseKey The base key for the data
 * @param fetcher The function to fetch the data
 * @param page The current page
 * @param pageSize The page size
 * @param options Configuration options
 * @returns SWR response with data, error, loading state, and pagination helpers
 */
export function useSWRPagination<Data = unknown, Error = unknown>(
  baseKey: string | null,
  fetcher: (
    key: string,
    page: number,
    pageSize: number
  ) => Promise<{ _data: Data[]; total: number }>,
  page: number = 1,
  pageSize: number = 10,
  _options: SWRConfiguration & {
    localCache?: boolean;
    localCacheTtl?: number;
  } = {}
) {
  // Create a key that includes pagination parameters
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const key = baseKey ? `${baseKey}?page=${page}&pageSize=${pageSize}` : null;

  // Custom fetcher that includes pagination parameters
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const paginatedFetcher = async (k: string) => {
    return fetcher(baseKey!, page, pageSize);
  };

  // Use our optimized SWR hook
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data, error, isLoading, mutate } = useSWROptimized<
    { _data: Data[]; total: number },
    Error
  >(key, paginatedFetcher, options);

  // Calculate pagination values
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const hasMore = page < totalPages;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isEmpty = data?.data.length === 0;

  return {
    _data: _data?.data || [],
    total: data?.total || 0,
    error,
    isLoading,
    mutate,
    pagination: {
      page,
      pageSize,
      totalPages,
      hasMore,
      isEmpty,
    },
  };
}

/**
 * Hook for fetching data with infinite scrolling and optimizations
 *
 * @param baseKey The base key for the data
 * @param fetcher The function to fetch the data
 * @param pageSize The page size
 * @param options Configuration options
 * @returns SWR response with data, error, loading state, and infinite scroll helpers
 */
export function useSWRInfinite<Data = unknown, Error = unknown>(
  baseKey: string | null,
  fetcher: (
    key: string,
    page: number,
    pageSize: number
  ) => Promise<{ _data: Data[]; total: number }>,
  pageSize: number = 10,
  _options: SWRConfiguration & {
    localCache?: boolean;
    localCacheTtl?: number;
  } = {}
) {
  // State for current page and all data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [page, setPage] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [allData, setAllData] = useState<Data[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [total, setTotal] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hasMore, setHasMore] = useState(true);

  // Create a key that includes pagination parameters
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const key = baseKey ? `${baseKey}?page=${page}&pageSize=${pageSize}` : null;

  // Custom fetcher that includes pagination parameters
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const infiniteFetcher = async (k: string) => {
    return fetcher(baseKey!, page, pageSize);
  };

  // Use our optimized SWR hook
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data, error, isLoading, mutate } = useSWROptimized<
    { _data: Data[]; total: number },
    Error
  >(key, infiniteFetcher, options);

  // Update all data when new data is fetched
  useEffect(() => {
    if (data) {
      if (page === 1) {
        // Reset data for page 1
        setAllData(data.data);
      } else {
        // Append data for subsequent pages
        setAllData(prev => [...prev, ...data.data]);
      }

      setTotal(data.total);
      setHasMore(page * pageSize < data.total);
    }
  }, [data, page, pageSize]);

  // Function to load more data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadMore = () => {
    if (hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  };

  // Function to refresh data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const refresh = () => {
    setPage(1);
    mutate();
  };

  return {
    _data: allData,
    total,
    error,
    isLoading,
    _mutate: refresh,
    infiniteScroll: {
      loadMore,
      hasMore,
      page,
      pageSize,
    },
  };
}

/**
 * Hook for prefetching data to improve perceived performance
 *
 * @param keys Array of keys to prefetch
 * @param fetcher The function to fetch the data
 */
export function usePrefetch(keys: string[], fetcher: (key: string) => Promise<unknown>) {
  useEffect(() => {
    // Prefetch data for each key
    keys.forEach(key => {
      // Check if data is already in cache
      if (!cacheAPI.get(key)) {
        // Fetch data in background
        fetcher(key)
          .then(data => {
            cacheAPI.set(key, data);
          })
          .catch(console.error);
      }
    });
  }, [keys, fetcher]);
}
