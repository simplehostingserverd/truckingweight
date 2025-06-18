#!/usr/bin/env node

/**
 * Unused Variables Cleanup Script
 * Prefixes unused variables with underscore or removes them where appropriate
 */

const fs = require('fs');
const path = require('path');

// Common patterns for unused variables to fix
const UNUSED_VARIABLE_PATTERNS = [
  // State variables that are set but never used
  { pattern: /const \[(\w+), set\w+\] = useState/, replacement: 'const [_$1, set$1] = useState' },
  
  // Function parameters that are unused
  { pattern: /\(([^)]*), (\w+)\) => {/, replacement: '($1, _$2) => {' },
  
  // Destructured variables that are unused
  { pattern: /const { (\w+), ([^}]+) } = /, replacement: 'const { _$1, $2 } = ' },
  
  // Variables assigned but never used
  { pattern: /const (\w+) = [^;]+;/, replacement: 'const _$1 = ' }
];

// Specific variable fixes based on linting output
const SPECIFIC_FIXES = {
  // Auth pages
  'frontend/src/app/(auth)/login/page.tsx': [
    { from: 'const [_captchaToken, setCaptchaToken]', to: 'const [_captchaToken, _setCaptchaToken]' },
    { from: 'const [_captchaError, setCaptchaError]', to: 'const [_captchaError, _setCaptchaError]' },
    { from: 'const router = useRouter();', to: 'const _router = useRouter();' },
    { from: 'const _onCaptchaVerify = ', to: 'const _onCaptchaVerify = ' },
    { from: 'const _onCaptchaError = ', to: 'const _onCaptchaError = ' },
    { from: 'const _onCaptchaExpire = ', to: 'const _onCaptchaExpire = ' }
  ],
  
  'frontend/src/app/(auth)/register/page.tsx': [
    { from: 'const [_captchaToken, setCaptchaToken]', to: 'const [_captchaToken, _setCaptchaToken]' },
    { from: 'const [_captchaError, setCaptchaError]', to: 'const [_captchaError, _setCaptchaError]' },
    { from: 'const _onCaptchaVerify = ', to: 'const _onCaptchaVerify = ' },
    { from: 'const _onCaptchaError = ', to: 'const _onCaptchaError = ' },
    { from: 'const _onCaptchaExpire = ', to: 'const _onCaptchaExpire = ' }
  ],
  
  'frontend/src/app/(auth)/reset-password/page.tsx': [
    { from: 'const router = useRouter();', to: 'const _router = useRouter();' }
  ],
  
  // City auth pages
  'frontend/src/app/(city-auth)/city/login/page.tsx': [
    { from: 'const [showDemoLogin, setShowDemoLogin]', to: 'const [showDemoLogin, _setShowDemoLogin]' }
  ],
  
  'frontend/src/app/(city-auth)/city/register/page.tsx': [
    { from: 'const [role, setRole]', to: 'const [_role, setRole]' },
    { from: 'const router = useRouter();', to: 'const _router = useRouter();' }
  ],
  
  // Dashboard pages
  'frontend/src/app/(dashboard)/loads/create/page.tsx': [
    { from: 'const [isCalculatingRoute, setIsCalculatingRoute]', to: 'const [_isCalculatingRoute, setIsCalculatingRoute]' },
    { from: 'const calculateRoute = ', to: 'const _calculateRoute = ' },
    { from: 'const { data: newLoad', to: 'const { data: _newLoad' }
  ],
  
  'frontend/src/app/(dashboard)/scales/page.tsx': [
    { from: 'const [connectionStatus, setConnectionStatus]', to: 'const [_connectionStatus, setConnectionStatus]' },
    { from: 'const [snackbarSeverity, setSnackbarSeverity]', to: 'const [_snackbarSeverity, setSnackbarSeverity]' },
    { from: 'const { data: userData, error: userError', to: 'const { data: userData, error: _userError' },
    { from: 'const connectedScales = ', to: 'const _connectedScales = ' }
  ]
};

function cleanupVariables(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Apply specific fixes for this file
    if (SPECIFIC_FIXES[filePath]) {
      for (const fix of SPECIFIC_FIXES[filePath]) {
        if (content.includes(fix.from)) {
          content = content.replace(fix.from, fix.to);
          modified = true;
        }
      }
    }

    // Apply general patterns
    for (const pattern of UNUSED_VARIABLE_PATTERNS) {
      const newContent = content.replace(pattern.pattern, pattern.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed variables in: ${filePath}`);
    } else {
      console.log(`⏭️  No variable changes needed: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Files with unused variables to fix
const FILES_WITH_UNUSED_VARS = [
  'frontend/src/app/(auth)/login/page.tsx',
  'frontend/src/app/(auth)/register/page.tsx',
  'frontend/src/app/(auth)/reset-password/page.tsx',
  'frontend/src/app/(city-auth)/city/login/page.tsx',
  'frontend/src/app/(city-auth)/city/register/page.tsx',
  'frontend/src/app/(city-dashboard)/city/profile/page.tsx',
  'frontend/src/app/(city-dashboard)/city/weighing/page.tsx',
  'frontend/src/app/(dashboard)/city-weighing/page.tsx',
  'frontend/src/app/(dashboard)/company/profile/page.tsx',
  'frontend/src/app/(dashboard)/loads/create/page.tsx',
  'frontend/src/app/(dashboard)/scales/page.tsx',
  'frontend/src/app/(dashboard)/drivers/page.tsx',
  'frontend/src/app/(dashboard)/drivers/create/page.tsx',
  'frontend/src/app/(dashboard)/vehicles/create/page.tsx',
  'frontend/src/app/(dashboard)/weights/new/page.tsx',
  'frontend/src/app/(dashboard)/admin/companies/page.tsx',
  'frontend/src/app/(dashboard)/admin/settings/page.tsx'
];

function main() {
  console.log('🔧 Starting unused variables cleanup...\n');
  
  for (const file of FILES_WITH_UNUSED_VARS) {
    cleanupVariables(file);
  }
  
  console.log('\n✨ Variables cleanup completed!');
}

if (require.main === module) {
  main();
}

module.exports = { cleanupVariables, SPECIFIC_FIXES };
