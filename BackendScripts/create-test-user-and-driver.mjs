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

// Script to create both user and driver records for test.driver@demo.com
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pczfmxigimuluacspxse.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjemZteGlnaW11bHVhY3NweHNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY2NzM2NSwiZXhwIjoyMDYyMjQzMzY1fQ.3UZzJl0LLGyMW9QqGQLx6Dkyzn_29l8rxTbRahUoTWE';

// Demo user/driver details
const userEmail = 'test.driver@demo.com';
const userName = 'Test Driver';
const licenseNumber = 'TEST123456789';
const phone = '+1-555-0123';
const testUserId = '550e8400-e29b-41d4-a716-446655440000'; // Fixed UUID for test user

async function createTestUserAndDriver() {
  // Initialize Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('Creating user and driver records for test.driver@demo.com...');
    
    // Get a demo company to assign the user/driver to
    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .limit(1);

    if (companyError) {
      console.error('Error fetching companies:', companyError);
    }

    const companyId = companies && companies.length > 0 ? companies[0].id : null;
    console.log('Using company ID:', companyId);

    // First, check if user record already exists
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (existingUser) {
      console.log('User record already exists:', existingUser);
    } else {
      // Create user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: testUserId,
          name: userName,
          email: userEmail,
          company_id: companyId,
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (userError) {
        console.error('Error creating user record:', userError);
        throw userError;
      }

      console.log('User record created successfully:', userData);
    }

    // Check if driver record already exists
    const { data: existingDriver, error: driverCheckError } = await supabase
      .from('drivers')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (existingDriver) {
      console.log('Driver record already exists:', existingDriver);
    } else {
      // Create driver record
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .insert({
          name: userName,
          email: userEmail,
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
        console.error('Error creating driver record:', driverError);
        throw driverError;
      }

      console.log('Driver record created successfully:', driverData);
    }

    console.log('\n=== Test User and Driver Records Ready! ===');
    console.log('User ID:', testUserId);
    console.log('Name:', userName);
    console.log('Email:', userEmail);
    console.log('License:', licenseNumber);
    console.log('Phone:', phone);
    if (companyId && companies && companies.length > 0) {
      console.log('Company:', companies[0].name);
    }
    console.log('\nYou can now login with:');
    console.log('Email: test.driver@demo.com');
    console.log('Password: TestDriver123!');
    console.log('\nThe user will be redirected to the driver dashboard.');

  } catch (error) {
    console.error('Error creating user/driver records:', error.message);
    process.exit(1);
  }
}

// Run the script
createTestUserAndDriver();