import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLSStatus() {
  try {
    console.log('Checking RLS status for city_users table...');
    
    // Check if RLS is enabled on city_users table
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('exec_sql', {
        sql: "SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'city_users'"
      });
    
    if (rlsError) {
      console.error('Error checking RLS status:', rlsError);
    } else {
      console.log('RLS Status:', rlsStatus);
    }
    
    // Try to disable RLS completely
    console.log('\nDisabling RLS on city_users...');
    const { error: disableError } = await supabase
      .rpc('exec_sql', {
        sql: "ALTER TABLE city_users DISABLE ROW LEVEL SECURITY"
      });
    
    if (disableError) {
      console.error('Error disabling RLS:', disableError);
    } else {
      console.log('✅ RLS disabled on city_users');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkRLSStatus();