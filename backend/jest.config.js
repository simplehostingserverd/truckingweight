/**
 * Jest Configuration for TMS Backend Testing
 * Comprehensive testing setup for all TMS modules
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Root directory for tests
  rootDir: '.',
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.test.ts'
  ],
  
  // Files to ignore
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js'
  ],
  
  // Module paths
  moduleDirectories: [
    'node_modules',
    '<rootDir>'
  ],
  
  // Module name mapping for absolute imports
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@middleware/(.*)$': '<rootDir>/middleware/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
    '^@routes/(.*)$': '<rootDir>/routes/$1'
  },
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],
  
  // Files to include in coverage
  collectCoverageFrom: [
    'routes/**/*.{js,ts}',
    'services/**/*.{js,ts}',
    'middleware/**/*.{js,ts}',
    'utils/**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**',
    '!**/dist/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    // Specific thresholds for critical modules
    './routes/maintenance.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './routes/iot.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './routes/analytics.ts': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },
  
  // Transform configuration for TypeScript
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // File extensions to consider
  moduleFileExtensions: [
    'js',
    'ts',
    'json'
  ],
  
  // Global variables
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: {
        compilerOptions: {
          module: 'esnext',
          target: 'es2020',
          moduleResolution: 'node',
          allowSyntheticDefaultImports: true,
          esModuleInterop: true
        }
      }
    }
  },
  
  // Test timeout
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Reset modules between tests
  resetModules: true,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Test suites configuration
  projects: [
    {
      displayName: 'Unit Tests',
      testMatch: [
        '<rootDir>/tests/*.test.js',
        '<rootDir>/tests/*.test.ts'
      ],
      testPathIgnorePatterns: [
        '<rootDir>/tests/integration/'
      ]
    },
    {
      displayName: 'Integration Tests',
      testMatch: [
        '<rootDir>/tests/integration/*.test.js',
        '<rootDir>/tests/integration/*.test.ts'
      ]
    }
  ],
  
  // Reporters
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './coverage/html-report',
        filename: 'test-report.html',
        expand: true,
        hideIcon: false,
        pageTitle: 'TMS Test Report',
        logoImgPath: undefined,
        inlineSource: false
      }
    ],
    [
      'jest-junit',
      {
        outputDirectory: './coverage',
        outputName: 'junit.xml',
        ancestorSeparator: ' › ',
        uniqueOutputName: 'false',
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}'
      }
    ]
  ],
  
  // Watch mode configuration
  watchman: true,
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/'
  ],
  
  // Snapshot configuration
  snapshotSerializers: [],
  
  // Mock configuration
  automock: false,
  unmockedModulePathPatterns: [
    '/node_modules/'
  ],
  
  // Performance monitoring
  detectOpenHandles: true,
  detectLeaks: true,
  
  // Test result processor
  testResultsProcessor: undefined,
  
  // Custom matchers
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js'
  ],
  
  // Bail configuration
  bail: false,
  
  // Force exit
  forceExit: false,
  
  // Max workers
  maxWorkers: '50%',
  
  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Notify mode
  notify: false,
  notifyMode: 'failure-change',
  
  // Silent mode
  silent: false,
  
  // Update snapshots
  updateSnapshot: false,
  
  // Use stderr
  useStderr: false,
  
  // Watch all files
  watchAll: false
};

// Environment-specific configurations
if (process.env.NODE_ENV === 'ci') {
  module.exports.ci = true;
  module.exports.coverage = true;
  module.exports.watchman = false;
  module.exports.maxWorkers = 2;
}

if (process.env.NODE_ENV === 'development') {
  module.exports.watch = true;
  module.exports.watchAll = false;
  module.exports.coverage = false;
}

if (process.env.NODE_ENV === 'production') {
  module.exports.coverage = true;
  module.exports.coverageThreshold.global = {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  };
}
