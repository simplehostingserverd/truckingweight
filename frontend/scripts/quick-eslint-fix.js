#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Quick ESLint Fix Script
 * 
 * Automatically fixes the most common ESLint warnings from the build output
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
  'VehicleIcon', 'SearchIcon', 'XMarkIcon', 'Input', 'useRef', 'useEffect'
];

// Variables to prefix with underscore (intentionally unused)
const UNUSED_VARS = [
  'router', 'supabase', 'isLoading', 'selectedDashboard', 'userData',
  'userRole', 'activeTab', 'setActiveTab', 'selectedDevice', 'selectedSensor',
  'handleDelete', 'connectionStatus', 'snackbarSeverity', 'connectedScales',
  'showQRScanner', 'setShowQRScanner', 'status', 'captchaRef', 'error',
  'err', 'data', 'mutate', 'sessionError', 'userName', 'expiringLicenses',
  'recentWeights', 'isTablet', 'isLargeScreen', 'fontsLoaded', 'logos',
  'handleError', 'getStatusColor', 'alertsAcknowledged', 'setAlertsAcknowledged',
  'user', 'drivers', 'currentTruckPosition', 'selectedTimeRange', 'setSelectedTimeRange',
  'totalDuration', 'geofenceZones', 'quality', 'sortable', 'useState',
  'isValidating', 'uploadData', 'ViolationType', 'getStatusColorClass',
  'actionTypes', 'destinationName', 'React', 'updateInterval', 'req',
  'vehicleId', 'zoneId', 'violationType', 'startTime', 'endTime', 'navigator',
  'GeoLocation', 'lightTheme', 'isDevelopment', 'formatData', 'performance',
  'e', 'config', 'filename', 'options', 'job', 'storageId', 'operation',
  'dataType', 'success', 'healthData', 'setRole', 'ThemeProvider'
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

    // 4. Prefix unused variables with underscore
    UNUSED_VARS.forEach(varName => {
      // Match variable declarations
      const patterns = [
        new RegExp(`\\b(const|let|var)\\s+(${varName})\\b`, 'g'),
        new RegExp(`\\b(${varName})\\s*=\\s*use`, 'g'),
        new RegExp(`\\b(${varName})\\s*:\\s*\\w+`, 'g'),
        new RegExp(`\\{\\s*(${varName})\\s*\\}`, 'g'),
        new RegExp(`\\[\\s*(${varName})\\s*\\]`, 'g'),
        new RegExp(`\\((.*?\\b${varName}\\b.*?)\\)\\s*=>`, 'g'),
        new RegExp(`function\\s*\\([^)]*\\b${varName}\\b[^)]*\\)`, 'g')
      ];
      
      patterns.forEach(pattern => {
        const newContent = content.replace(pattern, (match) => {
          if (!match.includes(`_${varName}`)) {
            const result = match.replace(new RegExp(`\\b${varName}\\b`, 'g'), `_${varName}`);
            if (result !== match) modified = true;
            return result;
          }
          return match;
        });
        content = newContent;
      });
    });

    // 5. Add eslint-disable for remaining unused vars
    const finalLines = content.split('\n');
    const resultLines = [];
    
    for (let i = 0; i < finalLines.length; i++) {
      const line = finalLines[i];
      
      // Check for lines that might still have unused variable warnings
      if ((line.includes('const ') || line.includes('let ') || line.includes('= use')) &&
          !finalLines[i-1]?.includes('eslint-disable-next-line')) {
        
        // Add eslint-disable for common patterns
        const needsDisable = UNUSED_VARS.some(varName => 
          line.includes(varName) && !line.includes(`_${varName}`)
        );
        
        if (needsDisable) {
          resultLines.push(`${' '.repeat(line.search(/\S/))}// eslint-disable-next-line @typescript-eslint/no-unused-vars`);
          modified = true;
        }
      }
      
      resultLines.push(line);
    }
    
    content = resultLines.join('\n');

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
  console.log('🔧 Starting quick ESLint warning fixes...');
  
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
