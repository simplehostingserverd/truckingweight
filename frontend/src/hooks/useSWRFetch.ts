import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { handleApiError, AppError } from '@/utils/errorHandler';
import logger from '@/utils/logger';

// Create a fetcher function that uses axios with error handling
const axiosFetcher = async function <T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axios(url, config);
    return response.data;
  } catch (error) {
    // Convert to AppError for better error handling
    const appError = handleApiError(error);

    // Log the error
    logger.error(`API Error: ${appError.message}`, {
      url,
      type: appError.type,
      statusCode: appError.statusCode,
      details: appError.details,
    });

    throw appError;
  }
};

// Custom hook that wraps SWR with axios
export function useSWRFetch<T = any>(
  url: string | null,
  config?: AxiosRequestConfig,
  swrOptions?: SWRConfiguration
): SWRResponse<T, AppError> {
  // Only fetch if URL is provided
  const shouldFetch = !!url;

  return useSWR<T, AppError>(
    shouldFetch ? [url, config] : null,
    ([url, config]) => axiosFetcher<T>(url, config),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // 5 seconds
      errorRetryCount: 3, // Retry 3 times on error
      ...swrOptions,
      onError: (error, key) => {
        // Call the user's onError if provided
        if (swrOptions?.onError) {
          swrOptions.onError(error, key);
        }
      },
    }
  );
}

// Hook for POST requests
export function useSWRMutation<T = any, D = any>(url: string, options?: SWRConfiguration) {
  const fetcher = async function (url: string, { arg }: { arg: D }) {
    try {
      const response = await axios.post<T>(url, arg);
      return response.data;
    } catch (error) {
      // Convert to AppError for better error handling
      const appError = handleApiError(error);

      // Log the error
      logger.error(`API POST Error: ${appError.message}`, {
        url,
        type: appError.type,
        statusCode: appError.statusCode,
        details: appError.details,
      });

      throw appError;
    }
  };

  return useSWR.mutation<T, AppError, string, { arg: D }>(url, fetcher, options);
}

// Hook for PUT requests
export function useSWRPut<T = any, D = any>(url: string, options?: SWRConfiguration) {
  const fetcher = async function (url: string, { arg }: { arg: D }) {
    try {
      const response = await axios.put<T>(url, arg);
      return response.data;
    } catch (error) {
      // Convert to AppError for better error handling
      const appError = handleApiError(error);

      // Log the error
      logger.error(`API PUT Error: ${appError.message}`, {
        url,
        type: appError.type,
        statusCode: appError.statusCode,
        details: appError.details,
      });

      throw appError;
    }
  };

  return useSWR.mutation<T, AppError, string, { arg: D }>(url, fetcher, options);
}

// Hook for DELETE requests
export function useSWRDelete<T = any>(url: string, options?: SWRConfiguration) {
  const fetcher = async function (url: string) {
    try {
      const response = await axios.delete<T>(url);
      return response.data;
    } catch (error) {
      // Convert to AppError for better error handling
      const appError = handleApiError(error);

      // Log the error
      logger.error(`API DELETE Error: ${appError.message}`, {
        url,
        type: appError.type,
        statusCode: appError.statusCode,
        details: appError.details,
      });

      throw appError;
    }
  };

  return useSWR.mutation<T, AppError, string>(url, fetcher, options);
}

export default useSWRFetch;
