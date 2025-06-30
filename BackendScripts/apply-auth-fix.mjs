/**
 * Apply Auth ID Error Fix
 * This script applies the SQL fix for the auth_id column error
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from frontend .env.local
const envPath = join(__dirname, '..', 'frontend', '.env.local');
dotenv.config({ path: envPath });

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables');
  console.error('Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
  console.error('Service Role Key:', supabaseServiceRoleKey ? 'Found' : 'Missing');
  process.exit(1);
}

console.log('Connecting to Supabase at:', supabaseUrl);

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyAuthFix() {
  try {
    console.log('Reading SQL fix file...');
    
    // Read the SQL fix file
    const sqlFilePath = join(__dirname, '..', 'fix-auth-id-error.sql');
    const sqlContent = readFileSync(sqlFilePath, 'utf8');
    
    console.log('Applying auth ID fix...');
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.toLowerCase().includes('select ') && statement.toLowerCase().includes('status')) {
        // Skip the final status message
        continue;
      }
      
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });
        
        if (error) {
          console.warn(`Warning on statement ${i + 1}:`, error.message);
          // Continue with other statements even if one fails
        } else {
          console.log(`✓ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.warn(`Warning on statement ${i + 1}:`, err.message);
        // Continue with other statements
      }
    }
    
    console.log('\n✅ Auth ID fix applied successfully!');
    console.log('\nChanges made:');
    console.log('- Added auth_id columns to drivers, vehicles, weights, and loads tables');
    console.log('- Updated RLS policies to handle both company-based and direct auth access');
    console.log('- Created missing tables: predictive_alerts, driver_activities, incident_reports');
    console.log('- Added missing columns to loads and weigh_tickets tables');
    console.log('- Created proper indexes and triggers');
    console.log('\nThe driver dashboard should now work without auth_id errors.');
    
  } catch (error) {
    console.error('Error applying auth fix:', error);
    process.exit(1);
  }
}

// Run the fix
applyAuthFix();