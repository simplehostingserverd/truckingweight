import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestData() {
  console.log('🚀 Creating simple test data...');

  try {
    // 1. Create companies
    console.log('\n📊 Creating companies...');
    const companies = [
      {
        name: 'Acme Transport Co',
        address: '123 Main St, City, State 12345',
        phone: '555-0101',
        email: 'contact@acmetransport.com',
        license_number: 'DOT123456',
        is_active: true
      },
      {
        name: 'Swift Logistics',
        address: '456 Oak Ave, City, State 12345',
        phone: '555-0102',
        email: 'info@swiftlogistics.com',
        license_number: 'DOT789012',
        is_active: true
      },
      {
        name: 'Reliable Freight',
        address: '789 Pine Rd, City, State 12345',
        phone: '555-0103',
        email: 'dispatch@reliablefreight.com',
        license_number: 'DOT345678',
        is_active: true
      }
    ];

    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert(companies)
      .select();

    if (companyError) {
      console.log('Company insert error:', companyError);
    } else {
      console.log(`✅ Created ${companyData.length} companies`);
    }

    // Get company IDs for drivers
    const { data: allCompanies } = await supabase
      .from('companies')
      .select('id, name')
      .limit(3);

    if (!allCompanies || allCompanies.length === 0) {
      console.log('❌ No companies found for driver creation');
      return;
    }

    // 2. Create drivers
    console.log('\n👨‍💼 Creating drivers...');
    const drivers = [
      {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@acmetransport.com',
        phone: '555-1001',
        license_number: 'CDL123456',
        license_expiry: '2025-12-31',
        company_id: allCompanies[0].id,
        is_active: true
      },
      {
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane.doe@swiftlogistics.com',
        phone: '555-1002',
        license_number: 'CDL789012',
        license_expiry: '2025-11-30',
        company_id: allCompanies[1].id,
        is_active: true
      },
      {
        first_name: 'Mike',
        last_name: 'Johnson',
        email: 'mike.johnson@reliablefreight.com',
        phone: '555-1003',
        license_number: 'CDL345678',
        license_expiry: '2025-10-31',
        company_id: allCompanies[2].id,
        is_active: true
      },
      {
        first_name: 'Sarah',
        last_name: 'Wilson',
        email: 'sarah.wilson@acmetransport.com',
        phone: '555-1004',
        license_number: 'CDL901234',
        license_expiry: '2025-09-30',
        company_id: allCompanies[0].id,
        is_active: true
      }
    ];

    const { data: driverData, error: driverError } = await supabase
      .from('drivers')
      .insert(drivers)
      .select();

    if (driverError) {
      console.log('Driver insert error:', driverError);
    } else {
      console.log(`✅ Created ${driverData.length} drivers`);
    }

    // 3. Create vehicles
    console.log('\n🚛 Creating vehicles...');
    const vehicles = [
      {
        make: 'Freightliner',
        model: 'Cascadia',
        year: 2022,
        vin: '1FUJGHDV8NLAA1234',
        license_plate: 'TRK001',
        company_id: allCompanies[0].id,
        is_active: true
      },
      {
        make: 'Peterbilt',
        model: '579',
        year: 2021,
        vin: '1XPWD40X1ED123456',
        license_plate: 'TRK002',
        company_id: allCompanies[1].id,
        is_active: true
      },
      {
        make: 'Kenworth',
        model: 'T680',
        year: 2023,
        vin: '1XKWD49X5NJ789012',
        license_plate: 'TRK003',
        company_id: allCompanies[2].id,
        is_active: true
      },
      {
        make: 'Volvo',
        model: 'VNL',
        year: 2022,
        vin: '4V4NC9EH8NN345678',
        license_plate: 'TRK004',
        company_id: allCompanies[0].id,
        is_active: true
      }
    ];

    const { data: vehicleData, error: vehicleError } = await supabase
      .from('vehicles')
      .insert(vehicles)
      .select();

    if (vehicleError) {
      console.log('Vehicle insert error:', vehicleError);
    } else {
      console.log(`✅ Created ${vehicleData.length} vehicles`);
    }

    // 4. Create some loads
    console.log('\n📦 Creating loads...');
    const loads = [
      {
        load_number: 'LD001',
        origin: 'Chicago, IL',
        destination: 'Detroit, MI',
        weight: 45000,
        status: 'in_transit',
        company_id: allCompanies[0].id
      },
      {
        load_number: 'LD002',
        origin: 'Los Angeles, CA',
        destination: 'Phoenix, AZ',
        weight: 38000,
        status: 'delivered',
        company_id: allCompanies[1].id
      },
      {
        load_number: 'LD003',
        origin: 'New York, NY',
        destination: 'Boston, MA',
        weight: 42000,
        status: 'pending',
        company_id: allCompanies[2].id
      }
    ];

    const { data: loadData, error: loadError } = await supabase
      .from('loads')
      .insert(loads)
      .select();

    if (loadError) {
      console.log('Load insert error:', loadError);
    } else {
      console.log(`✅ Created ${loadData.length} loads`);
    }

    console.log('\n🎉 Test data creation completed!');
    console.log('\n📋 Summary:');
    console.log(`- Companies: ${companyData?.length || 0}`);
    console.log(`- Drivers: ${driverData?.length || 0}`);
    console.log(`- Vehicles: ${vehicleData?.length || 0}`);
    console.log(`- Loads: ${loadData?.length || 0}`);
    console.log('\n🌐 You can now test the application at http://localhost:3000');
    console.log('📧 Login with: demo@trucking.com / demo123');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  }
}

createTestData();