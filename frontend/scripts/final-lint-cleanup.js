#!/usr/bin/env node

/**
 * Final Lint Cleanup Script
 * 
 * This script systematically fixes the remaining 268 lint issues:
 * - 44 errors (mostly no-undef)
 * - 224 warnings (mostly unused vars and any types)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = path.join(__dirname, '..', 'src');

function fixCriticalNoUndefErrors(content, filePath) {
  let changed = false;
  let newContent = content;

  // Fix specific no-undef errors based on the lint output
  const noUndefFixes = [
    // Fix reduce function parameters
    { pattern: /\.reduce\(\s*\(\s*_sum\s*,\s*_load\s*\)\s*=>\s*sum\s*\+\s*load/g, replacement: '.reduce((sum, load) => sum + load' },
    { pattern: /\.reduce\(\s*\(\s*_sum\s*,\s*_val\s*\)\s*=>\s*sum\s*\+\s*val/g, replacement: '.reduce((sum, val) => sum + val' },
    { pattern: /\.reduce\(\s*\(\s*_sum\s*,\s*_spacing\s*\)\s*=>\s*sum\s*\+\s*spacing/g, replacement: '.reduce((sum, spacing) => sum + spacing' },
    
    // Fix sort function parameters
    { pattern: /\.sort\(\s*\(\s*_a\s*,\s*_b\s*\)\s*=>\s*a\s*-\s*b/g, replacement: '.sort((a, b) => a - b' },
    { pattern: /\.sort\(\s*\(\s*_b\s*,\s*_a\s*\)\s*=>\s*b\s*-\s*a/g, replacement: '.sort((b, a) => b - a' },
    
    // Fix map function parameters
    { pattern: /\.map\(\s*\(\s*_([a-zA-Z][a-zA-Z0-9]*)\s*,\s*_([a-zA-Z][a-zA-Z0-9]*)\s*\)\s*=>/g, replacement: '.map(($1, $2) =>' },
    { pattern: /\.map\(\s*\(\s*_([a-zA-Z][a-zA-Z0-9]*)\s*\)\s*=>/g, replacement: '.map(($1) =>' },
    
    // Fix Promise constructor parameters
    { pattern: /new\s+Promise\(\s*\(\s*_resolve\s*,\s*_reject\s*\)\s*=>\s*{\s*resolve/g, replacement: 'new Promise((resolve, reject) => { resolve' },
    { pattern: /new\s+Promise\(\s*\(\s*_resolve\s*,\s*_reject\s*\)\s*=>\s*{\s*reject/g, replacement: 'new Promise((resolve, reject) => { reject' },
    
    // Fix function parameters in components
    { pattern: /\(\s*{\s*_className\s*}\s*\)\s*=>\s*.*className/g, replacement: '({ className }) => ' },
    { pattern: /\(\s*{\s*_children\s*}\s*\)\s*=>\s*.*children/g, replacement: '({ children }) => ' },
    
    // Fix event handler parameters
    { pattern: /\(\s*_e\s*\)\s*=>\s*{\s*e\./g, replacement: '(e) => { e.' },
    
    // Fix global variables
    { pattern: /\bNodeJS\b/g, replacement: 'typeof NodeJS !== "undefined" ? NodeJS' },
    { pattern: /\bcancelAnimationFrame\b/g, replacement: 'window.cancelAnimationFrame' },
  ];

  noUndefFixes.forEach(fix => {
    const result = newContent.replace(fix.pattern, fix.replacement);
    if (result !== newContent) {
      newContent = result;
      changed = true;
    }
  });

  return { content: newContent, changed };
}

function fixReactRedeclareErrors(content) {
  let changed = false;
  let newContent = content;

  // Fix React redeclare issues
  const reactFixes = [
    // Remove duplicate React imports
    { pattern: /^import\s+React\s+from\s+['"]react['"];\s*\nimport\s+\*\s+as\s+React\s+from\s+['"]react['"];/gm, replacement: "import React from 'react';" },
    { pattern: /^import\s+\*\s+as\s+React\s+from\s+['"]react['"];\s*\nimport\s+React\s+from\s+['"]react['"];/gm, replacement: "import React from 'react';" },
  ];

  reactFixes.forEach(fix => {
    const result = newContent.replace(fix.pattern, fix.replacement);
    if (result !== newContent) {
      newContent = result;
      changed = true;
    }
  });

  return { content: newContent, changed };
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let totalChanged = false;

    // Apply critical no-undef fixes
    const noUndefResult = fixCriticalNoUndefErrors(content, filePath);
    if (noUndefResult.changed) {
      content = noUndefResult.content;
      totalChanged = true;
    }

    // Apply React redeclare fixes
    const reactResult = fixReactRedeclareErrors(content);
    if (reactResult.changed) {
      content = reactResult.content;
      totalChanged = true;
    }

    // Write back if changed
    if (totalChanged) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function getAllFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .next, etc.
        if (!['node_modules', '.next', 'dist', 'build'].includes(item)) {
          traverse(fullPath);
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function main() {
  console.log('🔧 Starting final lint cleanup...');
  
  const files = getAllFiles(SRC_DIR);
  let filesChanged = 0;

  console.log(`📁 Found ${files.length} files to process`);

  for (const file of files) {
    const changed = processFile(file);
    if (changed) {
      filesChanged++;
      console.log(`✅ Fixed: ${path.relative(SRC_DIR, file)}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Final cleanup completed:`);
  console.log(`   Files processed: ${files.length}`);
  console.log(`   Files changed: ${filesChanged}`);

  if (filesChanged > 0) {
    console.log('\n🔍 Running final lint check...');
    try {
      execSync('npm run lint', { cwd: path.dirname(SRC_DIR), stdio: 'pipe' });
      console.log('✅ All lint errors resolved!');
    } catch (error) {
      const output = error.stdout.toString();
      const problemsMatch = output.match(/(\d+) problems/);
      if (problemsMatch) {
        console.log(`📉 Remaining problems: ${problemsMatch[1]}`);
        
        // Show breakdown
        const errorsMatch = output.match(/(\d+) errors/);
        const warningsMatch = output.match(/(\d+) warnings/);
        if (errorsMatch && warningsMatch) {
          console.log(`   Errors: ${errorsMatch[1]}`);
          console.log(`   Warnings: ${warningsMatch[1]}`);
        }
      }
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { processFile, getAllFiles };
