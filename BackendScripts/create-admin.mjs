/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

// Script to create an admin user in Supabase
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://fjmrukumtldijehoggeb.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqbXJ1a3VtdGxkaWplaG9nZ2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MDcxMzAsImV4cCI6MjA2MjE4MzEzMH0.Wy2IcOhbhiefmSN8vzfcSVa1TszUVa5PcxIniwO1p64';

// Admin user details
const adminEmail = 'admin@truckingsemis.com';
const adminPassword = 'Admin123!';
const adminName = 'Admin User';
const companyName = 'TruckingSemis Admin';

async function createAdminUser() {
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Create user in Supabase Auth
    console.log('Creating admin user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          name: adminName,
        },
      },
    });

    if (authError) {
      throw authError;
    }

    console.log('Admin user created in Auth:', authData.user.id);

    // 2. Create company
    console.log('Creating company...');
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert([
        {
          name: companyName,
          contact_email: adminEmail,
        },
      ])
      .select()
      .single();

    if (companyError) {
      throw companyError;
    }

    console.log('Company created:', companyData.id);

    // 3. Create user record with company association
    console.log('Creating user record...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          name: adminName,
          email: adminEmail,
          company_id: companyData.id,
          is_admin: true,
        },
      ])
      .select()
      .single();

    if (userError) {
      throw userError;
    }

    console.log('User record created:', userData.id);
    console.log('\nAdmin user created successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  }
}

createAdminUser();
