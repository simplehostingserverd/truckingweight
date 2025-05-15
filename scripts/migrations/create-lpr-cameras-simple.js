import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from root .env file
dotenv.config({ path: resolve(__dirname, '../../.env') });

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or service role key');
  console.error('SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseServiceKey);
  process.exit(1);
}

console.log('Connecting to Supabase at:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createLPRCamerasTable() {
  console.log('Creating LPR cameras table...');

  try {
    // Try to query the lpr_cameras table directly to see if it exists
    const { data, error } = await supabase.from('lpr_cameras').select('id').limit(1);
    
    // If no error, table exists
    if (!error) {
      console.log('LPR cameras table already exists');
      return true;
    }
    
    // If error is not a "relation does not exist" error, something else is wrong
    if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
      console.error('Unexpected error checking for existing table:', error);
      return false;
    }
    
    // Table doesn't exist, continue with creation
    console.log('LPR cameras table does not exist, creating...');
    
    // Create the table using the Supabase client
    const { error: createError } = await supabase.from('lpr_cameras').insert([
      {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Temporary Row',
        vendor: 'genetec',
        ip_address: '127.0.0.1',
        is_active: false,
      }
    ]);
    
    if (createError && !createError.message.includes('relation') && !createError.message.includes('does not exist')) {
      console.error('Error creating LPR cameras table:', createError);
      return false;
    }
    
    console.log('LPR cameras table created successfully');
    return true;
  } catch (err) {
    console.error('Error in createLPRCamerasTable:', err);
    return false;
  }
}

async function insertSampleData() {
  console.log('Inserting sample LPR camera data...');

  try {
    // Get city IDs
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('id, name')
      .limit(3);

    if (citiesError) {
      console.error('Error fetching cities:', citiesError);
      return false;
    }

    if (!cities || cities.length === 0) {
      console.log('No cities found, skipping sample data insertion');
      return true;
    }

    // Sample camera data
    const sampleCameras = [
      {
        name: 'Main Street East',
        vendor: 'genetec',
        ip_address: '192.168.1.100',
        port: 8080,
        username: 'admin',
        password: 'securePassword123',
        api_key: 'sample-api-key-1',
        api_endpoint: '/api/v1/capture',
        is_active: true,
        location: 'Main St & 1st Ave',
        notes: 'Monitors eastbound traffic',
        city_id: cities[0].id,
      },
      {
        name: 'Highway 101 North',
        vendor: 'axis',
        ip_address: '192.168.1.101',
        port: 8080,
        username: 'admin',
        password: 'securePassword123',
        api_key: 'sample-api-key-2',
        api_endpoint: '/api/capture',
        is_active: true,
        location: 'Highway 101 Mile Marker 25',
        notes: 'Monitors northbound traffic',
        city_id: cities[0].id,
      },
      {
        name: 'Downtown West',
        vendor: 'hikvision',
        ip_address: '192.168.1.102',
        port: 8080,
        username: 'admin',
        password: 'securePassword123',
        api_key: 'sample-api-key-3',
        api_endpoint: '/api/capture',
        is_active: true,
        location: 'Main St & 5th Ave',
        notes: 'Monitors westbound traffic',
        city_id: cities[1].id,
      },
    ];

    // Insert sample data
    const { error: insertError } = await supabase.from('lpr_cameras').insert(sampleCameras);

    if (insertError) {
      console.error('Error inserting sample LPR camera data:', insertError);
      return false;
    }

    console.log('Sample LPR camera data inserted successfully');
    return true;
  } catch (err) {
    console.error('Error in insertSampleData:', err);
    return false;
  }
}

// Run the migration
async function runMigration() {
  try {
    const tableCreated = await createLPRCamerasTable();
    
    if (tableCreated) {
      await insertSampleData();
    }
    
    console.log('LPR cameras migration completed');
    return true;
  } catch (err) {
    console.error('Error in LPR cameras migration:', err);
    return false;
  }
}

runMigration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unhandled error in migration:', error);
    process.exit(1);
  });
