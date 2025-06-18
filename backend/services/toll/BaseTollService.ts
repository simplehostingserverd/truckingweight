/**
 * Base Toll Service Class
 * Abstract class for all toll provider integrations
 */

import { logger } from '../../utils/logger';

export interface TollProviderConfig {
  apiKey?: string;
  apiSecret?: string;
  baseUrl: string;
  timeout?: number;
  rateLimit?: {
    requests: number;
    period: number; // in milliseconds
  };
}

export interface RouteRequest {
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
  routeOptions?: {
    fastest?: boolean;
    shortest?: boolean;
    truckRoute?: boolean;
  };
}

export interface TollCalculation {
  totalCost: number;
  currency: string;
  tollPoints: TollPoint[];
  route: {
    distance: number;
    duration: number;
    coordinates?: Array<[number, number]>;
  };
  alternatives?: TollCalculation[];
}

export interface TollPoint {
  facilityName: string;
  facilityId?: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  cost: number;
  vehicleClass?: string;
  entryTime?: Date;
  exitTime?: Date;
}

export interface AccountInfo {
  accountNumber: string;
  accountName: string;
  balance: number;
  currency: string;
  status: string;
  lastUpdated: Date;
}

export interface Transaction {
  transactionId: string;
  facilityName: string;
  facilityId?: string;
  amount: number;
  currency: string;
  transactionDate: Date;
  vehicleClass?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  entryTime?: Date;
  exitTime?: Date;
  status: string;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  errors: string[];
  syncDuration: number;
}

export abstract class BaseTollService {
  protected config: TollProviderConfig;
  protected providerName: string;
  protected lastRequestTime: number = 0;

  constructor(config: TollProviderConfig, providerName: string) {
    this.config = config;
    this.providerName = providerName;
  }

  /**
   * Rate limiting helper
   */
  protected async enforceRateLimit(): Promise<void> {
    if (!this.config.rateLimit) return;

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = this.config.rateLimit.period / this.config.rateLimit.requests;

    if (timeSinceLastRequest < minInterval) {
      const waitTime = minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Generic HTTP request helper with error handling
   */
  protected async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<any> {
    await this.enforceRateLimit();

    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      const requestOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...headers,
        },
        signal: AbortSignal.timeout(this.config.timeout || 30000),
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        requestOptions.body = JSON.stringify(data);
      }

      logger.info(`Making ${method} request to ${this.providerName}:`, { url, method });

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      logger.info(`${this.providerName} API response received successfully`);
      
      return result;
    } catch (error) {
      logger.error(`Error making request to ${this.providerName}:`, error);
      throw new Error(`${this.providerName} API error: ${error.message}`);
    }
  }

  /**
   * Get authentication headers - to be implemented by each provider
   */
  protected abstract getAuthHeaders(): Record<string, string>;

  /**
   * Test the connection to the toll provider
   */
  public abstract testConnection(): Promise<boolean>;

  /**
   * Calculate toll costs for a route
   */
  public abstract calculateTolls(request: RouteRequest): Promise<TollCalculation>;

  /**
   * Get account information
   */
  public abstract getAccountInfo(accountNumber: string): Promise<AccountInfo>;

  /**
   * Get transaction history
   */
  public abstract getTransactions(
    accountNumber: string,
    startDate: Date,
    endDate: Date,
    limit?: number
  ): Promise<Transaction[]>;

  /**
   * Sync account data (balance, transactions, etc.)
   */
  public abstract syncAccountData(accountNumber: string): Promise<SyncResult>;

  /**
   * Get supported regions/states
   */
  public abstract getSupportedRegions(): string[];

  /**
   * Get provider-specific features
   */
  public abstract getFeatures(): Record<string, boolean>;

  /**
   * Validate account credentials
   */
  public abstract validateCredentials(): Promise<boolean>;
}

export default BaseTollService;
