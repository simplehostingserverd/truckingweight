/**
 * I-Pass Toll Service
 * Integration with Illinois Tollway I-Pass API
 */

import { BaseTollService, TollProviderConfig, RouteRequest, TollCalculation, AccountInfo, Transaction, SyncResult } from './BaseTollService';
import { logger } from '../../utils/logger';

export interface IPassConfig extends TollProviderConfig {
  apiKey: string;
  accountNumber?: string;
  environment?: 'production' | 'sandbox';
}

export interface IPassTransaction {
  transactionId: string;
  tollPlaza?: string;
  facilityName?: string;
  plazaId?: string;
  facilityId?: string;
  amount: number;
  transactionDate: string;
  vehicleClass?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  entryTime?: string;
  exitTime?: string;
  status?: string;
}

export interface IPassViolation {
  violationId: string;
  amount: number;
  date: string;
  facilityName?: string;
  status?: string;
  vehicleClass?: string;
}

export interface IPassTransponder {
  transponderId: string;
  accountNumber: string;
  status: string;
  balance?: number;
  vehicleInfo?: {
    make?: string;
    model?: string;
    year?: number;
    licensePlate?: string;
  };
}

export interface IPassRouteResponse {
  totalTollCost?: number;
  distance?: number;
  estimatedTime?: number;
  routeCoordinates?: Array<[number, number]>;
  tollPlazas?: IPassTollPlaza[];
  alternativeRoutes?: IPassRouteResponse[];
}

export interface IPassTollPlaza {
  name?: string;
  plazaName?: string;
  id?: string;
  plazaId?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  toll?: number;
  cost?: number;
  vehicleClass?: string;
}

export interface IPassTollPoint {
  facilityName: string;
  facilityId?: string;
  location: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  cost: number;
  vehicleClass?: string;
}

export class IPassService extends BaseTollService {
  private config: IPassConfig;

  constructor(config: IPassConfig) {
    super(config, 'I-Pass');
    this.config = {
      baseUrl: config.environment === 'production' 
        ? 'https://api.illinoistollway.com/v1' 
        : 'https://sandbox-api.illinoistollway.com/v1',
      timeout: 30000,
      rateLimit: {
        requests: 60,
        period: 60000, // 60 requests per minute
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
      const response = await this.makeRequest('GET', '/health');
      return response.status === 'healthy' || response.status === 'ok';
    } catch (error) {
      logger.error('I-Pass connection test failed:', error);
      return false;
    }
  }

  public async calculateTolls(request: RouteRequest): Promise<TollCalculation> {
    try {
      // I-Pass API for toll calculation (hypothetical endpoint structure)
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
        vehicleClass: this.mapVehicleClass(request.vehicleClass),
        includeAlternatives: true,
      };

      const response = await this.makeRequest('POST', '/tolls/calculate', routeData);

      return this.parseRouteResponse(response);
    } catch (error) {
      logger.error('Error calculating tolls with I-Pass:', error);
      throw error;
    }
  }

  public async getAccountInfo(accountNumber: string): Promise<AccountInfo> {
    try {
      const response = await this.makeRequest('GET', `/accounts/${accountNumber}`);
      
      return {
        accountNumber: response.accountNumber,
        accountName: response.accountHolderName,
        balance: response.balance,
        currency: 'USD',
        status: response.status,
        lastUpdated: new Date(response.lastUpdated),
      };
    } catch (error) {
      logger.error('Error getting I-Pass account info:', error);
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
      });

      const response = await this.makeRequest('GET', `/accounts/${accountNumber}/transactions?${params}`);

      return response.transactions?.map((tx: IPassTransaction) => ({
        transactionId: tx.transactionId,
        facilityName: tx.tollPlaza || tx.facilityName,
        facilityId: tx.plazaId || tx.facilityId,
        amount: tx.amount,
        currency: 'USD',
        transactionDate: new Date(tx.transactionDate),
        vehicleClass: tx.vehicleClass,
        location: {
          latitude: tx.latitude,
          longitude: tx.longitude,
          address: tx.location,
        },
        entryTime: tx.entryTime ? new Date(tx.entryTime) : undefined,
        exitTime: tx.exitTime ? new Date(tx.exitTime) : undefined,
        status: tx.status || 'completed',
      })) || [];
    } catch (error) {
      logger.error('Error getting I-Pass transactions:', error);
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
    return ['IL', 'IN', 'WI']; // Illinois, Indiana, Wisconsin
  }

  public getFeatures(): Record<string, boolean> {
    return {
      accountManagement: true,
      transactionHistory: true,
      balanceInquiry: true,
      violationLookup: true,
      autoReplenishment: true,
      transponderManagement: true,
      tollCalculation: true,
      realTimeBalance: true,
    };
  }

  public async validateCredentials(): Promise<boolean> {
    return await this.testConnection();
  }

  public async getViolations(accountNumber: string): Promise<IPassViolation[]> {
    try {
      const response = await this.makeRequest('GET', `/accounts/${accountNumber}/violations`);
      return response.violations || [];
    } catch (error) {
      logger.error('Error getting I-Pass violations:', error);
      return [];
    }
  }

  public async getTransponders(accountNumber: string): Promise<IPassTransponder[]> {
    try {
      const response = await this.makeRequest('GET', `/accounts/${accountNumber}/transponders`);
      return response.transponders || [];
    } catch (error) {
      logger.error('Error getting I-Pass transponders:', error);
      return [];
    }
  }

  public async replenishAccount(accountNumber: string, amount: number): Promise<boolean> {
    try {
      const response = await this.makeRequest('POST', `/accounts/${accountNumber}/replenish`, {
        amount,
        paymentMethod: 'auto', // Assuming auto-replenishment
      });
      return response.success === true;
    } catch (error) {
      logger.error('Error replenishing I-Pass account:', error);
      return false;
    }
  }

  private mapVehicleClass(vehicleClass?: string): string {
    const mapping: Record<string, string> = {
      'car': 'Class1',
      'motorcycle': 'Class1',
      'truck': 'Class2',
      'bus': 'Class2',
      'rv': 'Class2',
    };

    return mapping[vehicleClass?.toLowerCase() || 'car'] || 'Class1';
  }

  private parseRouteResponse(response: IPassRouteResponse): TollCalculation {
    return {
      totalCost: response.totalTollCost || 0,
      currency: 'USD',
      tollPoints: this.parseTollPoints(response.tollPlazas || []),
      route: {
        distance: response.distance || 0,
        duration: response.estimatedTime || 0,
        coordinates: response.routeCoordinates,
      },
      alternatives: response.alternativeRoutes?.map((alt: IPassRouteResponse) => this.parseRouteResponse(alt)) || [],
    };
  }

  private parseTollPoints(tollPlazas: IPassTollPlaza[]): IPassTollPoint[] {
    return tollPlazas.map((plaza: IPassTollPlaza) => ({
      facilityName: plaza.name || plaza.plazaName,
      facilityId: plaza.id || plaza.plazaId,
      location: {
        latitude: plaza.latitude,
        longitude: plaza.longitude,
        address: plaza.address,
      },
      cost: plaza.toll || plaza.cost,
      vehicleClass: plaza.vehicleClass,
    }));
  }
}
