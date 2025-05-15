#!/usr/bin/env node

/**
 * Comprehensive script to convert CommonJS modules to ESM
 * This script will scan and convert all .js files in the specified directories
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Files to skip (already converted or should remain as CommonJS)
const skipFiles = [
  'server-fastify.mjs',
  'cache.js',
  'pasetoService.js',
  'tokenService.js',
  'database.js',
  'swagger.js',
  'bearerAuth.js'
];

// Function to check if a file should be skipped
function shouldSkipFile(filePath) {
  const fileName = path.basename(filePath);
  return skipFiles.includes(fileName);
}

// Function to convert a file from CommonJS to ESM
async function convertFileToESM(filePath) {
  try {
    console.log(`Converting ${filePath} to ESM...`);
    
    // Read the file content
    const content = await fs.readFile(filePath, 'utf8');
    
    // Skip if file already uses ESM imports
    if (content.includes('import ') && content.includes('export ')) {
      console.log(`  Skipping ${filePath} - already using ESM syntax`);
      return;
    }
    
    // Replace require statements with import statements
    let newContent = content.replace(/const\s+(\w+|\{\s*[\w\s,]+\})\s+=\s+require\(['"]([^'"]+)['"]\);?/g, (match, importName, modulePath) => {
      // Add .js extension if it's a relative path and doesn't already have an extension
      const newPath = modulePath.startsWith('.') && !path.extname(modulePath) 
        ? `${modulePath}.js` 
        : modulePath;
      
      // Handle destructuring imports
      if (importName.includes('{')) {
        return `import ${importName} from '${newPath}';`;
      }
      // Handle default imports
      return `import ${importName} from '${newPath}';`;
    });
    
    // Replace module.exports = function with export default function
    newContent = newContent.replace(/module\.exports\s+=\s+function\s+(\w+)/g, 'export default function $1');
    
    // Replace module.exports = async function with export default async function
    newContent = newContent.replace(/module\.exports\s+=\s+async\s+function\s+(\w+)/g, 'export default async function $1');
    
    // Replace module.exports = class with export default class
    newContent = newContent.replace(/module\.exports\s+=\s+class\s+(\w+)/g, 'export default class $1');
    
    // Replace module.exports = variable with export default variable
    newContent = newContent.replace(/module\.exports\s+=\s+(\w+);?/g, 'export default $1;');
    
    // Replace module.exports = { ... } with export { ... }
    newContent = newContent.replace(/module\.exports\s+=\s+\{([^}]+)\};?/g, (match, exports) => {
      return `export default {${exports}};`;
    });
    
    // Write the modified content back to the file
    await fs.writeFile(filePath, newContent, 'utf8');
    console.log(`  Successfully converted ${filePath} to ESM`);
  } catch (error) {
    console.error(`  Error converting ${filePath} to ESM:`, error);
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
      } else if (file.endsWith('.js') && !file.endsWith('.mjs') && !shouldSkipFile(filePath)) {
        // Convert .js files to ESM
        await convertFileToESM(filePath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error);
  }
}

// Check for missing supabase.js file and create it if needed
async function checkSupabaseFile() {
  const supabaseFilePath = path.join(rootDir, 'backend/config/supabase.js');
  try {
    await fs.access(supabaseFilePath);
    console.log('Supabase config file exists, converting to ESM...');
    await convertFileToESM(supabaseFilePath);
  } catch (error) {
    console.log('Supabase config file does not exist, creating it...');
    const supabaseContent = `/**
 * Supabase client configuration
 * This file configures and exports the Supabase client for database access
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://pczfmxigimuluacspxse.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.warn('No Supabase key found in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
`;
    await fs.writeFile(supabaseFilePath, supabaseContent, 'utf8');
    console.log('Created Supabase config file');
  }
}

// Check for missing auth middleware file and create it if needed
async function checkAuthMiddlewareFile() {
  const authMiddlewareFilePath = path.join(rootDir, 'backend/middleware/fastify/auth.js');
  try {
    await fs.access(authMiddlewareFilePath);
    console.log('Auth middleware file exists, converting to ESM...');
    await convertFileToESM(authMiddlewareFilePath);
  } catch (error) {
    console.log('Auth middleware file does not exist, creating it...');
    const authMiddlewareContent = `/**
 * Authentication middleware for Fastify
 * This middleware verifies JWT tokens for protected routes
 */

import * as pasetoService from '../../services/pasetoService.js';
import supabase from '../../config/supabase.js';

/**
 * Authentication middleware
 * Verifies the JWT token in the Authorization header
 */
export async function authMiddleware(request, reply) {
  try {
    // Get token from header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ msg: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify token
      const decoded = await pasetoService.decryptToken(token);
      if (!decoded) {
        return reply.code(401).send({ msg: 'Token is not valid' });
      }

      // Set user data in request
      request.user = decoded.user;
    } catch (err) {
      return reply.code(401).send({ msg: 'Token is not valid' });
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
}

export default { authMiddleware };
`;
    await fs.writeFile(authMiddlewareFilePath, authMiddlewareContent, 'utf8');
    console.log('Created Auth middleware file');
  }
}

// Main function to start the conversion process
async function main() {
  console.log('Starting comprehensive conversion to ESM...');
  
  // Check for and create necessary files
  await checkSupabaseFile();
  await checkAuthMiddlewareFile();
  
  // Process all directories
  for (const directory of directories) {
    console.log(`Processing directory: ${directory}`);
    await processDirectory(directory);
  }
  
  console.log('Conversion to ESM completed');
}

// Run the main function
main().catch(error => {
  console.error('Error in main function:', error);
  process.exit(1);
});
