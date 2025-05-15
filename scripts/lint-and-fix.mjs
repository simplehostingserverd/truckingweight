#!/usr/bin/env node

/**
 * Comprehensive script to scan and fix linting, syntax, and formatting errors
 * This script will:
 * 1. Check for ESM compatibility issues
 * 2. Fix import/export statements
 * 3. Format code with Prettier
 * 4. Fix common syntax errors
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Directories to process
const directories = [
  'backend/routes',
  'backend/controllers',
  'backend/middleware',
  'backend/services',
  'backend/config',
  'backend/utils',
  'backend/models',
  'backend/lib'
];

// Files to skip (already fixed or should remain as is)
const skipFiles = [];

// Common import patterns to fix
const importPatterns = [
  {
    // Fix default imports for modules that export named exports
    pattern: /import\s+(\w+)\s+from\s+['"]([^'"]+)['"];/g,
    replacement: (match, importName, modulePath, offset, string) => {
      // Skip if the import is already using named imports
      if (string.slice(offset - 20, offset).includes('* as')) {
        return match;
      }
      return `import * as ${importName} from '${modulePath}';`;
    },
    modules: [
      'pasetoService',
      'tokenService',
      'cacheService',
      'database',
      'swagger'
    ]
  },
  {
    // Add .js extension to relative imports
    pattern: /import\s+(?:(?:\{\s*[^}]+\})|(?:\*\s+as\s+\w+)|(?:\w+))\s+from\s+['"](\.[^'"]+)['"];/g,
    replacement: (match, modulePath) => {
      if (modulePath.endsWith('.js') || modulePath.endsWith('.mjs')) {
        return match;
      }
      return match.replace(modulePath, `${modulePath}.js`);
    }
  },
  {
    // Convert CommonJS require to ESM import
    pattern: /const\s+(\w+|\{\s*[\w\s,]+\})\s+=\s+require\(['"]([^'"]+)['"]\);/g,
    replacement: (match, importName, modulePath) => {
      const newPath = modulePath.startsWith('.') && !path.extname(modulePath) 
        ? `${modulePath}.js` 
        : modulePath;
      
      if (importName.includes('{')) {
        return `import ${importName} from '${newPath}';`;
      }
      return `import ${importName} from '${newPath}';`;
    }
  },
  {
    // Convert module.exports to export default
    pattern: /module\.exports\s+=\s+(\w+);/g,
    replacement: 'export default $1;'
  },
  {
    // Convert module.exports = { ... } to export default { ... }
    pattern: /module\.exports\s+=\s+\{([^}]+)\};/g,
    replacement: 'export default {$1};'
  },
  {
    // Convert exports.X to export const X
    pattern: /exports\.(\w+)\s+=\s+/g,
    replacement: 'export const $1 = '
  }
];

// Function to fix imports in a file
async function fixImports(filePath, content) {
  let newContent = content;
  
  // Apply all import patterns
  for (const { pattern, replacement, modules } of importPatterns) {
    if (modules) {
      // Only apply to specific modules
      for (const moduleName of modules) {
        const specificPattern = new RegExp(`import\\s+(\\w+)\\s+from\\s+['"][^'"]*${moduleName}['"];`, 'g');
        newContent = newContent.replace(specificPattern, (match, importName) => {
          return `import * as ${importName} from '${match.match(/from\s+['"](.*?)['"]/)[1]}';`;
        });
      }
    } else {
      // Apply to all imports
      newContent = newContent.replace(pattern, replacement);
    }
  }
  
  return newContent;
}

// Function to fix exports in a file
async function fixExports(filePath, content) {
  let newContent = content;
  
  // Check if the file has named exports that should also be exported individually
  const defaultExportMatch = newContent.match(/export\s+default\s+\{([^}]+)\};/);
  if (defaultExportMatch) {
    const exportedItems = defaultExportMatch[1].split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    // Add named exports before the default export
    if (exportedItems.length > 0) {
      const namedExports = `export { ${exportedItems.join(', ')} };\n\n`;
      
      // Check if named exports already exist
      if (!newContent.includes(`export { ${exportedItems[0]}`)) {
        newContent = newContent.replace(/export\s+default\s+\{/, `${namedExports}export default {`);
      }
    }
  }
  
  return newContent;
}

// Function to fix syntax errors in a file
async function fixSyntaxErrors(filePath, content) {
  let newContent = content;
  
  // Fix async; function syntax error
  newContent = newContent.replace(/export\s+default\s+async;\s+function/g, 'export default async function');
  
  // Fix missing semicolons
  newContent = newContent.replace(/}\n(?![\s}])/g, '};\n');
  
  return newContent;
}

// Function to format a file with Prettier
async function formatWithPrettier(filePath) {
  try {
    execSync(`npx prettier --write "${filePath}"`, { stdio: 'inherit' });
    console.log(`  Formatted ${filePath} with Prettier`);
  } catch (error) {
    console.error(`  Error formatting ${filePath} with Prettier:`, error.message);
  }
}

// Function to process a file
async function processFile(filePath) {
  try {
    console.log(`Processing ${filePath}...`);
    
    // Read the file content
    const content = await fs.readFile(filePath, 'utf8');
    
    // Fix imports
    let newContent = await fixImports(filePath, content);
    
    // Fix exports
    newContent = await fixExports(filePath, newContent);
    
    // Fix syntax errors
    newContent = await fixSyntaxErrors(filePath, newContent);
    
    // Write the modified content back to the file if changed
    if (newContent !== content) {
      await fs.writeFile(filePath, newContent, 'utf8');
      console.log(`  Updated ${filePath}`);
    }
    
    // Format with Prettier
    await formatWithPrettier(filePath);
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Function to process a directory recursively
async function processDirectory(directory) {
  try {
    const fullPath = path.join(rootDir, directory);
    
    // Check if directory exists
    try {
      await fs.access(fullPath);
    } catch (error) {
      console.log(`Directory ${fullPath} does not exist, skipping...`);
      return;
    }
    
    const files = await fs.readdir(fullPath);
    
    for (const file of files) {
      const filePath = path.join(fullPath, file);
      const fileStat = await fs.stat(filePath);
      
      if (fileStat.isDirectory()) {
        // Recursively process subdirectories
        await processDirectory(path.join(directory, file));
      } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
        // Skip files in the skip list
        if (skipFiles.includes(file)) {
          console.log(`Skipping ${filePath} (in skip list)`);
          continue;
        }
        
        // Process JavaScript files
        await processFile(filePath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error);
  }
}

// Install required dependencies
async function installDependencies() {
  try {
    console.log('Installing required dependencies...');
    execSync('npm install --save-dev prettier', { stdio: 'inherit' });
    console.log('Dependencies installed successfully');
  } catch (error) {
    console.error('Error installing dependencies:', error.message);
  }
}

// Main function to start the process
async function main() {
  console.log('Starting comprehensive linting and fixing process...');
  
  // Install dependencies
  await installDependencies();
  
  // Process all directories
  for (const directory of directories) {
    console.log(`Processing directory: ${directory}`);
    await processDirectory(directory);
  }
  
  console.log('Linting and fixing process completed');
}

// Run the main function
main().catch(error => {
  console.error('Error in main function:', error);
  process.exit(1);
});
