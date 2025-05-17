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
    options: {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storageKey: 'supabase-auth',
        storage: {
          getItem: key => {
            if (typeof window === 'undefined') {
              return null;
            }
            return window.localStorage.getItem(key);
          },
          setItem: (key, value) => {
            if (typeof window === 'undefined') {
              return;
            }
            window.localStorage.setItem(key, value);
          },
          removeItem: key => {
            if (typeof window === 'undefined') {
              return;
            }
            window.localStorage.removeItem(key);

            // Also remove legacy tokens for backward compatibility
            if (key.includes('supabase-auth')) {
              window.localStorage.removeItem('cityToken');
              window.localStorage.removeItem('cityUser');
              window.localStorage.removeItem('truckingToken');
              window.localStorage.removeItem('truckingUser');
            }
          },
        },
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-auth-helpers-nextjs',
        },
      },
    },
  });
};
