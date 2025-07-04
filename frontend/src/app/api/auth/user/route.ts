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
 * Mock user API endpoint
 * This provides a temporary user data mechanism while the backend is being developed
 */

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header (try both formats)
    const authHeader = request.headers.get('authorization');
    const xAuthToken = request.headers.get('x-auth-token');

    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (xAuthToken) {
      token = xAuthToken;
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // Create Supabase client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const supabase = createClient();

    // Verify the token and get user data
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get additional user data from the database
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('id, email, name, company_id, is_admin')
      .eq('id', authUser.id)
      .single();

    if (userDataError) {
      console.error('Error fetching user data:', userDataError);
      
      // If no user data found, return mock user data for demo purposes
      if (userDataError.code === 'PGRST116') {
        const mockUser = {
          id: authUser.id,
          email: authUser.email || 'demo@example.com',
          name: authUser.user_metadata?.name || 'Demo User',
          company_id: 'demo-company-1',
          is_admin: true
        };
        return NextResponse.json({ user: mockUser });
      }
      
      return NextResponse.json({ error: 'Error fetching user data' }, { status: 500 });
    }

    // Return success response with real user data
    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Error in user API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
