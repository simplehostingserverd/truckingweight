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

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint to get the current session
 * This is used by the ComplianceChart and other components
 */

export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const supabase = createClient();

    // Get authenticated user (more secure than getSession)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'No authenticated user' }, { status: 401 });
    }

    // Get session for access token
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Return session data
    return NextResponse.json({
      token: session?.access_token || 'mock-token',
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error in session API:', error);

    // Try to recover by creating a new session
    try {
      // Initialize a new Supabase client
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const supabase = createClient();

      // Get authenticated user (more secure than getSession)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return NextResponse.json({ error: 'No authenticated user' }, { status: 401 });
      }

      // Get session for access token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Return session data
      return NextResponse.json({
        token: session?.access_token || 'mock-token',
        user: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (recoveryError) {
      console.error('Recovery attempt failed:', recoveryError);

      // Only as a last resort, return a mock session in development
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({
          token: 'mock-access-token',
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'user@example.com',
            is_admin: false,
          },
        });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
