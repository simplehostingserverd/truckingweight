/**
 * Script to verify and update the city-related database schema
 * Run with: node scripts/verify-city-schema.js
 *
 * This script checks if the necessary tables and fields exist for the city dashboard
 * and creates them if they don't exist.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Check if a table exists in the database
 * @param {string} tableName - Name of the table to check
 * @returns {Promise<boolean>} - True if table exists, false otherwise
 */
async function tableExists(tableName) {
  try {
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: `
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = '${tableName}'
        );
      `,
    });

    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }

    return data[0].exists;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

/**
 * Create the cities table if it doesn't exist
 */
async function createCitiesTable() {
  try {
    console.log('Checking cities table...');

    const exists = await tableExists('cities');

    if (exists) {
      console.log('Cities table already exists.');
      return true;
    }

    console.log('Creating cities table...');

    const { error } = await supabase.rpc('execute_sql', {
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

    if (error) {
      console.error('Error creating cities table:', error);
      return false;
    }

    console.log('Cities table created successfully.');
    return true;
  } catch (error) {
    console.error('Error creating cities table:', error);
    return false;
  }
}

/**
 * Create the city_users table if it doesn't exist
 */
async function createCityUsersTable() {
  try {
    console.log('Checking city_users table...');

    const exists = await tableExists('city_users');

    if (exists) {
      console.log('City users table already exists.');
      return true;
    }

    console.log('Creating city_users table...');

    const { error } = await supabase.rpc('execute_sql', {
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

    if (error) {
      console.error('Error creating city_users table:', error);
      return false;
    }

    console.log('City users table created successfully.');
    return true;
  } catch (error) {
    console.error('Error creating city_users table:', error);
    return false;
  }
}

/**
 * Create the city_scales table if it doesn't exist
 */
async function createCityScalesTable() {
  try {
    console.log('Checking city_scales table...');

    const exists = await tableExists('city_scales');

    if (exists) {
      console.log('City scales table already exists.');
      return true;
    }

    console.log('Creating city_scales table...');

    const { error } = await supabase.rpc('execute_sql', {
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

    if (error) {
      console.error('Error creating city_scales table:', error);
      return false;
    }

    console.log('City scales table created successfully.');
    return true;
  } catch (error) {
    console.error('Error creating city_scales table:', error);
    return false;
  }
}

/**
 * Create the city_permits table if it doesn't exist
 */
async function createCityPermitsTable() {
  try {
    console.log('Checking city_permits table...');

    const exists = await tableExists('city_permits');

    if (exists) {
      console.log('City permits table already exists.');
      return true;
    }

    console.log('Creating city_permits table...');

    const { error } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS city_permits (
          id SERIAL PRIMARY KEY,
          permit_number VARCHAR(50) NOT NULL,
          company_name VARCHAR(255) NOT NULL,
          contact_name VARCHAR(255),
          contact_email VARCHAR(255),
          contact_phone VARCHAR(50),
          vehicle_info JSONB,
          permit_type VARCHAR(50) NOT NULL,
          max_weight DECIMAL(10,2),
          dimensions JSONB,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          fee_amount DECIMAL(10,2),
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

    if (error) {
      console.error('Error creating city_permits table:', error);
      return false;
    }

    console.log('City permits table created successfully.');
    return true;
  } catch (error) {
    console.error('Error creating city_permits table:', error);
    return false;
  }
}

/**
 * Create the city_weigh_tickets table if it doesn't exist
 */
async function createCityWeighTicketsTable() {
  try {
    console.log('Checking city_weigh_tickets table...');

    const exists = await tableExists('city_weigh_tickets');

    if (exists) {
      console.log('City weigh tickets table already exists.');
      return true;
    }

    console.log('Creating city_weigh_tickets table...');

    const { error } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS city_weigh_tickets (
          id SERIAL PRIMARY KEY,
          ticket_number VARCHAR(50) NOT NULL,
          vehicle_info JSONB NOT NULL,
          driver_name VARCHAR(255),
          company_name VARCHAR(255),
          gross_weight DECIMAL(10,2) NOT NULL,
          tare_weight DECIMAL(10,2),
          net_weight DECIMAL(10,2),
          weigh_date TIMESTAMPTZ NOT NULL,
          permit_number VARCHAR(50),
          city_id INTEGER NOT NULL,
          scale_id INTEGER,
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

    if (error) {
      console.error('Error creating city_weigh_tickets table:', error);
      return false;
    }

    console.log('City weigh tickets table created successfully.');
    return true;
  } catch (error) {
    console.error('Error creating city_weigh_tickets table:', error);
    return false;
  }
}

/**
 * Create the city_violations table if it doesn't exist
 */
async function createCityViolationsTable() {
  try {
    console.log('Checking city_violations table...');

    const exists = await tableExists('city_violations');

    if (exists) {
      console.log('City violations table already exists.');
      return true;
    }

    console.log('Creating city_violations table...');

    const { error } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS city_violations (
          id SERIAL PRIMARY KEY,
          violation_number VARCHAR(50) NOT NULL,
          vehicle_info JSONB NOT NULL,
          driver_name VARCHAR(255),
          company_name VARCHAR(255),
          violation_type VARCHAR(50) NOT NULL,
          description TEXT,
          fine_amount DECIMAL(10,2),
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

    if (error) {
      console.error('Error creating city_violations table:', error);
      return false;
    }

    console.log('City violations table created successfully.');
    return true;
  } catch (error) {
    console.error('Error creating city_violations table:', error);
    return false;
  }
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    console.log('Starting city schema verification...');

    // Create tables if they don't exist
    const citiesTableCreated = await createCitiesTable();
    const cityUsersTableCreated = await createCityUsersTable();
    const cityScalesTableCreated = await createCityScalesTable();
    const cityPermitsTableCreated = await createCityPermitsTable();
    const cityWeighTicketsTableCreated = await createCityWeighTicketsTable();
    const cityViolationsTableCreated = await createCityViolationsTable();

    if (
      citiesTableCreated &&
      cityUsersTableCreated &&
      cityScalesTableCreated &&
      cityPermitsTableCreated &&
      cityWeighTicketsTableCreated &&
      cityViolationsTableCreated
    ) {
      console.log('\nAll city tables verified and created if needed.');
      console.log('Schema is ready for city dashboard functionality.');
    } else {
      console.error('\nFailed to verify or create some city tables.');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the main function
main();
