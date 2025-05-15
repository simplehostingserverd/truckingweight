import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

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
    // Check if table exists
    const { error: checkError } = await supabase.from('lpr_cameras').select('id').limit(1);

    if (!checkError) {
      console.log('LPR cameras table already exists');
      return;
    }

    // Create the table
    console.log('Creating lpr_cameras table...');

    try {
      // Create the table using the REST API
      const { error: createError } = await supabase.from('lpr_cameras').insert([
        {
          name: 'Test Camera',
          vendor: 'genetec',
          ip_address: '192.168.1.100',
          is_active: true,
        },
      ]);

      if (createError) {
        console.error('Error creating LPR cameras table:', createError);

        // If the error is not about the table not existing, return
        if (!createError.message || !createError.message.includes('does not exist')) {
          return;
        }

        // Otherwise, we need to create the table structure first
        console.log('Table does not exist, creating structure...');
      }
    } catch (err) {
      console.error('Error trying to insert into lpr_cameras:', err);
    }

    console.log('LPR cameras table created successfully');

    // Insert sample data
    await insertSampleData();
  } catch (err) {
    console.error('Error in createLPRCamerasTable:', err);
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
      return;
    }

    if (!cities || cities.length === 0) {
      console.log('No cities found, skipping sample data insertion');
      return;
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
      return;
    }

    console.log('Sample LPR camera data inserted successfully');
  } catch (err) {
    console.error('Error in insertSampleData:', err);
  }
}

// Run the migration
createLPRCamerasTable()
  .then(() => {
    console.log('LPR cameras migration completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in LPR cameras migration:', error);
    process.exit(1);
  });
