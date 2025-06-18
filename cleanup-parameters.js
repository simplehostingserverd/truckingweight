#!/usr/bin/env node

/**
 * Function Parameters Cleanup Script
 * Prefixes unused function parameters with underscore
 */

const fs = require('fs');
const path = require('path');

// Specific parameter fixes based on linting output
const PARAMETER_FIXES = {
  'frontend/src/app/(city-dashboard)/city/map/page.tsx': [{ from: '(data) =>', to: '(_data) =>' }],

  'frontend/src/app/(dashboard)/financial-reports/page.tsx': [
    { from: '(item, index) =>', to: '(item, _index) =>' },
  ],

  'frontend/src/app/(dashboard)/fleet-analytics/page.tsx': [
    { from: '(item, index) =>', to: '(item, _index) =>' },
  ],

  'frontend/src/app/(dashboard)/ml/models/new/page.tsx': [
    { from: '(feature, index) =>', to: '(feature, _index) =>' },
  ],

  'frontend/src/app/(dashboard)/telematics/page.tsx': [
    { from: '(alert, index) =>', to: '(alert, _index) =>' },
  ],

  'frontend/src/components/Dashboard/AdminCompanySelector.tsx': [
    { from: '(company, key) =>', to: '(company, _key) =>' },
  ],

  'frontend/src/components/Dashboard/RecentWeightsTable.tsx': [
    { from: '(weights, companyId) =>', to: '(weights, _companyId) =>' },
  ],

  'frontend/src/components/DraggableList.tsx': [
    { from: '(item, index) =>', to: '(item, _index) =>' },
  ],

  'frontend/src/components/TruckModel.tsx': [
    {
      from: '({ position, rotation, totalWeight }) =>',
      to: '({ position, rotation, _totalWeight }) =>',
    },
  ],

  'frontend/src/components/TruckTracking/DeckGLTruckVisualization.tsx': [
    { from: '(d) =>', to: '(_d) =>' },
  ],

  'frontend/src/components/TruckTracking/MapboxTruckVisualization.tsx': [
    { from: '(gl, matrix) =>', to: '(_gl, _matrix) =>' },
  ],

  'frontend/src/components/TruckTracking/TruckTrackingVisualization.tsx': [
    { from: '({ routeData, currentPosition }) =>', to: '({ _routeData, _currentPosition }) =>' },
  ],

  'frontend/src/hooks/useSWROptimized.ts': [{ from: '(k) =>', to: '(_k) =>' }],

  'frontend/src/components/ui/OptimizedImage.tsx': [
    {
      from: '({ src, alt, width, height, quality, ...props }) =>',
      to: '({ src, alt, width, height, _quality, ...props }) =>',
    },
  ],

  'frontend/src/components/ui/table.tsx': [
    {
      from: '({ className, sortable, ...props }) =>',
      to: '({ className, _sortable, ...props }) =>',
    },
  ],

  'frontend/src/middleware/security.ts': [{ from: '(req) =>', to: '(_req) =>' }],

  'frontend/src/pages/_document.tsx': [{ from: '(props) =>', to: '(_props) =>' }],

  // API routes
  'frontend/src/app/api/admin/companies/route.ts': [{ from: '(request) =>', to: '(_request) =>' }],

  'frontend/src/app/api/auth/session/route.ts': [{ from: '(request) =>', to: '(_request) =>' }],

  'frontend/src/app/api/scales/hardware-options/route.ts': [{ from: '(req) =>', to: '(_req) =>' }],

  'frontend/src/app/api/scales/route.ts': [{ from: '(request) =>', to: '(_request) =>' }],

  'frontend/src/app/api/scales/vehicles-drivers/route.ts': [
    { from: '(request) =>', to: '(_request) =>' },
  ],

  'frontend/src/app/api/telematics/vehicles/route.ts': [
    { from: '(request) =>', to: '(_request) =>' },
  ],
};

function fixParameters(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Apply specific parameter fixes for this file
    if (PARAMETER_FIXES[filePath]) {
      for (const fix of PARAMETER_FIXES[filePath]) {
        if (content.includes(fix.from)) {
          content = content.replace(
            new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            fix.to
          );
          modified = true;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed parameters in: ${filePath}`);
    } else {
      console.log(`⏭️  No parameter changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🔧 Starting function parameters cleanup...\n');

  const filesToFix = Object.keys(PARAMETER_FIXES);

  for (const file of filesToFix) {
    fixParameters(file);
  }

  console.log('\n✨ Function parameters cleanup completed!');
}

if (require.main === module) {
  main();
}

module.exports = { fixParameters, PARAMETER_FIXES };
