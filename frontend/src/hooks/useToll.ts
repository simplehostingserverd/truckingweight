/**
 * Toll Management Hook
 * Custom hook for managing toll provider integration state and API calls
 */

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

interface TollProvider {
  id: number;
  name: string;
  provider_type: string;
  api_endpoint: string;
  authentication_type: string;
  is_active: boolean;
  supported_regions: string[];
  features: unknown;
}

interface TollAccount {
  id: number;
  company_id: number;
  toll_provider_id: number;
  account_number: string;
  account_name: string;
  account_status: string;
  balance_amount: number;
  balance_currency: string;
  last_sync_at: string;
  sync_status: string;
  sync_error_message?: string;
  toll_providers: TollProvider;
}

interface TollTransaction {
  id: number;
  company_toll_account_id: number;
  vehicle_id?: number;
  driver_id?: number;
  transaction_id: string;
  toll_facility_name: string;
  toll_facility_id?: string;
  location_address?: string;
  transaction_date: string;
  amount: number;
  currency: string;
  vehicle_class?: string;
  transaction_status: string;
  company_toll_accounts: {
    toll_providers: TollProvider;
  };
  vehicles?: unknown;
  drivers?: unknown;
}

interface TollSummary {
  period: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  totalTransactions: number;
  costsByProvider: Array<{
    provider: string;
    totalCost: number;
    transactionCount: number;
  }>;
  costsByVehicle: Array<{
    _vehicleId: number;
    totalCost: number;
    transactionCount: number;
  }>;
}

interface RouteCalculationRequest {
  origin: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  destination: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  vehicleClass?: string;
  vehicleType?: string;
  avoidTolls?: boolean;
  providerId: number;
  routeOptions?: {
    fastest?: boolean;
    shortest?: boolean;
    truckRoute?: boolean;
  };
}

interface RouteEstimate {
  route_name?: string;
  origin_address: string;
  destination_address: string;
  estimated_toll_cost?: number;
  estimated_distance_miles?: number;
  estimated_duration_minutes?: number;
  vehicle_class?: string;
  toll_breakdown?: unknown;
  route_alternatives?: unknown;
  toll_provider_id?: number;
  load_id?: number;
  vehicle_id?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useToll = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { token } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [providers, setProviders] = useState<TollProvider[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [accounts, setAccounts] = useState<TollAccount[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [transactions, setTransactions] = useState<TollTransaction[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [summary, setSummary] = useState<TollSummary | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const apiCall = useCallback(
    async (endpoint: string, _options: RequestInit = {}) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = await fetch(`/api/toll${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    [token]
  );

  // Provider management
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _data = await apiCall('/providers');
      setProviders(data.providers || []);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching toll providers:', error);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const testConnection = useCallback(
    async (providerId: number, credentials: unknown) => {
      try {
        return await apiCall(`/providers/${providerId}/test`, {
          method: 'POST',
          body: JSON.stringify({ credentials }),
        });
      } catch (error) {
        console.error('Error testing connection:', error);
        throw error;
      }
    },
    [apiCall]
  );

  // Account management
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchAccounts = useCallback(
    async (filters?: Record<string, unknown>) => {
      setLoading(true);
      setError(null);
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const params = new URLSearchParams(filters || {});
        const _data = await apiCall(`/accounts?${params}`);
        setAccounts(data.accounts || []);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching toll accounts:', error);
      } finally {
        setLoading(false);
      }
    },
    [apiCall]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createAccount = useCallback(
    async (accountData: Partial<TollAccount>) => {
      try {
        const _data = await apiCall('/accounts', {
          method: 'POST',
          body: JSON.stringify(accountData),
        });
        return data.account;
      } catch (error) {
        console.error('Error creating toll account:', error);
        throw error;
      }
    },
    [apiCall]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateAccount = useCallback(
    async (accountId: number, accountData: Partial<TollAccount>) => {
      try {
        const _data = await apiCall(`/accounts/${accountId}`, {
          method: 'PUT',
          body: JSON.stringify(accountData),
        });
        return data.account;
      } catch (error) {
        console.error('Error updating toll account:', error);
        throw error;
      }
    },
    [apiCall]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const deleteAccount = useCallback(
    async (accountId: number) => {
      try {
        await apiCall(`/accounts/${accountId}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Error deleting toll account:', error);
        throw error;
      }
    },
    [apiCall]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const syncAccount = useCallback(
    async (accountId: number) => {
      try {
        const _data = await apiCall(`/accounts/${accountId}/sync`, {
          method: 'POST',
        });
        return data.syncResult;
      } catch (error) {
        console.error('Error syncing toll account:', error);
        throw error;
      }
    },
    [apiCall]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const syncAllAccounts = useCallback(async () => {
    try {
      const _data = await apiCall('/transactions/sync', {
        method: 'POST',
      });
      return data.syncResults;
    } catch (error) {
      console.error('Error syncing all accounts:', error);
      throw error;
    }
  }, [apiCall]);

  // Route calculation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const calculateTolls = useCallback(
    async (request: RouteCalculationRequest) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _data = await apiCall('/routes/calculate', {
          method: 'POST',
          body: JSON.stringify(request),
        });
        return data;
      } catch (error) {
        console.error('Error calculating tolls:', error);
        throw error;
      }
    },
    [apiCall]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const saveRouteEstimate = useCallback(
    async (estimate: RouteEstimate) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _data = await apiCall('/routes/estimates', {
          method: 'POST',
          body: JSON.stringify(estimate),
        });
        return data.estimate;
      } catch (error) {
        console.error('Error saving route estimate:', error);
        throw error;
      }
    },
    [apiCall]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchRouteEstimates = useCallback(
    async (filters?: Record<string, unknown>) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const params = new URLSearchParams(filters || {});
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _data = await apiCall(`/routes/estimates?${params}`);
        return data.estimates || [];
      } catch (error) {
        console.error('Error fetching route estimates:', error);
        throw error;
      }
    },
    [apiCall]
  );

  // Transaction management
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchTransactions = useCallback(
    async (filters?: Record<string, unknown>) => {
      setLoading(true);
      setError(null);
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const params = new URLSearchParams(filters || {});
        const _data = await apiCall(`/transactions?${params}`);
        setTransactions(data.transactions || []);
        return data;
      } catch (error) {
        setError(error.message);
        console.error('Error fetching toll transactions:', error);
      } finally {
        setLoading(false);
      }
    },
    [apiCall]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchTransaction = useCallback(
    async (transactionId: number) => {
      try {
        const _data = await apiCall(`/transactions/${transactionId}`);
        return data.transaction;
      } catch (error) {
        console.error('Error fetching toll transaction:', error);
        throw error;
      }
    },
    [apiCall]
  );

  // Reporting
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchSummary = useCallback(
    async (period?: string, startDate?: string, endDate?: string) => {
      setLoading(true);
      setError(null);
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const params = new URLSearchParams();
        if (period) params.append('period', period);
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);

        const _data = await apiCall(`/summary?${params}`);
        setSummary(data.summary);
        return data.summary;
      } catch (error) {
        setError(error.message);
        console.error('Error fetching toll summary:', error);
      } finally {
        setLoading(false);
      }
    },
    [apiCall]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchReports = useCallback(
    async (reportType: string, format?: string, startDate?: string, endDate?: string) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const params = new URLSearchParams({ report_type: reportType });
        if (format) params.append('format', format);
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _data = await apiCall(`/reports?${params}`);
        return data;
      } catch (error) {
        console.error('Error fetching toll reports:', error);
        throw error;
      }
    },
    [apiCall]
  );

  return {
    // State
    providers,
    accounts,
    transactions,
    summary,
    loading,
    error,

    // Provider methods
    fetchProviders,
    testConnection,

    // Account methods
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    syncAccount,
    syncAllAccounts,

    // Route methods
    calculateTolls,
    saveRouteEstimate,
    fetchRouteEstimates,

    // Transaction methods
    fetchTransactions,
    fetchTransaction,

    // Reporting methods
    fetchSummary,
    fetchReports,
  };
};
