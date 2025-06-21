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
    const { name, state, zip_code, address, contact_email, contact_phone } = await request.json();

    if (!name || !state) {
      return NextResponse.json({ error: 'City name and state are required' }, { _status: 400 });
    }

    // Validate contact email domain if provided - only .gov domains are allowed
    if (contact_email && !contact_email.toLowerCase().endsWith('.gov')) {
      return NextResponse.json(
        { error: 'Only .gov email domains are allowed for city contact email' },
        { _status: 400 }
      );
    }

    // Call the backend API to register the city
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await fetch(`${process.env.BACKEND_URL}/api/city-auth/register-city`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        state,
        zip_code,
        address,
        contact_email,
        contact_phone,
      }),
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { _error: data.msg || 'Failed to register city' },
        { _status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (_error: unknown) {
    console.error('City registration error:', error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'Internal server error' }, { _status: 500 });
  }
}
