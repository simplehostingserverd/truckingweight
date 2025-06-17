/**
 * Jest Test Setup
 * Global test configuration and utilities for TMS testing
 */

// Increase timeout for integration tests
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  // Mock user for authenticated requests
  mockUser: {
    id: 1,
    companyId: 1,
    email: 'test@example.com',
    role: 'admin'
  },

  // Mock company data
  mockCompany: {
    id: 1,
    name: 'Test Trucking Company',
    subscription_tier: 'enterprise'
  },

  // Common mock responses
  mockResponses: {
    success: { success: true },
    notFound: { message: 'Not found' },
    unauthorized: { message: 'Unauthorized' },
    serverError: { message: 'Internal server error' }
  },

  // Date utilities for consistent testing
  dates: {
    now: new Date('2025-01-20T12:00:00Z'),
    yesterday: new Date('2025-01-19T12:00:00Z'),
    tomorrow: new Date('2025-01-21T12:00:00Z'),
    nextWeek: new Date('2025-01-27T12:00:00Z'),
    lastMonth: new Date('2024-12-20T12:00:00Z')
  },

  // Mock pagination
  mockPagination: {
    page: 1,
    limit: 20,
    total: 100,
    pages: 5
  },

  // Generate mock data helpers
  generateMockWorkOrder: (overrides = {}) => ({
    id: 1,
    title: 'Test Work Order',
    status: 'pending',
    priority: 'medium',
    vehicle_id: 1,
    vendor_id: 1,
    estimated_cost: 500.00,
    scheduled_date: global.testUtils.dates.tomorrow,
    created_at: global.testUtils.dates.now,
    updated_at: global.testUtils.dates.now,
    ...overrides
  }),

  generateMockVehicle: (overrides = {}) => ({
    id: 1,
    company_id: 1,
    unit_number: 'T001',
    make: 'Freightliner',
    model: 'Cascadia',
    year: 2022,
    vin: '1FUJGHDV8NLAA1234',
    status: 'active',
    current_mileage: 125000,
    ...overrides
  }),

  generateMockDriver: (overrides = {}) => ({
    id: 1,
    company_id: 1,
    first_name: 'John',
    last_name: 'Doe',
    license_number: 'DL123456789',
    phone: '555-0123',
    email: 'john.doe@example.com',
    status: 'active',
    ...overrides
  }),

  generateMockLoad: (overrides = {}) => ({
    id: 1,
    company_id: 1,
    load_number: 'LD-2025-001',
    customer_id: 1,
    driver_id: 1,
    vehicle_id: 1,
    status: 'available',
    pickup_address: '123 Pickup St, Los Angeles, CA',
    delivery_address: '456 Delivery Ave, Phoenix, AZ',
    pickup_date: global.testUtils.dates.tomorrow,
    delivery_date: global.testUtils.dates.nextWeek,
    weight: 25000,
    commodity: 'General Freight',
    rate: 2500.00,
    ...overrides
  }),

  generateMockIoTDevice: (overrides = {}) => ({
    id: 1,
    company_id: 1,
    device_id: 'TEMP001',
    device_type: 'temperature_sensor',
    vehicle_id: 1,
    manufacturer: 'SensorTech',
    model: 'ST-100',
    status: 'active',
    firmware_version: '1.2.3',
    ...overrides
  }),

  generateMockSensorData: (overrides = {}) => ({
    id: 1,
    device_id: 1,
    sensor_type: 'temperature',
    value: 25.5,
    unit: 'celsius',
    timestamp: global.testUtils.dates.now,
    metadata: {},
    ...overrides
  })
};

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

// Restore console for specific tests if needed
global.restoreConsole = () => {
  global.console = originalConsole;
};

// Mock Date.now for consistent testing
const mockDate = new Date('2025-01-20T12:00:00Z');
global.Date.now = jest.fn(() => mockDate.getTime());

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// Global error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global setup for all tests
beforeAll(async () => {
  // Any global setup logic
});

// Global cleanup for all tests
afterAll(async () => {
  // Any global cleanup logic
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset Date mock
  global.Date.now = jest.fn(() => mockDate.getTime());
});

// Cleanup after each test
afterEach(() => {
  // Clean up any test-specific state
});

// Custom matchers
expect.extend({
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false,
      };
    }
  },

  toBeValidUUID(received) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = typeof received === 'string' && uuidRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },

  toHaveValidPagination(received) {
    const pass = received && 
                 typeof received.page === 'number' &&
                 typeof received.limit === 'number' &&
                 typeof received.total === 'number' &&
                 typeof received.pages === 'number' &&
                 received.page > 0 &&
                 received.limit > 0 &&
                 received.total >= 0 &&
                 received.pages >= 0;
    
    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to have valid pagination`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to have valid pagination`,
        pass: false,
      };
    }
  },

  toBeValidApiResponse(received) {
    const pass = received && 
                 typeof received === 'object' &&
                 (received.success !== undefined || received.message !== undefined || received.data !== undefined);
    
    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be a valid API response`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be a valid API response`,
        pass: false,
      };
    }
  }
});

// Test database utilities
global.testDb = {
  // Mock database operations
  mockQuery: jest.fn(),
  mockTransaction: jest.fn(),
  
  // Reset database state
  reset: () => {
    global.testDb.mockQuery.mockClear();
    global.testDb.mockTransaction.mockClear();
  }
};

// API testing utilities
global.apiTest = {
  // Standard headers for API requests
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-token'
  },

  // Common assertion helpers
  expectSuccessResponse: (response) => {
    expect(response.status).toBe(200);
    expect(response.body).toBeValidApiResponse();
  },

  expectErrorResponse: (response, status = 500) => {
    expect(response.status).toBe(status);
    expect(response.body).toHaveProperty('message');
  },

  expectPaginatedResponse: (response) => {
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('pagination');
    expect(response.body.pagination).toHaveValidPagination();
  }
};

// Performance testing utilities
global.perfTest = {
  measureTime: async (fn) => {
    const start = process.hrtime.bigint();
    await fn();
    const end = process.hrtime.bigint();
    return Number(end - start) / 1000000; // Convert to milliseconds
  },

  expectFastResponse: (duration, maxMs = 1000) => {
    expect(duration).toBeLessThan(maxMs);
  }
};

// Mock external services
global.mockServices = {
  // Mock email service
  emailService: {
    sendEmail: jest.fn().mockResolvedValue({ success: true }),
    sendNotification: jest.fn().mockResolvedValue({ success: true })
  },

  // Mock file storage service
  storageService: {
    uploadFile: jest.fn().mockResolvedValue({ url: 'https://example.com/file.pdf' }),
    deleteFile: jest.fn().mockResolvedValue({ success: true })
  },

  // Mock external APIs
  externalApis: {
    weatherApi: jest.fn().mockResolvedValue({ temperature: 25, conditions: 'clear' }),
    trafficApi: jest.fn().mockResolvedValue({ congestion: 'light', eta: 120 }),
    fuelPriceApi: jest.fn().mockResolvedValue({ price: 3.45, currency: 'USD' })
  }
};
