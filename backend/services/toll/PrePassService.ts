/**
 * PrePass Toll Service
 * Integration with PrePass API for weigh station bypass and toll payment
 */

import { BaseTollService, TollProviderConfig, RouteRequest, TollCalculation, AccountInfo, Transaction, SyncResult } from './BaseTollService';
import { logger } from '../../utils/logger';

export interface PrePassConfig extends TollProviderConfig {
  apiKey: string;
  customerId?: string;
  environment?: 'production' | 'sandbox';
}

export interface WeighStationBypass {
  stationId: string;
  stationName: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  bypassEligible: boolean;
  bypassStatus: 'green' | 'red' | 'unknown';
  lastBypassTime?: Date;
}

export class PrePassService extends BaseTollService {
  private config: PrePassConfig;

  constructor(config: PrePassConfig) {
    super(config, 'PrePass');
    this.config = {
      baseUrl: config.environment === 'production' 
        ? 'https://api.prepass.com/v1' 
        : 'https://sandbox-api.prepass.com/v1',
      timeout: 30000,
      rateLimit: {
        requests: 100,
        period: 60000, // 100 requests per minute
      },
      environment: 'production',
      ...config,
    };
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      'X-API-Key': this.config.apiKey,
      'Accept': 'application/json',
    };
  }

  public async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('GET', '/status');
      return response.status === 'operational' || response.status === 'ok';
    } catch (error) {
      logger.error('PrePass connection test failed:', error);
      return false;
    }
  }

  public async calculateTolls(request: RouteRequest): Promise<TollCalculation> {
    try {
      const routeData = {
        origin: {
          address: request.origin.address,
          coordinates: request.origin.latitude && request.origin.longitude 
            ? { lat: request.origin.latitude, lng: request.origin.longitude }
            : undefined,
        },
        destination: {
          address: request.destination.address,
          coordinates: request.destination.latitude && request.destination.longitude 
            ? { lat: request.destination.latitude, lng: request.destination.longitude }
            : undefined,
        },
        vehicleProfile: {
          class: this.mapVehicleClass(request.vehicleClass),
          type: request.vehicleType || 'truck',
        },
        includeWeighStations: true,
        includeTolls: true,
      };

      const response = await this.makeRequest('POST', '/routes/analyze', routeData);

      return this.parseRouteResponse(response);
    } catch (error) {
      logger.error('Error calculating tolls with PrePass:', error);
      throw error;
    }
  }

  public async getAccountInfo(accountNumber: string): Promise<AccountInfo> {
    try {
      const response = await this.makeRequest('GET', `/customers/${accountNumber}/account`);
      
      return {
        accountNumber: response.customerId,
        accountName: response.companyName,
        balance: response.accountBalance,
        currency: 'USD',
        status: response.accountStatus,
        lastUpdated: new Date(response.lastUpdated),
      };
    } catch (error) {
      logger.error('Error getting PrePass account info:', error);
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
      const params = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        limit: (limit || 100).toString(),
        type: 'toll', // Filter for toll transactions only
      });

      const response = await this.makeRequest('GET', `/customers/${accountNumber}/transactions?${params}`);

      return response.transactions?.map((tx: any) => ({
        transactionId: tx.transactionId,
        facilityName: tx.tollFacility || tx.facilityName,
        facilityId: tx.facilityId,
        amount: tx.amount,
        currency: 'USD',
        transactionDate: new Date(tx.transactionDate),
        vehicleClass: tx.vehicleClass,
        location: {
          latitude: tx.location?.latitude,
          longitude: tx.location?.longitude,
          address: tx.location?.address,
        },
        status: tx.status || 'completed',
      })) || [];
    } catch (error) {
      logger.error('Error getting PrePass transactions:', error);
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

      // Sync weigh station bypass history
      const bypassHistory = await this.getWeighStationBypassHistory(accountNumber, startDate, endDate);
      recordsProcessed += bypassHistory.length;
      recordsCreated += bypassHistory.length;

      return {
        success: true,
        recordsProcessed,
        recordsCreated,
        recordsUpdated,
        errors,
        syncDuration: Date.now() - startTime,
      };
    } catch (error) {
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
    return ['US', 'CA']; // United States and Canada
  }

  public getFeatures(): Record<string, boolean> {
    return {
      weighStationBypass: true,
      tollPayment: true,
      safetyCompliance: true,
      fleetTracking: true,
      realTimeNotifications: true,
      bypassHistory: true,
      complianceReporting: true,
      mobileApp: true,
      customerSupport: true,
      integrationAPI: true,
    };
  }

  public async validateCredentials(): Promise<boolean> {
    return await this.testConnection();
  }

  public async getWeighStationBypassHistory(
    accountNumber: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        type: 'bypass',
      });

      const response = await this.makeRequest('GET', `/customers/${accountNumber}/bypass-history?${params}`);
      return response.bypassEvents || [];
    } catch (error) {
      logger.error('Error getting PrePass bypass history:', error);
      return [];
    }
  }

  public async getWeighStationsOnRoute(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ): Promise<WeighStationBypass[]> {
    try {
      const routeData = {
        origin: { lat: origin.latitude, lng: origin.longitude },
        destination: { lat: destination.latitude, lng: destination.longitude },
      };

      const response = await this.makeRequest('POST', '/routes/weigh-stations', routeData);

      return response.weighStations?.map((station: any) => ({
        stationId: station.id,
        stationName: station.name,
        location: {
          latitude: station.location.latitude,
          longitude: station.location.longitude,
          address: station.location.address,
        },
        bypassEligible: station.bypassEligible,
        bypassStatus: station.currentStatus || 'unknown',
      })) || [];
    } catch (error) {
      logger.error('Error getting weigh stations on route:', error);
      return [];
    }
  }

  public async getVehicleStatus(vehicleId: string): Promise<any> {
    try {
      const response = await this.makeRequest('GET', `/vehicles/${vehicleId}/status`);
      return {
        vehicleId: response.vehicleId,
        currentLocation: response.location,
        bypassEligible: response.bypassEligible,
        complianceStatus: response.complianceStatus,
        lastUpdate: new Date(response.lastUpdate),
      };
    } catch (error) {
      logger.error('Error getting PrePass vehicle status:', error);
      return null;
    }
  }

  public async requestBypass(vehicleId: string, stationId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest('POST', `/vehicles/${vehicleId}/request-bypass`, {
        stationId,
        timestamp: new Date().toISOString(),
      });
      return response.bypassGranted === true;
    } catch (error) {
      logger.error('Error requesting PrePass bypass:', error);
      return false;
    }
  }

  private mapVehicleClass(vehicleClass?: string): string {
    const mapping: Record<string, string> = {
      'truck': 'commercial',
      'semi': 'commercial',
      'bus': 'commercial',
      'rv': 'recreational',
      'car': 'passenger',
    };

    return mapping[vehicleClass?.toLowerCase() || 'truck'] || 'commercial';
  }

  private parseRouteResponse(response: any): TollCalculation {
    return {
      totalCost: response.totalTollCost || 0,
      currency: 'USD',
      tollPoints: this.parseTollPoints(response.tollFacilities || []),
      route: {
        distance: response.totalDistance || 0,
        duration: response.estimatedTravelTime || 0,
        coordinates: response.routeCoordinates,
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
