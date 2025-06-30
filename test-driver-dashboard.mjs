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

async function testDriverDashboard() {
  try {
    console.log('Testing driver dashboard data access...');
    
    // Test 1: Check if drivers table exists and has data
    console.log('\n1. Testing drivers table...');
    const { data: drivers, error: driversError } = await supabase
      .from('drivers')
      .select('id, name, email, status, license_number, company_id')
      .limit(5);
    
    if (driversError) {
      console.error('Drivers table error:', driversError);
    } else {
      console.log(`Found ${drivers.length} drivers`);
      if (drivers.length > 0) {
        console.log('Sample driver:', drivers[0]);
      }
    }
    
    // Test 2: Check predictive_alerts table
    console.log('\n2. Testing predictive_alerts table...');
    const { data: alerts, error: alertsError } = await supabase
      .from('predictive_alerts')
      .select('*')
      .limit(3);
    
    if (alertsError) {
      console.error('Predictive alerts error:', alertsError);
    } else {
      console.log(`Found ${alerts.length} alerts`);
    }
    
    // Test 3: Check loads table
    console.log('\n3. Testing loads table...');
    const { data: loads, error: loadsError } = await supabase
      .from('loads')
      .select('*')
      .limit(3);
    
    if (loadsError) {
      console.error('Loads error:', loadsError);
    } else {
      console.log(`Found ${loads.length} loads`);
    }
    
    // Test 4: Check vehicles table
    console.log('\n4. Testing vehicles table...');
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .limit(3);
    
    if (vehiclesError) {
      console.error('Vehicles error:', vehiclesError);
    } else {
      console.log(`Found ${vehicles.length} vehicles`);
    }
    
    // Test 5: Check weights table
    console.log('\n5. Testing weights table...');
    const { data: weights, error: weightsError } = await supabase
      .from('weights')
      .select('*')
      .limit(3);
    
    if (weightsError) {
      console.error('Weights error:', weightsError);
    } else {
      console.log(`Found ${weights.length} weight records`);
    }
    
    console.log('\nDriver dashboard test completed!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testDriverDashboard();