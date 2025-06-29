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

// Script to create a simple demo driver user in Supabase Auth only
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pczfmxigimuluacspxse.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjemZteGlnaW11bHVhY3NweHNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY2NzM2NSwiZXhwIjoyMDYyMjQzMzY1fQ.3UZzJl0LLGyMW9QqGQLx6Dkyzn_29l8rxTbRahUoTWE';

// Demo driver details
const driverEmail = 'test.driver@demo.com';
const driverPassword = 'TestDriver123!';
const driverName = 'Test Driver';

async function createSimpleDemoDriver() {
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Create user in Supabase Auth only
    console.log('Creating demo driver user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: driverEmail,
      password: driverPassword,
      email_confirm: true,
      user_metadata: {
        name: driverName,
        role: 'driver'
      }
    });

    if (authError) {
      throw authError;
    }

    console.log('\n=== Simple Demo Driver Created Successfully! ===');
    console.log('Email:', driverEmail);
    console.log('Password:', driverPassword);
    console.log('Name:', driverName);
    console.log('Auth ID:', authData.user.id);
    console.log('\nYou can now log in to the frontend with these credentials.');
    console.log('Note: This user only exists in Auth. Database records will be created on first login.');
  } catch (error) {
    console.error('Error creating demo driver:', error.message);
    process.exit(1);
  }
}

// Run the script
createSimpleDemoDriver();