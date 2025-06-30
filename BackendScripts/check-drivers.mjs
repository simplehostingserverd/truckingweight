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

async function checkDrivers() {
  try {
    console.log('Checking existing drivers...');
    
    // Get all drivers
    const { data: drivers, error } = await supabase
      .from('drivers')
      .select('*');
    
    if (error) {
      console.error('Error fetching drivers:', error);
      return;
    }
    
    console.log('Found', drivers?.length || 0, 'drivers:');
    if (drivers && drivers.length > 0) {
      drivers.forEach(driver => {
        console.log(`- ${driver.name} (${driver.email}) - ${driver.status}`);
      });
    }
    
    // Check if test driver exists
    const testDriver = drivers?.find(d => d.email === 'test.driver@demo.com');
    if (testDriver) {
      console.log('\nTest driver already exists:', testDriver);
    } else {
      console.log('\nTest driver does not exist yet.');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkDrivers();