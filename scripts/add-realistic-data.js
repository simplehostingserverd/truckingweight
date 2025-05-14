/**
 * Script to add realistic data to the database
 * Run with: node scripts/add-realistic-data.js
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get current file directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from root .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Realistic weight data
const generateWeightData = (vehicleId, driverId, companyId, count = 10) => {
  const weights = [];
  const today = new Date();

  // Status options
  const statusOptions = ['Compliant', 'Non-Compliant', 'Warning'];

  // Generate weight entries
  for (let i = 0; i < count; i++) {
    // Generate a date within the last 30 days
    const date = new Date(today);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

    // Generate a random time
    const hours = Math.floor(Math.random() * 24)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor(Math.random() * 60)
      .toString()
      .padStart(2, '0');
    const time = `${hours}:${minutes}`;

    // Generate a random weight between 15,000 and 80,000 pounds
    const weight = (15000 + Math.floor(Math.random() * 65000)).toString();

    // Determine status (80% compliant, 15% non-compliant, 5% warning)
    const statusRandom = Math.random();
    let status;
    if (statusRandom < 0.8) {
      status = 'Compliant';
    } else if (statusRandom < 0.95) {
      status = 'Non-Compliant';
    } else {
      status = 'Warning';
    }

    weights.push({
      vehicle_id: vehicleId,
      driver_id: driverId,
      company_id: companyId,
      weight,
      date: date.toISOString().split('T')[0],
      time,
      status,
    });
  }

  return weights;
};

// Realistic telematics data
const generateTelematicsData = (vehicleId, connectionId, count = 20) => {
  const telematicsData = [];
  const now = new Date();

  // Status options
  const statusOptions = ['active', 'idle', 'maintenance'];

  // Engine status options
  const engineStatusOptions = ['running', 'off', 'starting'];

  // Generate telematics entries
  for (let i = 0; i < count; i++) {
    // Generate a timestamp within the last 24 hours
    const timestamp = new Date(now);
    timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 24));
    timestamp.setMinutes(timestamp.getMinutes() - Math.floor(Math.random() * 60));

    // Generate location (Dallas area)
    const latitude = 32.7767 + (Math.random() * 0.1 - 0.05);
    const longitude = -96.797 + (Math.random() * 0.1 - 0.05);

    // Generate speed (0-75 mph)
    const speed = Math.floor(Math.random() * 75);

    // Generate fuel level (10-100%)
    const fuelLevel = 10 + Math.floor(Math.random() * 90);

    // Determine status
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];

    // Determine engine status
    const engineStatus =
      engineStatusOptions[Math.floor(Math.random() * engineStatusOptions.length)];

    telematicsData.push({
      vehicle_id: vehicleId,
      connection_id: connectionId,
      timestamp: timestamp.toISOString(),
      latitude,
      longitude,
      location: 'Dallas, TX area',
      speed,
      fuel_level: fuelLevel,
      status,
      engine_status: engineStatus,
    });
  }

  return telematicsData;
};

// Main function to add data to the database
async function addRealisticData() {
  console.log('Starting to add realistic data to the database...');

  try {
    // Get all companies
    console.log('Fetching companies...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name');

    if (companiesError) throw companiesError;
    if (!companies || companies.length === 0) {
      console.log('No companies found. Please run seed-realistic-data.js first.');
      return;
    }

    console.log(`Found ${companies.length} companies`);

    // Process each company
    for (const company of companies) {
      console.log(`Processing company: ${company.name} (ID: ${company.id})`);

      // Get vehicles for this company
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id, name')
        .eq('company_id', company.id);

      if (vehiclesError) throw vehiclesError;
      if (!vehicles || vehicles.length === 0) {
        console.log(`No vehicles found for company ${company.name}`);
        continue;
      }

      console.log(`Found ${vehicles.length} vehicles for company ${company.name}`);

      // Get drivers for this company
      const { data: drivers, error: driversError } = await supabase
        .from('drivers')
        .select('id, name')
        .eq('company_id', company.id);

      if (driversError) throw driversError;
      if (!drivers || drivers.length === 0) {
        console.log(`No drivers found for company ${company.name}`);
        continue;
      }

      console.log(`Found ${drivers.length} drivers for company ${company.name}`);

      // Create telematics connections for this company
      const { data: connections, error: connectionsError } = await supabase
        .from('telematics_connections')
        .upsert([
          {
            company_id: company.id,
            name: `${company.name} Telematics`,
            provider: 'GPS Tracking Pro',
            status: 'active',
            connection_details: {
              api_key: `key_${Math.random().toString(36).substring(2, 15)}`,
              refresh_interval: 300,
              data_retention_days: 90,
            },
          },
        ])
        .select();

      if (connectionsError) throw connectionsError;
      console.log(`Created telematics connection for company ${company.name}`);

      // Add weight data for each vehicle
      for (const vehicle of vehicles) {
        // Select a random driver for this vehicle
        const driver = drivers[Math.floor(Math.random() * drivers.length)];

        // Generate weight data
        const weightData = generateWeightData(
          vehicle.id,
          driver.id,
          company.id,
          Math.floor(Math.random() * 20) + 5 // 5-25 weight entries
        );

        // Insert weight data
        const { error: weightError } = await supabase.from('weights').upsert(weightData);

        if (weightError) throw weightError;

        // Generate telematics data
        const telematicsData = generateTelematicsData(
          vehicle.id,
          connections[0].id,
          Math.floor(Math.random() * 30) + 10 // 10-40 telematics entries
        );

        // Insert telematics data
        const { error: telematicsError } = await supabase
          .from('telematics_data')
          .upsert(telematicsData);

        if (telematicsError) throw telematicsError;

        console.log(`Added data for vehicle ${vehicle.name} (ID: ${vehicle.id})`);
      }
    }

    console.log('Successfully added realistic data to the database!');
  } catch (error) {
    console.error('Error adding realistic data:', error);
  }
}

// Run the function
addRealisticData();
