/**
 * Script to create a test city and city user
 * Run with: node scripts/create-test-city.js
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

async function main() {
  try {
    console.log('Creating test city and user...');
    
    // Check if city already exists
    const { data: existingCities, error: cityCheckError } = await supabase
      .from('cities')
      .select('*')
      .eq('name', 'Austin')
      .eq('state', 'TX');
      
    if (cityCheckError) {
      console.error('Error checking for existing city:', cityCheckError);
      return;
    }
    
    let cityId;
    
    // Create city if it doesn't exist
    if (!existingCities || existingCities.length === 0) {
      const { data: newCity, error: cityCreateError } = await supabase
        .from('cities')
        .insert([
          {
            name: 'Austin',
            state: 'TX',
            country: 'USA',
            address: '123 Main St, Austin, TX 78701',
            zip_code: '78701',
            contact_email: 'transportation@austin.gov',
            contact_phone: '(512) 555-1234',
            website: 'https://austin.gov',
            status: 'Active'
          }
        ])
        .select()
        .single();
        
      if (cityCreateError) {
        console.error('Error creating city:', cityCreateError);
        return;
      }
      
      console.log('Created test city:', newCity);
      cityId = newCity.id;
    } else {
      console.log('City already exists:', existingCities[0]);
      cityId = existingCities[0].id;
    }
    
    // Check if user already exists
    const { data: existingUsers, error: userCheckError } = await supabase
      .from('city_users')
      .select('*')
      .eq('email', 'cityadmin@example.gov');
      
    if (userCheckError) {
      console.error('Error checking for existing user:', userCheckError);
      return;
    }
    
    // Create user if it doesn't exist
    if (!existingUsers || existingUsers.length === 0) {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'cityadmin@example.gov',
        password: 'CityAdmin123!',
        user_metadata: {
          name: 'City Admin',
          city_id: cityId,
          role: 'admin',
          user_type: 'city'
        }
      });
      
      if (authError) {
        console.error('Error creating user in auth:', authError);
        return;
      }
      
      console.log('Created user in auth:', authData.user);
      
      // Create city user record
      const userId = authData.user.id;
      const { data: newUser, error: userCreateError } = await supabase
        .from('city_users')
        .insert([
          {
            id: userId,
            name: 'City Admin',
            email: 'cityadmin@example.gov',
            city_id: cityId,
            role: 'admin',
            is_active: true
          }
        ])
        .select()
        .single();
        
      if (userCreateError) {
        console.error('Error creating city user record:', userCreateError);
        return;
      }
      
      console.log('Created city user record:', newUser);
      console.log('\nLogin credentials:');
      console.log('Email: cityadmin@example.gov');
      console.log('Password: CityAdmin123!');
    } else {
      console.log('User already exists:', existingUsers[0]);
      console.log('\nLogin credentials:');
      console.log('Email: cityadmin@example.gov');
      console.log('Password: CityAdmin123!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
