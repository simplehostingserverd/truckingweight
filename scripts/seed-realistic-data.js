/**
 * Seed script to add realistic dummy data to the database
 * Run with: node scripts/seed-realistic-data.js
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

// Realistic company data
const companies = [
  {
    name: 'Horizon Freight Systems',
    address: '1250 Industrial Parkway, Dallas, TX 75247',
    phone: '(214) 555-7890',
    email: 'info@horizonfreight.com',
    website: 'https://horizonfreight.com',
    status: 'active',
  },
  {
    name: 'Summit Logistics Inc.',
    address: '4500 Transport Avenue, Houston, TX 77002',
    phone: '(713) 555-3421',
    email: 'contact@summitlogistics.com',
    website: 'https://summitlogistics.com',
    status: 'active',
  },
  {
    name: 'Velocity Transport Group',
    address: '8700 Commerce Drive, Austin, TX 78744',
    phone: '(512) 555-9876',
    email: 'info@velocitytransport.com',
    website: 'https://velocitytransport.com',
    status: 'active',
  },
  {
    name: 'Precision Cargo Services',
    address: '2300 Freight Boulevard, San Antonio, TX 78219',
    phone: '(210) 555-4567',
    email: 'operations@precisioncargo.com',
    website: 'https://precisioncargo.com',
    status: 'active',
  },
  {
    name: 'Alliance Trucking Co.',
    address: '5600 Logistics Way, Fort Worth, TX 76177',
    phone: '(817) 555-2345',
    email: 'dispatch@alliancetrucking.com',
    website: 'https://alliancetrucking.com',
    status: 'active',
  },
];

// Realistic vehicle data
const vehicleTypes = [
  'Kenworth T680', 'Peterbilt 579', 'Freightliner Cascadia', 'Volvo VNL 860',
  'International LT Series', 'Mack Anthem', 'Western Star 5700XE'
];

// Realistic driver data
const firstNames = [
  'James', 'Robert', 'John', 'Michael', 'William', 'David', 'Richard', 'Joseph',
  'Thomas', 'Charles', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth',
  'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Miguel', 'José', 'Carlos',
  'Juan', 'Luis', 'Jorge', 'Maria', 'Ana', 'Sofia', 'Isabella'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

// Realistic customer reviews
const customerReviews = [
  {
    name: 'Michael Thompson',
    company: 'Thompson Logistics',
    rating: 5,
    review: 'TruckingWeight has completely transformed our weight compliance process. The real-time monitoring has saved us thousands in potential fines and improved our efficiency by 30%.',
    position: 'Fleet Manager',
  },
  {
    name: 'Sarah Rodriguez',
    company: 'Express Freight Solutions',
    rating: 5,
    review: 'The analytics dashboard gives us insights we never had before. We can now make data-driven decisions that have improved our load efficiency and reduced overweight incidents to nearly zero.',
    position: 'Operations Director',
  },
  {
    name: 'David Chen',
    company: 'Pacific Northwest Transport',
    rating: 4,
    review: 'Implementation was smooth and the support team was incredibly helpful. The system paid for itself within the first three months through avoided fines and improved route planning.',
    position: 'CEO',
  },
  {
    name: 'Jennifer Williams',
    company: 'Midwest Distribution Services',
    rating: 5,
    review: 'The mobile app is a game-changer for our drivers. They can now verify weights before leaving facilities, which has dramatically reduced our compliance issues.',
    position: 'Compliance Manager',
  },
  {
    name: 'Robert Jackson',
    company: 'Southern Cargo Express',
    rating: 4,
    review: 'We've been using TruckingWeight for over a year now, and it has become an essential part of our operation. The integration with our existing systems was seamless.',
    position: 'Technology Director',
  },
];

// Generate random data
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomPhone() {
  return `(${getRandomInt(200, 999)}) ${getRandomInt(200, 999)}-${getRandomInt(1000, 9999)}`;
}

function getRandomEmail(firstName, lastName) {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'company.com'];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomElement(domains)}`;
}

function getRandomLicenseNumber() {
  return `${getRandomElement(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'])}${getRandomInt(10000000, 99999999)}`;
}

// Main function to seed the database
async function seedDatabase() {
  console.log('Starting database seeding with realistic data...');

  try {
    // Insert companies
    console.log('Inserting companies...');
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .upsert(companies, { onConflict: 'name' })
      .select();

    if (companiesError) throw companiesError;
    console.log(`Inserted ${companiesData.length} companies`);

    // Insert customer reviews
    console.log('Inserting customer reviews...');
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('testimonials')
      .upsert(customerReviews, { onConflict: 'name' })
      .select();

    if (reviewsError) throw reviewsError;
    console.log(`Inserted ${reviewsData.length} customer reviews`);

    // Generate and insert vehicles for each company
    console.log('Generating vehicles...');
    const vehicles = [];
    for (const company of companiesData) {
      const vehicleCount = getRandomInt(5, 15);
      for (let i = 0; i < vehicleCount; i++) {
        const vehicleType = getRandomElement(vehicleTypes);
        vehicles.push({
          company_id: company.id,
          name: `${vehicleType} - ${company.name.substring(0, 3)}${getRandomInt(100, 999)}`,
          type: vehicleType,
          license_plate: `${getRandomElement(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'])}${getRandomInt(100, 999)}${getRandomElement(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'])}`,
          vin: `1${getRandomInt(1000000000000000, 9999999999999999)}`,
          year: getRandomInt(2015, 2023),
          status: getRandomElement(['active', 'maintenance', 'inactive']),
          last_latitude: 32.7767 + (Math.random() * 0.1 - 0.05),
          last_longitude: -96.7970 + (Math.random() * 0.1 - 0.05),
          last_location: 'Dallas, TX area',
          last_speed: getRandomInt(0, 75),
          fuel_level: getRandomInt(10, 100),
          engine_status: getRandomElement(['running', 'off']),
          weight: getRandomInt(15000, 35000).toString(),
        });
      }
    }

    // Insert vehicles
    const { data: vehiclesData, error: vehiclesError } = await supabase
      .from('vehicles')
      .upsert(vehicles)
      .select();

    if (vehiclesError) throw vehiclesError;
    console.log(`Inserted ${vehiclesData.length} vehicles`);

    // Generate and insert drivers for each company
    console.log('Generating drivers...');
    const drivers = [];
    for (const company of companiesData) {
      const driverCount = getRandomInt(5, 20);
      for (let i = 0; i < driverCount; i++) {
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);
        drivers.push({
          company_id: company.id,
          first_name: firstName,
          last_name: lastName,
          email: getRandomEmail(firstName, lastName),
          phone: getRandomPhone(),
          license_number: getRandomLicenseNumber(),
          license_state: getRandomElement(['TX', 'CA', 'FL', 'NY', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI']),
          license_expiration: getRandomDate(new Date(), new Date(2026, 11, 31)).toISOString().split('T')[0],
          status: getRandomElement(['active', 'on_leave', 'inactive']),
        });
      }
    }

    // Insert drivers
    const { data: driversData, error: driversError } = await supabase
      .from('drivers')
      .upsert(drivers)
      .select();

    if (driversError) throw driversError;
    console.log(`Inserted ${driversData.length} drivers`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function
seedDatabase();
