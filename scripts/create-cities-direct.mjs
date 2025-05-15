/**
 * Script to create cities directly using Supabase API
 * Run with: node scripts/create-cities-direct.mjs
 * 
 * This script adds Texas cities to the database using the Supabase API
 * instead of executing SQL directly.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// List of major Texas cities to add
const texasCities = [
  { name: 'Houston', state: 'TX', contact_email: 'transportation@houston.gov', contact_phone: '(713) 837-0311', website: 'https://www.houstontx.gov', zip_code: '77002' },
  { name: 'San Antonio', state: 'TX', contact_email: 'transportation@sanantonio.gov', contact_phone: '(210) 207-7730', website: 'https://www.sanantonio.gov', zip_code: '78205' },
  { name: 'Dallas', state: 'TX', contact_email: 'transportation@dallascityhall.com', contact_phone: '(214) 670-5111', website: 'https://www.dallascityhall.com', zip_code: '75201' },
  { name: 'Austin', state: 'TX', contact_email: 'transportation@austintexas.gov', contact_phone: '(512) 974-1150', website: 'https://www.austintexas.gov', zip_code: '78701' },
  { name: 'Fort Worth', state: 'TX', contact_email: 'transportation@fortworthtexas.gov', contact_phone: '(817) 392-1234', website: 'https://www.fortworthtexas.gov', zip_code: '76102' },
  { name: 'El Paso', state: 'TX', contact_email: 'transportation@elpasotexas.gov', contact_phone: '(915) 212-0000', website: 'https://www.elpasotexas.gov', zip_code: '79901' },
  { name: 'Arlington', state: 'TX', contact_email: 'transportation@arlingtontx.gov', contact_phone: '(817) 459-6777', website: 'https://www.arlingtontx.gov', zip_code: '76010' },
  { name: 'Corpus Christi', state: 'TX', contact_email: 'transportation@cctexas.com', contact_phone: '(361) 826-2489', website: 'https://www.cctexas.com', zip_code: '78401' },
  { name: 'Plano', state: 'TX', contact_email: 'transportation@plano.gov', contact_phone: '(972) 941-7000', website: 'https://www.plano.gov', zip_code: '75074' },
  { name: 'Lubbock', state: 'TX', contact_email: 'transportation@mylubbock.us', contact_phone: '(806) 775-2000', website: 'https://ci.lubbock.tx.us', zip_code: '79401' }
];

/**
 * Check if the cities table exists
 */
async function checkCitiesTable() {
  try {
    console.log('Checking if cities table exists...');
    
    // Try to query the cities table
    const { data, error } = await supabase
      .from('cities')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === '42P01') { // Table doesn't exist
        console.log('Cities table does not exist.');
        return false;
      } else {
        console.error('Error checking cities table:', error);
        return false;
      }
    }
    
    console.log('Cities table exists.');
    return true;
  } catch (error) {
    console.error('Error checking cities table:', error);
    return false;
  }
}

/**
 * Create the cities table
 */
async function createCitiesTable() {
  try {
    console.log('Creating cities table...');
    
    // Use the SQL API to create the table
    const { error } = await supabase.from('cities').insert([
      {
        name: 'Test City',
        state: 'TX',
        country: 'USA',
        status: 'Active'
      }
    ]);
    
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
              status: 'Active'
            }
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
          user_type: 'city'
        }
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
            is_active: true
          }
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
    console.log('Starting direct city creation script...');
    
    // Check if cities table exists
    const tableExists = await checkCitiesTable();
    
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
