#!/usr/bin/env node

/**
 * Safe ESLint Fixes
 * 
 * This script only applies very safe fixes that won't break functionality:
 * 1. Only fix console.log statements
 * 2. Only fix very specific 'any' types that are safe
 * 3. Only remove clearly unused imports
 * 4. Don't touch variables that might be used
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = path.join(__dirname, '../src');

function getAllTsFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !['node_modules', '.next', 'dist'].includes(item)) {
        traverse(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function revertProblematicChanges(content) {
  let fixed = content;
  let changes = 0;
  
  // Revert problematic variable renames that broke functionality
  const revertPatterns = [
    // Revert error variables that are actually used
    { pattern: /const \[_error, setError\]/g, replacement: 'const [error, setError]' },
    { pattern: /const _handleError = /g, replacement: 'const handleError = ' },
    { pattern: /const _handleSubmit = /g, replacement: 'const handleSubmit = ' },
    { pattern: /const _handleChange = /g, replacement: 'const handleChange = ' },
    { pattern: /const _handleClick = /g, replacement: 'const handleClick = ' },
    { pattern: /const \[_loading, setLoading\]/g, replacement: 'const [loading, setLoading]' },
    { pattern: /const \[_isLoading, setIsLoading\]/g, replacement: 'const [isLoading, setIsLoading]' },
    { pattern: /const \[_data, setData\]/g, replacement: 'const [data, setData]' },
    { pattern: /const \[_mounted, setMounted\]/g, replacement: 'const [mounted, setMounted]' },
  ];
  
  for (const { pattern, replacement } of revertPatterns) {
    const matches = (fixed.match(pattern) || []).length;
    if (matches > 0) {
      fixed = fixed.replace(pattern, replacement);
      changes += matches;
      console.log(`    - Reverted ${matches} problematic variable renames`);
    }
  }
  
  return { content: fixed, changes };
}

function applySafeFixes(content) {
  let fixed = content;
  let changes = 0;
  
  // Only apply very safe fixes
  
  // 1. Safe TypeScript fixes (only very specific patterns)
  const safeTypeFixes = [
    { pattern: /: any \/\* @ts-ignore \*\//g, replacement: ': unknown' },
    // Only fix 'any' in very specific, safe contexts
    { pattern: /Promise<any>/g, replacement: 'Promise<unknown>' },
  ];
  
  for (const { pattern, replacement } of safeTypeFixes) {
    const matches = (fixed.match(pattern) || []).length;
    if (matches > 0) {
      fixed = fixed.replace(pattern, replacement);
      changes += matches;
      console.log(`    - Applied ${matches} safe TypeScript fixes`);
    }
  }
  
  // 2. Safe import removals (only very obvious unused imports)
  const safeImportRemovals = [
    /^import React from 'react';\n(?=import { useState|import { useEffect|import { Component)/gm,
  ];
  
  for (const pattern of safeImportRemovals) {
    const matches = (fixed.match(pattern) || []).length;
    if (matches > 0) {
      fixed = fixed.replace(pattern, '');
      changes += matches;
      console.log(`    - Removed ${matches} safe unused imports`);
    }
  }
  
  return { content: fixed, changes };
}

function main() {
  console.log('🔧 Applying safe fixes and reverting problematic changes...\n');
  
  const files = getAllTsFiles(SRC_DIR);
  console.log(`📁 Processing ${files.length} TypeScript files\n`);
  
  let totalChanges = 0;
  let filesChanged = 0;
  
  for (const file of files) {
    const relativePath = path.relative(SRC_DIR, file);
    const originalContent = fs.readFileSync(file, 'utf8');
    
    // First revert problematic changes
    const revertResult = revertProblematicChanges(originalContent);
    let content = revertResult.content;
    let fileChanges = revertResult.changes;
    
    // Then apply safe fixes
    const safeResult = applySafeFixes(content);
    content = safeResult.content;
    fileChanges += safeResult.changes;
    
    if (fileChanges > 0) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`  ✅ ${relativePath} - ${fileChanges} changes`);
      totalChanges += fileChanges;
      filesChanged++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Safe fixes completed:`);
  console.log(`   Files processed: ${files.length}`);
  console.log(`   Files changed: ${filesChanged}`);
  console.log(`   Total changes: ${totalChanges}`);
  
  if (totalChanges > 0) {
    console.log('\n🔍 Running lint to check status...');
    try {
      execSync('npm run lint', { cwd: path.dirname(SRC_DIR), stdio: 'pipe' });
      console.log('🎉 All lint issues resolved!');
    } catch (error) {
      const output = error.stdout.toString();
      const problemsMatch = output.match(/(\d+) problems \((\d+) errors, (\d+) warnings\)/);
      if (problemsMatch) {
        const [, total, errors, warnings] = problemsMatch;
        console.log(`📊 Current status: ${total} problems (${errors} errors, ${warnings} warnings)`);
        
        if (parseInt(errors) === 0) {
          console.log('✅ All critical errors fixed! Only warnings remain.');
        } else {
          console.log('⚠️  Still have critical errors that need manual attention.');
        }
      }
    }
  }
}

if (require.main === module) {
  main();
}
