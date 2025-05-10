import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (first 10 chars):', supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'undefined');

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');

    // Test auth connection
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Error testing auth connection:', authError);
    } else {
      console.log('Auth connection successful!');
      if (authData.user) {
        console.log('Current user:', authData.user.email);
      } else {
        console.log('No user is currently authenticated (this is expected)');
      }
    }

    // Try to create a simple table
    console.log('\nTrying to create a test table...');
    const { error: createError } = await supabase
      .from('_test_connection')
      .insert([{ test_value: 'Connection test at ' + new Date().toISOString() }]);

    if (createError) {
      console.error('Error creating test record:', createError);

      if (createError.code === 'PGRST116') {
        console.log('Table does not exist yet. This is expected for a new database.');
      }
    } else {
      console.log('Successfully created test record!');
      console.log('Database connection is fully working!');
    }

  } catch (error) {
    console.error('Unexpected error testing connection:', error);
  }
}

// Run the test
testConnection();
