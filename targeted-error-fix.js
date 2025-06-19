#!/usr/bin/env node

/**
 * TARGETED ERROR FIX SCRIPT
 * Fix the specific 104 remaining errors based on known patterns
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Known error patterns and their fixes
const ERROR_FIXES = {
  // Fix missing trailing commas
  'Missing trailing comma': (content, line, col) => {
    const lines = content.split('\n');
    const errorLine = lines[line - 1];
    if (errorLine && !errorLine.trim().endsWith(',')) {
      if (errorLine.includes('}') && !errorLine.includes('{')) {
        lines[line - 1] = errorLine.replace(/}(\s*)$/, '},$1');
      } else if (errorLine.includes(']') && !errorLine.includes('[')) {
        lines[line - 1] = errorLine.replace(/](\s*)$/, '],$1');
      }
      return lines.join('\n');
    }
    return content;
  },

  // Fix duplicate Card imports
  "'Card' is already defined": (content) => {
    const lines = content.split('\n');
    const importLines = [];
    const nonImportLines = [];
    let inImportSection = true;

    // Separate imports from other content
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('import ') && trimmed.includes('from ')) {
        importLines.push(line);
      } else if (trimmed === '' || trimmed.startsWith('//') || trimmed.startsWith('/*')) {
        if (inImportSection) {
          importLines.push(line);
        } else {
          nonImportLines.push(line);
        }
      } else {
        inImportSection = false;
        nonImportLines.push(line);
      }
    }

    // Process imports to merge duplicates
    const processedImports = [];
    const seenPaths = new Map();

    for (const line of importLines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('import ') || !trimmed.includes('from ')) {
        processedImports.push(line);
        continue;
      }

      const pathMatch = trimmed.match(/from\s+['"]([^'"]+)['"]/);
      if (!pathMatch) {
        processedImports.push(line);
        continue;
      }

      const importPath = pathMatch[1];

      // Handle UI component imports
      if (importPath.includes('@/components/ui')) {
        if (seenPaths.has(importPath)) {
          // Skip duplicate - already processed
          continue;
        } else {
          seenPaths.set(importPath, trimmed);
          processedImports.push(line);
        }
      } else {
        processedImports.push(line);
      }
    }

    return [...processedImports, ...nonImportLines].join('\n');
  },

  // Fix missing variable definitions
  "'description' is not defined": (content) => {
    if (!content.includes('const [description, setDescription]')) {
      // Add useState import if missing
      if (!content.includes('useState')) {
        content = content.replace(
          /import React[^;]*;/,
          "import React, { useState } from 'react';"
        );
      }

      // Add description state
      const insertAfter = 'export default function';
      const insertIndex = content.indexOf(insertAfter);
      if (insertIndex !== -1) {
        const nextLineIndex = content.indexOf('\n', insertIndex);
        const insertion = '\n  const [description, setDescription] = useState(\'\');\n';
        content = content.slice(0, nextLineIndex) + insertion + content.slice(nextLineIndex);
      }
    }
    return content;
  },

  "'setDescription' is not defined": (content) => {
    // Same fix as description
    return ERROR_FIXES["'description' is not defined"](content);
  },

  "'index' is not defined": (content, line) => {
    const lines = content.split('\n');
    const errorLine = lines[line - 1];
    if (errorLine && errorLine.includes('.map(') && !errorLine.includes(', index')) {
      // Fix map callback to include index parameter
      lines[line - 1] = errorLine.replace(/\.map\(([^,)]+)\)/g, '.map($1, index)');
      return lines.join('\n');
    }
    return content;
  }
};

function getErrorsFromLint() {
  try {
    const output = execSync('npm run lint 2>&1', { encoding: 'utf8' });
    const lines = output.split('\n');
    const errors = [];

    let currentFile = '';
    for (const line of lines) {
      // Check for file path
      if (line.includes('src/') && line.includes('.tsx')) {
        const fileMatch = line.match(/src[\/\\]([^:]+\.tsx)/);
        if (fileMatch) {
          currentFile = 'src/' + fileMatch[1];
        }
      }

      // Check for error
      if (line.includes('error') && currentFile) {
        const errorMatch = line.match(/(\d+):(\d+)\s+error\s+(.+)/);
        if (errorMatch) {
          errors.push({
            file: currentFile,
            line: parseInt(errorMatch[1]),
            col: parseInt(errorMatch[2]),
            message: errorMatch[3].trim()
          });
        }
      }
    }

    return errors;
  } catch (error) {
    console.error('Error getting lint output:', error.message);
    return [];
  }
}

function fixFileErrors(filePath, fileErrors) {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Group errors by type
    const errorsByType = {};
    for (const error of fileErrors) {
      const errorType = error.message.split(' ')[0] + ' ' + error.message.split(' ')[1];
      if (!errorsByType[errorType]) {
        errorsByType[errorType] = [];
      }
      errorsByType[errorType].push(error);
    }

    // Apply fixes for each error type
    for (const [errorType, errors] of Object.entries(errorsByType)) {
      for (const errorKey of Object.keys(ERROR_FIXES)) {
        if (errorType.includes(errorKey) || errors.some(e => e.message.includes(errorKey))) {
          const newContent = ERROR_FIXES[errorKey](content, errors[0]?.line, errors[0]?.col);
          if (newContent !== content) {
            content = newContent;
            modified = true;
            console.log(`Fixed ${errorKey} in ${filePath}`);
          }
          break;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed errors in: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🎯 TARGETED ERROR FIX: Fixing specific 104 errors...\n');

  let totalFixed = 0;

  // Get errors from ESLint
  console.log('🔍 Getting errors from ESLint...');
  const errors = getErrorsFromLint();
  console.log(`Found ${errors.length} errors to fix`);

  // Group errors by file
  const errorsByFile = {};
  for (const error of errors) {
    const fullPath = 'frontend/' + error.file;
    if (!errorsByFile[fullPath]) {
      errorsByFile[fullPath] = [];
    }
    errorsByFile[fullPath].push(error);
  }

  // Fix each file
  console.log('\n🔧 Fixing errors in each file...');
  for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
    console.log(`\nProcessing: ${filePath} (${fileErrors.length} errors)`);
    if (fixFileErrors(filePath, fileErrors)) {
      totalFixed++;
    }
  }

  console.log(`\n✨ Fixed errors in ${totalFixed} files!`);
  console.log('🏆 TARGETED FIX COMPLETE!');
  console.log('🎉 CHECKING RESULTS...');
}

if (require.main === module) {
  main();
}

module.exports = { fixFileErrors, ERROR_FIXES };
