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

// Simple script to insert driver record
import { createClient } from '@supabase/supabase-js';

// Supabase configuration with service role key
const supabaseUrl = 'https://pczfmxigimuluacspxse.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjemZteGlnaW11bHVhY3NweHNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY2NzM2NSwiZXhwIjoyMDYyMjQzMzY1fQ.3UZzJl0LLGyMW9QqGQLx6Dkyzn_29l8rxTbRahUoTWE';

async function insertDriverSimple() {
  // Initialize Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('Checking if driver already exists...');
    
    // First check if driver exists
    const { data: existingDriver, error: checkError } = await supabase
      .from('drivers')
      .select('*')
      .eq('email', 'test.driver@demo.com')
      .maybeSingle();

    if (existingDriver) {
      console.log('\n=== Driver Already Exists! ===');
      console.log('Driver ID:', existingDriver.id);
      console.log('Name:', existingDriver.name);
      console.log('Email:', existingDriver.email);
      console.log('\nYou can login with:');
      console.log('Email: test.driver@demo.com');
      console.log('Password: TestDriver123!');
      return;
    }

    console.log('Creating new driver record...');
    
    // Insert new driver
    const { data: newDriver, error: insertError } = await supabase
      .from('drivers')
      .insert({
        name: 'Test Driver',
        email: 'test.driver@demo.com',
        license_number: 'TEST123456789',
        phone: '+1-555-0123',
        status: 'active'
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log('\n=== Test Driver Record Created Successfully! ===');
    console.log('Driver ID:', newDriver.id);
    console.log('Name:', newDriver.name);
    console.log('Email:', newDriver.email);
    console.log('License:', newDriver.license_number);
    console.log('Phone:', newDriver.phone);
    console.log('Status:', newDriver.status);
    console.log('\nYou can now login with:');
    console.log('Email: test.driver@demo.com');
    console.log('Password: TestDriver123!');
    console.log('\nThe user will be redirected to the driver dashboard.');

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the script
insertDriverSimple();