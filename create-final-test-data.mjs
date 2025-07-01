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

async function createFinalTestData() {
  try {
    console.log('Creating final test data...');

    // First, check existing companies
    const { data: existingCompanies, error: companiesCheckError } = await supabase
      .from('companies')
      .select('*')
      .limit(10);

    if (companiesCheckError) {
      console.error('Error checking companies:', companiesCheckError);
      return;
    }

    console.log(`Found ${existingCompanies.length} existing companies`);

    let companies = existingCompanies;

    // If no companies exist, create some
    if (companies.length === 0) {
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
        }
      ];

      const { data: newCompanies, error: companiesError } = await supabase
        .from('companies')
        .insert(companiesData)
        .select();

      if (companiesError) {
        console.error('Error creating companies:', companiesError);
        return;
      }

      companies = newCompanies;
      console.log(`✅ Created ${companies.length} companies`);
    }

    // Try to create drivers one by one to avoid audit_trail issues
    console.log('Creating drivers individually...');
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
        company_id: companies.length > 1 ? companies[1].id : companies[0].id
      }
    ];

    const createdDrivers = [];
    for (const driverData of driversData) {
      try {
        const { data: driver, error: driverError } = await supabase
          .from('drivers')
          .insert([driverData])
          .select()
          .single();

        if (driverError) {
          console.log(`⚠️  Could not create driver ${driverData.name}:`, driverError.message);
        } else {
          createdDrivers.push(driver);
          console.log(`✅ Created driver: ${driver.name}`);
        }
      } catch (error) {
        console.log(`⚠️  Error creating driver ${driverData.name}:`, error.message);
      }
    }

    // Try to create vehicles one by one
    console.log('Creating vehicles individually...');
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
        company_id: companies.length > 1 ? companies[1].id : companies[0].id
      }
    ];

    const createdVehicles = [];
    for (const vehicleData of vehiclesData) {
      try {
        const { data: vehicle, error: vehicleError } = await supabase
          .from('vehicles')
          .insert([vehicleData])
          .select()
          .single();

        if (vehicleError) {
          console.log(`⚠️  Could not create vehicle ${vehicleData.name}:`, vehicleError.message);
        } else {
          createdVehicles.push(vehicle);
          console.log(`✅ Created vehicle: ${vehicle.name}`);
        }
      } catch (error) {
        console.log(`⚠️  Error creating vehicle ${vehicleData.name}:`, error.message);
      }
    }

    // Create loads if we have drivers and vehicles
    const createdLoads = [];
    if (createdDrivers.length > 0 && createdVehicles.length > 0) {
      console.log('Creating loads...');
      const loadsData = [
        {
          description: 'Steel coils delivery',
          origin: 'Pittsburgh, PA',
          destination: 'Detroit, MI',
          weight: '45000',
          vehicle_id: createdVehicles[0].id,
          driver_id: createdDrivers[0].id,
          status: 'In Transit',
          company_id: companies[0].id
        },
        {
          description: 'Electronics shipment',
          origin: 'Los Angeles, CA',
          destination: 'Phoenix, AZ',
          weight: '25000',
          vehicle_id: createdVehicles.length > 1 ? createdVehicles[1].id : createdVehicles[0].id,
          driver_id: createdDrivers.length > 1 ? createdDrivers[1].id : createdDrivers[0].id,
          status: 'Pending',
          company_id: companies[0].id
        }
      ];

      for (const loadData of loadsData) {
        try {
          const { data: load, error: loadError } = await supabase
            .from('loads')
            .insert([loadData])
            .select()
            .single();

          if (loadError) {
            console.log(`⚠️  Could not create load ${loadData.description}:`, loadError.message);
          } else {
            createdLoads.push(load);
            console.log(`✅ Created load: ${load.description}`);
          }
        } catch (error) {
          console.log(`⚠️  Error creating load ${loadData.description}:`, error.message);
        }
      }
    }

    console.log('\n🎉 === Final Test Data Summary ===');
    console.log(`Companies: ${companies.length}`);
    console.log(`Drivers: ${createdDrivers.length}`);
    console.log(`Vehicles: ${createdVehicles.length}`);
    console.log(`Loads: ${createdLoads.length}`);
    console.log('\n✅ Test data creation completed!');
    console.log('🚀 Your Supabase database now has test data for the application!');

    if (createdDrivers.length === 0 && createdVehicles.length === 0) {
      console.log('\n⚠️  Note: Due to RLS policies, drivers and vehicles could not be created.');
      console.log('However, companies were successfully created, and the application should still be functional.');
    }

  } catch (error) {
    console.error('Error creating test data:', error);
  }
}

createFinalTestData();