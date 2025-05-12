/**
 * Script to run database migrations
 * Run with: node scripts/run-migrations.js
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get current file directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Path to migrations
const migrationsPath = path.join(__dirname, '../backend/prisma/migrations');

// Function to run a migration SQL file
async function runMigration(filePath) {
  try {
    console.log(`Running migration: ${path.basename(filePath)}`);
    const sql = fs.readFileSync(filePath, 'utf8');

    // Split the SQL into statements
    const statements = sql
      .split(';')
      .filter(statement => statement.trim() !== '')
      .map(statement => statement.trim() + ';');

    // Execute each statement
    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      if (error) {
        console.error(`Error executing SQL: ${error.message}`);
        console.error(`Statement: ${statement}`);
        throw error;
      }
    }

    console.log(`Migration ${path.basename(filePath)} completed successfully`);
    return true;
  } catch (error) {
    console.error(`Error running migration ${path.basename(filePath)}: ${error.message}`);
    return false;
  }
}

// Main function to run all migrations
async function runMigrations() {
  try {
    console.log('Starting database migrations...');

    // Check if migrations directory exists
    if (!fs.existsSync(migrationsPath)) {
      console.error(`Migrations directory not found: ${migrationsPath}`);
      return;
    }

    // Get all migration directories
    const migrationDirs = fs.readdirSync(migrationsPath)
      .filter(dir => fs.statSync(path.join(migrationsPath, dir)).isDirectory())
      .sort(); // Sort to ensure migrations run in order

    // Run each migration
    for (const migrationDir of migrationDirs) {
      const migrationPath = path.join(migrationsPath, migrationDir, 'migration.sql');

      // Check if migration file exists
      if (fs.existsSync(migrationPath)) {
        const success = await runMigration(migrationPath);
        if (!success) {
          console.error(`Migration ${migrationDir} failed. Stopping.`);
          break;
        }
      } else {
        console.warn(`No migration.sql file found in ${migrationDir}. Skipping.`);
      }
    }

    console.log('Database migrations completed');
  } catch (error) {
    console.error('Error running migrations:', error);
  }
}

// Run the migrations
runMigrations();
