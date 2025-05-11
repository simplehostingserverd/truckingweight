const { createClient } = require('@supabase/supabase-js');

// Updated Supabase credentials from the Supabase Management API
const SUPABASE_URL = 'https://pczfmxigimuluacspxse.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjemZteGlnaW11bHVhY3NweHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NjczNjUsImV4cCI6MjA2MjI0MzM2NX0.SyWZsCDWc5u5oXIR4IHBTcT63Le0HyjCZQJK0E6FO7w';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');

    // Test a simple query to get the current user (anonymous)
    const { data: authData, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.error('Error testing auth connection:', authError);
    } else {
      console.log('Auth connection successful!');
      console.log('Session data:', authData);
    }

    // Try to access a public table
    console.log('\nTrying to access a public table...');
    const { data, error } = await supabase.from('health_check').select('*').limit(1);

    if (error) {
      console.log('Could not access health_check table:', error.message);

      // Try to access another common table
      console.log('\nTrying to access companies table...');
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .limit(1);

      if (companiesError) {
        console.log('Could not access companies table:', companiesError.message);
      } else {
        console.log('Successfully accessed companies table!');
        console.log('Data:', companiesData);
      }
    } else {
      console.log('Successfully accessed health_check table!');
      console.log('Data:', data);
    }

    // Get Supabase project details
    console.log('\nGetting Supabase project details...');
    const { data: projectData, error: projectError } = await supabase.rpc('get_project_details');

    if (projectError) {
      console.log('Could not get project details:', projectError.message);
    } else {
      console.log('Successfully retrieved project details!');
      console.log('Project data:', projectData);
    }

  } catch (error) {
    console.error('Unexpected error testing connection:', error);
  }
}

// Run the test
testConnection();
