/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 *
 * Designed and built by Michael Anthony Trevino Jr., Lead Full-Stack Developer
 */

// Import required modules directly
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Debug output
console.log('Script started');

// Set to offline mode for testing
process.env.LICENSE_OFFLINE_MODE = 'true';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// License file path
const LICENSE_FILE_PATH = path.join(__dirname, 'config', 'license.json');

async function testLicense() {
  console.log('🔑 Testing License Validation');
  console.log('============================');

  console.log('Initializing license validator...');
  const isValid = await licenseValidator.initialize();

  console.log(`\nLicense Valid: ${isValid ? '✅ YES' : '❌ NO'}`);

  const licenseInfo = licenseValidator.getLicenseInfo();

  console.log('\nLicense Information:');
  console.log('-------------------');
  console.log(`Customer: ${licenseInfo.customer?.name || 'N/A'}`);
  console.log(`Company: ${licenseInfo.customer?.company || 'N/A'}`);
  console.log(`Plan: ${licenseInfo.plan || 'N/A'}`);
  console.log(`Expires: ${new Date(licenseInfo.expiresAt).toLocaleDateString() || 'N/A'}`);
  console.log(`Max Users: ${licenseInfo.maxUsers || 'N/A'}`);
  console.log(`Max Tenants: ${licenseInfo.maxTenants || 'N/A'}`);

  console.log('\nFeature Access:');
  console.log('--------------');
  console.log(
    `Basic Features: ${licenseValidator.hasFeature('basic') ? '✅ Available' : '❌ Not Available'}`
  );
  console.log(
    `Advanced Features: ${licenseValidator.hasFeature('advanced') ? '✅ Available' : '❌ Not Available'}`
  );
  console.log(
    `API Access: ${licenseValidator.hasFeature('api') ? '✅ Available' : '❌ Not Available'}`
  );
  console.log(
    `Premium Support: ${licenseValidator.hasFeature('premium') ? '✅ Available' : '❌ Not Available'}`
  );

  // Test a feature that shouldn't exist
  console.log(
    `Custom Feature: ${licenseValidator.hasFeature('custom') ? '✅ Available' : '❌ Not Available'}`
  );
}

testLicense().catch(error => {
  console.error('Error testing license:', error);
});
