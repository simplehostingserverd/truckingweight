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

async function createTestDriver() {
  try {
    console.log('Checking for test driver...');
    
    // Check if test driver already exists
    const { data: existingDriver } = await supabase
      .from('drivers')
      .select('*')
      .eq('email', 'test.driver@demo.com')
      .single();
    
    if (existingDriver) {
      console.log('Test driver already exists:', existingDriver);
      return;
    }
    
    console.log('Creating test driver...');
    
    // Get or create a test company first
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
    
    // Create test driver
    const { data: newDriver, error: driverError } = await supabase
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
      console.error('Error creating driver:', driverError);
      return;
    }
    
    console.log('Test driver created successfully:', newDriver);
    
    // Create a test vehicle for the driver
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
        driver_id: newDriver.id,
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
    
    console.log('Test driver setup completed successfully!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTestDriver();