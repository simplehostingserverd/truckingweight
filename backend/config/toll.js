/**
 * Toll Provider Configuration (JavaScript version)
 * Centralized configuration for all toll management providers
 */

/**
 * Load toll provider configuration from environment variables
 */
export function loadTollConfig() {
  const config = {
    pcmiler: {
      apiKey: process.env.PCMILER_API_KEY,
      baseUrl: process.env.PCMILER_BASE_URL || 'https://api.pcmiler.com/v1',
      region: process.env.PCMILER_REGION || 'NA',
      units: process.env.PCMILER_UNITS || 'Miles',
      routeType: process.env.PCMILER_ROUTE_TYPE || 'Practical',
      enabled: !!process.env.PCMILER_API_KEY,
    },
    ipass: {
      apiKey: process.env.IPASS_API_KEY,
      baseUrl: process.env.IPASS_BASE_URL || 'https://api.illinoistollway.com/v1',
      environment: process.env.IPASS_ENVIRONMENT || 'production',
      enabled: !!process.env.IPASS_API_KEY,
    },
    bestpass: {
      clientId: process.env.BESTPASS_CLIENT_ID,
      clientSecret: process.env.BESTPASS_CLIENT_SECRET,
      baseUrl: process.env.BESTPASS_BASE_URL || 'https://api.bestpass.com/v2',
      environment: process.env.BESTPASS_ENVIRONMENT || 'production',
      enabled: !!(process.env.BESTPASS_CLIENT_ID && process.env.BESTPASS_CLIENT_SECRET),
    },
    prepass: {
      apiKey: process.env.PREPASS_API_KEY,
      baseUrl: process.env.PREPASS_BASE_URL || 'https://api.prepass.com/v1',
      customerId: process.env.PREPASS_CUSTOMER_ID,
      environment: process.env.PREPASS_ENVIRONMENT || 'production',
      enabled: !!process.env.PREPASS_API_KEY,
    },
    general: {
      syncIntervalMinutes: parseInt(process.env.TOLL_SYNC_INTERVAL_MINUTES || '60'),
      cacheTtlMinutes: parseInt(process.env.TOLL_CACHE_TTL_MINUTES || '30'),
      maxRetryAttempts: parseInt(process.env.TOLL_MAX_RETRY_ATTEMPTS || '3'),
      requestTimeoutMs: parseInt(process.env.TOLL_REQUEST_TIMEOUT_MS || '30000'),
    },
  };

  // Log configuration status (without sensitive data)
  console.log('Toll provider configuration loaded:', {
    pcmiler: { enabled: config.pcmiler.enabled, baseUrl: config.pcmiler.baseUrl },
    ipass: { enabled: config.ipass.enabled, baseUrl: config.ipass.baseUrl },
    bestpass: { enabled: config.bestpass.enabled, baseUrl: config.bestpass.baseUrl },
    prepass: { enabled: config.prepass.enabled, baseUrl: config.prepass.baseUrl },
    general: config.general,
  });

  return config;
}

/**
 * Get configuration for a specific toll provider
 */
export function getTollProviderConfig(providerName) {
  const config = loadTollConfig();
  
  switch (providerName.toLowerCase()) {
    case 'pcmiler':
    case 'pc miler':
      return {
        apiKey: config.pcmiler.apiKey,
        baseUrl: config.pcmiler.baseUrl,
        region: config.pcmiler.region,
        units: config.pcmiler.units,
        routeType: config.pcmiler.routeType,
        timeout: config.general.requestTimeoutMs,
      };
    
    case 'ipass':
    case 'i-pass':
      return {
        apiKey: config.ipass.apiKey,
        baseUrl: config.ipass.baseUrl,
        environment: config.ipass.environment,
        timeout: config.general.requestTimeoutMs,
      };
    
    case 'bestpass':
      return {
        clientId: config.bestpass.clientId,
        clientSecret: config.bestpass.clientSecret,
        baseUrl: config.bestpass.baseUrl,
        environment: config.bestpass.environment,
        timeout: config.general.requestTimeoutMs,
      };
    
    case 'prepass':
      return {
        apiKey: config.prepass.apiKey,
        baseUrl: config.prepass.baseUrl,
        customerId: config.prepass.customerId,
        environment: config.prepass.environment,
        timeout: config.general.requestTimeoutMs,
      };
    
    default:
      throw new Error(`Unknown toll provider: ${providerName}`);
  }
}

/**
 * Check if a toll provider is properly configured
 */
export function isTollProviderConfigured(providerName) {
  const config = loadTollConfig();
  
  switch (providerName.toLowerCase()) {
    case 'pcmiler':
    case 'pc miler':
      return config.pcmiler.enabled;
    
    case 'ipass':
    case 'i-pass':
      return config.ipass.enabled;
    
    case 'bestpass':
      return config.bestpass.enabled;
    
    case 'prepass':
      return config.prepass.enabled;
    
    default:
      return false;
  }
}

/**
 * Get list of enabled toll providers
 */
export function getEnabledTollProviders() {
  const config = loadTollConfig();
  const enabled = [];
  
  if (config.pcmiler.enabled) enabled.push('pcmiler');
  if (config.ipass.enabled) enabled.push('ipass');
  if (config.bestpass.enabled) enabled.push('bestpass');
  if (config.prepass.enabled) enabled.push('prepass');
  
  return enabled;
}

/**
 * Validate toll provider configuration
 */
export function validateTollConfig() {
  const config = loadTollConfig();
  const errors = [];

  // Validate general settings
  if (config.general.syncIntervalMinutes < 1) {
    errors.push('TOLL_SYNC_INTERVAL_MINUTES must be at least 1');
  }
  
  if (config.general.cacheTtlMinutes < 1) {
    errors.push('TOLL_CACHE_TTL_MINUTES must be at least 1');
  }
  
  if (config.general.maxRetryAttempts < 1) {
    errors.push('TOLL_MAX_RETRY_ATTEMPTS must be at least 1');
  }
  
  if (config.general.requestTimeoutMs < 1000) {
    errors.push('TOLL_REQUEST_TIMEOUT_MS must be at least 1000');
  }

  // Validate provider-specific settings
  if (config.pcmiler.enabled) {
    if (!config.pcmiler.apiKey) {
      errors.push('PCMILER_API_KEY is required when PC Miler is enabled');
    }
    if (!['NA', 'EU', 'AF'].includes(config.pcmiler.region)) {
      errors.push('PCMILER_REGION must be one of: NA, EU, AF');
    }
    if (!['Miles', 'Kilometers'].includes(config.pcmiler.units)) {
      errors.push('PCMILER_UNITS must be one of: Miles, Kilometers');
    }
  }

  if (config.ipass.enabled) {
    if (!config.ipass.apiKey) {
      errors.push('IPASS_API_KEY is required when I-Pass is enabled');
    }
    if (!['production', 'sandbox'].includes(config.ipass.environment)) {
      errors.push('IPASS_ENVIRONMENT must be one of: production, sandbox');
    }
  }

  if (config.bestpass.enabled) {
    if (!config.bestpass.clientId) {
      errors.push('BESTPASS_CLIENT_ID is required when BestPass is enabled');
    }
    if (!config.bestpass.clientSecret) {
      errors.push('BESTPASS_CLIENT_SECRET is required when BestPass is enabled');
    }
    if (!['production', 'sandbox'].includes(config.bestpass.environment)) {
      errors.push('BESTPASS_ENVIRONMENT must be one of: production, sandbox');
    }
  }

  if (config.prepass.enabled) {
    if (!config.prepass.apiKey) {
      errors.push('PREPASS_API_KEY is required when PrePass is enabled');
    }
    if (!['production', 'sandbox'].includes(config.prepass.environment)) {
      errors.push('PREPASS_ENVIRONMENT must be one of: production, sandbox');
    }
  }

  // Check if at least one provider is enabled
  const enabledProviders = getEnabledTollProviders();
  if (enabledProviders.length === 0) {
    console.warn('No toll providers are configured. Toll management features will be disabled.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Initialize toll configuration and validate
 */
export function initializeTollConfig() {
  const validation = validateTollConfig();
  
  if (!validation.valid) {
    console.error('Toll configuration validation failed:', validation.errors);
    throw new Error(`Toll configuration errors: ${validation.errors.join(', ')}`);
  }
  
  const enabledProviders = getEnabledTollProviders();
  console.log(`Toll management initialized with ${enabledProviders.length} providers:`, enabledProviders);
}

// Export the configuration instance
export const tollConfig = loadTollConfig();

export default {
  loadTollConfig,
  getTollProviderConfig,
  isTollProviderConfigured,
  getEnabledTollProviders,
  validateTollConfig,
  initializeTollConfig,
  tollConfig,
};
