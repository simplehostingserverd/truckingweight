#!/usr/bin/env node
/**
 * Environment Configuration Checker
 * Validates all required environment variables for both backend and frontend
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Required environment variables for backend
const BACKEND_REQUIRED = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_JWT_SECRET',
  'DATABASE_URL'
];

// Required environment variables for frontend
const FRONTEND_REQUIRED = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

// Optional but recommended environment variables
const OPTIONAL_VARS = [
  'NEXT_PUBLIC_MAPBOX_TOKEN',
  'NEXT_PUBLIC_CESIUM_TOKEN',
  'NEXT_PUBLIC_MAPTILER_KEY',
  'JWT_SECRET',
  'PASETO_SECRET_KEY',
  'NODE_ENV',
  'PORT',
  'BACKEND_URL',
  'NEXT_PUBLIC_API_URL',
  'FRONTEND_URL',
  'AUTHORIZED_DOMAINS'
];

// Third-party service variables (optional)
const THIRD_PARTY_VARS = [
  'PCMILER_API_KEY',
  'IPASS_API_KEY',
  'BESTPASS_CLIENT_ID',
  'BESTPASS_CLIENT_SECRET',
  'PREPASS_API_KEY',
  'SAMSARA_API_KEY',
  'MAPBOX_ACCESS_TOKEN',
  'HERE_API_KEY',
  'STRIPE_SECRET_KEY',
  'HCAPTCHA_SECRET_KEY',
  'NEXT_PUBLIC_HCAPTCHA_SITE_KEY'
];

function checkEnvironmentVariables() {
  log('cyan', '\n=== ENVIRONMENT CONFIGURATION CHECK ===\n');
  
  let hasErrors = false;
  let hasWarnings = false;

  // Check required backend variables
  log('blue', '🔧 BACKEND REQUIRED VARIABLES:');
  BACKEND_REQUIRED.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      log('red', `  ❌ ${varName}: MISSING (REQUIRED)`);
      hasErrors = true;
    } else {
      const displayValue = varName.includes('SECRET') || varName.includes('KEY') || varName.includes('URL') 
        ? `${value.substring(0, 20)}...` 
        : value;
      log('green', `  ✅ ${varName}: ${displayValue}`);
    }
  });

  // Check required frontend variables
  log('blue', '\n🌐 FRONTEND REQUIRED VARIABLES:');
  FRONTEND_REQUIRED.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      log('red', `  ❌ ${varName}: MISSING (REQUIRED)`);
      hasErrors = true;
    } else {
      const displayValue = varName.includes('KEY') 
        ? `${value.substring(0, 20)}...` 
        : value;
      log('green', `  ✅ ${varName}: ${displayValue}`);
    }
  });

  // Check optional variables
  log('blue', '\n⚙️  OPTIONAL VARIABLES:');
  OPTIONAL_VARS.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      log('yellow', `  ⚠️  ${varName}: NOT SET (OPTIONAL)`);
      hasWarnings = true;
    } else {
      const displayValue = varName.includes('SECRET') || varName.includes('KEY') 
        ? `${value.substring(0, 20)}...` 
        : value;
      log('green', `  ✅ ${varName}: ${displayValue}`);
    }
  });

  // Check third-party service variables
  log('blue', '\n🔌 THIRD-PARTY SERVICE VARIABLES:');
  THIRD_PARTY_VARS.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      log('white', `  ⭕ ${varName}: NOT SET (THIRD-PARTY)`);
    } else {
      const displayValue = varName.includes('SECRET') || varName.includes('KEY') 
        ? `${value.substring(0, 20)}...` 
        : value;
      log('green', `  ✅ ${varName}: ${displayValue}`);
    }
  });

  // Summary
  log('cyan', '\n=== SUMMARY ===');
  if (hasErrors) {
    log('red', '❌ CRITICAL: Missing required environment variables!');
    log('red', '   Please check your .env file and add the missing variables.');
  } else {
    log('green', '✅ All required environment variables are set!');
  }

  if (hasWarnings) {
    log('yellow', '⚠️  WARNING: Some optional variables are missing.');
    log('yellow', '   The application will work but some features may be limited.');
  }

  return !hasErrors;
}

function checkEnvFiles() {
  log('cyan', '\n=== ENVIRONMENT FILES CHECK ===\n');
  
  const envFile = path.join(process.cwd(), '.env');
  const envExampleFile = path.join(process.cwd(), '.env.example');
  
  if (fs.existsSync(envFile)) {
    log('green', '✅ .env file exists');
  } else {
    log('red', '❌ .env file is missing!');
    log('yellow', '   Please copy .env.example to .env and configure it.');
  }
  
  if (fs.existsSync(envExampleFile)) {
    log('green', '✅ .env.example file exists');
  } else {
    log('yellow', '⚠️  .env.example file is missing');
  }
}

function testDatabaseConnection() {
  log('cyan', '\n=== DATABASE CONNECTION TEST ===\n');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    log('red', '❌ DATABASE_URL not set, skipping connection test');
    return;
  }
  
  log('blue', '🔍 Testing database connection...');
  // Note: Actual connection test would require pg module
  log('yellow', '⚠️  Database connection test requires manual verification');
  log('white', '   Run: npm run test:db in backend directory');
}

function testSupabaseConnection() {
  log('cyan', '\n=== SUPABASE CONNECTION TEST ===\n');
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    log('red', '❌ Supabase credentials not set, skipping connection test');
    return;
  }
  
  log('blue', '🔍 Testing Supabase connection...');
  log('green', `✅ Supabase URL: ${supabaseUrl}`);
  log('green', `✅ Supabase Key: ${supabaseKey.substring(0, 20)}...`);
  log('yellow', '⚠️  Supabase connection test requires manual verification');
  log('white', '   Check Supabase dashboard or run backend tests');
}

function main() {
  log('magenta', '🚀 CARGO SCALE PRO - ENVIRONMENT CHECKER');
  log('magenta', '========================================');
  
  checkEnvFiles();
  const envOk = checkEnvironmentVariables();
  testDatabaseConnection();
  testSupabaseConnection();
  
  log('cyan', '\n=== NEXT STEPS ===');
  if (envOk) {
    log('green', '✅ Environment configuration looks good!');
    log('white', '   You can now run:');
    log('white', '   - Backend tests: cd backend && npm test');
    log('white', '   - Frontend tests: cd frontend && npm test');
    log('white', '   - Start backend: cd backend && npm run dev');
    log('white', '   - Start frontend: cd frontend && npm run dev');
  } else {
    log('red', '❌ Please fix the environment configuration first!');
    log('white', '   1. Copy .env.example to .env');
    log('white', '   2. Fill in the required values');
    log('white', '   3. Run this script again');
  }
  
  process.exit(envOk ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = {
  checkEnvironmentVariables,
  checkEnvFiles,
  BACKEND_REQUIRED,
  FRONTEND_REQUIRED,
  OPTIONAL_VARS,
  THIRD_PARTY_VARS
};