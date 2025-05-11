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

// SQL to create tables in correct order
const createTablesSQL = `
-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  company_id INTEGER REFERENCES companies(id),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  license_plate VARCHAR(50),
  vin VARCHAR(50),
  make VARCHAR(100),
  model VARCHAR(100),
  year INTEGER,
  empty_weight DECIMAL(10, 2),
  max_weight DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  license_number VARCHAR(50),
  phone VARCHAR(50),
  email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Weights Table
CREATE TABLE IF NOT EXISTS weights (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) NOT NULL,
  vehicle_id INTEGER REFERENCES vehicles(id),
  driver_id INTEGER REFERENCES drivers(id),
  weight DECIMAL(10, 2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Loads Table
CREATE TABLE IF NOT EXISTS loads (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) NOT NULL,
  description VARCHAR(255) NOT NULL,
  origin VARCHAR(255),
  destination VARCHAR(255),
  weight DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'pending',
  vehicle_id INTEGER REFERENCES vehicles(id),
  driver_id INTEGER REFERENCES drivers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sync Queue Table for offline operations
CREATE TABLE IF NOT EXISTS sync_queue (
  id VARCHAR(255) PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  action VARCHAR(20) NOT NULL,
  data JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

// SQL for Row Level Security policies
const rlsPoliciesSQL = `
-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Companies are viewable by their users" ON companies
  FOR SELECT
  USING (id IN (
    SELECT company_id FROM users
    WHERE auth.uid()::text = users.id::text
  ));

CREATE POLICY "Companies are editable by admins" ON companies
  FOR UPDATE
  USING (id IN (
    SELECT company_id FROM users
    WHERE auth.uid()::text = users.id::text AND is_admin = TRUE
  ));

-- Users policies
CREATE POLICY "Users can view their own company's users" ON users
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM users
    WHERE auth.uid()::text = users.id::text
  ));

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Vehicles policies
CREATE POLICY "Users can view their company's vehicles" ON vehicles
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM users
    WHERE auth.uid()::text = users.id::text
  ));

CREATE POLICY "Users can manage their company's vehicles" ON vehicles
  FOR ALL
  USING (company_id IN (
    SELECT company_id FROM users
    WHERE auth.uid()::text = users.id::text
  ));

-- Similar policies for other tables
-- Drivers
CREATE POLICY "Users can view their company's drivers" ON drivers
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM users
    WHERE auth.uid()::text = users.id::text
  ));

CREATE POLICY "Users can manage their company's drivers" ON drivers
  FOR ALL
  USING (company_id IN (
    SELECT company_id FROM users
    WHERE auth.uid()::text = users.id::text
  ));

-- Weights
CREATE POLICY "Users can view their company's weights" ON weights
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM users
    WHERE auth.uid()::text = users.id::text
  ));

CREATE POLICY "Users can manage their company's weights" ON weights
  FOR ALL
  USING (company_id IN (
    SELECT company_id FROM users
    WHERE auth.uid()::text = users.id::text
  ));

-- Loads
CREATE POLICY "Users can view their company's loads" ON loads
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM users
    WHERE auth.uid()::text = users.id::text
  ));

CREATE POLICY "Users can manage their company's loads" ON loads
  FOR ALL
  USING (company_id IN (
    SELECT company_id FROM users
    WHERE auth.uid()::text = users.id::text
  ));

-- Sync Queue
CREATE POLICY "Users can view their company's sync queue" ON sync_queue
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM users
    WHERE auth.uid()::text = users.id::text
  ));

CREATE POLICY "Users can manage their company's sync queue" ON sync_queue
  FOR ALL
  USING (company_id IN (
    SELECT company_id FROM users
    WHERE auth.uid()::text = users.id::text
  ));
`;

// Function to create admin user
async function createAdminUser() {
  try {
    console.log('Creating admin company...');

    // Create admin company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert([
        {
          name: 'System Administrator',
          address: '123 Admin St',
          contact_email: 'simplehostingsolutionsd@yahoo.com',
          contact_phone: '555-123-4567',
        },
      ])
      .select()
      .single();

    if (companyError) {
      console.error('Error creating admin company:', companyError);
      return;
    }

    console.log('Admin company created with ID:', company.id);

    // Create admin user in auth
    console.log('Creating admin user in auth...');
    const adminPassword = 'Tr#ck1ng@W3ight$2024!';

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'simplehostingsolutionsd@yahoo.com',
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        name: 'System Administrator',
      },
    });

    if (authError) {
      console.error('Error creating admin auth user:', authError);
      return;
    }

    console.log('Admin auth user created with ID:', authUser.user.id);

    // Create admin user in users table
    console.log('Creating admin user in users table...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authUser.user.id,
          name: 'System Administrator',
          email: 'simplehostingsolutionsd@yahoo.com',
          company_id: company.id,
          is_admin: true,
        },
      ])
      .select()
      .single();

    if (userError) {
      console.error('Error creating admin user in users table:', userError);
      return;
    }

    console.log('Admin user created successfully!');
    console.log('Email: simplehostingsolutionsd@yahoo.com');
    console.log('Password:', adminPassword);
  } catch (error) {
    console.error('Unexpected error creating admin user:', error);
  }
}

// Main function to set up the database
async function setupDatabase() {
  try {
    console.log('Starting database setup...');

    // Step 1: Create tables
    console.log('Creating tables...');

    // Try direct SQL via REST API
    const { error: createError } = await supabase.rpc('pgmoon.query', { query: createTablesSQL });

    if (createError) {
      console.error('Error creating tables via pgmoon.query:', createError);

      if (createError.message.includes('function pgmoon.query() does not exist')) {
        console.log('\nThe pgmoon extension is not enabled in your Supabase project.');
        console.log('Trying to create tables one by one via REST API...');

        // Create tables one by one using REST API
        await createTablesOneByOne();
      } else {
        return;
      }
    } else {
      console.log('Tables created successfully!');
    }

    // Step 2: Apply RLS policies
    console.log('Applying Row Level Security policies...');
    const { error: rlsError } = await supabase.rpc('pgmoon.query', { query: rlsPoliciesSQL });

    if (rlsError) {
      console.error('Error applying RLS policies:', rlsError);

      if (rlsError.message.includes('function pgmoon.query() does not exist')) {
        console.log('\nSkipping RLS policies for now. You can apply them later.');
      } else {
        return;
      }
    } else {
      console.log('RLS policies applied successfully!');
    }

    // Step 3: Create admin user
    await createAdminUser();

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Unexpected error setting up database:', error);
  }
}

// Function to create tables one by one using REST API
async function createTablesOneByOne() {
  try {
    // Create companies table
    console.log('Creating companies table...');
    const { error: companiesError } = await supabase.from('companies').insert([
      {
        name: 'Test Company',
        address: '123 Test St',
        contact_email: 'test@example.com',
        contact_phone: '555-123-4567',
      },
    ]);

    if (companiesError && !companiesError.message.includes('already exists')) {
      console.error('Error creating companies table:', companiesError);
    } else {
      console.log('Companies table created or already exists');
    }

    // Create other tables similarly
    // ...
  } catch (error) {
    console.error('Error creating tables one by one:', error);
  }
}

// Run the setup
setupDatabase();
