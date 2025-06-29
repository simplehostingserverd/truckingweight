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

// Script to create a second demo driver user in Supabase
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pczfmxigimuluacspxse.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjemZteGlnaW11bHVhY3NweHNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY2NzM2NSwiZXhwIjoyMDYyMjQzMzY1fQ.3UZzJl0LLGyMW9QqGQLx6Dkyzn_29l8rxTbRahUoTWE';

// Demo driver details - different from first demo
const driverEmail = 'sarah.wilson@demo.com';
const driverPassword = 'DemoDriver789!';
const driverName = 'Sarah Wilson';
const companyName = 'Demo Trucking Company';
const licenseNumber = 'CA555666777';
const driverPhone = '+1-555-0789';

async function createDemoDriver() {
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Create user in Supabase Auth
    console.log('Creating new demo driver user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: driverEmail,
      password: driverPassword,
      email_confirm: true,
    });

    if (authError) {
      throw authError;
    }

    console.log('Driver user created in Auth:', authData.user.id);

    // 2. Check if company exists, create if not
    console.log('Checking for existing company...');
    let { data: existingCompany } = await supabase
      .from('companies')
      .select('*')
      .eq('name', companyName)
      .single();

    let companyData;
    if (!existingCompany) {
      console.log('Creating demo company...');
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert([
          {
            name: companyName,
            contact_email: driverEmail,
            contact_phone: driverPhone,
          },
        ])
        .select()
        .single();

      if (companyError) {
        throw companyError;
      }
      companyData = newCompany;
    } else {
      companyData = existingCompany;
    }

    console.log('Company ready:', companyData.id);

    // 3. Create user record with company association
    console.log('Creating user record...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert(
        [
          {
            id: authData.user.id,
            email: driverEmail,
            company_id: companyData.id,
            name: driverName,
          },
        ],
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (userError) {
      throw userError;
    }

    console.log('User record ready:', userData.id);

    // 4. Create driver record (simplified - no audit trail)
    console.log('Creating driver record...');
    const licenseExpiry = new Date();
    licenseExpiry.setFullYear(licenseExpiry.getFullYear() + 2); // 2 years from now

    // Check if driver already exists
    const { data: existingDriver } = await supabase
      .from('drivers')
      .select('*')
      .eq('license_number', licenseNumber)
      .single();

    let driverData;
    if (existingDriver) {
      console.log('Driver already exists, using existing record...');
      driverData = existingDriver;
    } else {
      const { data: newDriver, error: driverError } = await supabase
        .from('drivers')
        .insert([
          {
            name: driverName,
            license_number: licenseNumber,
            license_expiry: licenseExpiry.toISOString().split('T')[0],
            phone: driverPhone,
            email: driverEmail,
            status: 'Active',
            company_id: companyData.id,
          },
        ])
        .select()
        .single();

      if (driverError) {
        throw driverError;
      }
      driverData = newDriver;
    }

    console.log('Driver record ready:', driverData.id);

    console.log('\n=== Demo Driver Created Successfully! ===');
    console.log('Email:', driverEmail);
    console.log('Password:', driverPassword);
    console.log('Name:', driverName);
    console.log('License:', licenseNumber);
    console.log('Company:', companyName);
    console.log('Auth ID:', authData.user.id);
    console.log('Driver ID:', driverData.id);
    console.log('Company ID:', companyData.id);
    console.log('\nYou can now log in to the frontend with these credentials.');
  } catch (error) {
    console.error('Error creating demo driver:', error.message);
    process.exit(1);
  }
}

// Run the script
createDemoDriver();