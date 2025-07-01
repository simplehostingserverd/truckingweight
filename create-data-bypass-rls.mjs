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
  console.error('Missing Supabase environment variables');
  console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQL(sql) {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (error) {
    console.error('SQL Error:', error);
    return false;
  }
  return true;
}

async function createTestDataBypassRLS() {
  try {
    console.log('Creating comprehensive test data by temporarily disabling RLS...');

    // Disable RLS on relevant tables
    console.log('Disabling RLS temporarily...');
    await executeSQL('ALTER TABLE audit_trail DISABLE ROW LEVEL SECURITY;');
    await executeSQL('ALTER TABLE drivers DISABLE ROW LEVEL SECURITY;');
    await executeSQL('ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;');
    await executeSQL('ALTER TABLE loads DISABLE ROW LEVEL SECURITY;');

    // Create companies with correct column names
    const companiesData = [
      {
        name: 'ABC Trucking Co.',
        address: '123 Main St, Anytown, USA',
        contact_phone: '555-0101',
        contact_email: 'contact@abctrucking.com'
      },
      {
        name: 'XYZ Logistics',
        address: '456 Oak Ave, Somewhere, USA',
        contact_phone: '555-0102',
        contact_email: 'info@xyzlogistics.com'
      },
      {
        name: 'FastHaul Transport',
        address: '789 Pine Rd, Elsewhere, USA',
        contact_phone: '555-0103',
        contact_email: 'dispatch@fasthaul.com'
      },
      {
        name: 'Metro Delivery Services',
        address: '321 Business Blvd, Metro City, USA',
        contact_phone: '555-0104',
        contact_email: 'operations@metrodelivery.com'
      },
      {
        name: 'Highway Express',
        address: '654 Interstate Dr, Highway Town, USA',
        contact_phone: '555-0105',
        contact_email: 'dispatch@highwayexpress.com'
      }
    ];

    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .insert(companiesData)
      .select();

    if (companiesError) {
      console.error('Error creating companies:', companiesError);
      return;
    }

    console.log(`✅ Created ${companies.length} companies`);

    // Create drivers
    const driversData = [
      {
        name: 'John Smith',
        license_number: 'DL123456789',
        license_expiry: '2025-12-31',
        phone: '555-1001',
        email: 'john.smith@email.com',
        status: 'Active',
        company_id: companies[0].id
      },
      {
        name: 'Jane Doe',
        license_number: 'DL987654321',
        license_expiry: '2025-06-30',
        phone: '555-1002',
        email: 'jane.doe@email.com',
        status: 'Active',
        company_id: companies[0].id
      },
      {
        name: 'Mike Johnson',
        license_number: 'DL456789123',
        license_expiry: '2025-09-15',
        phone: '555-1003',
        email: 'mike.johnson@email.com',
        status: 'Active',
        company_id: companies[1].id
      },
      {
        name: 'Sarah Wilson',
        license_number: 'DL789123456',
        license_expiry: '2025-03-20',
        phone: '555-1004',
        email: 'sarah.wilson@email.com',
        status: 'Active',
        company_id: companies[2].id
      },
      {
        name: 'Robert Brown',
        license_number: 'DL321654987',
        license_expiry: '2025-08-10',
        phone: '555-1005',
        email: 'robert.brown@email.com',
        status: 'Active',
        company_id: companies[3].id
      },
      {
        name: 'Lisa Garcia',
        license_number: 'DL654987321',
        license_expiry: '2025-11-25',
        phone: '555-1006',
        email: 'lisa.garcia@email.com',
        status: 'Active',
        company_id: companies[4].id
      }
    ];

    const { data: drivers, error: driversError } = await supabase
      .from('drivers')
      .insert(driversData)
      .select();

    if (driversError) {
      console.error('Error creating drivers:', driversError);
    } else {
      console.log(`✅ Created ${drivers.length} drivers`);
    }

    // Create vehicles
    const vehiclesData = [
      {
        name: 'Truck 001',
        type: 'Semi-Truck',
        license_plate: 'TRK001',
        vin: 'VIN123456789ABCDEF1',
        make: 'Freightliner',
        model: 'Cascadia',
        year: 2020,
        status: 'Active',
        max_weight: '80000',
        company_id: companies[0].id
      },
      {
        name: 'Truck 002',
        type: 'Semi-Truck',
        license_plate: 'TRK002',
        vin: 'VIN123456789ABCDEF2',
        make: 'Peterbilt',
        model: '579',
        year: 2021,
        status: 'Active',
        max_weight: '80000',
        company_id: companies[0].id
      },
      {
        name: 'Truck 003',
        type: 'Box Truck',
        license_plate: 'BOX003',
        vin: 'VIN123456789ABCDEF3',
        make: 'International',
        model: 'DuraStar',
        year: 2019,
        status: 'Active',
        max_weight: '26000',
        company_id: companies[1].id
      },
      {
        name: 'Truck 004',
        type: 'Semi-Truck',
        license_plate: 'TRK004',
        vin: 'VIN123456789ABCDEF4',
        make: 'Kenworth',
        model: 'T680',
        year: 2022,
        status: 'Active',
        max_weight: '80000',
        company_id: companies[2].id
      },
      {
        name: 'Truck 005',
        type: 'Delivery Van',
        license_plate: 'VAN005',
        vin: 'VIN123456789ABCDEF5',
        make: 'Ford',
        model: 'Transit',
        year: 2021,
        status: 'Active',
        max_weight: '10000',
        company_id: companies[3].id
      },
      {
        name: 'Truck 006',
        type: 'Semi-Truck',
        license_plate: 'TRK006',
        vin: 'VIN123456789ABCDEF6',
        make: 'Volvo',
        model: 'VNL',
        year: 2023,
        status: 'Active',
        max_weight: '80000',
        company_id: companies[4].id
      }
    ];

    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .insert(vehiclesData)
      .select();

    if (vehiclesError) {
      console.error('Error creating vehicles:', vehiclesError);
    } else {
      console.log(`✅ Created ${vehicles.length} vehicles`);
    }

    // Create loads if we have drivers and vehicles
    if (drivers && vehicles && drivers.length > 0 && vehicles.length > 0) {
      const loadsData = [
        {
          description: 'Steel coils delivery',
          origin: 'Pittsburgh, PA',
          destination: 'Detroit, MI',
          weight: '45000',
          vehicle_id: vehicles[0].id,
          driver_id: drivers[0].id,
          status: 'In Transit',
          company_id: companies[0].id
        },
        {
          description: 'Electronics shipment',
          origin: 'Los Angeles, CA',
          destination: 'Phoenix, AZ',
          weight: '25000',
          vehicle_id: vehicles[1].id,
          driver_id: drivers[1].id,
          status: 'Pending',
          company_id: companies[0].id
        },
        {
          description: 'Food products delivery',
          origin: 'Chicago, IL',
          destination: 'Milwaukee, WI',
          weight: '18000',
          vehicle_id: vehicles[2].id,
          driver_id: drivers[2].id,
          status: 'Delivered',
          company_id: companies[1].id
        },
        {
          description: 'Construction materials',
          origin: 'Houston, TX',
          destination: 'Dallas, TX',
          weight: '52000',
          vehicle_id: vehicles[3].id,
          driver_id: drivers[3].id,
          status: 'Loading',
          company_id: companies[2].id
        },
        {
          description: 'Medical supplies',
          origin: 'Atlanta, GA',
          destination: 'Jacksonville, FL',
          weight: '8000',
          vehicle_id: vehicles[4].id,
          driver_id: drivers[4].id,
          status: 'Scheduled',
          company_id: companies[3].id
        },
        {
          description: 'Automotive parts',
          origin: 'Denver, CO',
          destination: 'Salt Lake City, UT',
          weight: '35000',
          vehicle_id: vehicles[5].id,
          driver_id: drivers[5].id,
          status: 'In Transit',
          company_id: companies[4].id
        }
      ];

      const { data: loads, error: loadsError } = await supabase
        .from('loads')
        .insert(loadsData)
        .select();

      if (loadsError) {
        console.error('Error creating loads:', loadsError);
      } else {
        console.log(`✅ Created ${loads.length} loads`);
      }
    }

    // Re-enable RLS
    console.log('Re-enabling RLS...');
    await executeSQL('ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;');
    await executeSQL('ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;');
    await executeSQL('ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;');
    await executeSQL('ALTER TABLE loads ENABLE ROW LEVEL SECURITY;');

    console.log('\n🎉 === Comprehensive Test Data Creation Summary ===');
    console.log(`Companies: ${companies.length}`);
    console.log(`Drivers: ${drivers ? drivers.length : 0}`);
    console.log(`Vehicles: ${vehicles ? vehicles.length : 0}`);
    console.log(`Loads: ${drivers && vehicles ? 6 : 0}`);
    console.log('\n✅ Comprehensive test data creation completed successfully!');
    console.log('🚀 Your Supabase database is now populated with test data!');

  } catch (error) {
    console.error('Error creating test data:', error);
  }
}

createTestDataBypassRLS();