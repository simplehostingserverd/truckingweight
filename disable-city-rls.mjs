import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableRLS() {
  console.log('Temporarily disabling RLS on city_users table...');
  
  try {
    // Simply disable RLS for now to allow demo user creation
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE city_users DISABLE ROW LEVEL SECURITY'
    });
    
    if (error) {
      console.error('Error disabling RLS:', error);
    } else {
      console.log('✅ RLS disabled on city_users table');
      console.log('You can now try creating the demo city user again.');
      console.log('Remember to re-enable RLS later for security.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

disableRLS();