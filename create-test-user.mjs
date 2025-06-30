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

async function createTestUser() {
  try {
    console.log('Creating test user account...');
    
    // Create auth user first
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'test.driver@demo.com',
      password: 'testdriver123',
      email_confirm: true
    });
    
    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }
    
    console.log('Auth user created:', authUser.user.id);
    
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
    }
    
    // Create user record
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
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
    
    console.log('User record created:', userRecord);
    
    // Create driver record
    const { data: driverRecord, error: driverError } = await supabase
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
    
    console.log('Driver record created:', driverRecord);
    
    // Create a test vehicle
    const { data: vehicle, error: vehicleError } = await supabase
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
      console.log('Test vehicle created:', vehicle);
    }
    
    // Create a test load
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
    
    console.log('\n=== Test Account Created Successfully! ===');
    console.log('Email: test.driver@demo.com');
    console.log('Password: testdriver123');
    console.log('This user will be redirected to the driver dashboard when logging in.');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTestUser();