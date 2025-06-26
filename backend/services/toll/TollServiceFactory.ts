/**
 * Toll Service Factory
 * Factory class to create and manage toll provider service instances
 */

import { BaseTollService } from './BaseTollService';
import { PCMilerService, PCMilerConfig } from './PCMilerService';
import { IPassService, IPassConfig } from './IPassService';
import { BestPassService, BestPassConfig } from './BestPassService';
import { PrePassService, PrePassConfig } from './PrePassService';
import { logger } from '../../utils/logger';

export type TollProviderType = 'pcmiler' | 'ipass' | 'bestpass' | 'prepass';

export interface TollProviderCredentials {
  pcmiler?: PCMilerConfig;
  ipass?: IPassConfig;
  bestpass?: BestPassConfig;
  prepass?: PrePassConfig;
}

export type TollProviderConfig = PCMilerConfig | IPassConfig | BestPassConfig | PrePassConfig;

export interface TollProviderInfo {
  name: string;
  type: string;
  description: string;
  supportedRegions: string[];
  features: Record<string, boolean>;
  authType: string;
  website: string;
}

export class TollServiceFactory {
  private static instances: Map<string, BaseTollService> = new Map();

  /**
   * Create a toll service instance for a specific provider
   */
  public static createService(
    provider: TollProviderType,
    config: TollProviderConfig
  ): BaseTollService {
    const key = `${provider}_${JSON.stringify(config)}`;
    
    if (this.instances.has(key)) {
      return this.instances.get(key)!;
    }

    let service: BaseTollService;

    switch (provider) {
      case 'pcmiler':
        service = new PCMilerService(config as PCMilerConfig);
        break;
      case 'ipass':
        service = new IPassService(config as IPassConfig);
        break;
      case 'bestpass':
        service = new BestPassService(config as BestPassConfig);
        break;
      case 'prepass':
        service = new PrePassService(config as PrePassConfig);
        break;
      default:
        throw new Error(`Unsupported toll provider: ${provider}`);
    }

    this.instances.set(key, service);
    logger.info(`Created toll service instance for provider: ${provider}`);
    
    return service;
  }

  /**
   * Get all available toll providers
   */
  public static getAvailableProviders(): TollProviderType[] {
    return ['pcmiler', 'ipass', 'bestpass', 'prepass'];
  }

  /**
   * Get provider information
   */
  public static getProviderInfo(provider: TollProviderType): TollProviderInfo {
    const providerInfo = {
      pcmiler: {
        name: 'PC Miler',
        type: 'route_planning',
        description: 'Route optimization and toll calculation for North America',
        supportedRegions: ['US', 'CA', 'MX'],
        features: {
          routeOptimization: true,
          tollCalculation: true,
          mileageReports: true,
          truckRouting: true,
          hazmatRouting: true,
          realTimeTraffic: true,
        },
        authType: 'api_key',
        website: 'https://www.pcmiler.com',
      },
      ipass: {
        name: 'I-Pass',
        type: 'transponder',
        description: 'Illinois Tollway electronic toll collection system',
        supportedRegions: ['IL', 'IN', 'WI'],
        features: {
          accountManagement: true,
          transactionHistory: true,
          balanceInquiry: true,
          violationLookup: true,
          autoReplenishment: true,
        },
        authType: 'api_key',
        website: 'https://www.illinoistollway.com',
      },
      bestpass: {
        name: 'BestPass',
        type: 'payment_system',
        description: 'Multi-state toll management and payment system',
        supportedRegions: ['US'], // Most US states
        features: {
          multiStateCoverage: true,
          fleetManagement: true,
          consolidatedBilling: true,
          violationManagement: true,
          realTimeReporting: true,
        },
        authType: 'oauth',
        website: 'https://www.bestpass.com',
      },
      prepass: {
        name: 'PrePass',
        type: 'transponder',
        description: 'Weigh station bypass and toll payment system',
        supportedRegions: ['US', 'CA'],
        features: {
          weighStationBypass: true,
          tollPayment: true,
          safetyCompliance: true,
          fleetTracking: true,
          realTimeNotifications: true,
        },
        authType: 'api_key',
        website: 'https://www.prepass.com',
      },
    };

    return providerInfo[provider];
  }

  /**
   * Validate provider configuration
   */
  public static validateConfig(provider: TollProviderType, config: TollProviderConfig): boolean {
    try {
      switch (provider) {
        case 'pcmiler':
          return !!(config.apiKey && config.baseUrl);
        case 'ipass':
          return !!(config.apiKey && config.baseUrl);
        case 'bestpass':
          return !!(config.clientId && config.clientSecret && config.baseUrl);
        case 'prepass':
          return !!(config.apiKey && config.baseUrl);
        default:
          return false;
      }
    } catch (error) {
      logger.error(`Error validating config for ${provider}:`, error);
      return false;
    }
  }

  /**
   * Test connection for all configured providers
   */
  public static async testAllConnections(credentials: TollProviderCredentials): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const provider of this.getAvailableProviders()) {
      if (credentials[provider]) {
        try {
          const service = this.createService(provider, credentials[provider]);
          results[provider] = await service.testConnection();
        } catch (error) {
          logger.error(`Error testing connection for ${provider}:`, error);
          results[provider] = false;
        }
      } else {
        results[provider] = false;
      }
    }

    return results;
  }

  /**
   * Get the best provider for a specific route
   */
  public static getBestProviderForRoute(
    origin: { latitude: number; longitude: number; state?: string },
    destination: { latitude: number; longitude: number; state?: string },
    availableProviders: TollProviderType[]
  ): TollProviderType | null {
    // Simple logic to determine best provider based on route
    const states = [origin.state, destination.state].filter(Boolean);
    
    // If route includes Illinois, prefer I-Pass
    if (states.includes('IL') && availableProviders.includes('ipass')) {
      return 'ipass';
    }

    // For multi-state routes, prefer BestPass
    if (states.length > 1 && availableProviders.includes('bestpass')) {
      return 'bestpass';
    }

    // For truck routes, prefer PrePass
    if (availableProviders.includes('prepass')) {
      return 'prepass';
    }

    // Default to PC Miler for route planning
    if (availableProviders.includes('pcmiler')) {
      return 'pcmiler';
    }

    return availableProviders[0] || null;
  }

  /**
   * Clear all cached service instances
   */
  public static clearCache(): void {
    this.instances.clear();
    logger.info('Cleared all toll service instances from cache');
  }

  /**
   * Get cached service instance count
   */
  public static getCacheSize(): number {
    return this.instances.size;
  }
}

export default TollServiceFactory;
