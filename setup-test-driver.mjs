import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from frontend/.env.local
dotenv.config({ path: path.join(__dirname, 'frontend', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTestDriver() {
  try {
    console.log('Setting up test driver data...');
    
    // Get the existing auth user
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return;
    }
    
    const testUser = authUsers.users.find(u => u.email === 'test.driver@demo.com');
    
    if (!testUser) {
      console.error('Test user not found in auth. Please create the user first.');
      return;
    }
    
    console.log('Found test user:', testUser.id);
    
    // Get or create company
    let { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('name', 'Demo Transport Company')
      .single();
    
    if (!company) {
      console.log('Creating demo company...');
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: 'Demo Transport Company',
          address: '123 Demo Street, Demo City, Demo State 12345',
          contact_phone: '555-0123',
          contact_email: 'contact@demotransport.com'
        })
        .select()
        .single();
      
      if (companyError) {
        console.error('Error creating company:', companyError);
        return;
      }
      company = newCompany;
      console.log('Company created:', company);
    } else {
      console.log('Company exists:', company);
    }
    
    // Check if user record exists
    let { data: userRecord } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUser.id)
      .single();
    
    if (!userRecord) {
      console.log('Creating user record...');
      const { data: newUserRecord, error: userError } = await supabase
        .from('users')
        .insert({
          id: testUser.id,
          name: 'Test Driver',
          email: 'test.driver@demo.com',
          company_id: company.id,
          is_admin: false
        })
        .select()
        .single();
      
      if (userError) {
        console.error('Error creating user record:', userError);
        return;
      }
      userRecord = newUserRecord;
      console.log('User record created:', userRecord);
    } else {
      console.log('User record exists:', userRecord);
    }
    
    // Check if driver record exists
    let { data: driverRecord } = await supabase
      .from('drivers')
      .select('*')
      .eq('email', 'test.driver@demo.com')
      .single();
    
    if (!driverRecord) {
      console.log('Creating driver record...');
      const { data: newDriverRecord, error: driverError } = await supabase
        .from('drivers')
        .insert({
          name: 'Test Driver',
          email: 'test.driver@demo.com',
          phone: '555-0456',
          license_number: 'DL123456789',
          license_expiry: '2025-12-31',
          status: 'Active',
          company_id: company.id
        })
        .select()
        .single();
      
      if (driverError) {
        console.error('Error creating driver record:', driverError);
        return;
      }
      driverRecord = newDriverRecord;
      console.log('Driver record created:', driverRecord);
    } else {
      console.log('Driver record exists:', driverRecord);
    }
    
    // Create a test vehicle if it doesn't exist
    let { data: vehicle } = await supabase
      .from('vehicles')
      .select('*')
      .eq('license_plate', 'TEST123')
      .single();
    
    if (!vehicle) {
      console.log('Creating test vehicle...');
      const { data: newVehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .insert({
          name: 'Test Truck 001',
          type: 'Semi-Truck',
          make: 'Freightliner',
          model: 'Cascadia',
          year: 2022,
          vin: 'TEST123456789VIN',
          license_plate: 'TEST123',
          company_id: company.id,
          status: 'Active',
          max_weight: '80000'
        })
        .select()
        .single();
      
      if (vehicleError) {
        console.error('Error creating vehicle:', vehicleError);
      } else {
        vehicle = newVehicle;
        console.log('Test vehicle created:', vehicle);
      }
    } else {
      console.log('Vehicle exists:', vehicle);
    }
    
    // Create a test load if none exists for this driver
    let { data: existingLoad } = await supabase
      .from('loads')
      .select('*')
      .eq('driver_id', driverRecord.id)
      .single();
    
    if (!existingLoad) {
      console.log('Creating test load...');
      const { data: load, error: loadError } = await supabase
        .from('loads')
        .insert({
          description: 'Demo Load - Electronics',
          status: 'In Transit',
          origin: 'Demo Warehouse, Demo City',
          destination: 'Customer Site, Another City',
          weight: '25000',
          driver_id: driverRecord.id,
          vehicle_id: vehicle?.id,
          company_id: company.id
        })
        .select()
        .single();
      
      if (loadError) {
        console.error('Error creating load:', loadError);
      } else {
        console.log('Test load created:', load);
      }
    } else {
      console.log('Load exists for driver:', existingLoad);
    }
    
    console.log('\n=== Test Driver Setup Complete! ===');
    console.log('Email: test.driver@demo.com');
    console.log('The user should now be redirected to the driver dashboard when logging in.');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

setupTestDriver();