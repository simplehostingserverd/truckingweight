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

// Script to create comprehensive demo user with rich dummy data
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pczfmxigimuluacspxse.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjemZteGlnaW11bHVhY3NweHNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY2NzM2NSwiZXhwIjoyMDYyMjQzMzY1fQ.3UZzJl0LLGyMW9QqGQLx6Dkyzn_29l8rxTbRahUoTWE';

// Demo user/driver details
const userEmail = 'info@cargoscalepro.com';
const userPassword = 'CargoDemo2025!';
const userName = 'Michael Rodriguez';
const licenseNumber = 'CDL-TX-8847291';
const phone = '+1-713-555-0198';
const demoUserId = '123e4567-e89b-12d3-a456-426614174000';
const demoDriverId = '456e7890-e89b-12d3-a456-426614174001';
const demoCompanyId = '789e0123-e89b-12d3-a456-426614174002';
const demoVehicleId = '012e3456-e89b-12d3-a456-426614174003';

async function createComprehensiveDemoUser() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('Creating comprehensive demo user with rich data...');
    
    // 1. Create Auth User
    console.log('\n1. Creating Supabase Auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userEmail,
      password: userPassword,
      email_confirm: true,
      user_metadata: {
        name: userName,
        role: 'driver'
      }
    });

    if (authError && !authError.message.includes('already registered')) {
      throw authError;
    }
    console.log('✓ Auth user created/exists');

    // 2. Create Company
    console.log('\n2. Creating demo company...');
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .upsert({
        id: demoCompanyId,
        name: 'Cargo Scale Pro Logistics',
        address: '1234 Industrial Blvd, Houston, TX 77001',
        phone: '+1-713-555-0100',
        email: 'operations@cargoscalepro.com',
        dot_number: 'DOT-3847291',
        mc_number: 'MC-847291',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (companyError) {
      console.error('Company creation error:', companyError);
    } else {
      console.log('✓ Company created:', companyData.name);
    }

    // 3. Create User Record
    console.log('\n3. Creating user record...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: demoUserId,
        name: userName,
        email: userEmail,
        company_id: demoCompanyId,
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      console.error('User creation error:', userError);
    } else {
      console.log('✓ User record created:', userData.name);
    }

    // 4. Create Driver Record
    console.log('\n4. Creating driver record...');
    const { data: driverData, error: driverError } = await supabase
      .from('drivers')
      .upsert({
        id: demoDriverId,
        name: userName,
        email: userEmail,
        license_number: licenseNumber,
        phone: phone,
        company_id: demoCompanyId,
        status: 'active',
        hire_date: '2023-03-15',
        birth_date: '1985-07-22',
        address: '5678 Oak Street, Houston, TX 77002',
        emergency_contact: 'Maria Rodriguez - +1-713-555-0199',
        medical_cert_expiry: '2025-12-31',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (driverError) {
      console.error('Driver creation error:', driverError);
    } else {
      console.log('✓ Driver record created:', driverData.name);
    }

    // 5. Create Vehicle
    console.log('\n5. Creating demo vehicle...');
    const { data: vehicleData, error: vehicleError } = await supabase
      .from('vehicles')
      .upsert({
        id: demoVehicleId,
        company_id: demoCompanyId,
        driver_id: demoDriverId,
        make: 'Freightliner',
        model: 'Cascadia',
        year: 2022,
        vin: '1FUJGHDV8NLAA1234',
        license_plate: 'TX-CSP-001',
        status: 'active',
        mileage: 125000,
        fuel_type: 'diesel',
        max_weight: 80000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (vehicleError) {
      console.error('Vehicle creation error:', vehicleError);
    } else {
      console.log('✓ Vehicle created:', `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`);
    }

    // 6. Create Sample Loads
    console.log('\n6. Creating sample loads...');
    const loads = [
      {
        id: '111e1111-e89b-12d3-a456-426614174001',
        driver_id: demoDriverId,
        company_id: demoCompanyId,
        vehicle_id: demoVehicleId,
        load_number: 'CSP-2025-001',
        origin: 'Houston, TX',
        destination: 'Dallas, TX',
        pickup_date: '2025-01-20',
        delivery_date: '2025-01-21',
        cargo_type: 'Steel Coils',
        weight: 45000,
        rate: 2500.00,
        status: 'in_transit',
        created_at: new Date().toISOString()
      },
      {
        id: '222e2222-e89b-12d3-a456-426614174002',
        driver_id: demoDriverId,
        company_id: demoCompanyId,
        vehicle_id: demoVehicleId,
        load_number: 'CSP-2025-002',
        origin: 'Dallas, TX',
        destination: 'Austin, TX',
        pickup_date: '2025-01-22',
        delivery_date: '2025-01-22',
        cargo_type: 'Electronics',
        weight: 28000,
        rate: 1800.00,
        status: 'scheduled',
        created_at: new Date().toISOString()
      }
    ];

    for (const load of loads) {
      const { error: loadError } = await supabase
        .from('loads')
        .upsert(load);
      
      if (loadError) {
        console.error('Load creation error:', loadError);
      } else {
        console.log(`✓ Load created: ${load.load_number}`);
      }
    }

    // 7. Create Driver Activities
    console.log('\n7. Creating driver activities...');
    const activities = [
      {
        driver_id: demoDriverId,
        activity_type: 'driving',
        start_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        location: 'I-45 North, Houston, TX',
        notes: 'En route to Dallas pickup location'
      },
      {
        driver_id: demoDriverId,
        activity_type: 'on_duty',
        start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        end_time: null,
        location: 'Dallas Distribution Center',
        notes: 'Loading steel coils'
      }
    ];

    for (const activity of activities) {
      const { error: activityError } = await supabase
        .from('driver_activities')
        .insert(activity);
      
      if (activityError) {
        console.error('Activity creation error:', activityError);
      } else {
        console.log(`✓ Activity created: ${activity.activity_type}`);
      }
    }

    // 8. Create Alerts
    console.log('\n8. Creating sample alerts...');
    const alerts = [
      {
        driver_id: demoDriverId,
        type: 'maintenance',
        severity: 'medium',
        title: 'Scheduled Maintenance Due',
        message: 'Vehicle maintenance due in 500 miles',
        is_read: false,
        created_at: new Date().toISOString()
      },
      {
        driver_id: demoDriverId,
        type: 'hos',
        severity: 'high',
        title: 'HOS Limit Approaching',
        message: 'Daily driving limit will be reached in 2 hours',
        is_read: false,
        created_at: new Date().toISOString()
      }
    ];

    for (const alert of alerts) {
      const { error: alertError } = await supabase
        .from('alerts')
        .insert(alert);
      
      if (alertError) {
        console.error('Alert creation error:', alertError);
      } else {
        console.log(`✓ Alert created: ${alert.title}`);
      }
    }

    console.log('\n=== Comprehensive Demo User Created Successfully! ===');
    console.log('\n📧 Login Credentials:');
    console.log('Email:', userEmail);
    console.log('Password:', userPassword);
    console.log('\n👤 User Details:');
    console.log('Name:', userName);
    console.log('License:', licenseNumber);
    console.log('Phone:', phone);
    console.log('\n🏢 Company:', 'Cargo Scale Pro Logistics');
    console.log('\n🚛 Vehicle:', '2022 Freightliner Cascadia (TX-CSP-001)');
    console.log('\n📦 Active Loads:', loads.length);
    console.log('\n⚠️  Active Alerts:', alerts.length);
    console.log('\n🎯 Features Available:');
    console.log('- Full CRUD operations on all data');
    console.log('- Real-time driver dashboard');
    console.log('- Load management');
    console.log('- Vehicle tracking');
    console.log('- HOS compliance monitoring');
    console.log('- Alert system');
    console.log('- Activity logging');
    console.log('\nYou can now login and explore the full application functionality!');

  } catch (error) {
    console.error('Error creating comprehensive demo user:', error.message);
    process.exit(1);
  }
}

// Run the script
createComprehensiveDemoUser();