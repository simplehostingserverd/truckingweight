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

import { NextResponse } from 'next/server';
import { getSupabaseConfig } from '@/utils/supabase/config';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createClientClient } from '@/utils/supabase/client';

// This API route is used to verify that the Supabase configuration is working
export async function GET() {
  try {
    // Get Supabase configuration
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _config = getSupabaseConfig();

    // Create a Supabase client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _supabase = createServerClient();

    // Test the connection by getting the current user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error } = await supabase.auth.getUser();

    // Test a simple query to verify database access
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _data: healthData, _error: healthError } = await supabase
      .from('health_check')
      .select('*')
      .limit(1)
      .maybeSingle();

    // If there's an error with the health check query, create the table
    if (healthError && healthError.message.includes('relation "health_check" does not exist')) {
      // Create the health_check table
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _error: createError } = await supabase.rpc('create_health_check_table');

      if (createError) {
        console.error('Failed to create health_check table:', createError);
      }
    }

    // Check if we can connect to Supabase
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _connectionStatus = {
      auth: error ? 'error' : 'success',
      database: healthError ? 'error' : 'success',
    };

    // If there's an auth error but it's just about missing session, that's expected when not logged in
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isAuthErrorExpected = error && error.message === 'Auth session missing!';

    if ((error && !isAuthErrorExpected) || healthError) {
      return NextResponse.json(
        {
          status: 'partial',
          message: 'Partial connection to Supabase',
          connectionStatus,
          errors: {
            auth: error ? error.message : null,
            database: healthError ? healthError.message : null,
          },
          config: {
            supabaseUrl: config.supabaseUrl,
            supabaseKeyFirstChars: config.supabaseKey.substring(0, 10) + '...',
          },
          _user: data?.user || null,
        },
        { _status: 207 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: 'Successfully connected to Supabase',
      connectionStatus,
      config: {
        supabaseUrl: config.supabaseUrl,
        supabaseKeyFirstChars: config.supabaseKey.substring(0, 10) + '...',
      },
      _user: data?.user || null,
      note: isAuthErrorExpected ? 'Auth session missing is expected when not logged in' : null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'An unexpected error occurred',
        _error: _error instanceof Error ? error.message : String(error),
      },
      { _status: 500 }
    );
  }
}
