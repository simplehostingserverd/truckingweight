/**
 * Script to populate Texas cities in the database
 * Run with: node scripts/populate-texas-cities.js
 *
 * This script adds major Texas cities to the database and creates
 * an example user for Houston, Texas.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// List of major Texas cities to add
const texasCities = [
  {
    name: 'Houston',
    state: 'TX',
    contact_email: 'transportation@houston.gov',
    contact_phone: '(713) 837-0311',
    website: 'https://www.houstontx.gov',
    zip_code: '77002',
  },
  {
    name: 'San Antonio',
    state: 'TX',
    contact_email: 'transportation@sanantonio.gov',
    contact_phone: '(210) 207-7730',
    website: 'https://www.sanantonio.gov',
    zip_code: '78205',
  },
  {
    name: 'Dallas',
    state: 'TX',
    contact_email: 'transportation@dallascityhall.com',
    contact_phone: '(214) 670-5111',
    website: 'https://www.dallascityhall.com',
    zip_code: '75201',
  },
  {
    name: 'Austin',
    state: 'TX',
    contact_email: 'transportation@austintexas.gov',
    contact_phone: '(512) 974-1150',
    website: 'https://www.austintexas.gov',
    zip_code: '78701',
  },
  {
    name: 'Fort Worth',
    state: 'TX',
    contact_email: 'transportation@fortworthtexas.gov',
    contact_phone: '(817) 392-1234',
    website: 'https://www.fortworthtexas.gov',
    zip_code: '76102',
  },
  {
    name: 'El Paso',
    state: 'TX',
    contact_email: 'transportation@elpasotexas.gov',
    contact_phone: '(915) 212-0000',
    website: 'https://www.elpasotexas.gov',
    zip_code: '79901',
  },
  {
    name: 'Arlington',
    state: 'TX',
    contact_email: 'transportation@arlingtontx.gov',
    contact_phone: '(817) 459-6777',
    website: 'https://www.arlingtontx.gov',
    zip_code: '76010',
  },
  {
    name: 'Corpus Christi',
    state: 'TX',
    contact_email: 'transportation@cctexas.com',
    contact_phone: '(361) 826-2489',
    website: 'https://www.cctexas.com',
    zip_code: '78401',
  },
  {
    name: 'Plano',
    state: 'TX',
    contact_email: 'transportation@plano.gov',
    contact_phone: '(972) 941-7000',
    website: 'https://www.plano.gov',
    zip_code: '75074',
  },
  {
    name: 'Lubbock',
    state: 'TX',
    contact_email: 'transportation@mylubbock.us',
    contact_phone: '(806) 775-2000',
    website: 'https://ci.lubbock.tx.us',
    zip_code: '79401',
  },
  {
    name: 'Laredo',
    state: 'TX',
    contact_email: 'transportation@ci.laredo.tx.us',
    contact_phone: '(956) 791-7300',
    website: 'https://www.cityoflaredo.com',
    zip_code: '78040',
  },
  {
    name: 'Irving',
    state: 'TX',
    contact_email: 'transportation@cityofirving.org',
    contact_phone: '(972) 721-2600',
    website: 'https://www.cityofirving.org',
    zip_code: '75060',
  },
  {
    name: 'Garland',
    state: 'TX',
    contact_email: 'transportation@garlandtx.gov',
    contact_phone: '(972) 205-2000',
    website: 'https://www.garlandtx.gov',
    zip_code: '75040',
  },
  {
    name: 'Frisco',
    state: 'TX',
    contact_email: 'transportation@friscotexas.gov',
    contact_phone: '(972) 292-5000',
    website: 'https://www.friscotexas.gov',
    zip_code: '75034',
  },
  {
    name: 'McKinney',
    state: 'TX',
    contact_email: 'transportation@mckinneytexas.org',
    contact_phone: '(972) 547-7500',
    website: 'https://www.mckinneytexas.org',
    zip_code: '75069',
  },
  {
    name: 'Amarillo',
    state: 'TX',
    contact_email: 'transportation@amarillo.gov',
    contact_phone: '(806) 378-3000',
    website: 'https://www.amarillo.gov',
    zip_code: '79101',
  },
  {
    name: 'Grand Prairie',
    state: 'TX',
    contact_email: 'transportation@gptx.org',
    contact_phone: '(972) 237-8000',
    website: 'https://www.gptx.org',
    zip_code: '75050',
  },
  {
    name: 'Brownsville',
    state: 'TX',
    contact_email: 'transportation@brownsvilletx.gov',
    contact_phone: '(956) 548-6000',
    website: 'https://www.brownsvilletx.gov',
    zip_code: '78520',
  },
  {
    name: 'Killeen',
    state: 'TX',
    contact_email: 'transportation@killeentexas.gov',
    contact_phone: '(254) 501-7600',
    website: 'https://www.killeentexas.gov',
    zip_code: '76541',
  },
  {
    name: 'Denton',
    state: 'TX',
    contact_email: 'transportation@cityofdenton.com',
    contact_phone: '(940) 349-8200',
    website: 'https://www.cityofdenton.com',
    zip_code: '76201',
  },
  {
    name: 'Waco',
    state: 'TX',
    contact_email: 'transportation@wacotx.gov',
    contact_phone: '(254) 750-5600',
    website: 'https://www.waco-texas.com',
    zip_code: '76701',
  },
  {
    name: 'Midland',
    state: 'TX',
    contact_email: 'transportation@midlandtexas.gov',
    contact_phone: '(432) 685-7200',
    website: 'https://www.midlandtexas.gov',
    zip_code: '79701',
  },
  {
    name: 'Abilene',
    state: 'TX',
    contact_email: 'transportation@abilenetx.gov',
    contact_phone: '(325) 676-6200',
    website: 'https://www.abilenetx.gov',
    zip_code: '79601',
  },
  {
    name: 'Odessa',
    state: 'TX',
    contact_email: 'transportation@odessa-tx.gov',
    contact_phone: '(432) 335-3200',
    website: 'https://www.odessa-tx.gov',
    zip_code: '79761',
  },
  {
    name: 'Beaumont',
    state: 'TX',
    contact_email: 'transportation@beaumonttexas.gov',
    contact_phone: '(409) 880-3700',
    website: 'https://www.beaumonttexas.gov',
    zip_code: '77701',
  },
  {
    name: 'Tyler',
    state: 'TX',
    contact_email: 'transportation@cityoftyler.org',
    contact_phone: '(903) 531-1100',
    website: 'https://www.cityoftyler.org',
    zip_code: '75701',
  },
  {
    name: 'Wichita Falls',
    state: 'TX',
    contact_email: 'transportation@wichitafallstx.gov',
    contact_phone: '(940) 761-7400',
    website: 'https://www.wichitafallstx.gov',
    zip_code: '76301',
  },
  {
    name: 'San Angelo',
    state: 'TX',
    contact_email: 'transportation@cosatx.us',
    contact_phone: '(325) 657-4200',
    website: 'https://www.cosatx.us',
    zip_code: '76903',
  },
  {
    name: 'College Station',
    state: 'TX',
    contact_email: 'transportation@cstx.gov',
    contact_phone: '(979) 764-3500',
    website: 'https://www.cstx.gov',
    zip_code: '77840',
  },
  {
    name: 'Galveston',
    state: 'TX',
    contact_email: 'transportation@galvestontx.gov',
    contact_phone: '(409) 797-3500',
    website: 'https://www.galvestontx.gov',
    zip_code: '77550',
  },
];

/**
 * Add Texas cities to the database
 */
async function addTexasCities() {
  try {
    console.log('Adding Texas cities to the database...');

    let addedCount = 0;
    let existingCount = 0;

    for (const city of texasCities) {
      // Check if city already exists
      const { data: existingCities, error: cityCheckError } = await supabase
        .from('cities')
        .select('*')
        .eq('name', city.name)
        .eq('state', city.state);

      if (cityCheckError) {
        console.error(`Error checking for existing city ${city.name}:`, cityCheckError);
        continue;
      }

      // Create city if it doesn't exist
      if (!existingCities || existingCities.length === 0) {
        const { data: newCity, error: cityCreateError } = await supabase
          .from('cities')
          .insert([
            {
              name: city.name,
              state: city.state,
              country: 'USA',
              address: `City Hall, ${city.name}, ${city.state}`,
              zip_code: city.zip_code,
              contact_email: city.contact_email,
              contact_phone: city.contact_phone,
              website: city.website,
              status: 'Active',
            },
          ])
          .select()
          .single();

        if (cityCreateError) {
          console.error(`Error creating city ${city.name}:`, cityCreateError);
          continue;
        }

        console.log(`Created city: ${city.name}, ${city.state}`);
        addedCount++;
      } else {
        console.log(`City already exists: ${city.name}, ${city.state}`);
        existingCount++;
      }
    }

    console.log(`\nCities added: ${addedCount}`);
    console.log(`Cities already existing: ${existingCount}`);
    console.log(`Total cities processed: ${texasCities.length}`);

    return true;
  } catch (error) {
    console.error('Error adding Texas cities:', error);
    return false;
  }
}

/**
 * Create an example user for Houston, Texas
 */
async function createHoustonUser() {
  try {
    console.log('\nCreating example user for Houston, Texas...');

    // Get Houston city ID
    const { data: houstonCity, error: cityError } = await supabase
      .from('cities')
      .select('*')
      .eq('name', 'Houston')
      .eq('state', 'TX')
      .single();

    if (cityError || !houstonCity) {
      console.error('Error finding Houston city:', cityError);
      return false;
    }

    const cityId = houstonCity.id;

    // Check if Houston user already exists
    const { data: existingUsers, error: userCheckError } = await supabase
      .from('city_users')
      .select('*')
      .eq('email', 'houston.admin@example.gov');

    if (userCheckError) {
      console.error('Error checking for existing user:', userCheckError);
      return false;
    }

    // Create user if it doesn't exist
    if (!existingUsers || existingUsers.length === 0) {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'houston.admin@example.gov',
        password: 'HoustonAdmin2024!',
        user_metadata: {
          name: 'Houston Admin',
          city_id: cityId,
          role: 'admin',
          user_type: 'city',
        },
      });

      if (authError) {
        console.error('Error creating user in auth:', authError);
        return false;
      }

      console.log('Created user in auth:', authData.user);

      // Create city user record
      const userId = authData.user.id;
      const { data: newUser, error: userCreateError } = await supabase
        .from('city_users')
        .insert([
          {
            id: userId,
            name: 'Houston Admin',
            email: 'houston.admin@example.gov',
            city_id: cityId,
            role: 'admin',
            is_active: true,
          },
        ])
        .select()
        .single();

      if (userCreateError) {
        console.error('Error creating city user record:', userCreateError);
        return false;
      }

      console.log('Created Houston city user record:', newUser);
      console.log('\nHouston Login credentials:');
      console.log('Email: houston.admin@example.gov');
      console.log('Password: HoustonAdmin2024!');

      return true;
    } else {
      console.log('Houston user already exists:', existingUsers[0]);
      console.log('\nHouston Login credentials:');
      console.log('Email: houston.admin@example.gov');
      console.log('Password: HoustonAdmin2024!');

      return true;
    }
  } catch (error) {
    console.error('Error creating Houston user:', error);
    return false;
  }
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    console.log('Starting Texas cities population script...');

    // Add Texas cities
    const citiesAdded = await addTexasCities();

    if (!citiesAdded) {
      console.error('Failed to add Texas cities.');
      return;
    }

    // Create Houston user
    const houstonUserCreated = await createHoustonUser();

    if (!houstonUserCreated) {
      console.error('Failed to create Houston user.');
      return;
    }

    console.log('\nScript completed successfully!');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the main function
main();
