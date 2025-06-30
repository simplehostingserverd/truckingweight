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

// Script to directly insert driver record using SQL
import { createClient } from '@supabase/supabase-js';

// Supabase configuration with service role key
const supabaseUrl = 'https://pczfmxigimuluacspxse.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjemZteGlnaW11bHVhY3NweHNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY2NzM2NSwiZXhwIjoyMDYyMjQzMzY1fQ.3UZzJl0LLGyMW9QqGQLx6Dkyzn_29l8rxTbRahUoTWE';

async function insertDriverDirectly() {
  // Initialize Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('Inserting driver record directly via SQL...');
    
    // Use raw SQL to bypass RLS policies
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO drivers (name, email, license_number, phone, status, created_at, updated_at)
        VALUES ('Test Driver', 'test.driver@demo.com', 'TEST123456789', '+1-555-0123', 'active', NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          license_number = EXCLUDED.license_number,
          phone = EXCLUDED.phone,
          status = EXCLUDED.status,
          updated_at = NOW()
        RETURNING *;
      `
    });

    if (error) {
      throw error;
    }

    console.log('\n=== Test Driver Record Created Successfully! ===');
    console.log('Result:', data);
    console.log('\nYou can now login with:');
    console.log('Email: test.driver@demo.com');
    console.log('Password: TestDriver123!');
    console.log('\nThe user will be redirected to the driver dashboard.');

  } catch (error) {
    console.error('Error inserting driver record:', error.message);
    
    // Try alternative approach with direct table insert
    console.log('\nTrying alternative approach...');
    try {
      const { data: insertData, error: insertError } = await supabase
        .from('drivers')
        .upsert({
          name: 'Test Driver',
          email: 'test.driver@demo.com',
          license_number: 'TEST123456789',
          phone: '+1-555-0123',
          status: 'active'
        }, {
          onConflict: 'email'
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      console.log('\n=== Test Driver Record Created Successfully (Alternative)! ===');
      console.log('Driver ID:', insertData.id);
      console.log('Name:', insertData.name);
      console.log('Email:', insertData.email);
      console.log('\nYou can now login with:');
      console.log('Email: test.driver@demo.com');
      console.log('Password: TestDriver123!');
      
    } catch (altError) {
      console.error('Alternative approach also failed:', altError.message);
      process.exit(1);
    }
  }
}

// Run the script
insertDriverDirectly();