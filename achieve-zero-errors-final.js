#!/usr/bin/env node

/**
 * Achieve Zero Errors Final Script
 * Eliminate the remaining 185 errors to achieve absolute zero
 */

const fs = require('fs');
const path = require('path');

// Critical fixes for remaining errors
const CRITICAL_FIXES = {
  // Fix remaining variable reference issues
  'frontend/src/app/(dashboard)/admin/companies/page.tsx': [
    { from: 'const _supabase = createClient();', to: 'const supabase = createClient();' },
    { from: 'const _data = ', to: 'const data = ' }
  ],
  
  'frontend/src/app/(dashboard)/admin/settings/page.tsx': [
    { from: 'const _supabase = createClient();', to: 'const supabase = createClient();' }
  ],
  
  'frontend/src/app/(city-auth)/city/login/page.tsx': [
    { from: 'const _router = useRouter();', to: 'const router = useRouter();' }
  ],
  
  'frontend/src/app/(dashboard)/company/profile/page.tsx': [
    { from: 'const _router = useRouter();', to: 'const router = useRouter();' },
    { from: 'const _name = ', to: 'const name = ' }
  ],
  
  'frontend/src/app/(dashboard)/drivers/create/page.tsx': [
    { from: 'const _router = useRouter();', to: 'const router = useRouter();' }
  ],
  
  'frontend/src/app/(dashboard)/drivers/page.tsx': [
    { from: 'const _supabase = createClient();', to: 'const supabase = createClient();' }
  ],
  
  'frontend/src/app/(dashboard)/scales/page.tsx': [
    { from: 'const _supabase = createClient();', to: 'const supabase = createClient();' },
    { from: 'const _data = ', to: 'const data = ' },
    { from: 'const _connectedScales = ', to: 'const connectedScales = ' }
  ],
  
  'frontend/src/app/(dashboard)/vehicles/create/page.tsx': [
    { from: 'const _router = useRouter();', to: 'const router = useRouter();' }
  ],
  
  'frontend/src/app/(dashboard)/weights/new/page.tsx': [
    { from: 'const _router = useRouter();', to: 'const router = useRouter();' }
  ],
  
  'frontend/src/app/api/city-settings/route.ts': [
    { from: 'const _token = ', to: 'const token = ' }
  ],
  
  'frontend/src/app/city-register/page.tsx': [
    { from: 'const _role = ', to: 'const role = ' },
    { from: 'const _router = ', to: 'const router = ' }
  ],
  
  'frontend/src/utils/storage/enterprise-storage.ts': [
    { from: 'const _config = ', to: 'const config = ' },
    { from: 'const _data = ', to: 'const data = ' },
    { from: 'const _filename = ', to: 'const filename = ' }
  ]
};

// Files that need parameter fixes
const PARAMETER_FIXES = {
  'frontend/src/app/api/admin/companies/route.ts': [
    { from: '(request)', to: '(_request)' }
  ],
  
  'frontend/src/app/api/auth/session/route.ts': [
    { from: '(request)', to: '(_request)' }
  ],
  
  'frontend/src/app/api/scales/hardware-options/route.ts': [
    { from: '(req)', to: '(_req)' }
  ],
  
  'frontend/src/app/api/scales/route.ts': [
    { from: '(request)', to: '(_request)' }
  ],
  
  'frontend/src/app/api/scales/vehicles-drivers/route.ts': [
    { from: '(request)', to: '(_request)' }
  ],
  
  'frontend/src/app/api/telematics/vehicles/route.ts': [
    { from: '(request)', to: '(_request)' }
  ],
  
  'frontend/src/app/(city-dashboard)/city/map/page.tsx': [
    { from: '(data) =>', to: '(_data) =>' }
  ],
  
  'frontend/src/app/(dashboard)/financial-reports/page.tsx': [
    { from: '(index) =>', to: '(_index) =>' }
  ],
  
  'frontend/src/app/(dashboard)/fleet-analytics/page.tsx': [
    { from: '(index) =>', to: '(_index) =>' }
  ],
  
  'frontend/src/app/(dashboard)/telematics/page.tsx': [
    { from: '(index) =>', to: '(_index) =>' }
  ],
  
  'frontend/src/app/(dashboard)/ml/models/new/page.tsx': [
    { from: '(index) =>', to: '(_index) =>' }
  ]
};

function applyCriticalFixes(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    if (CRITICAL_FIXES[filePath]) {
      for (const fix of CRITICAL_FIXES[filePath]) {
        if (content.includes(fix.from)) {
          content = content.replace(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
          modified = true;
        }
      }
    }

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
      console.log(`✅ Applied critical fixes to: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error applying critical fixes to ${filePath}:`, error.message);
    return false;
  }
}

function fixRemainingIssues() {
  // Additional specific fixes for common issues
  const specificFixes = [
    {
      file: 'frontend/src/app/(dashboard)/scales/page.tsx',
      fixes: [
        { from: 'const _userError = ', to: 'const userError = ' }
      ]
    },
    {
      file: 'frontend/src/app/api/scales/[id]/reading/route.ts',
      fixes: [
        { from: 'const _scale = ', to: 'const scale = ' }
      ]
    },
    {
      file: 'frontend/src/app/api/verify-supabase/route.ts',
      fixes: [
        { from: 'const _createClientClient = ', to: 'const createClientClient = ' },
        { from: 'const _healthData = ', to: 'const healthData = ' }
      ]
    }
  ];

  let totalFixed = 0;
  
  for (const item of specificFixes) {
    try {
      if (!fs.existsSync(item.file)) {
        continue;
      }

      let content = fs.readFileSync(item.file, 'utf8');
      let modified = false;

      for (const fix of item.fixes) {
        if (content.includes(fix.from)) {
          content = content.replace(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(item.file, content);
        console.log(`✅ Applied specific fixes to: ${item.file}`);
        totalFixed++;
      }
    } catch (error) {
      console.error(`❌ Error applying specific fixes to ${item.file}:`, error.message);
    }
  }

  return totalFixed;
}

function main() {
  console.log('🎯 FINAL PUSH: Achieving absolute zero errors...\n');
  
  let totalFixed = 0;
  
  // Apply critical fixes
  console.log('🔧 Applying critical variable fixes...');
  const allFiles = [...Object.keys(CRITICAL_FIXES), ...Object.keys(PARAMETER_FIXES)];
  const uniqueFiles = [...new Set(allFiles)];
  
  for (const filePath of uniqueFiles) {
    if (applyCriticalFixes(filePath)) {
      totalFixed++;
    }
  }
  
  // Apply remaining specific fixes
  console.log('\n🎯 Applying remaining specific fixes...');
  totalFixed += fixRemainingIssues();
  
  console.log(`\n✨ Applied critical fixes to ${totalFixed} files!`);
  console.log('🏆 THIS SHOULD ACHIEVE ZERO ERRORS!');
  console.log('🎉 We are going for the gold - 0 errors, 0 warnings!');
}

if (require.main === module) {
  main();
}

module.exports = { applyCriticalFixes, fixRemainingIssues };
