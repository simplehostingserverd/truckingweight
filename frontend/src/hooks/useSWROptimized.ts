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
export function useSWROptimized<Data = any, Error = any>(
  key: string | null,
  fetcher: (key: string) => Promise<Data>,
  options: SWRConfiguration & {
    localCache?: boolean;
    localCacheTtl?: number;
  } = {}
): SWRResponse<Data, Error> & { isLoading: boolean } {
  const {
    localCache = true,
    localCacheTtl = 3600, // 1 hour in seconds
    ...swrOptions
  } = options;

  // State for loading indicator
  const [isLoading, setIsLoading] = useState(true);

  // Check local cache first if enabled
  const [initialData, setInitialData] = useState<Data | undefined>(undefined);

  useEffect(() => {
    if (!key || !localCache) return;

    // Try to get data from local cache
    const cachedData = cacheAPI.get(key);
    if (cachedData) {
      setInitialData(cachedData);
      setIsLoading(false);
    }
  }, [key, localCache]);

  // Custom fetcher that updates local cache
  const customFetcher = async (k: string) => {
    setIsLoading(true);
    try {
      const data = await fetcher(k);

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
export function useSWRPagination<Data = any, Error = any>(
  baseKey: string | null,
  fetcher: (
    key: string,
    page: number,
    pageSize: number
  ) => Promise<{ data: Data[]; total: number }>,
  page: number = 1,
  pageSize: number = 10,
  options: SWRConfiguration & {
    localCache?: boolean;
    localCacheTtl?: number;
  } = {}
) {
  // Create a key that includes pagination parameters
  const key = baseKey ? `${baseKey}?page=${page}&pageSize=${pageSize}` : null;

  // Custom fetcher that includes pagination parameters
  const paginatedFetcher = async (k: string) => {
    return fetcher(baseKey!, page, pageSize);
  };

  // Use our optimized SWR hook
  const { data, error, isLoading, mutate } = useSWROptimized<
    { data: Data[]; total: number },
    Error
  >(key, paginatedFetcher, options);

  // Calculate pagination values
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;
  const hasMore = page < totalPages;
  const isEmpty = data?.data.length === 0;

  return {
    data: data?.data || [],
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
export function useSWRInfinite<Data = any, Error = any>(
  baseKey: string | null,
  fetcher: (
    key: string,
    page: number,
    pageSize: number
  ) => Promise<{ data: Data[]; total: number }>,
  pageSize: number = 10,
  options: SWRConfiguration & {
    localCache?: boolean;
    localCacheTtl?: number;
  } = {}
) {
  // State for current page and all data
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState<Data[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Create a key that includes pagination parameters
  const key = baseKey ? `${baseKey}?page=${page}&pageSize=${pageSize}` : null;

  // Custom fetcher that includes pagination parameters
  const infiniteFetcher = async (k: string) => {
    return fetcher(baseKey!, page, pageSize);
  };

  // Use our optimized SWR hook
  const { data, error, isLoading, mutate } = useSWROptimized<
    { data: Data[]; total: number },
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
  const loadMore = () => {
    if (hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  };

  // Function to refresh data
  const refresh = () => {
    setPage(1);
    mutate();
  };

  return {
    data: allData,
    total,
    error,
    isLoading,
    mutate: refresh,
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
export function usePrefetch(keys: string[], fetcher: (key: string) => Promise<any>) {
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
