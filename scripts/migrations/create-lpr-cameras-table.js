import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or service role key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createLPRCamerasTable() {
  console.log('Creating LPR cameras table...');

  // Check if table already exists
  const { data: existingTables, error: tablesError } = await supabase
    .from('pg_tables')
    .select('tablename')
    .eq('schemaname', 'public')
    .eq('tablename', 'lpr_cameras');

  if (tablesError) {
    console.error('Error checking for existing table:', tablesError);
    return;
  }

  if (existingTables && existingTables.length > 0) {
    console.log('LPR cameras table already exists');
    return;
  }

  // Create the table
  const { error: createError } = await supabase.rpc('create_lpr_cameras_table');

  if (createError) {
    console.error('Error creating LPR cameras table:', createError);
    return;
  }

  console.log('LPR cameras table created successfully');

  // Create RLS policies
  await createRLSPolicies();

  // Insert sample data
  await insertSampleData();
}

async function createRLSPolicies() {
  console.log('Creating RLS policies for LPR cameras table...');

  // Enable RLS
  const { error: rlsError } = await supabase.rpc('enable_rls_on_lpr_cameras');

  if (rlsError) {
    console.error('Error enabling RLS on LPR cameras table:', rlsError);
    return;
  }

  // Create policies
  const policies = [
    {
      name: 'lpr_cameras_select_policy',
      operation: 'SELECT',
      definition: 'auth.uid() IN (SELECT id FROM users WHERE is_admin = true OR city_id = lpr_cameras.city_id)',
    },
    {
      name: 'lpr_cameras_insert_policy',
      operation: 'INSERT',
      definition: 'auth.uid() IN (SELECT id FROM users WHERE is_admin = true)',
    },
    {
      name: 'lpr_cameras_update_policy',
      operation: 'UPDATE',
      definition: 'auth.uid() IN (SELECT id FROM users WHERE is_admin = true OR city_id = lpr_cameras.city_id)',
    },
    {
      name: 'lpr_cameras_delete_policy',
      operation: 'DELETE',
      definition: 'auth.uid() IN (SELECT id FROM users WHERE is_admin = true)',
    },
  ];

  for (const policy of policies) {
    const { error } = await supabase.rpc('create_policy_on_lpr_cameras', {
      policy_name: policy.name,
      policy_operation: policy.operation,
      policy_definition: policy.definition,
    });

    if (error) {
      console.error(`Error creating policy ${policy.name}:`, error);
    } else {
      console.log(`Policy ${policy.name} created successfully`);
    }
  }
}

async function insertSampleData() {
  console.log('Inserting sample LPR camera data...');

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
  const { error: insertError } = await supabase
    .from('lpr_cameras')
    .insert(sampleCameras);

  if (insertError) {
    console.error('Error inserting sample LPR camera data:', insertError);
    return;
  }

  console.log('Sample LPR camera data inserted successfully');
}

// Run the migration
createLPRCamerasTable()
  .then(() => {
    console.log('LPR cameras migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error in LPR cameras migration:', error);
    process.exit(1);
  });
