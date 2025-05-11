const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

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

    // Test a simple query
    const { data, error } = await supabase.from('health_check').select('*').limit(1);

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('Connection successful, but health_check table does not exist yet.');
        console.log('This is expected if you have not set up the database yet.');

        // Try to create the health_check table
        console.log('Creating health_check table...');
        const { error: createError } = await supabase.rpc('pgmoon.query', {
          query: `
            CREATE TABLE IF NOT EXISTS health_check (
              id SERIAL PRIMARY KEY,
              status TEXT NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            
            INSERT INTO health_check (status) VALUES ('ok');
          `,
        });

        if (createError) {
          console.error('Error creating health_check table:', createError);

          if (createError.message.includes('function pgmoon.query() does not exist')) {
            console.log('\nThe pgmoon extension is not enabled in your Supabase project.');
            console.log(
              'You can still use the database, but some schema management scripts may not work.'
            );
            console.log('Testing a simple insert instead...');

            // Try a simple insert into a new table
            const { error: createTableError } = await supabase.rpc('create_health_check_table');

            if (createTableError) {
              console.error('Error creating health_check table via RPC:', createTableError);
              console.log('\nTrying direct SQL via REST API...');

              // Try direct SQL via REST API
              const { error: sqlError } = await supabase
                .from('_health_check')
                .insert([{ status: 'ok' }]);

              if (sqlError) {
                console.error('Error inserting into _health_check table:', sqlError);
                console.error('Database connection test failed.');
              } else {
                console.log('Successfully inserted into _health_check table!');
                console.log('Database connection is working!');
              }
            } else {
              console.log('Successfully created health_check table via RPC!');
              console.log('Database connection is working!');
            }
          }
        } else {
          console.log('Successfully created health_check table!');
          console.log('Database connection is working!');
        }
      } else {
        console.error('Error testing database connection:', error);
      }
    } else {
      console.log('Database connection successful!');
      console.log('Retrieved data:', data);
    }

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
  } catch (error) {
    console.error('Unexpected error testing connection:', error);
  }
}

// Run the test
testConnection();
