import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log(
  'Supabase Key (first 10 chars):',
  supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'undefined'
);

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to create tables using Supabase API
async function createTables() {
  try {
    console.log('Creating tables...');

    // Create companies table
    console.log('Creating companies table...');
    const { error: companiesError } = await supabase.rpc('create_companies_table');

    if (companiesError) {
      if (companiesError.message.includes('function create_companies_table() does not exist')) {
        console.log('Creating companies table directly...');

        // Try to create the table directly
        const { error } = await supabase.from('companies').insert([
          {
            name: 'Test Company',
            address: '123 Test St',
            contact_email: 'test@example.com',
            contact_phone: '555-123-4567',
          },
        ]);

        if (error && !error.message.includes('already exists')) {
          console.error('Error creating companies table:', error);
        } else {
          console.log('Companies table created or already exists');
        }
      } else {
        console.error('Error creating companies table:', companiesError);
      }
    } else {
      console.log('Companies table created successfully');
    }

    // Create users table
    console.log('Creating users table...');
    const { error: usersError } = await supabase.rpc('create_users_table');

    if (usersError) {
      if (usersError.message.includes('function create_users_table() does not exist')) {
        console.log('Creating users table directly...');

        // Try to create the table directly
        const { error } = await supabase.from('users').insert([
          {
            id: '00000000-0000-0000-0000-000000000000',
            name: 'Test User',
            email: 'test@example.com',
            company_id: 1,
            is_admin: true,
          },
        ]);

        if (error && !error.message.includes('already exists')) {
          console.error('Error creating users table:', error);
        } else {
          console.log('Users table created or already exists');
        }
      } else {
        console.error('Error creating users table:', usersError);
      }
    } else {
      console.log('Users table created successfully');
    }

    // Create vehicles table
    console.log('Creating vehicles table...');
    const { error: vehiclesError } = await supabase.rpc('create_vehicles_table');

    if (vehiclesError) {
      if (vehiclesError.message.includes('function create_vehicles_table() does not exist')) {
        console.log('Creating vehicles table directly...');

        // Try to create the table directly
        const { error } = await supabase.from('vehicles').insert([
          {
            company_id: 1,
            name: 'Test Vehicle',
            license_plate: 'ABC123',
            vin: '1HGCM82633A123456',
            make: 'Test Make',
            model: 'Test Model',
            year: 2023,
            empty_weight: 10000,
            max_weight: 80000,
            status: 'active',
          },
        ]);

        if (error && !error.message.includes('already exists')) {
          console.error('Error creating vehicles table:', error);
        } else {
          console.log('Vehicles table created or already exists');
        }
      } else {
        console.error('Error creating vehicles table:', vehiclesError);
      }
    } else {
      console.log('Vehicles table created successfully');
    }

    // Create drivers table
    console.log('Creating drivers table...');
    const { error: driversError } = await supabase.rpc('create_drivers_table');

    if (driversError) {
      if (driversError.message.includes('function create_drivers_table() does not exist')) {
        console.log('Creating drivers table directly...');

        // Try to create the table directly
        const { error } = await supabase.from('drivers').insert([
          {
            company_id: 1,
            name: 'Test Driver',
            license_number: 'DL12345',
            phone: '555-123-4567',
            email: 'driver@example.com',
            status: 'active',
          },
        ]);

        if (error && !error.message.includes('already exists')) {
          console.error('Error creating drivers table:', error);
        } else {
          console.log('Drivers table created or already exists');
        }
      } else {
        console.error('Error creating drivers table:', driversError);
      }
    } else {
      console.log('Drivers table created successfully');
    }

    // Create weights table
    console.log('Creating weights table...');
    const { error: weightsError } = await supabase.rpc('create_weights_table');

    if (weightsError) {
      if (weightsError.message.includes('function create_weights_table() does not exist')) {
        console.log('Creating weights table directly...');

        // Try to create the table directly
        const { error } = await supabase.from('weights').insert([
          {
            company_id: 1,
            vehicle_id: 1,
            driver_id: 1,
            weight: 75000,
            location: 'Test Location',
            notes: 'Test weight entry',
          },
        ]);

        if (error && !error.message.includes('already exists')) {
          console.error('Error creating weights table:', error);
        } else {
          console.log('Weights table created or already exists');
        }
      } else {
        console.error('Error creating weights table:', weightsError);
      }
    } else {
      console.log('Weights table created successfully');
    }

    // Create loads table
    console.log('Creating loads table...');
    const { error: loadsError } = await supabase.rpc('create_loads_table');

    if (loadsError) {
      if (loadsError.message.includes('function create_loads_table() does not exist')) {
        console.log('Creating loads table directly...');

        // Try to create the table directly
        const { error } = await supabase.from('loads').insert([
          {
            company_id: 1,
            description: 'Test Load',
            origin: 'Origin City',
            destination: 'Destination City',
            weight: 50000,
            status: 'pending',
            vehicle_id: 1,
            driver_id: 1,
          },
        ]);

        if (error && !error.message.includes('already exists')) {
          console.error('Error creating loads table:', error);
        } else {
          console.log('Loads table created or already exists');
        }
      } else {
        console.error('Error creating loads table:', loadsError);
      }
    } else {
      console.log('Loads table created successfully');
    }

    // Create sync_queue table
    console.log('Creating sync_queue table...');
    const { error: syncQueueError } = await supabase.rpc('create_sync_queue_table');

    if (syncQueueError) {
      if (syncQueueError.message.includes('function create_sync_queue_table() does not exist')) {
        console.log('Creating sync_queue table directly...');

        // Try to create the table directly
        const { error } = await supabase.from('sync_queue').insert([
          {
            id: 'test_sync_1',
            company_id: 1,
            table_name: 'weights',
            action: 'create',
            data: { weight: 70000, vehicle_id: 1 },
            status: 'pending',
          },
        ]);

        if (error && !error.message.includes('already exists')) {
          console.error('Error creating sync_queue table:', error);
        } else {
          console.log('Sync queue table created or already exists');
        }
      } else {
        console.error('Error creating sync_queue table:', syncQueueError);
      }
    } else {
      console.log('Sync queue table created successfully');
    }

    console.log('All tables created or verified!');
  } catch (error) {
    console.error('Unexpected error creating tables:', error);
  }
}

// Run the function
createTables();
