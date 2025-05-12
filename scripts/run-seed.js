/**
 * Script to run seed data
 * Run with: node scripts/run-seed.js
 */

import dotenv from 'dotenv';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get current file directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to seed script
const seedScriptPath = path.join(__dirname, 'seed-realistic-data.js');

// Run the seed script
console.log('Running seed script...');
try {
  execSync(`node ${seedScriptPath}`, { stdio: 'inherit' });
  console.log('Seed script completed successfully');
} catch (error) {
  console.error('Error running seed script:', error);
}
