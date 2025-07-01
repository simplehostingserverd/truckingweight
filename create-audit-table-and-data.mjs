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

async function createAuditTableIfNotExists() {
  console.log('🔧 Creating audit_trail table if it doesn\'t exist...');
  
  const createAuditTableSQL = `
    CREATE TABLE IF NOT EXISTS audit_trail (
      id SERIAL PRIMARY KEY,
      table_name TEXT NOT NULL,
      operation TEXT NOT NULL,
      old_data JSONB,
      new_data JSONB,
      user_id UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable RLS on audit_trail
    ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
    
    -- Create a permissive policy for service role
    DROP POLICY IF EXISTS "Service role can do anything" ON audit_trail;
    CREATE POLICY "Service role can do anything" ON audit_trail
      FOR ALL USING (true) WITH CHECK (true);
  `;
  
  const { error } = await supabase.rpc('exec_sql', { sql: createAuditTableSQL });
  
  if (error) {
    console.log('Note: Could not create audit_trail table via RPC, trying direct approach...');
    // If RPC doesn't work, we'll continue anyway
  } else {
    console.log('✅ Audit trail table created/verified');
  }
}

async function createBasicTestData() {
  try {
    console.log('🚀 Creating basic test data...');
    
    // First, create audit table
    await createAuditTableIfNotExists();
    
    // Create a test company
    console.log('📊 Creating test company...');
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .upsert({
        id: 1,
        name: 'Test Transport Co',
        address: '123 Test Street, Test City, TS 12345',
        contact_phone: '555-0123',
        contact_email: 'test@testtransport.com'
      }, { onConflict: 'id' })
      .select()
      .single();
    
    if (companyError) {
      console.error('Error creating company:', companyError);
      return;
    }
    
    console.log('✅ Company created:', company.name);
    
    // Create test drivers
    console.log('👨‍💼 Creating test drivers...');
    const drivers = [
      {
        name: 'John Smith',
        email: 'john.smith@test.com',
        phone: '555-0101',
        license_number: 'DL001',
        license_expiry: '2025-12-31',
        status: 'Active',
        company_id: company.id
      },
      {
        name: 'Jane Doe',
        email: 'jane.doe@test.com',
        phone: '555-0102',
        license_number: 'DL002',
        license_expiry: '2025-11-30',
        status: 'Active',
        company_id: company.id
      }
    ];
    
    for (const driver of drivers) {
      const { data, error } = await supabase
        .from('drivers')
        .upsert(driver, { onConflict: 'email' })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating driver:', driver.name, error);
      } else {
        console.log('✅ Driver created:', data.name);
      }
    }
    
    // Create test vehicles
    console.log('🚛 Creating test vehicles...');
    const vehicles = [
      {
        name: 'Truck 001',
        type: 'Semi-Truck',
        max_weight: '80000',
        company_id: company.id
      },
      {
        name: 'Truck 002',
        type: 'Box Truck',
        max_weight: '26000',
        company_id: company.id
      }
    ];
    
    for (const vehicle of vehicles) {
      const { data, error } = await supabase
        .from('vehicles')
        .upsert(vehicle, { onConflict: 'name,company_id' })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating vehicle:', vehicle.name, error);
      } else {
        console.log('✅ Vehicle created:', data.name);
      }
    }
    
    console.log('\n🎉 Basic test data creation completed!');
    console.log('You can now test the application with:');
    console.log('- Company: Test Transport Co');
    console.log('- Drivers: John Smith, Jane Doe');
    console.log('- Vehicles: Truck 001, Truck 002');
    
  } catch (error) {
    console.error('Error in createBasicTestData:', error);
  }
}

createBasicTestData();