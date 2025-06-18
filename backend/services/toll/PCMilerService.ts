/**
 * PC Miler Toll Service
 * Integration with PC Miler API for route planning and toll calculation
 */

import { BaseTollService, TollProviderConfig, RouteRequest, TollCalculation, AccountInfo, Transaction, SyncResult } from './BaseTollService';
import { logger } from '../../utils/logger';

export interface PCMilerConfig extends TollProviderConfig {
  apiKey: string;
  region?: 'NA' | 'EU' | 'AF'; // North America, Europe, Africa
  units?: 'Miles' | 'Kilometers';
  routeType?: 'Practical' | 'Shortest' | 'Fastest';
}

export class PCMilerService extends BaseTollService {
  private config: PCMilerConfig;

  constructor(config: PCMilerConfig) {
    super(config, 'PC Miler');
    this.config = {
      baseUrl: 'https://api.pcmiler.com/v1',
      timeout: 30000,
      rateLimit: {
        requests: 100,
        period: 60000, // 100 requests per minute
      },
      region: 'NA',
      units: 'Miles',
      routeType: 'Practical',
      ...config,
    };
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Accept': 'application/json',
    };
  }

  public async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('GET', '/ping');
      return response.status === 'ok';
    } catch (error) {
      logger.error('PC Miler connection test failed:', error);
      return false;
    }
  }

  public async calculateTolls(request: RouteRequest): Promise<TollCalculation> {
    try {
      const routeData = {
        Stops: [
          {
            Address: request.origin.address,
            Coords: request.origin.latitude && request.origin.longitude 
              ? `${request.origin.latitude},${request.origin.longitude}` 
              : undefined,
          },
          {
            Address: request.destination.address,
            Coords: request.destination.latitude && request.destination.longitude 
              ? `${request.destination.latitude},${request.destination.longitude}` 
              : undefined,
          },
        ],
        ReportType: 'Detailed',
        RouteType: this.config.routeType,
        Units: this.config.units,
        Region: this.config.region,
        VehicleType: this.mapVehicleType(request.vehicleType),
        IncludeTolls: true,
        IncludeRouteGeometry: true,
        Options: {
          AvoidTolls: request.avoidTolls || false,
          TruckRoute: request.routeOptions?.truckRoute || false,
        },
      };

      const response = await this.makeRequest('POST', '/route', routeData);

      return this.parseRouteResponse(response);
    } catch (error) {
      logger.error('Error calculating tolls with PC Miler:', error);
      throw error;
    }
  }

  public async getAccountInfo(accountNumber: string): Promise<AccountInfo> {
    // PC Miler is primarily a route planning service, not an account-based toll service
    // This would typically be used for API usage tracking
    try {
      const response = await this.makeRequest('GET', `/account/${accountNumber}`);
      
      return {
        accountNumber: response.accountNumber,
        accountName: response.accountName,
        balance: response.apiCredits || 0,
        currency: 'USD',
        status: response.status || 'active',
        lastUpdated: new Date(),
      };
    } catch (error) {
      logger.error('Error getting PC Miler account info:', error);
      throw error;
    }
  }

  public async getTransactions(
    accountNumber: string,
    startDate: Date,
    endDate: Date,
    limit?: number
  ): Promise<Transaction[]> {
    // PC Miler doesn't have traditional toll transactions
    // This would return API usage history instead
    try {
      const response = await this.makeRequest('GET', `/account/${accountNumber}/usage`, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: limit || 100,
      });

      return response.usage?.map((usage: any) => ({
        transactionId: usage.id,
        facilityName: 'PC Miler API Usage',
        amount: usage.cost || 0,
        currency: 'USD',
        transactionDate: new Date(usage.timestamp),
        status: 'completed',
      })) || [];
    } catch (error) {
      logger.error('Error getting PC Miler usage history:', error);
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

      // Sync recent usage (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const transactions = await this.getTransactions(accountNumber, startDate, endDate);
      recordsProcessed += transactions.length;
      recordsCreated += transactions.length;

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
    return ['US', 'CA', 'MX']; // North America
  }

  public getFeatures(): Record<string, boolean> {
    return {
      routeOptimization: true,
      tollCalculation: true,
      mileageReports: true,
      truckRouting: true,
      hazmatRouting: true,
      realTimeTraffic: true,
      multipleStops: true,
      routeAlternatives: true,
      geocoding: true,
      reverseGeocoding: true,
    };
  }

  public async validateCredentials(): Promise<boolean> {
    return await this.testConnection();
  }

  private mapVehicleType(vehicleType?: string): string {
    const mapping: Record<string, string> = {
      'truck': 'Truck',
      'car': 'Auto',
      'motorcycle': 'Auto',
      'bus': 'Bus',
      'rv': 'RV',
    };

    return mapping[vehicleType?.toLowerCase() || 'truck'] || 'Truck';
  }

  private parseRouteResponse(response: any): TollCalculation {
    const route = response.Route || response;
    
    return {
      totalCost: route.TollCost || 0,
      currency: 'USD',
      tollPoints: this.parseTollPoints(route.TollDetails || []),
      route: {
        distance: route.TMiles || route.Distance || 0,
        duration: route.TTime || route.Duration || 0,
        coordinates: this.parseRouteGeometry(route.Geometry),
      },
      alternatives: route.Alternatives?.map((alt: any) => this.parseRouteResponse(alt)) || [],
    };
  }

  private parseTollPoints(tollDetails: any[]): any[] {
    return tollDetails.map((toll: any) => ({
      facilityName: toll.Name || toll.FacilityName || 'Unknown Toll',
      facilityId: toll.Id || toll.FacilityId,
      location: {
        latitude: toll.Lat || toll.Latitude || 0,
        longitude: toll.Lon || toll.Longitude || 0,
        address: toll.Address,
      },
      cost: toll.Cost || toll.Amount || 0,
      vehicleClass: toll.VehicleClass,
    }));
  }

  private parseRouteGeometry(geometry: any): Array<[number, number]> | undefined {
    if (!geometry) return undefined;
    
    // PC Miler typically returns geometry as encoded polyline or coordinate array
    if (Array.isArray(geometry)) {
      return geometry.map((point: any) => [point.Lat || point[1], point.Lon || point[0]]);
    }
    
    return undefined;
  }
}
