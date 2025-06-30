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

async function insertDriverDirectly() {
  try {
    console.log('Attempting direct insert with service role...');
    
    // First check if driver already exists
    const { data: existingDriver } = await supabase
      .from('drivers')
      .select('*')
      .eq('email', 'test.driver@demo.com')
      .single();
    
    if (existingDriver) {
      console.log('Driver already exists:', existingDriver);
      return;
    }
    
    // Insert driver directly using service role
    const { data, error } = await supabase
      .from('drivers')
      .insert({
        name: 'Test Driver',
        license_number: 'TEST-123456',
        phone: '+1-555-0123',
        email: 'test.driver@demo.com',
        status: 'Active',
        company_id: 1
      })
      .select()
      .single();
    
    if (error) {
      console.error('Insert error:', error);
      return;
    }
    
    console.log('Driver created successfully:', data);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

insertDriverDirectly();