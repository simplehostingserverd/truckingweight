/**
 * Script to add company logos for the landing page
 * Run with: node scripts/add-company-logos.js
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get current file directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from root .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Realistic company logos data
const companyLogos = [
  {
    name: 'J.B. Hunt Transport',
    logo_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/J.B._Hunt_logo.svg/1200px-J.B._Hunt_logo.svg.png',
    website: 'https://www.jbhunt.com',
    type: 'trucking',
  },
  {
    name: 'Schneider National',
    logo_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Schneider_National_logo.svg/1200px-Schneider_National_logo.svg.png',
    website: 'https://schneider.com',
    type: 'trucking',
  },
  {
    name: 'Swift Transportation',
    logo_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Swift_Transportation_logo.svg/1200px-Swift_Transportation_logo.svg.png',
    website: 'https://www.swifttrans.com',
    type: 'trucking',
  },
  {
    name: 'Werner Enterprises',
    logo_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Werner_Enterprises_logo.svg/1200px-Werner_Enterprises_logo.svg.png',
    website: 'https://www.werner.com',
    type: 'trucking',
  },
  {
    name: 'Knight-Swift Transportation',
    logo_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Knight-Swift_Transportation_logo.svg/1200px-Knight-Swift_Transportation_logo.svg.png',
    website: 'https://www.knightswift.com',
    type: 'trucking',
  },
  {
    name: 'XPO Logistics',
    logo_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/XPO_Logistics_logo.svg/1200px-XPO_Logistics_logo.svg.png',
    website: 'https://www.xpo.com',
    type: 'trucking',
  },
  {
    name: 'Old Dominion Freight Line',
    logo_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Old_Dominion_Freight_Line_logo.svg/1200px-Old_Dominion_Freight_Line_logo.svg.png',
    website: 'https://www.odfl.com',
    type: 'trucking',
  },
  {
    name: 'Landstar System',
    logo_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Landstar_System_logo.svg/1200px-Landstar_System_logo.svg.png',
    website: 'https://www.landstar.com',
    type: 'trucking',
  },
  {
    name: 'City of Dallas',
    logo_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Seal_of_Dallas%2C_Texas.svg/1200px-Seal_of_Dallas%2C_Texas.svg.png',
    website: 'https://www.dallascityhall.com',
    type: 'city',
  },
  {
    name: 'City of Houston',
    logo_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Seal_of_Houston%2C_Texas.svg/1200px-Seal_of_Houston%2C_Texas.svg.png',
    website: 'https://www.houstontx.gov',
    type: 'city',
  },
  {
    name: 'City of San Antonio',
    logo_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Seal_of_San_Antonio%2C_Texas.svg/1200px-Seal_of_San_Antonio%2C_Texas.svg.png',
    website: 'https://www.sanantonio.gov',
    type: 'city',
  },
  {
    name: 'City of Austin',
    logo_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Seal_of_Austin%2C_Texas.svg/1200px-Seal_of_Austin%2C_Texas.svg.png',
    website: 'https://www.austintexas.gov',
    type: 'city',
  },
  {
    name: 'City of Fort Worth',
    logo_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Seal_of_Fort_Worth%2C_Texas.svg/1200px-Seal_of_Fort_Worth%2C_Texas.svg.png',
    website: 'https://www.fortworthtexas.gov',
    type: 'city',
  },
  {
    name: 'City of El Paso',
    logo_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Seal_of_El_Paso%2C_Texas.svg/1200px-Seal_of_El_Paso%2C_Texas.svg.png',
    website: 'https://www.elpasotexas.gov',
    type: 'city',
  },
  {
    name: 'City of Arlington',
    logo_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Seal_of_Arlington%2C_Texas.svg/1200px-Seal_of_Arlington%2C_Texas.svg.png',
    website: 'https://www.arlingtontx.gov',
    type: 'city',
  },
  {
    name: 'City of Corpus Christi',
    logo_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Seal_of_Corpus_Christi%2C_Texas.svg/1200px-Seal_of_Corpus_Christi%2C_Texas.svg.png',
    website: 'https://www.cctexas.com',
    type: 'city',
  },
];

// Main function to add company logos to the database
async function addCompanyLogos() {
  console.log('Starting to add company logos to the database...');

  try {
    // First, try to query the company_logos table to see if it exists
    const { error: checkTableError } = await supabase.from('company_logos').select('id').limit(1);

    // If the table doesn't exist, create it using SQL API
    if (checkTableError && checkTableError.code === '42P01') {
      // 42P01 is the PostgreSQL error code for "table does not exist"
      console.log('Company logos table does not exist. Creating it...');

      // Create the table using Supabase's SQL API
      const { error: createTableError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS company_logos (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            logo_url TEXT NOT NULL,
            website VARCHAR(255),
            type VARCHAR(50) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `,
      });

      if (createTableError) {
        // If the execute_sql function doesn't exist, we'll just continue and try to insert
        // The table might be created automatically with the first insert
        console.log('Note: Could not create table using SQL API. Will try to insert anyway.');
      }
    }

    // Insert company logos
    console.log('Inserting company logos...');
    const { data: logosData, error: logosError } = await supabase
      .from('company_logos')
      .upsert(companyLogos, { onConflict: 'name' })
      .select();

    if (logosError) {
      console.error('Error inserting company logos:', logosError);
      throw logosError;
    }

    console.log(`Inserted ${logosData.length} company logos`);
    console.log('Company logos added successfully!');
  } catch (error) {
    console.error('Error adding company logos:', error);
  }
}

// Run the function
addCompanyLogos();
