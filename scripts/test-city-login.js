/**
 * Test script for city login functionality
 * This script tests the city login functionality with test credentials
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Initialize dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

// Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const TEST_CREDENTIALS = [
  {
    email: 'sanantonio.admin@example.gov',
    password: 'CityAdmin123!',
    city: 'San Antonio',
  },
  {
    email: 'houston.admin@example.gov',
    password: 'CityAdmin123!',
    city: 'Houston',
  },
  {
    email: 'cityadmin@example.gov',
    password: 'CityAdmin123!',
    city: 'Default City',
  },
];

/**
 * Test city login
 * @param {Object} credentials - Login credentials
 * @returns {Promise<Object>} - Response data
 */
async function testCityLogin(credentials) {
  try {
    console.log(`Testing city login for ${credentials.email} (${credentials.city})`);
    
    const response = await fetch(`${FRONTEND_URL}/api/city-auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Login failed for ${credentials.email}: ${data.error || data.msg || 'Unknown error'}`);
      return { success: false, error: data.error || data.msg };
    }

    console.log(`✅ Login successful for ${credentials.email}`);
    console.log(`   Token: ${data.token ? data.token.substring(0, 20) + '...' : 'No token'}`);
    console.log(`   User: ${data.user ? JSON.stringify(data.user, null, 2) : 'No user data'}`);
    
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Error testing login for ${credentials.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main function to test city login
 */
async function runTests() {
  console.log('=== CITY LOGIN TEST ===');
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log('=======================\n');

  for (const credentials of TEST_CREDENTIALS) {
    await testCityLogin(credentials);
    console.log(''); // Add empty line between tests
  }

  console.log('\nAll tests completed.');
}

// Run the tests
runTests();
