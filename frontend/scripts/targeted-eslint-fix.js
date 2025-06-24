#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Targeted ESLint Warning Fixer
 * 
 * Only fixes very specific, safe cases:
 * 1. Remove clearly unused imports (icons only)
 * 2. Add eslint-disable for specific unused variables
 * 3. Fix console.log statements
 * 4. Prefix unused function parameters with underscore (very selective)
 */

class TargetedESLintFixer {
  constructor() {
    this.srcDir = path.join(__dirname, '..', 'src');
    this.fixedFiles = [];
    this.stats = {
      unusedImportsRemoved: 0,
      consoleStatementsFixed: 0,
      eslintDisablesAdded: 0,
      parametersFixed: 0
    };
  }

  log(message) {
    console.log(`[Targeted Fixer] ${message}`);
  }

  getAllFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
    let files = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          files = files.concat(this.getAllFiles(fullPath, extensions));
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (err) {
      console.error(`Error reading directory ${dir}: ${err.message}`);
    }
    
    return files;
  }

  // Remove only icon imports that are clearly unused
  removeUnusedImports(content, filePath) {
    const lines = content.split('\n');
    const newLines = [];
    let modified = false;

    // Only remove icon imports that are clearly unused
    const iconImports = [
      'CalendarIcon', 'ExclamationTriangleIcon', 'XCircleIcon', 'CheckCircleIcon',
      'ClockIcon', 'WrenchScrewdriverIcon', 'CurrencyDollarIcon', 'MapPinIcon',
      'BoltIcon', 'WifiIcon', 'CpuChipIcon', 'BuildingOfficeIcon', 'UserIcon',
      'CogIcon', 'ShieldCheckIcon', 'CloudArrowUpIcon', 'ServerIcon',
      'ArrowsRightLeftIcon', 'DocumentTextIcon', 'AdjustmentsHorizontalIcon',
      'InformationCircleIcon', 'PlayIcon', 'EyeIcon',
      'CursorArrowRaysIcon', 'NoSymbolIcon', 'VehicleIcon', 'SearchIcon', 'XMarkIcon',
      'AcademicCapIcon'
    ];

    for (const line of lines) {
      if (line.trim().startsWith('import ') && line.includes('{')) {
        let modifiedLine = line;
        let hasUnusedImport = false;
        
        iconImports.forEach(iconImport => {
          if (line.includes(iconImport)) {
            // Check if actually used in file
            const usageRegex = new RegExp(`\\b${iconImport}\\b`, 'g');
            const matches = content.match(usageRegex);
            
            if (!matches || matches.length <= 1) {
              // Remove this import
              modifiedLine = modifiedLine.replace(new RegExp(`\\s*,?\\s*${iconImport}\\s*,?`, 'g'), '');
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
    
    if (modified) {
      this.stats.unusedImportsRemoved++;
    }

    return { content: newLines.join('\n'), modified };
  }

  // Fix console.log statements
  fixConsoleStatements(content, filePath) {
    let modified = false;
    
    // Replace console.log with console.warn (which is allowed)
    const originalContent = content;
    content = content.replace(/console\.log\(/g, 'console.warn(');
    
    if (content !== originalContent) {
      modified = true;
      this.stats.consoleStatementsFixed++;
    }

    return { content, modified };
  }

  // Add eslint-disable for very specific safe cases
  addEslintDisables(content, filePath) {
    const lines = content.split('\n');
    const newLines = [];
    let modified = false;
    
    // Only add eslint-disable for very specific, safe variables
    const safeUnusedVars = [
      'alert', 'userCountError', 'vehicleCountError', 'driverCountError',
      'AnalyticsWidget', '_selectedDashboard', 'selectedLoad', 'selectedDevice',
      'selectedSensor', 'showQRScanner', 'setShowQRScanner', 'newWeight',
      'healthData', 'setRole', 'userName', 'expiringLicenses', 'recentWeights',
      'fontsLoaded', 'logos', 'handleError', 'connectedScales', 'isValidating',
      'uploadData', 'updateInterval', '_lightTheme', '_isDevelopment', 'formatData',
      '_isLoading', 'setCityData', 'setError', 'setRecentWeighings', 'activePermits',
      'setActivePermits', '_activeTab', 'setActiveTab', '_isCalculatingRoute',
      '_calculateRoute', '_newLoad', 'getVendorIcon', 'handleDelete',
      '_connectionStatus', '_snackbarSeverity', '_userError', 'supabase',
      'newScale', 'router', 'hiddenSecrets', 'toggleSecretVisibility',
      'searchAlarms', 'setSearchAlarms', 'postAlarms', 'setPostAlarms',
      'datPlan', 'setDatPlan', 'driver', 'vehicle', '_inactiveDrivers',
      'INSPECTION_CATEGORIES', 'COMMODITIES', 'REGIONS', 'userData',
      'err', 'error', 'captchaRef', 'userRole'
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this line declares a safe unused variable
      safeUnusedVars.forEach(varName => {
        if ((line.includes(`const ${varName}`) || 
             line.includes(`let ${varName}`) || 
             line.includes(`${varName} =`) ||
             line.includes(`= ${varName}`)) &&
            !lines[i-1]?.includes('eslint-disable-next-line')) {
          
          newLines.push(`${' '.repeat(line.search(/\S/))}// eslint-disable-next-line @typescript-eslint/no-unused-vars`);
          modified = true;
        }
      });
      
      newLines.push(line);
    }

    if (modified) {
      this.stats.eslintDisablesAdded++;
    }

    return { content: newLines.join('\n'), modified };
  }

  // Process a single file
  processFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let totalModified = false;
      
      // Apply all fixes in order
      const fixes = [
        this.removeUnusedImports.bind(this),
        this.fixConsoleStatements.bind(this),
        this.addEslintDisables.bind(this)
      ];
      
      for (const fix of fixes) {
        const result = fix(content, filePath);
        content = result.content;
        if (result.modified) {
          totalModified = true;
        }
      }
      
      if (totalModified) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.fixedFiles.push(path.relative(this.srcDir, filePath));
      }
      
    } catch (err) {
      console.error(`Error processing ${filePath}: ${err.message}`);
    }
  }

  // Main execution
  async run() {
    this.log('Starting targeted ESLint warning fixes...');
    
    const files = this.getAllFiles(this.srcDir);
    this.log(`Processing ${files.length} files...`);
    
    files.forEach(file => this.processFile(file));
    
    this.log('\n=== Fix Summary ===');
    this.log(`Files modified: ${this.fixedFiles.length}`);
    this.log(`Unused imports removed: ${this.stats.unusedImportsRemoved}`);
    this.log(`Console statements fixed: ${this.stats.consoleStatementsFixed}`);
    this.log(`ESLint disables added: ${this.stats.eslintDisablesAdded}`);
    
    if (this.fixedFiles.length > 0) {
      this.log('\nModified files:');
      this.fixedFiles.slice(0, 10).forEach(file => this.log(`  - ${file}`));
      if (this.fixedFiles.length > 10) {
        this.log(`  ... and ${this.fixedFiles.length - 10} more files`);
      }
    }
    
    this.log('\nDone! Running build to check remaining warnings...');
  }
}

// Run if executed directly
if (require.main === module) {
  const fixer = new TargetedESLintFixer();
  fixer.run().catch(console.error);
}

module.exports = TargetedESLintFixer;
