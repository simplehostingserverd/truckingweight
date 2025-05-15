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
      return;
    }

    // If error is not a "relation does not exist" error, something else is wrong
    if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
      console.error('Unexpected error checking for existing table:', error);
      return;
    }

    // Table doesn't exist, continue with creation
    console.log('LPR cameras table does not exist, creating...');
  } catch (err) {
    console.error('Error checking if table exists:', err);
    // Continue anyway to try creating the table
  }

  // Create the table directly with SQL
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS public.lpr_cameras (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      vendor TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      port INTEGER,
      username TEXT,
      password TEXT,
      api_key TEXT,
      api_endpoint TEXT,
      is_active BOOLEAN DEFAULT true,
      location TEXT,
      notes TEXT,
      city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS lpr_cameras_city_id_idx ON public.lpr_cameras(city_id);
    CREATE INDEX IF NOT EXISTS lpr_cameras_is_active_idx ON public.lpr_cameras(is_active);

    CREATE OR REPLACE FUNCTION update_lpr_cameras_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS update_lpr_cameras_updated_at_trigger ON public.lpr_cameras;

    CREATE TRIGGER update_lpr_cameras_updated_at_trigger
    BEFORE UPDATE ON public.lpr_cameras
    FOR EACH ROW
    EXECUTE FUNCTION update_lpr_cameras_updated_at();
  `;

  const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });

  if (createError) {
    console.error('Error creating LPR cameras table:', createError);

    // Try an alternative approach if the RPC method fails
    console.log('Trying alternative approach to create table...');
    try {
      // Use the REST API to execute SQL directly
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseServiceKey}`,
          apikey: supabaseServiceKey,
          Prefer: 'params=single-object',
        },
        body: JSON.stringify({
          query: createTableSQL,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error with alternative approach:', errorData);
        return;
      }

      console.log('Table created using alternative approach');
    } catch (err) {
      console.error('Error with alternative approach:', err);
      return;
    }
  } else {
    console.log('LPR cameras table created successfully');
  }

  // Create RLS policies
  await createRLSPolicies();

  // Insert sample data
  await insertSampleData();
}

async function createRLSPolicies() {
  console.log('Creating RLS policies for LPR cameras table...');

  // Enable RLS with direct SQL
  const enableRlsSQL = `
    ALTER TABLE public.lpr_cameras ENABLE ROW LEVEL SECURITY;
  `;

  const { error: rlsError } = await supabase.rpc('exec_sql', { sql: enableRlsSQL });

  if (rlsError) {
    console.error('Error enabling RLS on LPR cameras table:', rlsError);
    console.log('Trying alternative approach to enable RLS...');

    try {
      // Use the REST API to execute SQL directly
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseServiceKey}`,
          apikey: supabaseServiceKey,
          Prefer: 'params=single-object',
        },
        body: JSON.stringify({
          query: enableRlsSQL,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error with alternative approach for RLS:', errorData);
        return;
      }

      console.log('RLS enabled using alternative approach');
    } catch (err) {
      console.error('Error with alternative approach for RLS:', err);
      return;
    }
  } else {
    console.log('RLS enabled successfully');
  }

  // Create policies
  const policies = [
    {
      name: 'lpr_cameras_select_policy',
      operation: 'SELECT',
      definition:
        'auth.uid() IN (SELECT id FROM users WHERE is_admin = true OR city_id = lpr_cameras.city_id)',
    },
    {
      name: 'lpr_cameras_insert_policy',
      operation: 'INSERT',
      definition: 'auth.uid() IN (SELECT id FROM users WHERE is_admin = true)',
    },
    {
      name: 'lpr_cameras_update_policy',
      operation: 'UPDATE',
      definition:
        'auth.uid() IN (SELECT id FROM users WHERE is_admin = true OR city_id = lpr_cameras.city_id)',
    },
    {
      name: 'lpr_cameras_delete_policy',
      operation: 'DELETE',
      definition: 'auth.uid() IN (SELECT id FROM users WHERE is_admin = true)',
    },
  ];

  for (const policy of policies) {
    const createPolicySQL = `
      CREATE POLICY ${policy.name} ON public.lpr_cameras
      FOR ${policy.operation} TO authenticated
      USING (${policy.definition});
    `;

    const { error } = await supabase.rpc('exec_sql', { sql: createPolicySQL });

    if (error) {
      console.error(`Error creating policy ${policy.name}:`, error);

      // Try alternative approach
      try {
        // Use the REST API to execute SQL directly
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
            Prefer: 'params=single-object',
          },
          body: JSON.stringify({
            query: createPolicySQL,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Error with alternative approach for policy ${policy.name}:`, errorData);
          continue;
        }

        console.log(`Policy ${policy.name} created using alternative approach`);
      } catch (err) {
        console.error(`Error with alternative approach for policy ${policy.name}:`, err);
        continue;
      }
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
  const { error: insertError } = await supabase.from('lpr_cameras').insert(sampleCameras);

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
  .catch(error => {
    console.error('Error in LPR cameras migration:', error);
    process.exit(1);
  });
