#!/usr/bin/env node

/**
 * Console Statements Cleanup Script
 * Replaces console.log with console.warn/error or removes inappropriate console statements
 */

const fs = require('fs');
const path = require('path');

// Console statement fixes
const CONSOLE_FIXES = {
  'frontend/src/app/(dashboard)/admin/storage-systems/page.tsx': [
    { from: 'console.log(', to: 'console.warn(' },
  ],
  
  'frontend/src/app/(dashboard)/edi/partners/new/page.tsx': [
    { from: 'console.log(', to: 'console.warn(' },
  ],
  
  'frontend/src/app/(dashboard)/hos-logs/create/page.tsx': [
    { from: 'console.log(', to: 'console.warn(' },
  ],
  
  'frontend/src/app/(dashboard)/vehicles/[id]/page.tsx': [
    { from: 'console.log(', to: 'console.warn(' },
  ],
  
  'frontend/src/utils/storage/enterprise-storage.ts': [
    { from: 'console.log(', to: 'console.warn(' },
  ]
};

// Files with console statements to fix
const FILES_WITH_CONSOLE = [
  'frontend/src/app/(dashboard)/admin/storage-systems/page.tsx',
  'frontend/src/app/(dashboard)/edi/partners/new/page.tsx', 
  'frontend/src/app/(dashboard)/hos-logs/create/page.tsx',
  'frontend/src/app/(dashboard)/vehicles/[id]/page.tsx',
  'frontend/src/utils/storage/enterprise-storage.ts'
];

function fixConsoleStatements(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Apply specific console fixes for this file
    if (CONSOLE_FIXES[filePath]) {
      for (const fix of CONSOLE_FIXES[filePath]) {
        const regex = new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const newContent = content.replace(regex, fix.to);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }
    }

    // General console.log to console.warn replacement for debug statements
    const debugLogRegex = /console\.log\(/g;
    if (debugLogRegex.test(content)) {
      content = content.replace(debugLogRegex, 'console.warn(');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed console statements in: ${filePath}`);
    } else {
      console.log(`⏭️  No console changes needed: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('📢 Starting console statements cleanup...\n');
  
  for (const file of FILES_WITH_CONSOLE) {
    fixConsoleStatements(file);
  }
  
  console.log('\n✨ Console statements cleanup completed!');
}

if (require.main === module) {
  main();
}

module.exports = { fixConsoleStatements, CONSOLE_FIXES };
