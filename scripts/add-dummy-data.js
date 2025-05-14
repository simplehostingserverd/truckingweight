import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get current file directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from root .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to execute SQL
async function executeSql(sql) {
  const { error } = await supabase.rpc('pgmoon.query', { query: sql });
  if (error) {
    throw error;
  }
}

// Main function to add dummy data
async function addDummyData() {
  try {
    console.log('Starting to add dummy data...');

    // Check if we have companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .limit(5);

    if (companiesError) {
      throw companiesError;
    }

    if (companies.length === 0) {
      console.log('No companies found. Please run setup-database.js first.');
      return;
    }

    console.log(`Found ${companies.length} companies.`);

    // Add ERP integration connections
    console.log('Adding ERP integration connections...');
    for (const company of companies) {
      // Check if company already has ERP connections
      const { data: existingConnections, error: connectionsError } = await supabase
        .from('integration_connections')
        .select('id')
        .eq('company_id', company.id)
        .eq('integration_type', 'erp')
        .limit(1);

      if (connectionsError) {
        throw connectionsError;
      }

      if (existingConnections.length === 0) {
        // Add ERP connections for this company
        const erpProviders = ['netsuite', 'quickbooks', 'sap', 'sage'];
        const randomProvider = erpProviders[Math.floor(Math.random() * erpProviders.length)];

        const { data: connection, error: connectionError } = await supabase
          .from('integration_connections')
          .insert({
            name: `${company.name} ${randomProvider.charAt(0).toUpperCase() + randomProvider.slice(1)}`,
            provider: randomProvider,
            integration_type: 'erp',
            company_id: company.id,
            is_active: true,
            config: {
              apiKey: uuidv4(),
              username: 'demouser',
              password: 'demopassword',
              server: `api.${randomProvider}.com`,
            },
            last_sync_at: new Date(
              Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
            ).toISOString(),
          })
          .select();

        if (connectionError) {
          throw connectionError;
        }

        console.log(`Added ERP connection for ${company.name}: ${randomProvider}`);

        // Add some sync logs for this connection
        await addSyncLogs(connection[0].id, company.id);
      } else {
        console.log(`Company ${company.name} already has ERP connections.`);
      }
    }

    // Add telematics integration connections
    console.log('Adding telematics integration connections...');
    for (const company of companies) {
      // Check if company already has telematics connections
      const { data: existingConnections, error: connectionsError } = await supabase
        .from('integration_connections')
        .select('id')
        .eq('company_id', company.id)
        .eq('integration_type', 'telematics')
        .limit(1);

      if (connectionsError) {
        throw connectionsError;
      }

      if (existingConnections.length === 0) {
        // Add telematics connections for this company
        const telematicsProviders = ['geotab', 'samsara', 'fleetcomplete', 'omnitracs'];
        const randomProvider =
          telematicsProviders[Math.floor(Math.random() * telematicsProviders.length)];

        const { error: connectionError } = await supabase.from('integration_connections').insert({
          name: `${company.name} ${randomProvider.charAt(0).toUpperCase() + randomProvider.slice(1)}`,
          provider: randomProvider,
          integration_type: 'telematics',
          company_id: company.id,
          is_active: true,
          config: {
            apiKey: uuidv4(),
            username: 'demouser',
            password: 'demopassword',
            server: `api.${randomProvider}.com`,
          },
          last_sync_at: new Date(
            Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
          ).toISOString(),
        });

        if (connectionError) {
          throw connectionError;
        }

        console.log(`Added telematics connection for ${company.name}: ${randomProvider}`);
      } else {
        console.log(`Company ${company.name} already has telematics connections.`);
      }
    }

    // Add more vehicles if needed
    console.log('Adding vehicles if needed...');
    for (const company of companies) {
      // Check how many vehicles the company has
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id')
        .eq('company_id', company.id);

      if (vehiclesError) {
        throw vehiclesError;
      }

      if (vehicles.length < 5) {
        // Add more vehicles
        const vehiclesToAdd = 5 - vehicles.length;
        const vehicleTypes = ['Semi', 'Box Truck', 'Flatbed', 'Tanker', 'Dump Truck'];
        const vehicleMakes = [
          'Freightliner',
          'Peterbilt',
          'Kenworth',
          'Volvo',
          'Mack',
          'International',
        ];

        for (let i = 0; i < vehiclesToAdd; i++) {
          const randomType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
          const randomMake = vehicleMakes[Math.floor(Math.random() * vehicleMakes.length)];
          const randomYear = 2015 + Math.floor(Math.random() * 9); // 2015-2023

          const { error: vehicleError } = await supabase.from('vehicles').insert({
            name: `Truck ${100 + vehicles.length + i}`,
            type: randomType,
            license_plate: `${company.name.substring(0, 3).toUpperCase()}-${1000 + i}`,
            vin: `VIN${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            make: randomMake,
            model: randomType === 'Semi' ? 'Class 8' : 'Medium Duty',
            year: randomYear,
            status: Math.random() > 0.2 ? 'Active' : 'Maintenance',
            max_weight: randomType === 'Semi' ? '80,000 lbs' : '33,000 lbs',
            company_id: company.id,
            empty_weight: randomType === 'Semi' ? 35000 : 15000,
            max_gross_weight: randomType === 'Semi' ? 80000 : 33000,
          });

          if (vehicleError) {
            throw vehicleError;
          }
        }

        console.log(`Added ${vehiclesToAdd} vehicles for ${company.name}`);
      } else {
        console.log(`Company ${company.name} already has enough vehicles.`);
      }
    }

    // Add more drivers if needed
    console.log('Adding drivers if needed...');
    for (const company of companies) {
      // Check how many drivers the company has
      const { data: drivers, error: driversError } = await supabase
        .from('drivers')
        .select('id')
        .eq('company_id', company.id);

      if (driversError) {
        throw driversError;
      }

      if (drivers.length < 5) {
        // Add more drivers
        const driversToAdd = 5 - drivers.length;
        const firstNames = [
          'John',
          'Sarah',
          'Michael',
          'Emily',
          'David',
          'Jessica',
          'Robert',
          'Jennifer',
          'William',
          'Lisa',
        ];
        const lastNames = [
          'Smith',
          'Johnson',
          'Williams',
          'Jones',
          'Brown',
          'Davis',
          'Miller',
          'Wilson',
          'Moore',
          'Taylor',
        ];

        for (let i = 0; i < driversToAdd; i++) {
          const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
          const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
          const fullName = `${randomFirstName} ${randomLastName}`;

          // Generate a future date for license expiry (1-3 years from now)
          const expiryDate = new Date();
          expiryDate.setFullYear(expiryDate.getFullYear() + 1 + Math.floor(Math.random() * 3));

          const { error: driverError } = await supabase.from('drivers').insert({
            name: fullName,
            license_number: `DL${Math.random().toString().substring(2, 10)}`,
            license_expiry: expiryDate.toISOString().split('T')[0],
            phone: `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
            email: `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}@example.com`,
            status: Math.random() > 0.2 ? 'Active' : Math.random() > 0.5 ? 'On Leave' : 'Inactive',
            company_id: company.id,
          });

          if (driverError) {
            throw driverError;
          }
        }

        console.log(`Added ${driversToAdd} drivers for ${company.name}`);
      } else {
        console.log(`Company ${company.name} already has enough drivers.`);
      }
    }

    // Add more weights if needed
    console.log('Adding weights if needed...');
    for (const company of companies) {
      // Check how many weights the company has
      const { data: weights, error: weightsError } = await supabase
        .from('weights')
        .select('id')
        .eq('company_id', company.id);

      if (weightsError) {
        throw weightsError;
      }

      // Get vehicles and drivers for this company
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id, empty_weight, max_gross_weight')
        .eq('company_id', company.id);

      if (vehiclesError) {
        throw vehiclesError;
      }

      const { data: drivers, error: driversError } = await supabase
        .from('drivers')
        .select('id')
        .eq('company_id', company.id)
        .eq('status', 'Active');

      if (driversError) {
        throw driversError;
      }

      if (weights.length < 20 && vehicles.length > 0 && drivers.length > 0) {
        // Add more weights
        const weightsToAdd = 20 - weights.length;
        const statuses = ['Compliant', 'Warning', 'Non-Compliant'];

        for (let i = 0; i < weightsToAdd; i++) {
          const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
          const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];

          // Generate a date within the last 30 days
          const date = new Date();
          date.setDate(date.getDate() - Math.floor(Math.random() * 30));

          // Generate a weight that's sometimes over the limit
          const emptyWeight = randomVehicle.empty_weight || 35000;
          const maxGross = randomVehicle.max_gross_weight || 80000;
          const cargoWeight = Math.floor(Math.random() * (maxGross - emptyWeight));
          const totalWeight = emptyWeight + cargoWeight;

          // Determine status based on weight
          let status;
          if (totalWeight > maxGross) {
            status = 'Non-Compliant';
          } else if (totalWeight > maxGross * 0.9) {
            status = 'Warning';
          } else {
            status = 'Compliant';
          }

          const { error: weightError } = await supabase.from('weights').insert({
            weight: totalWeight,
            date: date.toISOString().split('T')[0],
            time: `${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)}`,
            vehicle_id: randomVehicle.id,
            driver_id: randomDriver.id,
            status: status,
            company_id: company.id,
            created_at: date.toISOString(),
          });

          if (weightError) {
            throw weightError;
          }
        }

        console.log(`Added ${weightsToAdd} weights for ${company.name}`);
      } else {
        console.log(
          `Company ${company.name} already has enough weights or missing vehicles/drivers.`
        );
      }
    }

    console.log('Dummy data added successfully!');
  } catch (error) {
    console.error('Error adding dummy data:', error);
  }
}

// Helper function to add sync logs for an ERP connection
async function addSyncLogs(connectionId, companyId) {
  const statuses = ['success', 'warning', 'error'];
  const messages = [
    'Successfully synchronized customer data',
    'Successfully synchronized invoice data',
    'Successfully synchronized product catalog',
    'Partial sync completed - some records skipped',
    'Failed to synchronize data - authentication error',
    'Failed to synchronize data - timeout error',
  ];

  // Add 5 sync logs with different timestamps
  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i * 2); // Every 2 days back

    const randomStatus = statuses[Math.floor(Math.random() * (i === 0 ? 1 : statuses.length))]; // First one is always success
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    let details = {};
    if (randomStatus === 'success') {
      details = {
        recordsProcessed: Math.floor(Math.random() * 200) + 50,
        recordsCreated: Math.floor(Math.random() * 20) + 5,
        recordsUpdated: Math.floor(Math.random() * 50) + 10,
        duration: `00:0${Math.floor(Math.random() * 9) + 1}:${Math.floor(Math.random() * 50) + 10}`,
      };
    } else if (randomStatus === 'warning') {
      details = {
        recordsProcessed: Math.floor(Math.random() * 100) + 20,
        recordsCreated: Math.floor(Math.random() * 10) + 2,
        recordsUpdated: Math.floor(Math.random() * 20) + 5,
        recordsSkipped: Math.floor(Math.random() * 30) + 5,
        errors: ['Invalid tax code for customer', 'Missing required field for invoice'],
        duration: `00:0${Math.floor(Math.random() * 9) + 1}:${Math.floor(Math.random() * 50) + 10}`,
      };
    } else {
      details = {
        error: 'Authentication failed. Token expired.',
      };
    }

    const { error } = await supabase.from('integration_logs').insert({
      integration_connection_id: connectionId,
      status: randomStatus,
      message: randomMessage,
      details: details,
      created_at: date.toISOString(),
      company_id: companyId,
    });

    if (error) {
      throw error;
    }
  }

  console.log(`Added 5 sync logs for connection ${connectionId}`);
}

// Run the function
addDummyData();
