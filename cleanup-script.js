#!/usr/bin/env node

/**
 * Code Cleanup Script
 * Automatically removes unused imports and variables from TypeScript/JavaScript files
 */

const fs = require('fs');
const path = require('path');

// Common unused imports to remove
const UNUSED_IMPORTS = {
  // React imports that are often unused
  'React': ['React'],
  '@heroicons/react/24/outline': [
    'CalendarIcon',
    'TruckIcon', 
    'DocumentTextIcon',
    'UsersIcon',
    'PlusIcon',
    'ExclamationTriangleIcon',
    'XCircleIcon',
    'ArrowPathIcon',
    'CheckCircleIcon',
    'ScaleIcon',
    'ClockIcon',
    'MapPinIcon',
    'PlayIcon',
    'PauseIcon',
    'BuildingOfficeIcon',
    'RouteIcon',
    'BellIcon',
    'WrenchScrewdriverIcon',
    'CpuChipIcon',
    'WifiIcon',
    'ChartBarIcon',
    'UserIcon',
    'CogIcon',
    'ShieldCheckIcon',
    'CloudArrowUpIcon',
    'ServerIcon',
    'ArrowsRightLeftIcon',
    'DocumentChartBarIcon',
    'AdjustmentsHorizontalIcon',
    'InformationCircleIcon',
    'ChartPieIcon',
    'CursorArrowRaysIcon',
    'NoSymbolIcon'
  ],
  '@/components/ui': [
    'CardHeader',
    'CardTitle',
    'Separator',
    'DialogTrigger',
    'Tabs',
    'TabsContent', 
    'TabsList',
    'TabsTrigger',
    'Input',
    'Progress',
    'Alert',
    'AlertDescription',
    'Checkbox',
    'Divider',
    'ListItemIcon',
    'Paper'
  ]
};

// Files to process
const FILES_TO_CLEAN = [
  'frontend/src/app/(dashboard)/analytics/page.tsx',
  'frontend/src/app/(dashboard)/ml/page.tsx',
  'frontend/src/app/(city-dashboard)/city/dashboard/page.tsx',
  'frontend/src/app/(city-dashboard)/city/permits/page.tsx',
  'frontend/src/app/(city-dashboard)/city/reports/page.tsx',
  'frontend/src/app/(city-dashboard)/city/scales/page.tsx',
  'frontend/src/app/(city-dashboard)/city/users/page.tsx',
  'frontend/src/app/(city-dashboard)/city/violations/page.tsx',
  'frontend/src/app/(dashboard)/accounts-receivable/page.tsx',
  'frontend/src/app/(dashboard)/compliance/documents/page.tsx',
  'frontend/src/app/(dashboard)/dispatch/page.tsx',
  'frontend/src/app/(dashboard)/driver-qualifications/page.tsx',
  'frontend/src/app/(dashboard)/dvir/page.tsx',
  'frontend/src/app/(dashboard)/edi/page.tsx',
  'frontend/src/app/(dashboard)/equipment/page.tsx',
  'frontend/src/app/(dashboard)/fuel/page.tsx',
  'frontend/src/app/(dashboard)/hos-logs/page.tsx',
  'frontend/src/app/(dashboard)/kpi/page.tsx',
  'frontend/src/app/(dashboard)/maintenance/page.tsx',
  'frontend/src/app/(dashboard)/parts/page.tsx',
  'frontend/src/app/(dashboard)/safety/page.tsx',
  'frontend/src/app/(dashboard)/toll-management/page.tsx'
];

function cleanupFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove unused imports
    for (const [importPath, unusedImports] of Object.entries(UNUSED_IMPORTS)) {
      for (const unusedImport of unusedImports) {
        // Pattern to match import statements
        const importRegex = new RegExp(
          `import\\s*{([^}]*)}\\s*from\\s*['"]${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"];?`,
          'g'
        );
        
        content = content.replace(importRegex, (match, imports) => {
          const importList = imports.split(',').map(imp => imp.trim()).filter(imp => imp);
          const filteredImports = importList.filter(imp => !unusedImports.includes(imp));
          
          if (filteredImports.length === 0) {
            modified = true;
            return ''; // Remove entire import line
          } else if (filteredImports.length !== importList.length) {
            modified = true;
            return `import { ${filteredImports.join(', ')} } from '${importPath}';`;
          }
          return match;
        });
      }
    }

    // Remove empty import lines
    content = content.replace(/^\s*import\s*{\s*}\s*from\s*['"][^'"]*['"];\s*$/gm, '');
    
    // Remove multiple consecutive empty lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Cleaned up: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🧹 Starting code cleanup...\n');
  
  for (const file of FILES_TO_CLEAN) {
    cleanupFile(file);
  }
  
  console.log('\n✨ Code cleanup completed!');
}

if (require.main === module) {
  main();
}

module.exports = { cleanupFile, UNUSED_IMPORTS, FILES_TO_CLEAN };
