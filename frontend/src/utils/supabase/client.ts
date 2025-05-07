import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { getSupabaseConfig } from './config';

// Create a Supabase client for use in client components
export const createClient = () => {
  // Get Supabase configuration
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  return createClientComponentClient<Database>({
    supabaseUrl,
    supabaseKey,
  });
};
