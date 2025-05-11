const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    'Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables'
  );
  process.exit(1);
}

console.log('Connecting to Supabase at:', supabaseUrl);

// Create Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SQL to drop existing tables (in reverse dependency order)
const dropTablesSQL = `
-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS loads;
DROP TABLE IF EXISTS weights;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS companies;
`;

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
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  license_plate VARCHAR(50) NOT NULL,
  vin VARCHAR(100) UNIQUE,
  make VARCHAR(100),
  model VARCHAR(100),
  year INTEGER,
  status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Maintenance', 'Out of Service')),
  max_weight VARCHAR(50),
  company_id INTEGER REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  license_number VARCHAR(100) NOT NULL,
  license_expiry DATE,
  phone VARCHAR(50),
  email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave', 'Inactive')),
  company_id INTEGER REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Weights Table
CREATE TABLE IF NOT EXISTS weights (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id),
  weight VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(50),
  driver_id INTEGER REFERENCES drivers(id),
  status VARCHAR(50) CHECK (status IN ('Compliant', 'Warning', 'Non-Compliant')),
  company_id INTEGER REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Loads Table
CREATE TABLE IF NOT EXISTS loads (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  weight VARCHAR(50) NOT NULL,
  vehicle_id INTEGER REFERENCES vehicles(id),
  driver_id INTEGER REFERENCES drivers(id),
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Transit', 'Delivered', 'Cancelled')),
  company_id INTEGER REFERENCES companies(id),
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
CREATE POLICY "Users can view their own record and company users" ON users
  FOR SELECT
  USING (
    auth.uid()::text = id::text OR
    company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text)
  );

CREATE POLICY "Users can update their own record" ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Vehicles policies
CREATE POLICY "Vehicles are viewable by company users" ON vehicles
  FOR SELECT
  USING (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));

CREATE POLICY "Vehicles are insertable by company users" ON vehicles
  FOR INSERT
  WITH CHECK (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));

CREATE POLICY "Vehicles are updatable by company users" ON vehicles
  FOR UPDATE
  USING (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));

CREATE POLICY "Vehicles are deletable by company users" ON vehicles
  FOR DELETE
  USING (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));

-- Drivers policies
CREATE POLICY "Drivers are viewable by company users" ON drivers
  FOR SELECT
  USING (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));

CREATE POLICY "Drivers are insertable by company users" ON drivers
  FOR INSERT
  WITH CHECK (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));

CREATE POLICY "Drivers are updatable by company users" ON drivers
  FOR UPDATE
  USING (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));

CREATE POLICY "Drivers are deletable by company users" ON drivers
  FOR DELETE
  USING (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));

-- Weights policies
CREATE POLICY "Weights are viewable by company users" ON weights
  FOR SELECT
  USING (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));

CREATE POLICY "Weights are insertable by company users" ON weights
  FOR INSERT
  WITH CHECK (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));

CREATE POLICY "Weights are updatable by company users" ON weights
  FOR UPDATE
  USING (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));

CREATE POLICY "Weights are deletable by company users" ON weights
  FOR DELETE
  USING (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));

-- Loads policies
CREATE POLICY "Loads are viewable by company users" ON loads
  FOR SELECT
  USING (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));

CREATE POLICY "Loads are insertable by company users" ON loads
  FOR INSERT
  WITH CHECK (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));

CREATE POLICY "Loads are updatable by company users" ON loads
  FOR UPDATE
  USING (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));

CREATE POLICY "Loads are deletable by company users" ON loads
  FOR DELETE
  USING (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));
`;

// Sample data for vehicles and drivers
const sampleDataSQL = `
-- Insert sample companies
INSERT INTO companies (name, address, contact_email, contact_phone)
VALUES
  ('ABC Trucking', '123 Main St, Anytown, USA', 'contact@abctrucking.com', '555-123-4567'),
  ('XYZ Logistics', '456 Oak Ave, Somewhere, USA', 'info@xyzlogistics.com', '555-987-6543');

-- Insert sample vehicles for ABC Trucking
INSERT INTO vehicles (name, type, license_plate, vin, make, model, year, status, max_weight, company_id)
VALUES
  ('Truck 101', 'Semi', 'ABC-1234', 'VIN12345678901234A', 'Freightliner', 'Cascadia', 2020, 'Active', '80,000 lbs', 1),
  ('Truck 203', 'Semi', 'ABC-2345', 'VIN23456789012345B', 'Peterbilt', '579', 2019, 'Active', '80,000 lbs', 1),
  ('Truck 155', 'Box Truck', 'ABC-3456', 'VIN34567890123456C', 'International', 'MV', 2021, 'Maintenance', '33,000 lbs', 1),
  ('Truck 087', 'Semi', 'ABC-4567', 'VIN45678901234567D', 'Kenworth', 'T680', 2018, 'Active', '80,000 lbs', 1);

-- Insert sample vehicles for XYZ Logistics
INSERT INTO vehicles (name, type, license_plate, vin, make, model, year, status, max_weight, company_id)
VALUES
  ('Truck A1', 'Semi', 'XYZ-1234', 'VIN56789012345678E', 'Volvo', 'VNL', 2021, 'Active', '80,000 lbs', 2),
  ('Truck B2', 'Semi', 'XYZ-2345', 'VIN67890123456789F', 'Mack', 'Anthem', 2020, 'Active', '80,000 lbs', 2),
  ('Truck C3', 'Box Truck', 'XYZ-3456', 'VIN78901234567890G', 'Hino', '338', 2019, 'Active', '33,000 lbs', 2),
  ('Truck D4', 'Semi', 'XYZ-4567', 'VIN89012345678901H', 'Western Star', '5700', 2022, 'Maintenance', '80,000 lbs', 2);

-- Insert sample drivers for ABC Trucking
INSERT INTO drivers (name, license_number, license_expiry, phone, email, status, company_id)
VALUES
  ('John Smith', 'DL12345678', '2025-06-30', '555-111-2222', 'john.smith@example.com', 'Active', 1),
  ('Sarah Johnson', 'DL23456789', '2024-08-15', '555-222-3333', 'sarah.johnson@example.com', 'Active', 1),
  ('Mike Wilson', 'DL34567890', '2023-12-01', '555-333-4444', 'mike.wilson@example.com', 'Active', 1),
  ('Lisa Brown', 'DL45678901', '2024-03-22', '555-444-5555', 'lisa.brown@example.com', 'On Leave', 1);

-- Insert sample drivers for XYZ Logistics
INSERT INTO drivers (name, license_number, license_expiry, phone, email, status, company_id)
VALUES
  ('David Miller', 'DL56789012', '2025-02-18', '555-555-6666', 'david.miller@example.com', 'Active', 2),
  ('Emily Davis', 'DL67890123', '2024-05-09', '555-666-7777', 'emily.davis@example.com', 'Active', 2),
  ('Michael Johnson', 'DL78901234', '2023-11-14', '555-777-8888', 'michael.johnson@example.com', 'Active', 2),
  ('Jessica Wilson', 'DL89012345', '2024-07-30', '555-888-9999', 'jessica.wilson@example.com', 'Inactive', 2);
`;

async function updateSchema() {
  try {
    console.log('Starting database schema update...');

    // Step 1: Drop existing tables
    console.log('Dropping existing tables...');
    const { error: dropError } = await supabase.rpc('pgmoon.query', { query: dropTablesSQL });

    if (dropError) {
      console.error('Error dropping tables:', dropError);
      return;
    }

    // Step 2: Create tables in correct order
    console.log('Creating tables...');
    const { error: createError } = await supabase.rpc('pgmoon.query', { query: createTablesSQL });

    if (createError) {
      console.error('Error creating tables:', createError);
      return;
    }

    // Step 3: Apply RLS policies
    console.log('Applying Row Level Security policies...');
    const { error: rlsError } = await supabase.rpc('pgmoon.query', { query: rlsPoliciesSQL });

    if (rlsError) {
      console.error('Error applying RLS policies:', rlsError);
      return;
    }

    console.log('Schema updated successfully!');

    // Ask if sample data should be inserted
    console.log('Do you want to insert sample data? (y/n)');
    process.stdin.once('data', async data => {
      const answer = data.toString().trim().toLowerCase();

      if (answer === 'y') {
        console.log('Inserting sample data...');

        // Insert sample data
        const { error: sampleDataError } = await supabase.rpc('pgmoon.query', {
          query: sampleDataSQL,
        });

        if (sampleDataError) {
          console.error('Error inserting sample data:', sampleDataError);
        } else {
          console.log('Sample data inserted successfully!');
        }
      }

      console.log('Schema update complete!');
      process.exit(0);
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

updateSchema();
