#!/usr/bin/env node

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

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import readline from 'readline';
import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';
import chalk from 'chalk';
import boxen from 'boxen';
import { DateTime } from 'luxon';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
let supabase;

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// License database file path
const LICENSE_DB_PATH = path.join(__dirname, 'licenses.json');

// ASCII art for the header
const headerText = `
╔═══════════════════════════════════════════════════════════════════════════╗
║                        COSMO EXPLOIT GROUP LLC                            ║
║                       LICENSE GENERATOR UTILITY                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`;

/**
 * Main function
 */
async function main() {
  console.clear();
  console.log(chalk.blue(headerText));
  console.log(chalk.yellow('© 2025 Cosmo Exploit Group LLC. All Rights Reserved.'));
  console.log(chalk.yellow('Designed and built by Michael Anthony Trevino Jr., Lead Full-Stack Developer\n'));

  // Check if running on Linux
  if (process.platform !== 'linux') {
    console.log(chalk.red('Error: This tool is designed to run only on Linux systems.'));
    process.exit(1);
  }

  // Initialize license database
  await initializeLicenseDatabase();

  // Initialize Supabase if credentials are available
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log(chalk.green('✓ Connected to Supabase'));
  } else {
    console.log(chalk.yellow('⚠ Supabase credentials not found. Operating in local-only mode.'));
  }

  // Show main menu
  await showMainMenu();
}

/**
 * Initialize license database
 */
async function initializeLicenseDatabase() {
  try {
    await fs.access(LICENSE_DB_PATH);
  } catch (error) {
    // File doesn't exist, create it
    await fs.writeFile(LICENSE_DB_PATH, JSON.stringify({
      licenses: [],
      customers: [],
      lastUpdated: new Date().toISOString()
    }, null, 2));
    
    console.log(chalk.green('✓ Created new license database'));
  }
}

/**
 * Show main menu
 */
async function showMainMenu() {
  console.log('\n' + chalk.cyan('MAIN MENU'));
  console.log('1. Generate New License');
  console.log('2. View All Licenses');
  console.log('3. Revoke License');
  console.log('4. Add Customer');
  console.log('5. View All Customers');
  console.log('6. Sync with Supabase');
  console.log('7. Exit');
  
  const answer = await question('Select an option (1-7): ');
  
  switch (answer) {
    case '1':
      await generateLicense();
      break;
    case '2':
      await viewLicenses();
      break;
    case '3':
      await revokeLicense();
      break;
    case '4':
      await addCustomer();
      break;
    case '5':
      await viewCustomers();
      break;
    case '6':
      await syncWithSupabase();
      break;
    case '7':
      console.log(chalk.green('\nThank you for using the Cosmo License Generator!'));
      process.exit(0);
      break;
    default:
      console.log(chalk.red('Invalid option. Please try again.'));
      await showMainMenu();
      break;
  }
}

/**
 * Generate a new license
 */
async function generateLicense() {
  console.log('\n' + chalk.cyan('GENERATE NEW LICENSE'));
  
  // Get customers
  const db = await readLicenseDatabase();
  
  if (db.customers.length === 0) {
    console.log(chalk.yellow('No customers found. Please add a customer first.'));
    await showMainMenu();
    return;
  }
  
  // Show customers
  console.log('\nAvailable customers:');
  db.customers.forEach((customer, index) => {
    console.log(`${index + 1}. ${customer.name} (${customer.email})`);
  });
  
  const customerIndex = parseInt(await question('Select a customer (number): ')) - 1;
  
  if (isNaN(customerIndex) || customerIndex < 0 || customerIndex >= db.customers.length) {
    console.log(chalk.red('Invalid customer selection.'));
    await showMainMenu();
    return;
  }
  
  const customer = db.customers[customerIndex];
  
  // Get license details
  const plan = await question('Plan (basic, professional, enterprise): ');
  const durationDays = parseInt(await question('Duration in days (365): ') || '365');
  const maxUsers = parseInt(await question('Maximum users (10): ') || '10');
  const maxTenants = parseInt(await question('Maximum tenants (1): ') || '1');
  const domains = (await question('Authorized domains (comma-separated): ')).split(',').map(d => d.trim()).filter(Boolean);
  
  // Generate license key
  const licenseId = nanoid(12).toUpperCase();
  const licenseKey = `CEG-${licenseId}-${nanoid(8).toUpperCase()}`;
  
  // Create license object
  const now = new Date();
  const expiresAt = DateTime.fromJSDate(now).plus({ days: durationDays }).toJSDate();
  
  const license = {
    id: crypto.randomUUID(),
    key: licenseKey,
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    plan,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    maxUsers,
    maxTenants,
    features: ['basic'],
    status: 'active',
    domains,
  };
  
  // Add license to database
  db.licenses.push(license);
  db.lastUpdated = new Date().toISOString();
  await writeLicenseDatabase(db);
  
  // Add to Supabase if connected
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .insert([{
          key: license.key,
          customer_id: license.customerId,
          plan: license.plan,
          created_at: license.createdAt,
          expires_at: license.expiresAt,
          max_users: license.maxUsers,
          max_tenants: license.maxTenants,
          features: license.features,
          status: license.status,
          domains: license.domains,
        }]);
      
      if (error) {
        console.log(chalk.yellow(`⚠ Warning: Failed to sync license to Supabase: ${error.message}`));
      } else {
        console.log(chalk.green('✓ License synced to Supabase'));
      }
    } catch (error) {
      console.log(chalk.yellow(`⚠ Warning: Failed to sync license to Supabase: ${error.message}`));
    }
  }
  
  // Display license information
  console.log('\n' + boxen(
    chalk.green('License Generated Successfully') + '\n\n' +
    chalk.white(`License Key: ${chalk.cyan(licenseKey)}`) + '\n' +
    chalk.white(`Customer: ${chalk.cyan(customer.name)}`) + '\n' +
    chalk.white(`Plan: ${chalk.cyan(plan)}`) + '\n' +
    chalk.white(`Expires: ${chalk.cyan(new Date(expiresAt).toLocaleDateString())}`) + '\n' +
    chalk.white(`Max Users: ${chalk.cyan(maxUsers)}`) + '\n' +
    chalk.white(`Max Tenants: ${chalk.cyan(maxTenants)}`),
    { padding: 1, borderColor: 'green', borderStyle: 'round' }
  ));
  
  await showMainMenu();
}

/**
 * View all licenses
 */
async function viewLicenses() {
  console.log('\n' + chalk.cyan('VIEW ALL LICENSES'));
  
  const db = await readLicenseDatabase();
  
  if (db.licenses.length === 0) {
    console.log(chalk.yellow('No licenses found.'));
    await showMainMenu();
    return;
  }
  
  console.log('\nLicenses:');
  db.licenses.forEach((license, index) => {
    const status = license.status === 'active' 
      ? chalk.green(license.status) 
      : license.status === 'revoked' 
        ? chalk.red(license.status) 
        : chalk.yellow(license.status);
    
    console.log(`${index + 1}. ${chalk.cyan(license.key)} - ${license.customerName} - ${status}`);
    console.log(`   Plan: ${license.plan}, Expires: ${new Date(license.expiresAt).toLocaleDateString()}`);
    console.log(`   Max Users: ${license.maxUsers}, Max Tenants: ${license.maxTenants}`);
    console.log(`   Domains: ${license.domains.join(', ') || 'Any'}`);
    console.log('');
  });
  
  await showMainMenu();
}

/**
 * Revoke a license
 */
async function revokeLicense() {
  console.log('\n' + chalk.cyan('REVOKE LICENSE'));
  
  const db = await readLicenseDatabase();
  
  if (db.licenses.length === 0) {
    console.log(chalk.yellow('No licenses found.'));
    await showMainMenu();
    return;
  }
  
  // Show active licenses
  const activeLicenses = db.licenses.filter(license => license.status === 'active');
  
  if (activeLicenses.length === 0) {
    console.log(chalk.yellow('No active licenses found.'));
    await showMainMenu();
    return;
  }
  
  console.log('\nActive licenses:');
  activeLicenses.forEach((license, index) => {
    console.log(`${index + 1}. ${chalk.cyan(license.key)} - ${license.customerName}`);
  });
  
  const licenseIndex = parseInt(await question('Select a license to revoke (number): ')) - 1;
  
  if (isNaN(licenseIndex) || licenseIndex < 0 || licenseIndex >= activeLicenses.length) {
    console.log(chalk.red('Invalid license selection.'));
    await showMainMenu();
    return;
  }
  
  const license = activeLicenses[licenseIndex];
  const confirm = await question(`Are you sure you want to revoke license ${license.key}? (y/n): `);
  
  if (confirm.toLowerCase() !== 'y') {
    console.log(chalk.yellow('License revocation cancelled.'));
    await showMainMenu();
    return;
  }
  
  // Update license status
  const licenseToUpdate = db.licenses.find(l => l.id === license.id);
  licenseToUpdate.status = 'revoked';
  licenseToUpdate.revokedAt = new Date().toISOString();
  
  // Update database
  db.lastUpdated = new Date().toISOString();
  await writeLicenseDatabase(db);
  
  // Update Supabase if connected
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .update({
          status: 'revoked',
          revoked_at: licenseToUpdate.revokedAt
        })
        .eq('key', license.key);
      
      if (error) {
        console.log(chalk.yellow(`⚠ Warning: Failed to sync license revocation to Supabase: ${error.message}`));
      } else {
        console.log(chalk.green('✓ License revocation synced to Supabase'));
      }
    } catch (error) {
      console.log(chalk.yellow(`⚠ Warning: Failed to sync license revocation to Supabase: ${error.message}`));
    }
  }
  
  console.log(chalk.green(`✓ License ${license.key} has been revoked.`));
  await showMainMenu();
}

/**
 * Add a new customer
 */
async function addCustomer() {
  console.log('\n' + chalk.cyan('ADD NEW CUSTOMER'));
  
  const name = await question('Customer Name: ');
  const email = await question('Customer Email: ');
  const company = await question('Company Name (optional): ');
  const phone = await question('Phone Number (optional): ');
  
  if (!name || !email) {
    console.log(chalk.red('Name and email are required.'));
    await showMainMenu();
    return;
  }
  
  // Create customer object
  const customer = {
    id: crypto.randomUUID(),
    name,
    email,
    company,
    phone,
    createdAt: new Date().toISOString()
  };
  
  // Add customer to database
  const db = await readLicenseDatabase();
  db.customers.push(customer);
  db.lastUpdated = new Date().toISOString();
  await writeLicenseDatabase(db);
  
  // Add to Supabase if connected
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          id: customer.id,
          name: customer.name,
          email: customer.email,
          company: customer.company,
          phone: customer.phone,
          created_at: customer.createdAt
        }]);
      
      if (error) {
        console.log(chalk.yellow(`⚠ Warning: Failed to sync customer to Supabase: ${error.message}`));
      } else {
        console.log(chalk.green('✓ Customer synced to Supabase'));
      }
    } catch (error) {
      console.log(chalk.yellow(`⚠ Warning: Failed to sync customer to Supabase: ${error.message}`));
    }
  }
  
  console.log(chalk.green(`✓ Customer ${name} has been added.`));
  await showMainMenu();
}

/**
 * View all customers
 */
async function viewCustomers() {
  console.log('\n' + chalk.cyan('VIEW ALL CUSTOMERS'));
  
  const db = await readLicenseDatabase();
  
  if (db.customers.length === 0) {
    console.log(chalk.yellow('No customers found.'));
    await showMainMenu();
    return;
  }
  
  console.log('\nCustomers:');
  db.customers.forEach((customer, index) => {
    console.log(`${index + 1}. ${chalk.cyan(customer.name)} (${customer.email})`);
    if (customer.company) console.log(`   Company: ${customer.company}`);
    if (customer.phone) console.log(`   Phone: ${customer.phone}`);
    console.log(`   Created: ${new Date(customer.createdAt).toLocaleDateString()}`);
    console.log('');
  });
  
  await showMainMenu();
}

/**
 * Sync with Supabase
 */
async function syncWithSupabase() {
  console.log('\n' + chalk.cyan('SYNC WITH SUPABASE'));
  
  if (!supabase) {
    console.log(chalk.red('Error: Supabase connection not available. Check your environment variables.'));
    await showMainMenu();
    return;
  }
  
  const syncDirection = await question('Sync direction (1: Local → Supabase, 2: Supabase → Local): ');
  
  if (syncDirection === '1') {
    // Local → Supabase
    await syncLocalToSupabase();
  } else if (syncDirection === '2') {
    // Supabase → Local
    await syncSupabaseToLocal();
  } else {
    console.log(chalk.red('Invalid option.'));
  }
  
  await showMainMenu();
}

/**
 * Sync local database to Supabase
 */
async function syncLocalToSupabase() {
  try {
    const db = await readLicenseDatabase();
    
    // Sync customers
    console.log(chalk.yellow('Syncing customers...'));
    for (const customer of db.customers) {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('id', customer.id)
        .single();
      
      if (existingCustomer) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update({
            name: customer.name,
            email: customer.email,
            company: customer.company,
            phone: customer.phone,
            updated_at: new Date().toISOString()
          })
          .eq('id', customer.id);
        
        if (error) {
          console.log(chalk.red(`Error updating customer ${customer.name}: ${error.message}`));
        }
      } else {
        // Insert new customer
        const { error } = await supabase
          .from('customers')
          .insert([{
            id: customer.id,
            name: customer.name,
            email: customer.email,
            company: customer.company,
            phone: customer.phone,
            created_at: customer.createdAt
          }]);
        
        if (error) {
          console.log(chalk.red(`Error inserting customer ${customer.name}: ${error.message}`));
        }
      }
    }
    
    // Sync licenses
    console.log(chalk.yellow('Syncing licenses...'));
    for (const license of db.licenses) {
      const { data: existingLicense } = await supabase
        .from('licenses')
        .select('id')
        .eq('key', license.key)
        .single();
      
      if (existingLicense) {
        // Update existing license
        const { error } = await supabase
          .from('licenses')
          .update({
            customer_id: license.customerId,
            plan: license.plan,
            expires_at: license.expiresAt,
            max_users: license.maxUsers,
            max_tenants: license.maxTenants,
            features: license.features,
            status: license.status,
            domains: license.domains,
            updated_at: new Date().toISOString()
          })
          .eq('key', license.key);
        
        if (error) {
          console.log(chalk.red(`Error updating license ${license.key}: ${error.message}`));
        }
      } else {
        // Insert new license
        const { error } = await supabase
          .from('licenses')
          .insert([{
            key: license.key,
            customer_id: license.customerId,
            plan: license.plan,
            created_at: license.createdAt,
            expires_at: license.expiresAt,
            max_users: license.maxUsers,
            max_tenants: license.maxTenants,
            features: license.features,
            status: license.status,
            domains: license.domains
          }]);
        
        if (error) {
          console.log(chalk.red(`Error inserting license ${license.key}: ${error.message}`));
        }
      }
    }
    
    console.log(chalk.green('✓ Sync completed successfully.'));
  } catch (error) {
    console.log(chalk.red(`Error syncing with Supabase: ${error.message}`));
  }
}

/**
 * Sync Supabase to local database
 */
async function syncSupabaseToLocal() {
  try {
    // Get customers from Supabase
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*');
    
    if (customersError) {
      console.log(chalk.red(`Error fetching customers: ${customersError.message}`));
      return;
    }
    
    // Get licenses from Supabase
    const { data: licenses, error: licensesError } = await supabase
      .from('licenses')
      .select('*');
    
    if (licensesError) {
      console.log(chalk.red(`Error fetching licenses: ${licensesError.message}`));
      return;
    }
    
    // Confirm sync
    console.log(chalk.yellow(`This will replace your local database with ${customers.length} customers and ${licenses.length} licenses.`));
    const confirm = await question('Are you sure you want to continue? (y/n): ');
    
    if (confirm.toLowerCase() !== 'y') {
      console.log(chalk.yellow('Sync cancelled.'));
      return;
    }
    
    // Transform data to local format
    const transformedCustomers = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      company: customer.company,
      phone: customer.phone,
      createdAt: customer.created_at
    }));
    
    const transformedLicenses = licenses.map(license => ({
      id: license.id,
      key: license.key,
      customerId: license.customer_id,
      customerName: customers.find(c => c.id === license.customer_id)?.name || 'Unknown',
      customerEmail: customers.find(c => c.id === license.customer_id)?.email || 'unknown@example.com',
      plan: license.plan,
      createdAt: license.created_at,
      expiresAt: license.expires_at,
      maxUsers: license.max_users,
      maxTenants: license.max_tenants,
      features: license.features || ['basic'],
      status: license.status,
      domains: license.domains || [],
      revokedAt: license.revoked_at
    }));
    
    // Update local database
    const db = {
      customers: transformedCustomers,
      licenses: transformedLicenses,
      lastUpdated: new Date().toISOString()
    };
    
    await writeLicenseDatabase(db);
    
    console.log(chalk.green('✓ Sync completed successfully.'));
  } catch (error) {
    console.log(chalk.red(`Error syncing with Supabase: ${error.message}`));
  }
}

/**
 * Read license database
 */
async function readLicenseDatabase() {
  try {
    const data = await fs.readFile(LICENSE_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log(chalk.red(`Error reading license database: ${error.message}`));
    return { licenses: [], customers: [], lastUpdated: new Date().toISOString() };
  }
}

/**
 * Write license database
 */
async function writeLicenseDatabase(db) {
  try {
    await fs.writeFile(LICENSE_DB_PATH, JSON.stringify(db, null, 2));
  } catch (error) {
    console.log(chalk.red(`Error writing license database: ${error.message}`));
  }
}

/**
 * Ask a question and get the answer
 */
function question(query) {
  return new Promise(resolve => {
    rl.question(query, answer => {
      resolve(answer);
    });
  });
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
