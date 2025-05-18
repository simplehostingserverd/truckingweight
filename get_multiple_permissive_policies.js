// Script to identify tables with multiple permissive policies in Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = 'https://pczfmxigimuluacspxse.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjemZteGlnaW11bHVhY3NweHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NjczNjUsImV4cCI6MjA2MjI0MzM2NX0.SyWZsCDWc5u5oXIR4IHBTcT63Le0HyjCZQJK0E6FO7w';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function getTablesWithMultiplePermissivePolicies() {
  const { data, error } = await supabase.rpc('get_tables_with_multiple_permissive_policies');

  if (error) {
    console.error('Error fetching tables with multiple permissive policies:', error);
    return;
  }

  console.log('Tables with multiple permissive policies:');
  console.log(JSON.stringify(data, null, 2));
}

getTablesWithMultiplePermissivePolicies();
