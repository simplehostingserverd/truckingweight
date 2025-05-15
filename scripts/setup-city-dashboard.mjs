/**
 * Script to set up the city dashboard
 * Run with: node scripts/setup-city-dashboard.js
 *
 * This script runs both the schema verification and city population scripts
 * in sequence to fully set up the city dashboard functionality.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * Run a script and log its output
 * @param {string} scriptPath - Path to the script to run
 * @returns {Promise<void>}
 */
async function runScript(scriptPath) {
  try {
    console.log(`Running ${scriptPath}...`);
    const { stdout, stderr } = await execPromise(`node ${scriptPath}`);

    if (stdout) {
      console.log(stdout);
    }

    if (stderr) {
      console.error(stderr);
    }

    console.log(`Finished running ${scriptPath}`);
    return true;
  } catch (error) {
    console.error(`Error running ${scriptPath}:`, error);
    return false;
  }
}

/**
 * Main function to run the setup scripts
 */
async function main() {
  try {
    console.log('Starting city dashboard setup...');
    console.log('=================================');

    // Step 1: Verify and create schema
    console.log('\nSTEP 1: Verifying database schema');
    const schemaVerified = await runScript('./scripts/verify-city-schema.mjs');

    if (!schemaVerified) {
      console.error('Failed to verify schema. Aborting setup.');
      return;
    }

    // Step 2: Populate Texas cities and create Houston user
    console.log('\nSTEP 2: Populating Texas cities');
    const citiesPopulated = await runScript('./scripts/populate-texas-cities.mjs');

    if (!citiesPopulated) {
      console.error('Failed to populate cities. Setup incomplete.');
      return;
    }

    console.log('\n=================================');
    console.log('City dashboard setup completed successfully!');
    console.log('\nYou can now log in with the following credentials:');
    console.log('\nHouston Admin User:');
    console.log('Email: houston.admin@example.gov');
    console.log('Password: HoustonAdmin2024!');
    console.log('\nAustin Admin User:');
    console.log('Email: cityadmin@example.gov');
    console.log('Password: CityAdmin123!');
    console.log('\nSee scripts/CITY-DASHBOARD-SETUP.md for more information.');
  } catch (error) {
    console.error('Unexpected error during setup:', error);
  }
}

// Run the main function
main();
