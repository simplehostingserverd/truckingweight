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

// Create a Supabase client for use in client components
export const createClient = () => {
  // Get Supabase configuration
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
};
