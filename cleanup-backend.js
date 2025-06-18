#!/usr/bin/env node

/**
 * Backend Code Cleanup Script
 * Fixes unused variables, parameters, and other linting issues in backend TypeScript/JavaScript files
 */

const fs = require('fs');
const path = require('path');

// Backend-specific fixes
const BACKEND_FIXES = {
  'backend/controllers/fastify/toll.js': [
    { from: "const logger = require('../../utils/logger');", to: "const _logger = require('../../utils/logger');" },
    { from: 'const { data: tollData, error: countError }', to: 'const { data: tollData, error: _countError }' },
    { from: 'const credentials = ', to: 'const _credentials = ' },
    { from: 'const _ = ', to: 'const _unused = ' }
  ],
  
  'backend/controllers/tollController.ts': [
    { from: 'const credentials = ', to: 'const _credentials = ' },
    { from: 'const _ = ', to: 'const _unused = ' }
  ],
  
  'backend/controllers/tollControllerExtended.ts': [
    { from: 'const { error: dbError }', to: 'const { error: _dbError }' }
  ],
  
  'backend/routes/compliance.ts': [
    { from: 'const dotService = ', to: 'const _dotService = ' }
  ],
  
  'backend/routes/dispatch.js': [
    { from: 'const updatedLoad = ', to: 'const _updatedLoad = ' }
  ],
  
  'backend/routes/fleet.ts': [
    { from: 'let whereClause', to: 'const whereClause' },
    { from: 'const resolution = ', to: 'const _resolution = ' }
  ],
  
  'backend/services/compliance/ELDService.ts': [
    { from: 'let lastBreakTime', to: 'const _lastBreakTime' }
  ],
  
  'backend/services/dispatch/DispatchService.ts': [
    { from: '(load: any, vehicle: any)', to: '(_load: any, _vehicle: any)' },
    { from: '(routeId: any)', to: '(_routeId: any)' },
    { from: '(driverId: number)', to: '(_driverId: number)' }
  ],
  
  'backend/services/dispatch/RouteOptimizationService.ts': [
    { from: '(load: any)', to: '(_load: any)' },
    { from: 'const fuelStops = ', to: 'const _fuelStops = ' },
    { from: 'const restStops = ', to: 'const _restStops = ' },
    { from: '(geometry: any, vehicle: any)', to: '(_geometry: any, _vehicle: any)' },
    { from: '(geometry: any, vehicle: any, load: any)', to: '(_geometry: any, _vehicle: any, _load: any)' },
    { from: '(polyline: string)', to: '(_polyline: string)' },
    { from: '(route: any, vehicle: any)', to: '(_route: any, _vehicle: any)' },
    { from: '(route: any)', to: '(_route: any)' }
  ],
  
  'backend/services/financial/BillingService.ts': [
    { from: '(subtotal: number, customer: any)', to: '(_subtotal: number, _customer: any)' },
    { from: '(customerId: string)', to: '(_customerId: string)' },
    { from: 'const tradingPartner = ', to: 'const _tradingPartner = ' },
    { from: 'const thirtyDaysAgo = ', to: 'const _thirtyDaysAgo = ' },
    { from: 'const sixtyDaysAgo = ', to: 'const _sixtyDaysAgo = ' },
    { from: 'const ninetyDaysAgo = ', to: 'const _ninetyDaysAgo = ' }
  ],
  
  'backend/services/toll/BestPassService.ts': [
    { from: 'const accountInfo = ', to: 'const _accountInfo = ' },
    { from: '(error)', to: '(_error)' }
  ],
  
  'backend/services/toll/IPassService.ts': [
    { from: 'const accountInfo = ', to: 'const _accountInfo = ' }
  ],
  
  'backend/services/toll/PCMilerService.ts': [
    { from: 'const accountInfo = ', to: 'const _accountInfo = ' }
  ],
  
  'backend/services/toll/PrePassService.ts': [
    { from: 'const accountInfo = ', to: 'const _accountInfo = ' }
  ]
};

// Files with parameter issues
const PARAMETER_FIXES = {
  'backend/services/ai/MLService.ts': [
    { from: '(prediction: any)', to: '(_prediction: any)' },
    { from: '(origin: any, destination: any, date: any)', to: '(_origin: any, _destination: any, _date: any)' },
    { from: '(origin: any, date: any)', to: '(_origin: any, _date: any)' },
    { from: '(origin: any, destination: any)', to: '(_origin: any, _destination: any)' },
    { from: '(features: any)', to: '(_features: any)' },
    { from: '(vehicle: any, component: any)', to: '(_vehicle: any, _component: any)' }
  ],
  
  'backend/services/toll/index.js': [
    { from: '(request)', to: '(_request)' },
    { from: '(accountNumber)', to: '(_accountNumber)' },
    { from: '(accountNumber, startDate, endDate, limit)', to: '(_accountNumber, _startDate, _endDate, _limit)' }
  ]
};

function cleanupBackendFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Apply specific fixes for this file
    if (BACKEND_FIXES[filePath]) {
      for (const fix of BACKEND_FIXES[filePath]) {
        if (content.includes(fix.from)) {
          content = content.replace(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
          modified = true;
        }
      }
    }

    // Apply parameter fixes
    if (PARAMETER_FIXES[filePath]) {
      for (const fix of PARAMETER_FIXES[filePath]) {
        if (content.includes(fix.from)) {
          content = content.replace(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
          modified = true;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed backend file: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🔧 Starting backend cleanup...\n');
  
  const allFiles = [...Object.keys(BACKEND_FIXES), ...Object.keys(PARAMETER_FIXES)];
  const uniqueFiles = [...new Set(allFiles)];
  
  for (const file of uniqueFiles) {
    cleanupBackendFile(file);
  }
  
  console.log('\n✨ Backend cleanup completed!');
}

if (require.main === module) {
  main();
}

module.exports = { cleanupBackendFile, BACKEND_FIXES, PARAMETER_FIXES };
