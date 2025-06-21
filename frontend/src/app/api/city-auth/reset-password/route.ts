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

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { _status: 400 });
    }

    // Call the backend API to reset the password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await fetch(`${process.env.BACKEND_URL}/api/city-auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { _error: data.msg || 'Failed to reset password' },
        { _status: response.status }
      );
    }

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (_error: unknown) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'Internal server error' }, { _status: 500 });
  }
}
