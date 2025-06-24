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
 */

import type { Database } from '@/types/supabase';
import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from './config';

// Singleton instance to prevent multiple GoTrueClient instances
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

// Create a Supabase client for use in client components
export const createClient = () => {
  // Return existing client if already created and still valid
  if (supabaseClient) {
    return supabaseClient;
  }

  // Get Supabase configuration
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  // Create new client and store it with singleton options
  supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js/trucking-frontend',
      },
    },
  });

  return supabaseClient;
};
