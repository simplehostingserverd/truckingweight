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

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { name, email, password, cityId, role } = await request.json();

    if (!name || !email || !password || !cityId || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, cityId, and role are required' },
        { _status: 400 }
      );
    }

    // Validate email domain - only .gov domains are allowed
    if (!email.toLowerCase().endsWith('.gov')) {
      return NextResponse.json(
        { error: 'Only .gov email domains are allowed for city registration' },
        { _status: 400 }
      );
    }

    // Call the backend API to register the city user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await fetch(`${process.env.BACKEND_URL}/api/city-auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        cityId,
        role,
        status: 'pending', // Set initial status to pending for security review
      }),
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { _error: data.msg || 'Failed to register user' },
        { _status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (_error: unknown) {
    console.error('City user registration error:', error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'Internal server error' }, { _status: 500 });
  }
}
