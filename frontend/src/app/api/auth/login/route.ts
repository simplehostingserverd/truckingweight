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

/**
 * Mock login API endpoint
 * This provides a temporary login mechanism while the backend is being developed
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Predefined test accounts
    const testAccounts = [
      {
        email: 'truckadmin@example.com',
        password: 'TruckAdmin123!',
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Trucking Admin',
        company_id: 1,
        is_admin: true,
      },
      {
        email: 'dispatcher@example.com',
        password: 'Dispatch123!',
        id: '223e4567-e89b-12d3-a456-426614174001',
        name: 'John Dispatcher',
        company_id: 1,
        is_admin: false,
      },
      {
        email: 'manager@example.com',
        password: 'Manager123!',
        id: '323e4567-e89b-12d3-a456-426614174002',
        name: 'Sarah Manager',
        company_id: 1,
        is_admin: false,
      },
    ];

    // Check for test accounts first
    const testAccount = testAccounts.find(
      account =>
        account.email.toLowerCase() === email.toLowerCase() && account.password === password
    );

    if (testAccount) {
      // Return success response with test account session
      return NextResponse.json({
        user: {
          id: testAccount.id,
          email: testAccount.email,
          name: testAccount.name,
          company_id: testAccount.company_id,
          is_admin: testAccount.is_admin,
        },
        session: {
          access_token: `mock-access-token-${testAccount.id}`,
          refresh_token: `mock-refresh-token-${testAccount.id}`,
          expires_at: Date.now() + 3600 * 1000, // 1 hour from now
        },
      });
    }

    // For demo purposes, accept any email with a password of "password"
    if (password === 'password') {
      // Create a mock user and session
      const user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email,
        name: 'Demo User',
        company_id: 1,
        is_admin: email.includes('admin'),
      };

      // Return success response with mock session
      return NextResponse.json({
        user,
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_at: Date.now() + 3600 * 1000, // 1 hour from now
        },
      });
    }

    // Return error for invalid credentials
    return NextResponse.json({ error: 'Invalid login credentials' }, { status: 401 });
  } catch (error) {
    console.error('Error in mock login API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
