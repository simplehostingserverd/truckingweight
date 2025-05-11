#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
// Node.js 18+ has built-in fetch

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  process.exit(1);
}

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

// Sample data for companies, vehicles, and drivers
const sampleDataSQL = `
-- Insert sample companies
INSERT INTO companies (name, address, contact_email, contact_phone)
VALUES
  ('ABC Trucking', '123 Freight St, Truckville, TX 75001', 'info@abctrucking.example.com', '555-123-4567'),
  ('XYZ Logistics', '456 Shipping Ave, Haul City, CA 90001', 'contact@xyzlogistics.example.com', '555-987-6543');

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

// Function to create admin user
async function createAdminUser() {
  try {
    console.log('Creating admin company...');

    // Create admin company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert([
        {
          name: 'Admin Company',
          address: '123 Admin Street, Admin City',
          contact_email: 'simplehostingsolutionsd@yahoo.com',
          contact_phone: '555-ADMIN',
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

    // First, check if the user already exists
    const { data: existingUsers, error: existingError } = await supabase.auth.admin.listUsers();

    let authUser;

    if (existingError) {
      console.error('Error checking existing users:', existingError);
      return;
    }

    const existingUser = existingUsers.users.find(
      user => user.email === 'simplehostingsolutionsd@yahoo.com'
    );

    if (existingUser) {
      console.log('Admin user already exists in auth, updating password...');

      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { password: adminPassword }
      );

      if (updateError) {
        console.error('Error updating admin user password:', updateError);
        return;
      }

      authUser = updatedUser;
    } else {
      console.log('Creating new admin user...');

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: 'simplehostingsolutionsd@yahoo.com',
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          name: 'System Administrator',
        },
      });

      if (createError) {
        console.error('Error creating admin auth user:', createError);
        return;
      }

      authUser = newUser;
    }

    console.log('Admin auth user ID:', authUser.user.id);

    // Create admin user in users table
    console.log('Creating admin user in users table...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert([
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

// Function to execute SQL directly
async function executeSql(sql) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseServiceKey}`,
        apikey: supabaseServiceKey,
        Prefer: 'params=single-object',
      },
      body: JSON.stringify({
        query: sql,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`SQL execution failed: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  }
}

// Main function to reset the database
async function resetDatabase() {
  try {
    console.log('Starting database reset...');

    // Step 1: Drop existing tables
    console.log('Dropping existing tables...');
    try {
      // Try to drop tables one by one
      console.log('Dropping loads table...');
      await supabase.from('loads').delete().neq('id', 0);
      await executeSql('DROP TABLE IF EXISTS loads;');

      console.log('Dropping weights table...');
      await supabase.from('weights').delete().neq('id', 0);
      await executeSql('DROP TABLE IF EXISTS weights;');

      console.log('Dropping drivers table...');
      await supabase.from('drivers').delete().neq('id', 0);
      await executeSql('DROP TABLE IF EXISTS drivers;');

      console.log('Dropping vehicles table...');
      await supabase.from('vehicles').delete().neq('id', 0);
      await executeSql('DROP TABLE IF EXISTS vehicles;');

      console.log('Dropping users table...');
      await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await executeSql('DROP TABLE IF EXISTS users;');

      console.log('Dropping companies table...');
      await supabase.from('companies').delete().neq('id', 0);
      await executeSql('DROP TABLE IF EXISTS companies;');
    } catch (dropError) {
      console.error('Error dropping tables, continuing with creation:', dropError);
    }

    // Step 2: Create tables in correct order
    console.log('Creating tables...');
    try {
      await executeSql(createTablesSQL);
      console.log('Tables created successfully');
    } catch (createError) {
      console.error('Error creating tables:', createError);
      return;
    }

    // Step 3: Apply RLS policies
    console.log('Applying Row Level Security policies...');
    try {
      await executeSql(rlsPoliciesSQL);
      console.log('RLS policies applied successfully');
    } catch (rlsError) {
      console.error('Error applying RLS policies:', rlsError);
      return;
    }

    // Step 4: Insert sample data
    console.log('Inserting sample data...');
    try {
      await executeSql(sampleDataSQL);
      console.log('Sample data inserted successfully');
    } catch (sampleDataError) {
      console.error('Error inserting sample data:', sampleDataError);
      return;
    }

    // Step 5: Create admin user
    await createAdminUser();

    console.log('Database reset completed successfully!');
  } catch (error) {
    console.error('Unexpected error during database reset:', error);
  }
}

// Run the reset
resetDatabase();
