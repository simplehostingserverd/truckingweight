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

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// License file path
const LICENSE_FILE_PATH = path.join(__dirname, 'config', 'license.json');

async function testLicense() {
  console.log('🔑 Testing License Validation');
  console.log('============================');
  
  console.log('Reading license file...');
  
  try {
    // Check if license file exists
    if (!fs.existsSync(LICENSE_FILE_PATH)) {
      console.error(`❌ License file not found at: ${LICENSE_FILE_PATH}`);
      return;
    }
    
    // Read and parse license file
    const licenseData = JSON.parse(fs.readFileSync(LICENSE_FILE_PATH, 'utf8'));
    
    // Basic validation
    const isValid = validateLicense(licenseData);
    
    console.log(`\nLicense Valid: ${isValid ? '✅ YES' : '❌ NO'}`);
    
    console.log('\nLicense Information:');
    console.log('-------------------');
    console.log(`License Key: ${licenseData.licenseKey || 'N/A'}`);
    console.log(`Customer: ${licenseData.customer?.name || 'N/A'}`);
    console.log(`Company: ${licenseData.customer?.company || 'N/A'}`);
    console.log(`Plan: ${licenseData.plan || 'N/A'}`);
    console.log(`Expires: ${new Date(licenseData.expiresAt).toLocaleDateString() || 'N/A'}`);
    console.log(`Max Users: ${licenseData.maxUsers || 'N/A'}`);
    console.log(`Max Tenants: ${licenseData.maxTenants || 'N/A'}`);
    
    console.log('\nFeature Access:');
    console.log('--------------');
    console.log(`Basic Features: ${hasFeature(licenseData, 'basic') ? '✅ Available' : '❌ Not Available'}`);
    console.log(`Advanced Features: ${hasFeature(licenseData, 'advanced') ? '✅ Available' : '❌ Not Available'}`);
    console.log(`API Access: ${hasFeature(licenseData, 'api') ? '✅ Available' : '❌ Not Available'}`);
    console.log(`Premium Support: ${hasFeature(licenseData, 'premium') ? '✅ Available' : '❌ Not Available'}`);
    
    // Test a feature that shouldn't exist
    console.log(`Custom Feature: ${hasFeature(licenseData, 'custom') ? '✅ Available' : '❌ Not Available'}`);
    
  } catch (error) {
    console.error('❌ Error reading or parsing license file:', error.message);
  }
}

// Simple license validation function
function validateLicense(licenseData) {
  if (!licenseData) return false;
  
  const { licenseKey, expiresAt } = licenseData;
  
  // Check if license key exists
  if (!licenseKey) return false;
  
  // Check if license has expired
  if (expiresAt && new Date(expiresAt) < new Date()) return false;
  
  // Basic format validation
  const keyPattern = /^CEG-[A-Z0-9_]{12}-[A-Z0-9]{8}$/;
  if (!keyPattern.test(licenseKey)) return false;
  
  return true;
}

// Check if a feature is available
function hasFeature(licenseData, featureName) {
  if (!licenseData || !licenseData.features) return false;
  return licenseData.features.includes(featureName);
}

// Run the test
testLicense().catch(error => {
  console.error('Error testing license:', error);
});
