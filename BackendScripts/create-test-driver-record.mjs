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

// Script to create a driver record for test.driver@demo.com
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pczfmxigimuluacspxse.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjemZteGlnaW11bHVhY3NweHNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY2NzM2NSwiZXhwIjoyMDYyMjQzMzY1fQ.3UZzJl0LLGyMW9QqGQLx6Dkyzn_29l8rxTbRahUoTWE';

// Use service role key for admin operations
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjemZteGlnaW11bHVhY3NweHNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY2NzM2NSwiZXhwIjoyMDYyMjQzMzY1fQ.3UZzJl0LLGyMW9QqGQLx6Dkyzn_29l8rxTbRahUoTWE';

// Demo driver details
const driverEmail = 'test.driver@demo.com';
const driverName = 'Test Driver';
const licenseNumber = 'TEST123456789';
const phone = '+1-555-0123';

async function createTestDriverRecord() {
  // Initialize Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('Creating driver record for test.driver@demo.com...');
    
    // First, check if driver record already exists
    const { data: existingDriver, error: checkError } = await supabase
      .from('drivers')
      .select('*')
      .eq('email', driverEmail)
      .single();

    if (existingDriver) {
      console.log('Driver record already exists:', existingDriver);
      return;
    }

    // Get a demo company to assign the driver to
    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .limit(1);

    if (companyError || !companies || companies.length === 0) {
      console.log('No companies found, creating driver without company assignment');
    }

    const companyId = companies && companies.length > 0 ? companies[0].id : null;

    // Create driver record
    const { data: driverData, error: driverError } = await supabase
      .from('drivers')
      .insert({
        name: driverName,
        email: driverEmail,
        license_number: licenseNumber,
        phone: phone,
        company_id: companyId,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (driverError) {
      throw driverError;
    }

    console.log('\n=== Test Driver Record Created Successfully! ===');
    console.log('Driver ID:', driverData.id);
    console.log('Name:', driverData.name);
    console.log('Email:', driverData.email);
    console.log('License:', driverData.license_number);
    console.log('Phone:', driverData.phone);
    if (companyId) {
      console.log('Company:', companies[0].name);
    }
    console.log('\nYou can now login with:');
    console.log('Email: test.driver@demo.com');
    console.log('Password: TestDriver123!');
    console.log('\nThe user will be redirected to the driver dashboard.');

  } catch (error) {
    console.error('Error creating driver record:', error.message);
    process.exit(1);
  }
}

// Run the script
createTestDriverRecord();