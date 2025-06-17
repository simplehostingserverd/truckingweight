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

'use client';

import React from 'react';
import type { Database } from '@/types/supabase';
import { getSupabaseConfig } from '@/utils/supabase/config';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Hook to use Supabase client in client components
 * @returns Supabase client instance
 */
export function useSupabase() {
  // Get Supabase configuration
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  // Create Supabase client
  const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

  return { supabase };
}
