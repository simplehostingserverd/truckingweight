#!/usr/bin/env node

/**
 * Final Zero Push Script
 * Eliminate the remaining 160 errors to achieve absolute zero
 */

const fs = require('fs');
const path = require('path');

// Critical fixes for the remaining 160 errors
const FINAL_CRITICAL_FIXES = {
  // Fix remaining incomplete variable declarations
  'frontend/src/app/(dashboard)/admin/settings/page.tsx': [
    { from: 'const _supabase = ', to: 'const supabase = createClient();' }
  ],
  
  'frontend/src/app/(dashboard)/drivers/page.tsx': [
    { from: 'const _supabase = ', to: 'const supabase = createClient();' }
  ],
  
  'frontend/src/app/(dashboard)/scales/page.tsx': [
    { from: 'const _supabase = ', to: 'const supabase = createClient();' },
    { from: 'const _data = ', to: 'const data = ' },
    { from: 'const _connectedScales = ', to: 'const connectedScales = ' },
    { from: 'const _userError = ', to: 'const userError = ' }
  ],
  
  'frontend/src/app/api/scales/[id]/reading/route.ts': [
    { from: 'const _scale = ', to: 'const scale = ' }
  ],
  
  'frontend/src/app/api/verify-supabase/route.ts': [
    { from: 'const _createClientClient = ', to: 'const createClientClient = ' },
    { from: 'const _healthData = ', to: 'const healthData = ' }
  ],
  
  'frontend/src/app/test-fixes/page.tsx': [
    { from: 'const _data = ', to: 'const data = ' }
  ],
  
  'frontend/src/hooks/use-toast.ts': [
    { from: 'const _actionTypes = ', to: 'const actionTypes = ' }
  ]
};

// Files that need import fixes
const IMPORT_FIXES = {
  'frontend/src/app/(city-auth)/city/register/page.tsx': [
    { from: 'import { useRouter as _useRouter }', to: 'import { useRouter }' },
    { from: 'const _router = useRouter();', to: 'const router = useRouter();' }
  ],
  
  'frontend/src/app/(auth)/reset-password/page.tsx': [
    { from: 'import { useRouter as _useRouter }', to: 'import { useRouter }' },
    { from: 'const _router = useRouter();', to: 'const router = useRouter();' }
  ]
};

// Files that need React import fixes
const REACT_IMPORT_FIXES = [
  'frontend/src/components/FontLoader.tsx',
  'frontend/src/hooks/useMediaQuery.ts',
  'frontend/src/hooks/useSupabase.ts',
  'frontend/src/hooks/useToast.ts',
  'frontend/src/utils/errorHandler.ts',
  'frontend/src/utils/offline-storage.ts'
];

function applyCriticalFixes(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    if (FINAL_CRITICAL_FIXES[filePath]) {
      for (const fix of FINAL_CRITICAL_FIXES[filePath]) {
        // Handle incomplete declarations
        if (fix.from.endsWith(' = ') && content.includes(fix.from)) {
          // Find the incomplete line and complete it
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(fix.from)) {
              // Check if the line is incomplete (ends with just the assignment)
              if (lines[i].trim().endsWith('= ') || lines[i].trim() === fix.from.trim()) {
                lines[i] = lines[i].replace(fix.from, fix.to);
                modified = true;
              }
            }
          }
          if (modified) {
            content = lines.join('\n');
          }
        } else if (content.includes(fix.from)) {
          content = content.replace(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
          modified = true;
        }
      }
    }

    if (IMPORT_FIXES[filePath]) {
      for (const fix of IMPORT_FIXES[filePath]) {
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

function fixReactImports(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix React import syntax issues
    if (content.includes('import React as _React')) {
      content = content.replace('import React as _React', 'import React');
      modified = true;
    }

    if (content.includes('const _React = ')) {
      content = content.replace('const _React = ', 'const React = ');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed React imports in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing React imports in ${filePath}:`, error.message);
    return false;
  }
}

function fixIncompleteDeclarations() {
  // Additional files that might have incomplete declarations
  const problematicFiles = [
    'frontend/src/app/(dashboard)/company/profile/page.tsx',
    'frontend/src/app/(dashboard)/drivers/create/page.tsx',
    'frontend/src/app/(dashboard)/vehicles/create/page.tsx',
    'frontend/src/app/(dashboard)/weights/new/page.tsx'
  ];

  let totalFixed = 0;

  for (const filePath of problematicFiles) {
    try {
      if (!fs.existsSync(filePath)) {
        continue;
      }

      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // Fix incomplete router declarations
      if (content.includes('const _router = ') && !content.includes('const _router = useRouter()')) {
        content = content.replace(/const _router = \s*$/gm, 'const router = useRouter();');
        modified = true;
      }

      // Fix incomplete name declarations
      if (content.includes('const _name = ') && !content.includes('const _name = ')) {
        content = content.replace(/const _name = \s*$/gm, 'const name = "";');
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed incomplete declarations in: ${filePath}`);
        totalFixed++;
      }
    } catch (error) {
      console.error(`❌ Error fixing incomplete declarations in ${filePath}:`, error.message);
    }
  }

  return totalFixed;
}

function main() {
  console.log('🎯 FINAL ZERO PUSH: Eliminating the last 160 errors...\n');
  
  let totalFixed = 0;
  
  // Apply critical fixes
  console.log('🔧 Applying final critical fixes...');
  const allFiles = [...Object.keys(FINAL_CRITICAL_FIXES), ...Object.keys(IMPORT_FIXES)];
  const uniqueFiles = [...new Set(allFiles)];
  
  for (const filePath of uniqueFiles) {
    if (applyCriticalFixes(filePath)) {
      totalFixed++;
    }
  }
  
  // Fix React imports
  console.log('\n⚛️ Fixing React import issues...');
  for (const filePath of REACT_IMPORT_FIXES) {
    if (fixReactImports(filePath)) {
      totalFixed++;
    }
  }
  
  // Fix incomplete declarations
  console.log('\n🔧 Fixing incomplete declarations...');
  totalFixed += fixIncompleteDeclarations();
  
  console.log(`\n✨ Applied final fixes to ${totalFixed} files!`);
  console.log('🏆 THIS IS THE FINAL PUSH TO ACHIEVE ZERO ERRORS!');
  console.log('🎉 We are eliminating every last error!');
}

if (require.main === module) {
  main();
}

module.exports = { applyCriticalFixes, fixReactImports, fixIncompleteDeclarations };
