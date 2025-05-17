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
 * Mock user API endpoint
 * This provides a temporary user data mechanism while the backend is being developed
 */

export async function GET(request: NextRequest) {
  try {
    // Create a mock user
    const user = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      name: 'Demo User',
      company_id: 1,
      is_admin: false,
    };

    // Return success response with mock user
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error in mock user API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
