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


import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';
import { getSupabaseConfig, getSupabaseServerConfig } from './config';

// Create a Supabase client for use in server components
export const createClient = () => {
  // Get Supabase configuration with JWT secret for server-side
  const { supabaseUrl, supabaseKey, supabaseJwtSecret } = getSupabaseServerConfig();

  return createServerComponentClient<Database>({
    cookies,
    supabaseUrl,
    supabaseKey,
    options: {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-auth-helpers-nextjs/server',
        },
      },
      // Add JWT secret if available
      ...(supabaseJwtSecret && { 
        db: { 
          schema: 'public' 
        },
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          flowType: 'pkce',
        },
      }),
    },
  });
};
