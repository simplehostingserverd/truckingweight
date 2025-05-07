import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';
import { getSupabaseConfig } from './config';

// Create a Supabase client for use in server components
export const createClient = () => {
  // Get Supabase configuration
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  return createServerComponentClient<Database>({
    cookies,
    supabaseUrl,
    supabaseKey,
  });
};
