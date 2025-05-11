import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');

    // Try to access the companies table
    console.log('\nTrying to access companies table...');
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(5);

    if (companiesError) {
      console.error('Error accessing companies table:', companiesError);
    } else {
      console.log('Successfully accessed companies table!');
      console.log('Number of companies:', companiesData.length);
      if (companiesData.length > 0) {
        console.log('First company:', companiesData[0]);
      } else {
        console.log('No companies found in the database.');
      }
    }

    // Try to access the database schema
    console.log('\nTrying to access database schema information...');
    const { data: tablesData, error: tablesError } = await supabase
      .from('pg_tables')
      .select('schemaname, tablename')
      .eq('schemaname', 'public')
      .limit(10);

    if (tablesError) {
      console.error('Error accessing schema information:', tablesError);

      // Try another approach to list tables
      console.log('\nTrying alternative approach to list tables...');
      const { data: schemasData, error: schemasError } = await supabase.rpc('get_schemas');

      if (schemasError) {
        console.error('Error accessing schemas via RPC:', schemasError);
      } else {
        console.log('Successfully retrieved schema information!');
        console.log('Schemas:', schemasData);
      }
    } else {
      console.log('Successfully accessed database schema!');
      console.log('Tables in public schema:', tablesData);
    }

    // Test auth connection
    console.log('\nTesting auth connection...');
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession();

      if (authError) {
        console.error('Error testing auth connection:', authError);
      } else {
        console.log('Auth connection successful!');
        if (authData.session) {
          console.log('Current session:', authData.session.user.email);
        } else {
          console.log('No active session (this is expected)');
        }
      }
    } catch (authError) {
      console.error('Error testing auth connection:', authError);
    }
  } catch (error) {
    console.error('Unexpected error testing connection:', error);
  }
}

// Run the test
testConnection();
