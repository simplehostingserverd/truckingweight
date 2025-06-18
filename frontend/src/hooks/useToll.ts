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
  features: any;
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
  vehicles?: any;
  drivers?: any;
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
    vehicleId: number;
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
  toll_breakdown?: any;
  route_alternatives?: any;
  toll_provider_id?: number;
  load_id?: number;
  vehicle_id?: number;
}

export const useToll = () => {
  const { token } = useAuth();
  const [providers, setProviders] = useState<TollProvider[]>([]);
  const [accounts, setAccounts] = useState<TollAccount[]>([]);
  const [transactions, setTransactions] = useState<TollTransaction[]>([]);
  const [summary, setSummary] = useState<TollSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`/api/toll${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }, [token]);

  // Provider management
  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiCall('/providers');
      setProviders(data.providers || []);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching toll providers:', error);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const testConnection = useCallback(async (providerId: number, credentials: any) => {
    try {
      return await apiCall(`/providers/${providerId}/test`, {
        method: 'POST',
        body: JSON.stringify({ credentials }),
      });
    } catch (error) {
      console.error('Error testing connection:', error);
      throw error;
    }
  }, [apiCall]);

  // Account management
  const fetchAccounts = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters || {});
      const data = await apiCall(`/accounts?${params}`);
      setAccounts(data.accounts || []);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching toll accounts:', error);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const createAccount = useCallback(async (accountData: Partial<TollAccount>) => {
    try {
      const data = await apiCall('/accounts', {
        method: 'POST',
        body: JSON.stringify(accountData),
      });
      return data.account;
    } catch (error) {
      console.error('Error creating toll account:', error);
      throw error;
    }
  }, [apiCall]);

  const updateAccount = useCallback(async (accountId: number, accountData: Partial<TollAccount>) => {
    try {
      const data = await apiCall(`/accounts/${accountId}`, {
        method: 'PUT',
        body: JSON.stringify(accountData),
      });
      return data.account;
    } catch (error) {
      console.error('Error updating toll account:', error);
      throw error;
    }
  }, [apiCall]);

  const deleteAccount = useCallback(async (accountId: number) => {
    try {
      await apiCall(`/accounts/${accountId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting toll account:', error);
      throw error;
    }
  }, [apiCall]);

  const syncAccount = useCallback(async (accountId: number) => {
    try {
      const data = await apiCall(`/accounts/${accountId}/sync`, {
        method: 'POST',
      });
      return data.syncResult;
    } catch (error) {
      console.error('Error syncing toll account:', error);
      throw error;
    }
  }, [apiCall]);

  const syncAllAccounts = useCallback(async () => {
    try {
      const data = await apiCall('/transactions/sync', {
        method: 'POST',
      });
      return data.syncResults;
    } catch (error) {
      console.error('Error syncing all accounts:', error);
      throw error;
    }
  }, [apiCall]);

  // Route calculation
  const calculateTolls = useCallback(async (request: RouteCalculationRequest) => {
    try {
      const data = await apiCall('/routes/calculate', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      return data;
    } catch (error) {
      console.error('Error calculating tolls:', error);
      throw error;
    }
  }, [apiCall]);

  const saveRouteEstimate = useCallback(async (estimate: RouteEstimate) => {
    try {
      const data = await apiCall('/routes/estimates', {
        method: 'POST',
        body: JSON.stringify(estimate),
      });
      return data.estimate;
    } catch (error) {
      console.error('Error saving route estimate:', error);
      throw error;
    }
  }, [apiCall]);

  const fetchRouteEstimates = useCallback(async (filters?: any) => {
    try {
      const params = new URLSearchParams(filters || {});
      const data = await apiCall(`/routes/estimates?${params}`);
      return data.estimates || [];
    } catch (error) {
      console.error('Error fetching route estimates:', error);
      throw error;
    }
  }, [apiCall]);

  // Transaction management
  const fetchTransactions = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters || {});
      const data = await apiCall(`/transactions?${params}`);
      setTransactions(data.transactions || []);
      return data;
    } catch (error) {
      setError(error.message);
      console.error('Error fetching toll transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const fetchTransaction = useCallback(async (transactionId: number) => {
    try {
      const data = await apiCall(`/transactions/${transactionId}`);
      return data.transaction;
    } catch (error) {
      console.error('Error fetching toll transaction:', error);
      throw error;
    }
  }, [apiCall]);

  // Reporting
  const fetchSummary = useCallback(async (period?: string, startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const data = await apiCall(`/summary?${params}`);
      setSummary(data.summary);
      return data.summary;
    } catch (error) {
      setError(error.message);
      console.error('Error fetching toll summary:', error);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const fetchReports = useCallback(async (reportType: string, format?: string, startDate?: string, endDate?: string) => {
    try {
      const params = new URLSearchParams({ report_type: reportType });
      if (format) params.append('format', format);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const data = await apiCall(`/reports?${params}`);
      return data;
    } catch (error) {
      console.error('Error fetching toll reports:', error);
      throw error;
    }
  }, [apiCall]);

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
