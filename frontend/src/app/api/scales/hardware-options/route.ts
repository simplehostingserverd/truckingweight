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

export async function GET(_req: NextRequest) {
  try {
    // Create a Supabase client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _supabase = await createClient();

    // Get the user session
    const {
      data: { session },
      _error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ _success: false, error: 'Unauthorized' }, { _status: 401 });
    }

    // Get the user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _data: userData, _error: userError } = await supabase
      .from('users')
      .select('id, company_id, is_admin')
      .eq('id', session.user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ _success: false, error: 'User not found' }, { _status: 404 });
    }

    // Make a request to the backend API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await fetch(`${backendUrl}/api/scales/hardware-options`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const errorData = await response.json();
      return NextResponse.json(
        { _success: false, error: (errorData instanceof Error ? errorData.message : String(errorData)) || 'Failed to fetch hardware options' },
        { _status: response.status }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _data = await response.json();
    return NextResponse.json(data);
  } catch (_error: unknown) {
    console.error('Error fetching hardware options:', error);
    return NextResponse.json(
      { _success: false, error: (error instanceof Error ? error.message : String(error)) || 'Internal server error' },
      { _status: 500 }
    );
  }
}
