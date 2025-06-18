#!/usr/bin/env node

/**
 * Final Cleanup Script
 * Comprehensive fix for remaining linting issues
 */

const fs = require('fs');
const path = require('path');

// Prefix unused parameters with underscore
const PARAMETER_FIXES = [
  {
    file: 'frontend/src/app/(city-dashboard)/city/map/page.tsx',
    fixes: [{ from: '(data) =>', to: '(_data) =>' }]
  },
  {
    file: 'frontend/src/app/(city-dashboard)/city/users/page.tsx', 
    fixes: [{ from: 'const userRole = ', to: 'const _userRole = ' }]
  },
  {
    file: 'frontend/src/app/(dashboard)/telematics/page.tsx',
    fixes: [{ from: '(index) =>', to: '(_index) =>' }]
  },
  {
    file: 'frontend/src/app/api/admin/companies/route.ts',
    fixes: [{ from: '(request)', to: '(_request)' }]
  },
  {
    file: 'frontend/src/app/api/auth/session/route.ts',
    fixes: [{ from: '(request)', to: '(_request)' }]
  },
  {
    file: 'frontend/src/app/api/scales/hardware-options/route.ts',
    fixes: [{ from: '(req)', to: '(_req)' }]
  },
  {
    file: 'frontend/src/app/api/scales/route.ts',
    fixes: [{ from: '(request)', to: '(_request)' }]
  },
  {
    file: 'frontend/src/app/api/scales/vehicles-drivers/route.ts',
    fixes: [{ from: '(request)', to: '(_request)' }]
  },
  {
    file: 'frontend/src/app/api/telematics/vehicles/route.ts',
    fixes: [{ from: '(request)', to: '(_request)' }]
  }
];

// Comment out unused imports
const UNUSED_IMPORT_FIXES = [
  {
    file: 'frontend/src/app/(city-dashboard)/city/permits/page.tsx',
    fixes: [
      { from: "import { CardHeader, CardTitle } from '@/components/ui/card';", to: "// import { CardHeader, CardTitle } from '@/components/ui/card'; // Unused" }
    ]
  },
  {
    file: 'frontend/src/app/(city-dashboard)/city/scales/page.tsx',
    fixes: [
      { from: "import { CardHeader, CardTitle } from '@/components/ui/card';", to: "// import { CardHeader, CardTitle } from '@/components/ui/card'; // Unused" }
    ]
  },
  {
    file: 'frontend/src/app/(city-dashboard)/city/users/page.tsx',
    fixes: [
      { from: "import { CardHeader, CardTitle } from '@/components/ui/card';", to: "// import { CardHeader, CardTitle } from '@/components/ui/card'; // Unused" },
      { from: "import { DialogTrigger } from '@/components/ui/dialog';", to: "// import { DialogTrigger } from '@/components/ui/dialog'; // Unused" }
    ]
  },
  {
    file: 'frontend/src/app/(city-dashboard)/city/violations/page.tsx',
    fixes: [
      { from: "import { CalendarIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';", to: "// import { CalendarIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline'; // Unused" },
      { from: "import { CardHeader, CardTitle } from '@/components/ui/card';", to: "// import { CardHeader, CardTitle } from '@/components/ui/card'; // Unused" }
    ]
  },
  {
    file: 'frontend/src/app/(dashboard)/compliance/documents/page.tsx',
    fixes: [
      { from: "import Link from 'next/link';", to: "// import Link from 'next/link'; // Unused" }
    ]
  },
  {
    file: 'frontend/src/app/providers.jsx',
    fixes: [
      { from: "import React from 'react';", to: "// import React from 'react'; // Unused" },
      { from: "import { ThemeProvider } from 'next-themes';", to: "// import { ThemeProvider } from 'next-themes'; // Unused" }
    ]
  }
];

// Fix unused variables by prefixing with underscore
const UNUSED_VARIABLE_FIXES = [
  {
    file: 'frontend/src/app/(dashboard)/admin/companies/page.tsx',
    fixes: [
      { from: 'const [createClient] = ', to: 'const [_createClient] = ' },
      { from: 'const _data = ', to: 'const _data = ' },
      { from: 'const userCountError = ', to: 'const _userCountError = ' },
      { from: 'const vehicleCountError = ', to: 'const _vehicleCountError = ' },
      { from: 'const driverCountError = ', to: 'const _driverCountError = ' },
      { from: 'const data = ', to: 'const _data = ' }
    ]
  },
  {
    file: 'frontend/src/app/(dashboard)/admin/settings/page.tsx',
    fixes: [
      { from: 'const [createClient] = ', to: 'const [_createClient] = ' },
      { from: 'const [isLoading] = ', to: 'const [_isLoading] = ' }
    ]
  },
  {
    file: 'frontend/src/app/(dashboard)/analytics/page.tsx',
    fixes: [
      { from: 'const [AnalyticsWidget] = ', to: 'const [_AnalyticsWidget] = ' },
      { from: 'const [selectedDashboard] = ', to: 'const [_selectedDashboard] = ' }
    ]
  }
];

function applyFixes(fileConfig) {
  try {
    const filePath = fileConfig.file;
    if (!fs.existsSync(filePath)) {
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const fix of fileConfig.fixes) {
      if (content.includes(fix.from)) {
        content = content.replace(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${fileConfig.file}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Running final cleanup...\n');
  
  let totalFixed = 0;
  
  // Fix unused parameters
  console.log('📝 Fixing unused parameters...');
  for (const fileConfig of PARAMETER_FIXES) {
    if (applyFixes(fileConfig)) {
      totalFixed++;
    }
  }
  
  // Fix unused imports
  console.log('\n📦 Commenting out unused imports...');
  for (const fileConfig of UNUSED_IMPORT_FIXES) {
    if (applyFixes(fileConfig)) {
      totalFixed++;
    }
  }
  
  // Fix unused variables
  console.log('\n🔧 Fixing unused variables...');
  for (const fileConfig of UNUSED_VARIABLE_FIXES) {
    if (applyFixes(fileConfig)) {
      totalFixed++;
    }
  }
  
  console.log(`\n✨ Final cleanup completed! Fixed ${totalFixed} files.`);
  console.log('🔍 Run npm run lint again to see final results...');
}

if (require.main === module) {
  main();
}

module.exports = { applyFixes };
