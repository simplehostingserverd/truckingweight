/**
 * Toll Services Index (JavaScript version)
 * Exports all toll-related services for Fastify server
 */

// Base service and types
export class BaseTollService {
  constructor(config, providerName) {
    this.config = config;
    this.providerName = providerName;
    this.lastRequestTime = 0;
  }

  /**
   * Rate limiting helper
   */
  async enforceRateLimit() {
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
  async makeRequest(method, endpoint, data, headers) {
    await this.enforceRateLimit();

    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      const requestOptions = {
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

      console.log(`Making ${method} request to ${this.providerName}:`, { url, method });

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log(`${this.providerName} API response received successfully`);
      
      return result;
    } catch (error) {
      console.error(`Error making request to ${this.providerName}:`, error);
      throw new Error(`${this.providerName} API error: ${error.message}`);
    }
  }

  /**
   * Abstract methods - to be implemented by each provider
   */
  getAuthHeaders() {
    throw new Error('getAuthHeaders must be implemented by subclass');
  }

  async testConnection() {
    throw new Error('testConnection must be implemented by subclass');
  }

  async calculateTolls(_request) {
    throw new Error('calculateTolls must be implemented by subclass');
  }

  async getAccountInfo(_accountNumber) {
    throw new Error('getAccountInfo must be implemented by subclass');
  }

  async getTransactions(_accountNumber, _startDate, _endDate, _limit) {
    throw new Error('getTransactions must be implemented by subclass');
  }

  async syncAccountData(_accountNumber) {
    throw new Error('syncAccountData must be implemented by subclass');
  }

  getSupportedRegions() {
    throw new Error('getSupportedRegions must be implemented by subclass');
  }

  getFeatures() {
    throw new Error('getFeatures must be implemented by subclass');
  }

  async validateCredentials() {
    throw new Error('validateCredentials must be implemented by subclass');
  }
}

// Toll Service Factory
export class TollServiceFactory {
  static instances = new Map();

  /**
   * Create a toll service instance for a specific provider
   */
  static createService(provider, config) {
    const key = `${provider}_${JSON.stringify(config)}`;
    
    if (this.instances.has(key)) {
      return this.instances.get(key);
    }

    let service;

    switch (provider) {
      case 'pcmiler':
        service = new PCMilerService(config);
        break;
      case 'ipass':
        service = new IPassService(config);
        break;
      case 'bestpass':
        service = new BestPassService(config);
        break;
      case 'prepass':
        service = new PrePassService(config);
        break;
      default:
        throw new Error(`Unsupported toll provider: ${provider}`);
    }

    this.instances.set(key, service);
    console.log(`Created toll service instance for provider: ${provider}`);
    
    return service;
  }

  /**
   * Get all available toll providers
   */
  static getAvailableProviders() {
    return ['pcmiler', 'ipass', 'bestpass', 'prepass'];
  }

  /**
   * Get provider information
   */
  static getProviderInfo(provider) {
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
   * Clear all cached service instances
   */
  static clearCache() {
    this.instances.clear();
    console.log('Cleared all toll service instances from cache');
  }
}

// Simple mock implementations for the providers
class PCMilerService extends BaseTollService {
  constructor(config) {
    super({
      baseUrl: 'https://api.pcmiler.com/v1',
      timeout: 30000,
      rateLimit: { requests: 100, period: 60000 },
      ...config,
    }, 'PC Miler');
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Accept': 'application/json',
    };
  }

  async testConnection() {
    // Mock implementation
    return true;
  }

  async validateCredentials() {
    return await this.testConnection();
  }

  getSupportedRegions() {
    return ['US', 'CA', 'MX'];
  }

  getFeatures() {
    return {
      routeOptimization: true,
      tollCalculation: true,
      mileageReports: true,
      truckRouting: true,
    };
  }

  async calculateTolls(_request) {
    // Mock implementation
    return {
      totalCost: 15.50,
      currency: 'USD',
      tollPoints: [],
      route: { distance: 100, duration: 120 },
    };
  }

  async getAccountInfo(_accountNumber) {
    return {
      accountNumber: _accountNumber,
      accountName: 'PC Miler Account',
      balance: 100,
      currency: 'USD',
      status: 'active',
      lastUpdated: new Date(),
    };
  }

  async getTransactions(_accountNumber, _startDate, _endDate, _limit) {
    return [];
  }

  async syncAccountData(_accountNumber) {
    return {
      success: true,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      errors: [],
      syncDuration: 1000,
    };
  }
}

class IPassService extends BaseTollService {
  constructor(config) {
    super({
      baseUrl: 'https://api.illinoistollway.com/v1',
      timeout: 30000,
      ...config,
    }, 'I-Pass');
  }

  getAuthHeaders() {
    return {
      'X-API-Key': this.config.apiKey,
      'Accept': 'application/json',
    };
  }

  async testConnection() {
    return true;
  }

  async validateCredentials() {
    return await this.testConnection();
  }

  getSupportedRegions() {
    return ['IL', 'IN', 'WI'];
  }

  getFeatures() {
    return {
      accountManagement: true,
      transactionHistory: true,
      balanceInquiry: true,
    };
  }

  async calculateTolls(_request) {
    return {
      totalCost: 8.25,
      currency: 'USD',
      tollPoints: [],
      route: { distance: 50, duration: 60 },
    };
  }

  async getAccountInfo(_accountNumber) {
    return {
      accountNumber: _accountNumber,
      accountName: 'I-Pass Account',
      balance: 50,
      currency: 'USD',
      status: 'active',
      lastUpdated: new Date(),
    };
  }

  async getTransactions(_accountNumber, _startDate, _endDate, _limit) {
    return [];
  }

  async syncAccountData(_accountNumber) {
    return {
      success: true,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      errors: [],
      syncDuration: 1000,
    };
  }
}

class BestPassService extends BaseTollService {
  constructor(config) {
    super({
      baseUrl: 'https://api.bestpass.com/v2',
      timeout: 30000,
      ...config,
    }, 'BestPass');
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Accept': 'application/json',
    };
  }

  async testConnection() {
    return true;
  }

  async validateCredentials() {
    return await this.testConnection();
  }

  getSupportedRegions() {
    return ['US'];
  }

  getFeatures() {
    return {
      multiStateCoverage: true,
      fleetManagement: true,
      consolidatedBilling: true,
    };
  }

  async calculateTolls(_request) {
    return {
      totalCost: 22.75,
      currency: 'USD',
      tollPoints: [],
      route: { distance: 150, duration: 180 },
    };
  }

  async getAccountInfo(_accountNumber) {
    return {
      accountNumber: _accountNumber,
      accountName: 'BestPass Account',
      balance: 200,
      currency: 'USD',
      status: 'active',
      lastUpdated: new Date(),
    };
  }

  async getTransactions(_accountNumber, _startDate, _endDate, _limit) {
    return [];
  }

  async syncAccountData(_accountNumber) {
    return {
      success: true,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      errors: [],
      syncDuration: 1000,
    };
  }
}

class PrePassService extends BaseTollService {
  constructor(config) {
    super({
      baseUrl: 'https://api.prepass.com/v1',
      timeout: 30000,
      ...config,
    }, 'PrePass');
  }

  getAuthHeaders() {
    return {
      'X-API-Key': this.config.apiKey,
      'Accept': 'application/json',
    };
  }

  async testConnection() {
    return true;
  }

  async validateCredentials() {
    return await this.testConnection();
  }

  getSupportedRegions() {
    return ['US', 'CA'];
  }

  getFeatures() {
    return {
      weighStationBypass: true,
      tollPayment: true,
      safetyCompliance: true,
    };
  }

  async calculateTolls(_request) {
    return {
      totalCost: 18.00,
      currency: 'USD',
      tollPoints: [],
      route: { distance: 120, duration: 150 },
    };
  }

  async getAccountInfo(_accountNumber) {
    return {
      accountNumber: _accountNumber,
      accountName: 'PrePass Account',
      balance: 75,
      currency: 'USD',
      status: 'active',
      lastUpdated: new Date(),
    };
  }

  async getTransactions(_accountNumber, _startDate, _endDate, _limit) {
    return [];
  }

  async syncAccountData(_accountNumber) {
    return {
      success: true,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      errors: [],
      syncDuration: 1000,
    };
  }
}

// Export everything
export {
  PCMilerService,
  IPassService,
  BestPassService,
  PrePassService,
};

export default {
  BaseTollService,
  PCMilerService,
  IPassService,
  BestPassService,
  PrePassService,
  TollServiceFactory,
};
