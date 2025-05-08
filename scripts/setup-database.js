#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  process.exit(1);
}

// Create Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
          contact_phone: '555-ADMIN'
        }
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
        name: 'System Administrator'
      }
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
          is_admin: true
        }
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
    const { error: createError } = await supabase.rpc('pgmoon.query', { query: createTablesSQL });
    
    if (createError) {
      console.error('Error creating tables:', createError);
      return;
    }
    
    // Step 2: Apply RLS policies
    console.log('Applying Row Level Security policies...');
    const { error: rlsError } = await supabase.rpc('pgmoon.query', { query: rlsPoliciesSQL });
    
    if (rlsError) {
      console.error('Error applying RLS policies:', rlsError);
      return;
    }
    
    // Step 3: Create admin user
    await createAdminUser();
    
    console.log('Database setup completed successfully!');
    
  } catch (error) {
    console.error('Unexpected error during database setup:', error);
  }
}

// Run the setup
setupDatabase();
