/*
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

// Script to create a driver record via API for test.driver@demo.com
// Using built-in fetch API (Node.js 18+)

// Demo driver details
const driverData = {
  name: 'Test Driver',
  email: 'test.driver@demo.com',
  license_number: 'TEST123456789',
  phone: '+1-555-0123',
  status: 'active'
};

async function createTestDriverViaAPI() {
  try {
    console.log('Creating driver record via API for test.driver@demo.com...');
    
    const response = await fetch('http://localhost:3000/api/drivers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(driverData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();

    console.log('\n=== Test Driver Record Created Successfully! ===');
    console.log('Driver ID:', result.id);
    console.log('Name:', result.name);
    console.log('Email:', result.email);
    console.log('License:', result.license_number);
    console.log('Phone:', result.phone);
    console.log('Status:', result.status);
    console.log('\nYou can now login with:');
    console.log('Email: test.driver@demo.com');
    console.log('Password: TestDriver123!');
    console.log('\nThe user will be redirected to the driver dashboard.');

  } catch (error) {
    console.error('Error creating driver record:', error.message);
    process.exit(1);
  }
}

// Run the script
createTestDriverViaAPI();