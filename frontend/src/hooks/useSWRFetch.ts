import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Create a fetcher function that uses axios
const axiosFetcher = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await axios(url, config);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError;
  }
};

// Custom hook that wraps SWR with axios
export function useSWRFetch<T = any>(
  url: string | null,
  config?: AxiosRequestConfig,
  swrOptions?: SWRConfiguration
): SWRResponse<T, AxiosError> {
  // Only fetch if URL is provided
  const shouldFetch = !!url;
  
  return useSWR<T, AxiosError>(
    shouldFetch ? [url, config] : null,
    ([url, config]) => axiosFetcher<T>(url, config),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // 5 seconds
      ...swrOptions,
    }
  );
}

// Hook for POST requests
export function useSWRMutation<T = any, D = any>(
  url: string,
  options?: SWRConfiguration
) {
  const fetcher = async (url: string, { arg }: { arg: D }) => {
    const response = await axios.post<T>(url, arg);
    return response.data;
  };

  return useSWR.mutation<T, AxiosError, string, { arg: D }>(url, fetcher, options);
}

// Hook for PUT requests
export function useSWRPut<T = any, D = any>(
  url: string,
  options?: SWRConfiguration
) {
  const fetcher = async (url: string, { arg }: { arg: D }) => {
    const response = await axios.put<T>(url, arg);
    return response.data;
  };

  return useSWR.mutation<T, AxiosError, string, { arg: D }>(url, fetcher, options);
}

// Hook for DELETE requests
export function useSWRDelete<T = any>(
  url: string,
  options?: SWRConfiguration
) {
  const fetcher = async (url: string) => {
    const response = await axios.delete<T>(url);
    return response.data;
  };

  return useSWR.mutation<T, AxiosError, string>(url, fetcher, options);
}

export default useSWRFetch;
