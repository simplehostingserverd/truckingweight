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

/**
 * Script to create city-related tables in Supabase
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createCityTables() {
  try {
    console.log('Creating city tables in Supabase...');

    // Create cities table
    const createCitiesTable = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS cities (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          state VARCHAR(50) NOT NULL,
          country VARCHAR(100) NOT NULL DEFAULT 'USA',
          address VARCHAR(255),
          zip_code VARCHAR(20),
          contact_email VARCHAR(255),
          contact_phone VARCHAR(50),
          logo_url VARCHAR(255),
          website VARCHAR(255),
          status VARCHAR(50) NOT NULL DEFAULT 'Active',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `,
    });

    if (createCitiesTable.error) {
      throw new Error(`Error creating cities table: ${createCitiesTable.error.message}`);
    }

    console.log('Cities table created successfully');

    // Create city_users table
    const createCityUsersTable = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS city_users (
          id UUID PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          city_id INTEGER NOT NULL,
          role VARCHAR(50) NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
        );
      `,
    });

    if (createCityUsersTable.error) {
      throw new Error(`Error creating city_users table: ${createCityUsersTable.error.message}`);
    }

    console.log('City users table created successfully');

    // Create city_scales table
    const createCityScalesTable = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS city_scales (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          location VARCHAR(255),
          latitude DECIMAL(10,8),
          longitude DECIMAL(11,8),
          scale_type VARCHAR(50) NOT NULL,
          manufacturer VARCHAR(100),
          model VARCHAR(100),
          serial_number VARCHAR(100),
          max_capacity DECIMAL(10,2),
          precision DECIMAL(5,2),
          calibration_date DATE,
          next_calibration_date DATE,
          status VARCHAR(50) NOT NULL DEFAULT 'Active',
          city_id INTEGER NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
        );
      `,
    });

    if (createCityScalesTable.error) {
      throw new Error(`Error creating city_scales table: ${createCityScalesTable.error.message}`);
    }

    console.log('City scales table created successfully');

    // Create city_weigh_tickets table
    const createCityWeighTicketsTable = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS city_weigh_tickets (
          id SERIAL PRIMARY KEY,
          ticket_number VARCHAR(50) NOT NULL UNIQUE,
          vehicle_info VARCHAR(255) NOT NULL,
          driver_name VARCHAR(255),
          company_name VARCHAR(255),
          gross_weight DECIMAL(10,2) NOT NULL,
          tare_weight DECIMAL(10,2),
          net_weight DECIMAL(10,2),
          unit VARCHAR(10) NOT NULL DEFAULT 'lb',
          weigh_date TIMESTAMPTZ NOT NULL,
          scale_id INTEGER,
          city_id INTEGER NOT NULL,
          recorded_by UUID,
          notes TEXT,
          status VARCHAR(50) NOT NULL DEFAULT 'Completed',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
          FOREIGN KEY (scale_id) REFERENCES city_scales(id) ON DELETE SET NULL,
          FOREIGN KEY (recorded_by) REFERENCES city_users(id) ON DELETE SET NULL
        );
      `,
    });

    if (createCityWeighTicketsTable.error) {
      throw new Error(
        `Error creating city_weigh_tickets table: ${createCityWeighTicketsTable.error.message}`
      );
    }

    console.log('City weigh tickets table created successfully');

    // Create city_permits table
    const createCityPermitsTable = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS city_permits (
          id SERIAL PRIMARY KEY,
          permit_number VARCHAR(50) NOT NULL UNIQUE,
          company_name VARCHAR(255) NOT NULL,
          contact_name VARCHAR(255),
          contact_email VARCHAR(255),
          contact_phone VARCHAR(50),
          vehicle_info VARCHAR(255) NOT NULL,
          permit_type VARCHAR(50) NOT NULL,
          max_weight DECIMAL(10,2),
          dimensions JSONB,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          fee_amount DECIMAL(10,2) NOT NULL,
          payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
          status VARCHAR(50) NOT NULL DEFAULT 'Active',
          approved_by UUID,
          city_id INTEGER NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
          FOREIGN KEY (approved_by) REFERENCES city_users(id) ON DELETE SET NULL
        );
      `,
    });

    if (createCityPermitsTable.error) {
      throw new Error(`Error creating city_permits table: ${createCityPermitsTable.error.message}`);
    }

    console.log('City permits table created successfully');

    // Create city_violations table
    const createCityViolationsTable = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS city_violations (
          id SERIAL PRIMARY KEY,
          violation_number VARCHAR(50) NOT NULL UNIQUE,
          company_name VARCHAR(255),
          vehicle_info VARCHAR(255) NOT NULL,
          driver_name VARCHAR(255),
          violation_type VARCHAR(50) NOT NULL,
          violation_details TEXT,
          fine_amount DECIMAL(10,2) NOT NULL,
          payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
          violation_date TIMESTAMPTZ NOT NULL,
          location VARCHAR(255),
          issued_by UUID,
          city_id INTEGER NOT NULL,
          weigh_ticket_id INTEGER,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
          FOREIGN KEY (issued_by) REFERENCES city_users(id) ON DELETE SET NULL,
          FOREIGN KEY (weigh_ticket_id) REFERENCES city_weigh_tickets(id) ON DELETE SET NULL
        );
      `,
    });

    if (createCityViolationsTable.error) {
      throw new Error(
        `Error creating city_violations table: ${createCityViolationsTable.error.message}`
      );
    }

    console.log('City violations table created successfully');

    console.log('All city tables created successfully!');
  } catch (error) {
    console.error('Error creating city tables:', error);
  }
}

// Run the function
createCityTables();
