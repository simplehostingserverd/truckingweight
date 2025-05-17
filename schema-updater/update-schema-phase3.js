/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * 
 * This file contains proprietary and confidential information of 
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
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

// SQL to update the weights table for Phase 3
const updateWeightsTableSQL = `
-- Add new columns to weights table for compliance details
ALTER TABLE weights 
ADD COLUMN IF NOT EXISTS axle_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS state_code VARCHAR(2),
ADD COLUMN IF NOT EXISTS compliance_details JSONB;

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_weights_status ON weights(status);

-- Create index on company_id and date for faster dashboard queries
CREATE INDEX IF NOT EXISTS idx_weights_company_date ON weights(company_id, date);
`;

// SQL to update the loads table for Phase 3
const updateLoadsTableSQL = `
-- Add new columns to loads table for route planning
ALTER TABLE loads 
ADD COLUMN IF NOT EXISTS estimated_departure TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS estimated_arrival TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS actual_departure TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS actual_arrival TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS route_details JSONB,
ADD COLUMN IF NOT EXISTS distance VARCHAR(50),
ADD COLUMN IF NOT EXISTS duration VARCHAR(50);

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_loads_status ON loads(status);

-- Create index on company_id for faster queries
CREATE INDEX IF NOT EXISTS idx_loads_company ON loads(company_id);
`;

// SQL to create reports table
const createReportsTableSQL = `
-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  parameters JSONB,
  results JSONB,
  created_by UUID REFERENCES users(id),
  company_id INTEGER REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on reports table
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reports
CREATE POLICY "Reports are viewable by company users" ON reports
  FOR SELECT
  USING (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));

CREATE POLICY "Reports are insertable by company users" ON reports
  FOR INSERT
  WITH CHECK (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));

CREATE POLICY "Reports are updatable by company users" ON reports
  FOR UPDATE
  USING (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));

CREATE POLICY "Reports are deletable by company users" ON reports
  FOR DELETE
  USING (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));
`;

async function updateSchema() {
  try {
    console.log('Starting database schema update for Phase 3...');

    // Step 1: Update weights table
    console.log('Updating weights table...');
    const { error: weightsError } = await supabase.rpc('pgmoon.query', {
      query: updateWeightsTableSQL,
    });

    if (weightsError) {
      console.error('Error updating weights table:', weightsError);
      return;
    }

    // Step 2: Update loads table
    console.log('Updating loads table...');
    const { error: loadsError } = await supabase.rpc('pgmoon.query', {
      query: updateLoadsTableSQL,
    });

    if (loadsError) {
      console.error('Error updating loads table:', loadsError);
      return;
    }

    // Step 3: Create reports table
    console.log('Creating reports table...');
    const { error: reportsError } = await supabase.rpc('pgmoon.query', {
      query: createReportsTableSQL,
    });

    if (reportsError) {
      console.error('Error creating reports table:', reportsError);
      return;
    }

    console.log('Schema updated successfully for Phase 3!');
    process.exit(0);
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

updateSchema();
