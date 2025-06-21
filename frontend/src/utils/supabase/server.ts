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
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseServerConfig } from './config';

// Create a Supabase client for use in server components
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createClient = () => {
  // Get Supabase configuration with JWT secret for server-side
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { supabaseUrl, supabaseKey } = getSupabaseServerConfig();

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      async getAll() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const cookieStore = await cookies();
        return cookieStore.getAll();
      },
      async setAll(cookiesToSet) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const cookieStore = await cookies();
          cookiesToSet.forEach(({ name, value, _options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
};
