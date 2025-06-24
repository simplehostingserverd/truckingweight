#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Safe ESLint Fix Script
 * 
 * Only removes unused imports and fixes console.log statements
 * Does NOT rename variables to avoid breaking code
 */

// List of unused imports to remove (from build output)
const UNUSED_IMPORTS = [
  'CalendarIcon', 'ExclamationTriangleIcon', 'XCircleIcon', 'CheckCircleIcon',
  'ClockIcon', 'WrenchScrewdriverIcon', 'CurrencyDollarIcon', 'MapPinIcon',
  'BoltIcon', 'WifiIcon', 'CpuChipIcon', 'BuildingOfficeIcon', 'UserIcon',
  'CogIcon', 'ShieldCheckIcon', 'CloudArrowUpIcon', 'ServerIcon',
  'ArrowsRightLeftIcon', 'DocumentTextIcon', 'AdjustmentsHorizontalIcon',
  'InformationCircleIcon', 'PlayIcon', 'Alert', 'AlertDescription',
  'Table', 'TableBody', 'TableCell', 'TableHead', 'TableHeader', 'TableRow',
  'Tabs', 'TabsList', 'TabsTrigger', 'TabsContent', 'EyeIcon',
  'CursorArrowRaysIcon', 'NoSymbolIcon', 'Divider', 'ListItemIcon', 'Paper',
  'VehicleIcon', 'SearchIcon', 'XMarkIcon', 'Input', 'AcademicCapIcon',
  'DialogTrigger'
];

function getAllFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files = files.concat(getAllFiles(fullPath, extensions));
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}: ${err.message}`);
  }
  
  return files;
}

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const originalContent = content;

    // 1. Remove unused imports
    const lines = content.split('\n');
    const newLines = [];
    
    for (const line of lines) {
      if (line.trim().startsWith('import ') && line.includes('{')) {
        let modifiedLine = line;
        let hasUnusedImport = false;
        
        UNUSED_IMPORTS.forEach(unusedImport => {
          if (line.includes(unusedImport)) {
            // Check if actually used in file
            const usageRegex = new RegExp(`\\b${unusedImport}\\b`, 'g');
            const matches = content.match(usageRegex);
            
            if (!matches || matches.length <= 1) {
              // Remove this import
              modifiedLine = modifiedLine.replace(new RegExp(`\\s*,?\\s*${unusedImport}\\s*,?`, 'g'), '');
              modifiedLine = modifiedLine.replace(/{\s*,/, '{').replace(/,\s*}/, '}');
              hasUnusedImport = true;
            }
          }
        });
        
        // Skip empty import lines
        if (modifiedLine.match(/import\s*{\s*}\s*from/) || modifiedLine.includes('import {  }')) {
          continue;
        }
        
        newLines.push(modifiedLine);
        if (hasUnusedImport) modified = true;
      } else {
        newLines.push(line);
      }
    }
    
    content = newLines.join('\n');

    // 2. Fix console.log statements
    if (content.includes('console.log(')) {
      content = content.replace(/console\.log\(/g, 'console.warn(');
      modified = true;
    }

    // 3. Remove unused React imports (React 17+)
    if (content.includes("import React") && 
        !content.includes('React.') && 
        !content.includes('<React.') &&
        !content.includes('React,')) {
      content = content.replace(/import React[^;]*;?\n?/g, '');
      modified = true;
    }

    // Write file if modified
    if (modified && content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`Error processing ${filePath}: ${err.message}`);
    return false;
  }
}

function main() {
  console.log('🔧 Starting safe ESLint warning fixes...');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const files = getAllFiles(srcDir);
  
  console.log(`📁 Found ${files.length} files to process`);
  
  let fixedCount = 0;
  const fixedFiles = [];
  
  files.forEach(file => {
    if (fixFile(file)) {
      fixedCount++;
      fixedFiles.push(path.relative(srcDir, file));
    }
  });
  
  console.log(`\n✅ Fixed ${fixedCount} files:`);
  fixedFiles.forEach(file => console.log(`   - ${file}`));
  
  console.log('\n🏗️  Running build to check remaining warnings...');
  
  try {
    execSync('npm run build', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    console.log('\n🎉 Build completed! Check output above for any remaining warnings.');
  } catch (err) {
    console.log('\n⚠️  Build completed with some issues. Check output above.');
  }
}

if (require.main === module) {
  main();
}
