/**
 * BestPass Toll Service
 * Integration with BestPass API for multi-state toll management
 */

import { BaseTollService, TollProviderConfig, RouteRequest, TollCalculation, AccountInfo, Transaction, SyncResult } from './BaseTollService';
import { logger } from '../../utils/logger';

export interface BestPassConfig extends TollProviderConfig {
  clientId: string;
  clientSecret: string;
  environment?: 'production' | 'sandbox';
  accessToken?: string;
  refreshToken?: string;
}

export class BestPassService extends BaseTollService {
  private config: BestPassConfig;
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor(config: BestPassConfig) {
    super(config, 'BestPass');
    this.config = {
      baseUrl: config.environment === 'production' 
        ? 'https://api.bestpass.com/v2' 
        : 'https://sandbox-api.bestpass.com/v2',
      timeout: 30000,
      rateLimit: {
        requests: 120,
        period: 60000, // 120 requests per minute
      },
      environment: 'production',
      ...config,
    };
    this.accessToken = config.accessToken;
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Accept': 'application/json',
    };
  }

  public async testConnection(): Promise<boolean> {
    try {
      await this.ensureAuthenticated();
      const response = await this.makeRequest('GET', '/health');
      return response.status === 'healthy' || response.status === 'ok';
    } catch (_error) {
      logger.error('BestPass connection test failed:', error);
      return false;
    }
  }

  public async calculateTolls(request: RouteRequest): Promise<TollCalculation> {
    try {
      await this.ensureAuthenticated();
      
      const routeData = {
        origin: {
          address: request.origin.address,
          coordinates: request.origin.latitude && request.origin.longitude 
            ? { latitude: request.origin.latitude, longitude: request.origin.longitude }
            : undefined,
        },
        destination: {
          address: request.destination.address,
          coordinates: request.destination.latitude && request.destination.longitude 
            ? { latitude: request.destination.latitude, longitude: request.destination.longitude }
            : undefined,
        },
        vehicleProfile: {
          class: this.mapVehicleClass(request.vehicleClass),
          type: request.vehicleType,
        },
        routeOptions: {
          avoidTolls: request.avoidTolls || false,
          truckRoute: request.routeOptions?.truckRoute || false,
          fastest: request.routeOptions?.fastest || false,
        },
        includeAlternatives: true,
      };

      const response = await this.makeRequest('POST', '/routes/calculate', routeData);

      return this.parseRouteResponse(response);
    } catch (_error) {
      logger.error('Error calculating tolls with BestPass:', error);
      throw error;
    }
  }

  public async getAccountInfo(accountNumber: string): Promise<AccountInfo> {
    try {
      await this.ensureAuthenticated();
      const response = await this.makeRequest('GET', `/accounts/${accountNumber}`);
      
      return {
        accountNumber: response.accountNumber,
        accountName: response.companyName || response.accountName,
        balance: response.currentBalance,
        currency: 'USD',
        status: response.accountStatus,
        lastUpdated: new Date(response.lastUpdated),
      };
    } catch (_error) {
      logger.error('Error getting BestPass account info:', error);
      throw error;
    }
  }

  public async getTransactions(
    accountNumber: string,
    startDate: Date,
    endDate: Date,
    limit?: number
  ): Promise<Transaction[]> {
    try {
      await this.ensureAuthenticated();
      
      const params = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        limit: (limit || 100).toString(),
        includeDetails: 'true',
      });

      const response = await this.makeRequest('GET', `/accounts/${accountNumber}/transactions?${params}`);

      return response.transactions?.map((tx: any) => ({
        transactionId: tx.transactionId,
        facilityName: tx.tollFacility?.name || tx.facilityName,
        facilityId: tx.tollFacility?.id || tx.facilityId,
        amount: tx.tollAmount,
        currency: 'USD',
        transactionDate: new Date(tx.transactionDateTime),
        vehicleClass: tx.vehicleClass,
        location: {
          latitude: tx.location?.latitude,
          longitude: tx.location?.longitude,
          address: tx.location?.address,
        },
        entryTime: tx.entryDateTime ? new Date(tx.entryDateTime) : undefined,
        exitTime: tx.exitDateTime ? new Date(tx.exitDateTime) : undefined,
        status: tx.transactionStatus || 'completed',
      })) || [];
    } catch (_error) {
      logger.error('Error getting BestPass transactions:', error);
      return [];
    }
  }

  public async syncAccountData(accountNumber: string): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let recordsProcessed = 0;
    let recordsCreated = 0;
    let recordsUpdated = 0;

    try {
      await this.ensureAuthenticated();

      // Sync account info
      const _accountInfo = await this.getAccountInfo(accountNumber);
      recordsProcessed++;
      recordsUpdated++;

      // Sync recent transactions (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const transactions = await this.getTransactions(accountNumber, startDate, endDate);
      recordsProcessed += transactions.length;
      recordsCreated += transactions.length;

      // Sync violations if any
      const violations = await this.getViolations(accountNumber);
      recordsProcessed += violations.length;
      recordsCreated += violations.length;

      return {
        success: true,
        recordsProcessed,
        recordsCreated,
        recordsUpdated,
        errors,
        syncDuration: Date.now() - startTime,
      };
    } catch (_error) {
      errors.push(error.message);
      return {
        success: false,
        recordsProcessed,
        recordsCreated,
        recordsUpdated,
        errors,
        syncDuration: Date.now() - startTime,
      };
    }
  }

  public getSupportedRegions(): string[] {
    return [
      'AL', 'CA', 'CO', 'DE', 'FL', 'GA', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 
      'ME', 'NC', 'NH', 'NJ', 'NY', 'OH', 'OK', 'PA', 'RI', 'SC', 'TN', 'TX', 'UT', 
      'VA', 'WA', 'WV'
    ]; // Most US states
  }

  public getFeatures(): Record<string, boolean> {
    return {
      multiStateCoverage: true,
      fleetManagement: true,
      consolidatedBilling: true,
      violationManagement: true,
      realTimeReporting: true,
      customReports: true,
      apiAccess: true,
      mobileApp: true,
      customerSupport: true,
      fraudProtection: true,
    };
  }

  public async validateCredentials(): Promise<boolean> {
    try {
      await this.authenticate();
      return true;
    } catch (_error) {
      return false;
    }
  }

  public async getViolations(accountNumber: string): Promise<any[]> {
    try {
      await this.ensureAuthenticated();
      const response = await this.makeRequest('GET', `/accounts/${accountNumber}/violations`);
      return response.violations || [];
    } catch (_error) {
      logger.error('Error getting BestPass violations:', error);
      return [];
    }
  }

  public async getFleetVehicles(accountNumber: string): Promise<any[]> {
    try {
      await this.ensureAuthenticated();
      const response = await this.makeRequest('GET', `/accounts/${accountNumber}/vehicles`);
      return response.vehicles || [];
    } catch (_error) {
      logger.error('Error getting BestPass fleet vehicles:', error);
      return [];
    }
  }

  private async authenticate(): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000));
      
      logger.info('BestPass authentication successful');
    } catch (_error) {
      logger.error('BestPass authentication failed:', error);
      throw error;
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken || (this.tokenExpiry && this.tokenExpiry <= new Date())) {
      await this.authenticate();
    }
  }

  private mapVehicleClass(vehicleClass?: string): string {
    const mapping: Record<string, string> = {
      'car': '2-axle',
      'motorcycle': '2-axle',
      'truck': '3-axle',
      'semi': '5-axle',
      'bus': '3-axle',
      'rv': '3-axle',
    };

    return mapping[vehicleClass?.toLowerCase() || 'truck'] || '3-axle';
  }

  private parseRouteResponse(response: any): TollCalculation {
    const route = response.primaryRoute || response;
    
    return {
      totalCost: route.totalTollCost || 0,
      currency: 'USD',
      tollPoints: this.parseTollPoints(route.tollFacilities || []),
      route: {
        distance: route.totalDistance || 0,
        duration: route.estimatedTravelTime || 0,
        coordinates: route.routeGeometry,
      },
      alternatives: response.alternativeRoutes?.map((alt: any) => this.parseRouteResponse(alt)) || [],
    };
  }

  private parseTollPoints(tollFacilities: any[]): any[] {
    return tollFacilities.map((facility: any) => ({
      facilityName: facility.name,
      facilityId: facility.id,
      location: {
        latitude: facility.location?.latitude || 0,
        longitude: facility.location?.longitude || 0,
        address: facility.location?.address,
      },
      cost: facility.tollCost || 0,
      vehicleClass: facility.vehicleClass,
    }));
  }
}
