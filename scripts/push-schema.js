#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_KEY must be set in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Read schema.sql file
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');

if (!fs.existsSync(schemaPath)) {
  console.error(`Error: Schema file not found at ${schemaPath}`);
  process.exit(1);
}

if (!fs.existsSync(seedPath)) {
  console.error(`Error: Seed file not found at ${seedPath}`);
  process.exit(1);
}

const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
const seedSQL = fs.readFileSync(seedPath, 'utf8');

async function pushSchema() {
  try {
    console.log('Pushing schema to Supabase...');
    
    // Execute schema SQL
    const { error: schemaError } = await supabase.rpc('pgmoon.query', { query: schemaSQL });
    
    if (schemaError) {
      console.error('Error pushing schema:', schemaError);
      return;
    }
    
    console.log('Schema pushed successfully!');
    
    // Ask for confirmation before pushing seed data
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('Do you want to push seed data? (y/n) ', async (answer) => {
      if (answer.toLowerCase() === 'y') {
        console.log('Pushing seed data to Supabase...');
        
        // Execute seed SQL
        const { error: seedError } = await supabase.rpc('pgmoon.query', { query: seedSQL });
        
        if (seedError) {
          console.error('Error pushing seed data:', seedError);
        } else {
          console.log('Seed data pushed successfully!');
        }
      }
      
      readline.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

pushSchema();
