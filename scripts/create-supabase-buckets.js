/**
 * Create Supabase Storage Buckets
 * This script creates the necessary storage buckets in Supabase
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://pczfmxigimuluacspxse.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Bucket names
const BUCKETS = [
  {
    name: 'city-logos',
    public: true,
    description: 'Storage for city logos',
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp'],
    fileSizeLimit: 2 * 1024 * 1024, // 2MB
  },
  {
    name: 'signatures',
    public: true,
    description: 'Storage for signatures',
    allowedMimeTypes: ['image/png'],
    fileSizeLimit: 1 * 1024 * 1024, // 1MB
  },
];

/**
 * Create a storage bucket if it doesn't exist
 * @param {Object} bucket Bucket configuration
 */
async function createBucket(bucket) {
  try {
    // Check if bucket exists
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      throw new Error(`Error listing buckets: ${listError.message}`);
    }

    const bucketExists = existingBuckets.some(b => b.name === bucket.name);

    if (bucketExists) {
      console.log(`Bucket '${bucket.name}' already exists.`);

      // Update bucket configuration
      const { error: updateError } = await supabase.storage.updateBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes,
      });

      if (updateError) {
        console.warn(`Warning: Could not update bucket '${bucket.name}': ${updateError.message}`);
      } else {
        console.log(`Updated configuration for bucket '${bucket.name}'.`);
      }

      return;
    }

    // Create the bucket
    const { data, error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit,
      allowedMimeTypes: bucket.allowedMimeTypes,
    });

    if (error) {
      throw new Error(`Error creating bucket '${bucket.name}': ${error.message}`);
    }

    console.log(`Created bucket '${bucket.name}' successfully.`);
  } catch (error) {
    console.error(`Failed to create bucket '${bucket.name}':`, error.message);
  }
}

/**
 * Main function to create all buckets
 */
async function main() {
  console.log('Creating Supabase storage buckets...');

  for (const bucket of BUCKETS) {
    await createBucket(bucket);
  }

  console.log('Finished creating storage buckets.');
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
