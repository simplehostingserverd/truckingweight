/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */


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
-- Insert professional sample companies for investor demonstration
INSERT INTO companies (name, address, contact_email, contact_phone)
VALUES
  ('Premier Freight Solutions', '2847 Industrial Blvd, Chicago, IL 60601', 'operations@premierfreight.com', '(312) 555-8472'),
  ('Continental Logistics Group', '5829 Commerce Drive, Dallas, TX 75201', 'dispatch@continentallogistics.com', '(214) 555-9384'),
  ('Pacific Coast Transport', '1847 Harbor Way, Long Beach, CA 90802', 'fleet@pacificcoasttransport.com', '(562) 555-7291'),
  ('Mountain States Hauling', '3947 Denver West Pkwy, Denver, CO 80401', 'admin@mountainstateshauling.com', '(303) 555-6847'),
  ('Atlantic Express Carriers', '7284 Peachtree Rd, Atlanta, GA 30309', 'info@atlanticexpress.com', '(404) 555-5729');

-- Insert professional sample vehicles for Premier Freight Solutions
INSERT INTO vehicles (name, type, license_plate, vin, make, model, year, status, max_weight, company_id)
VALUES
  ('Freightliner FL-2847', 'Class 8 Semi', 'IL PFS-2847', '1FUJGHDV8NLAA2847', 'Freightliner', 'Cascadia Evolution', 2022, 'Active', '80,000 lbs', 1),
  ('Peterbilt PB-3947', 'Class 8 Semi', 'IL PFS-3947', '1XPBDP9X5ND394756', 'Peterbilt', '579 EPIQ', 2023, 'Active', '80,000 lbs', 1),
  ('Kenworth KW-5829', 'Class 8 Semi', 'IL PFS-5829', '1XKDDB9X8NJ582947', 'Kenworth', 'T680 Next Gen', 2023, 'Active', '80,000 lbs', 1),
  ('International IN-7284', 'Medium Duty', 'IL PFS-7284', '3HAMMAAR8NL728456', 'International', 'MV Series', 2022, 'Maintenance', '33,000 lbs', 1);

-- Insert professional sample vehicles for Continental Logistics Group
INSERT INTO vehicles (name, type, license_plate, vin, make, model, year, status, max_weight, company_id)
VALUES
  ('Volvo VN-8472', 'Class 8 Semi', 'TX CLG-8472', '4V4NC9EH5NN847291', 'Volvo', 'VNL 860', 2023, 'Active', '80,000 lbs', 2),
  ('Mack MA-9384', 'Class 8 Semi', 'TX CLG-9384', '1M1AK07Y5KM938456', 'Mack', 'Anthem 64T', 2022, 'Active', '80,000 lbs', 2),
  ('Western Star WS-7291', 'Class 8 Semi', 'TX CLG-7291', '5KKHALDV8NP729184', 'Western Star', '5700XE', 2023, 'Active', '80,000 lbs', 2),
  ('Isuzu IS-6847', 'Medium Duty', 'TX CLG-6847', 'JALC4B16X97684729', 'Isuzu', 'NPR-HD', 2021, 'Maintenance', '25,950 lbs', 2);

-- Insert professional sample drivers for Premier Freight Solutions
INSERT INTO drivers (name, license_number, license_expiry, phone, email, status, company_id)
VALUES
  ('Michael Rodriguez', 'CDL-IL-847291', '2026-08-15', '(312) 555-8472', 'mrodriguez@premierfreight.com', 'Active', 1),
  ('Jennifer Chen', 'CDL-IL-394756', '2025-11-22', '(312) 555-3947', 'jchen@premierfreight.com', 'Active', 1),
  ('Robert Thompson', 'CDL-IL-582947', '2026-03-18', '(312) 555-5829', 'rthompson@premierfreight.com', 'Active', 1),
  ('Amanda Williams', 'CDL-IL-728456', '2025-09-30', '(312) 555-7284', 'awilliams@premierfreight.com', 'On Leave', 1);

-- Insert professional sample drivers for Continental Logistics Group
INSERT INTO drivers (name, license_number, license_expiry, phone, email, status, company_id)
VALUES
  ('Carlos Martinez', 'CDL-TX-938456', '2026-01-12', '(214) 555-9384', 'cmartinez@continentallogistics.com', 'Active', 2),
  ('Sarah Mitchell', 'CDL-TX-729184', '2025-07-25', '(214) 555-7291', 'smitchell@continentallogistics.com', 'Active', 2),
  ('David Park', 'CDL-TX-684729', '2026-04-08', '(214) 555-6847', 'dpark@continentallogistics.com', 'Active', 2),
  ('Lisa Anderson', 'CDL-TX-572948', '2025-12-14', '(214) 555-5729', 'landerson@continentallogistics.com', 'Active', 2);
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
