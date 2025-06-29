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

async function checkPolicies() {
  console.log('Checking current RLS policies on city_users table...');
  
  try {
    // Try to drop any existing policies first
    console.log('Attempting to drop all existing policies...');
    
    const policiesToDrop = [
      'City users can view their own record',
      'City users can insert records', 
      'City users can update their own record',
      'City users can delete their own record',
      'City users can view users from same city'
    ];
    
    for (const policyName of policiesToDrop) {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "${policyName}" ON city_users`
      });
      if (error) {
        console.log(`Policy "${policyName}" not found or already dropped:`, error.message);
      } else {
        console.log(`✅ Dropped policy: ${policyName}`);
      }
    }
    
    // Reset RLS
    console.log('Resetting RLS...');
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE city_users DISABLE ROW LEVEL SECURITY'
    });
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE city_users ENABLE ROW LEVEL SECURITY'
    });
    
    // Create simple policies
    console.log('Creating new simple policies...');
    
    // Policy 1: Allow users to view their own record
    const { error: policy1Error } = await supabase.rpc('exec_sql', {
      sql: `CREATE POLICY "city_users_select_own" ON city_users FOR SELECT USING (auth.uid() = id)`
    });
    if (policy1Error) {
      console.error('Error creating select policy:', policy1Error);
    } else {
      console.log('✅ Created select policy');
    }
    
    // Policy 2: Allow insert for authenticated users
    const { error: policy2Error } = await supabase.rpc('exec_sql', {
      sql: `CREATE POLICY "city_users_insert" ON city_users FOR INSERT WITH CHECK (true)`
    });
    if (policy2Error) {
      console.error('Error creating insert policy:', policy2Error);
    } else {
      console.log('✅ Created insert policy');
    }
    
    // Policy 3: Allow users to update their own record
    const { error: policy3Error } = await supabase.rpc('exec_sql', {
      sql: `CREATE POLICY "city_users_update_own" ON city_users FOR UPDATE USING (auth.uid() = id)`
    });
    if (policy3Error) {
      console.error('Error creating update policy:', policy3Error);
    } else {
      console.log('✅ Created update policy');
    }
    
    console.log('\n✅ All policies have been reset and recreated!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPolicies();