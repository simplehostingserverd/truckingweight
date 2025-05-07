// Script to fix RLS policies in Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  console.error('Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.');
  process.exit(1);
}

async function fixRlsPolicies() {
  try {
    // Initialize Supabase client with service role key
    console.log('Initializing Supabase client with service role key...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Connected to Supabase');

    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'fix-rls-policies.sql');
    console.log(`Reading SQL file from: ${sqlFilePath}`);

    if (!fs.existsSync(sqlFilePath)) {
      console.error(`SQL file not found: ${sqlFilePath}`);
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('SQL file read successfully');

    console.log('Executing SQL to fix RLS policies...');

    // Execute SQL using pgmoon.query RPC
    const { data, error } = await supabase.rpc('pgmoon.query', { query: sqlContent });

    if (error) {
      console.error('Error fixing RLS policies:', error);

      // Try to provide more helpful error messages
      if (error.message.includes('permission denied')) {
        console.error('\nPermission denied. Make sure you are using the SUPABASE_SERVICE_ROLE_KEY, not the anon key.');
        console.error('The service role key starts with "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." and has "role": "service_role" in the JWT payload.');
      } else if (error.message.includes('function pgmoon.query')) {
        console.error('\nThe pgmoon.query function is not available. This is needed to execute raw SQL.');
        console.error('You may need to enable the pgmoon extension in your Supabase project.');
      }

      process.exit(1);
    }

    console.log('RLS policies fixed successfully!');
    console.log('\nYou should now be able to register new users without the infinite recursion error.');
    console.log('Try registering a new user or logging in with an existing account.');
    process.exit(0);
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

fixRlsPolicies();
