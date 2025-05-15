import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  // Don't exit in development to allow for easier debugging
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
