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

export async function GET(request: NextRequest) {
  try {
    // Get the authorization token from the request headers
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token is required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Check if this is a test token
    if (token.startsWith('test-city-token-')) {
      console.log('Using test data for city users');

      // Mock data
      const dummyUsers = [
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@example.gov',
          role: 'admin',
          status: 'active',
          lastLogin: '2023-11-20T09:30:00Z',
          createdAt: '2023-01-15T00:00:00Z',
        },
        {
          id: 2,
          name: 'John Operator',
          email: 'john.operator@example.gov',
          role: 'operator',
          status: 'active',
          lastLogin: '2023-11-19T14:45:00Z',
          createdAt: '2023-02-10T00:00:00Z',
        },
        {
          id: 3,
          name: 'Sarah Inspector',
          email: 'sarah.inspector@example.gov',
          role: 'inspector',
          status: 'active',
          lastLogin: '2023-11-18T11:20:00Z',
          createdAt: '2023-03-05T00:00:00Z',
        },
        {
          id: 4,
          name: 'Mike Viewer',
          email: 'mike.viewer@example.gov',
          role: 'viewer',
          status: 'active',
          lastLogin: '2023-11-15T16:10:00Z',
          createdAt: '2023-04-20T00:00:00Z',
        },
        {
          id: 5,
          name: 'Jane Doe',
          email: 'jane.doe@example.gov',
          role: 'operator',
          status: 'inactive',
          lastLogin: '2023-10-05T10:30:00Z',
          createdAt: '2023-05-12T00:00:00Z',
        },
      ];

      return NextResponse.json({ users: dummyUsers });
    }

    // Call the backend API to get city users
    const response = await fetch(`${process.env.BACKEND_URL}/api/city-users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.msg || 'Failed to fetch city users' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any /* @ts-ignore */) {
    console.error('Error fetching city users:', error);

    // Return mock data for development/demo purposes
    if (process.env.NODE_ENV !== 'production') {
      const dummyUsers = [
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@example.gov',
          role: 'admin',
          status: 'active',
          lastLogin: '2023-11-20T09:30:00Z',
          createdAt: '2023-01-15T00:00:00Z',
        },
        {
          id: 2,
          name: 'John Operator',
          email: 'john.operator@example.gov',
          role: 'operator',
          status: 'active',
          lastLogin: '2023-11-19T14:45:00Z',
          createdAt: '2023-02-10T00:00:00Z',
        },
        {
          id: 3,
          name: 'Sarah Inspector',
          email: 'sarah.inspector@example.gov',
          role: 'inspector',
          status: 'active',
          lastLogin: '2023-11-18T11:20:00Z',
          createdAt: '2023-03-05T00:00:00Z',
        },
        {
          id: 4,
          name: 'Mike Viewer',
          email: 'mike.viewer@example.gov',
          role: 'viewer',
          status: 'active',
          lastLogin: '2023-11-15T16:10:00Z',
          createdAt: '2023-04-20T00:00:00Z',
        },
        {
          id: 5,
          name: 'Jane Doe',
          email: 'jane.doe@example.gov',
          role: 'operator',
          status: 'inactive',
          lastLogin: '2023-10-05T10:30:00Z',
          createdAt: '2023-05-12T00:00:00Z',
        },
      ];

      return NextResponse.json({ users: dummyUsers });
    }

    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization token from the request headers
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token is required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Get request body
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.role || !body.password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Call the backend API to create a new city user
    const response = await fetch(`${process.env.BACKEND_URL}/api/city-users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.msg || 'Failed to create city user' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any /* @ts-ignore */) {
    console.error('Error creating city user:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
