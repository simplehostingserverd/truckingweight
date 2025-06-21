#!/usr/bin/env node

/**
 * Replace 'any' types with 'unknown' for better type safety
 */

const fs = require('fs');
const path = require('path');

// Files to process
const filesToProcess = [
  // Components with any[] arrays
  'src/components/WeightCapture/ScaleSelector.tsx',
  'src/components/toll/TollAccountDetails.tsx',
  'src/components/Dashboard/DashboardStats.tsx',
  'src/components/Dashboard/VehicleWeightChart.tsx',
  'src/components/Dashboard/LoadStatusChart.tsx',
  'src/components/Dashboard/AdminCompanySelector.tsx',
  
  // Pages with any[] arrays
  'src/app/(dashboard)/weights/new/page.tsx',
  'src/app/(dashboard)/weights/[id]/edit/page.tsx',
  'src/app/(dashboard)/signatures/page.tsx',
  'src/app/(dashboard)/loads/edit/[id]/page.tsx',
  'src/app/(dashboard)/admin/users/page.tsx',
  'src/app/(dashboard)/admin/companies/page.tsx',
  
  // Other files with any types
  'src/hooks/useAudioAlerts.ts',
  'src/hooks/useSWRFetch.ts',
  'src/hooks/useSWROptimized.ts',
  'src/lib/metrics.ts',
  'src/lib/performance.ts',
  'src/providers/SupabaseAuthProvider.tsx',
  'src/utils/storage/enterprise-storage.ts',
];

// Replacement patterns
const replacements = [
  // Basic any[] to unknown[]
  { pattern: /: any\[\]/g, replacement: ': unknown[]' },
  { pattern: /Array<any>/g, replacement: 'Array<unknown>' },
  
  // Function parameters
  { pattern: /\(([^)]*): any\)/g, replacement: '($1: unknown)' },
  { pattern: /\(([^)]*): any\[\]\)/g, replacement: '($1: unknown[])' },
  
  // Variable declarations
  { pattern: /const ([^:]+): any =/g, replacement: 'const $1: unknown =' },
  { pattern: /let ([^:]+): any =/g, replacement: 'let $1: unknown =' },
  { pattern: /var ([^:]+): any =/g, replacement: 'var $1: unknown =' },
  
  // Interface/type properties
  { pattern: /(\s+)([a-zA-Z_][a-zA-Z0-9_]*)\?: any;/g, replacement: '$1$2?: unknown;' },
  { pattern: /(\s+)([a-zA-Z_][a-zA-Z0-9_]*): any;/g, replacement: '$1$2: unknown;' },
  { pattern: /(\s+)([a-zA-Z_][a-zA-Z0-9_]*)\?: any\[\];/g, replacement: '$1$2?: unknown[];' },
  { pattern: /(\s+)([a-zA-Z_][a-zA-Z0-9_]*): any\[\];/g, replacement: '$1$2: unknown[];' },
  
  // Generic types
  { pattern: /Promise<any>/g, replacement: 'Promise<unknown>' },
  { pattern: /Record<string, any>/g, replacement: 'Record<string, unknown>' },
  { pattern: /Record<[^,]+, any>/g, replacement: 'Record<$1, unknown>' },
];

function processFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;
    let changeCount = 0;
    
    // Apply all replacements
    for (const { pattern, replacement } of replacements) {
      const matches = (content.match(pattern) || []).length;
      if (matches > 0) {
        content = content.replace(pattern, replacement);
        changed = true;
        changeCount += matches;
      }
    }
    
    if (changed) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ ${filePath}: ${changeCount} replacements`);
      return true;
    } else {
      console.log(`⏭️  ${filePath}: No changes needed`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔄 Replacing "any" types with "unknown" for better type safety...\n');
  
  let processedCount = 0;
  let changedCount = 0;
  
  for (const filePath of filesToProcess) {
    processedCount++;
    if (processFile(filePath)) {
      changedCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${processedCount}`);
  console.log(`   Files changed: ${changedCount}`);
  console.log(`   Files unchanged: ${processedCount - changedCount}`);
  
  if (changedCount > 0) {
    console.log('\n🔍 Next steps:');
    console.log('   1. Run: npm run build');
    console.log('   2. Fix any type errors that arise');
    console.log('   3. Test the application');
  }
}

if (require.main === module) {
  main();
}

module.exports = { processFile, replacements };
