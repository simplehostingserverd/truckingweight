/*
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testWithoutRLS() {
  try {
    console.log('Temporarily disabling RLS on drivers table...');
    
    // Disable RLS temporarily
    const { error: disableError } = await supabase.rpc('exec', {
      sql: 'ALTER TABLE drivers DISABLE ROW LEVEL SECURITY;'
    });
    
    if (disableError) {
      console.error('Error disabling RLS:', disableError);
    } else {
      console.log('RLS disabled successfully');
    }
    
    // Try to insert driver
    console.log('Attempting to insert driver...');
    const { data, error } = await supabase
      .from('drivers')
      .insert({
        name: 'Test Driver RLS',
        license_number: 'TEST-RLS-123',
        phone: '+1-555-0124',
        email: 'test.driver.rls@demo.com',
        status: 'Active',
        company_id: 1
      })
      .select()
      .single();
    
    if (error) {
      console.error('Insert error:', error);
    } else {
      console.log('Driver created successfully:', data);
    }
    
    // Re-enable RLS
    console.log('Re-enabling RLS on drivers table...');
    const { error: enableError } = await supabase.rpc('exec', {
      sql: 'ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;'
    });
    
    if (enableError) {
      console.error('Error re-enabling RLS:', enableError);
    } else {
      console.log('RLS re-enabled successfully');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testWithoutRLS();