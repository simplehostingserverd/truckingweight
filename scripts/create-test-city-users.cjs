/**
 * Script to create test city users for development
 * This script creates test city users for the San Antonio and Houston cities
 */

const fetch = require('node-fetch');
const dotenv = require('dotenv');
const path = require('path');

// Initialize dotenv
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const CITY_USERS = [
  {
    name: 'San Antonio Admin',
    email: 'sanantonio.admin@example.gov',
    password: 'CityAdmin123!',
    cityId: 2, // San Antonio
    role: 'admin',
  },
  {
    name: 'Houston Admin',
    email: 'houston.admin@example.gov',
    password: 'CityAdmin123!',
    cityId: 1, // Houston
    role: 'admin',
  },
];

/**
 * Register a city user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} - Response data
 */
async function registerCityUser(userData) {
  try {
    console.log(`Registering city user: ${userData.email}`);
    
    const response = await fetch(`${BACKEND_URL}/api/city-auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Error registering user ${userData.email}:`, data.msg || data.error);
      return { success: false, error: data.msg || data.error };
    }

    console.log(`Successfully registered user: ${userData.email}`);
    return { success: true, data };
  } catch (error) {
    console.error(`Error registering user ${userData.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main function to create test city users
 */
async function createTestCityUsers() {
  console.log('Creating test city users...');

  for (const userData of CITY_USERS) {
    const result = await registerCityUser(userData);
    
    if (result.success) {
      console.log(`✅ User ${userData.email} created successfully`);
    } else {
      console.log(`❌ Failed to create user ${userData.email}: ${result.error}`);
      
      // If user already exists, try to log in to verify credentials
      if (result.error === 'User already exists') {
        console.log(`Attempting to log in with user ${userData.email} to verify credentials...`);
        
        try {
          const loginResponse = await fetch(`${BACKEND_URL}/api/city-auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: userData.email,
              password: userData.password,
            }),
          });

          const loginData = await loginResponse.json();

          if (loginResponse.ok) {
            console.log(`✅ Successfully logged in with user ${userData.email}`);
          } else {
            console.log(`❌ Failed to log in with user ${userData.email}: ${loginData.msg || loginData.error}`);
          }
        } catch (error) {
          console.error(`Error logging in with user ${userData.email}:`, error.message);
        }
      }
    }
  }

  console.log('\nTest city users creation completed.');
  console.log('\nYou can now log in with the following credentials:');
  CITY_USERS.forEach(user => {
    console.log(`- Email: ${user.email}`);
    console.log(`  Password: ${user.password}`);
    console.log(`  City: ${user.cityId === 1 ? 'Houston' : 'San Antonio'}`);
    console.log(`  Role: ${user.role}`);
    console.log('');
  });
}

// Run the script
createTestCityUsers();
