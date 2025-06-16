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
      console.log('Using test data for city user');

      // Try to extract city info from token
      let cityId = 1; // Default to Houston
      let cityName = 'Houston';

      if (token.includes('sanantonio')) {
        cityId = 2;
        cityName = 'San Antonio';
      }

      // Return mock user data
      return NextResponse.json({
        user: {
          id: token.split('-').pop(),
          name: token.includes('sanantonio') ? 'San Antonio Admin' : 'Houston Admin',
          email: token.includes('sanantonio')
            ? 'sanantonio.admin@example.gov'
            : 'houston.admin@example.gov',
          cityId: cityId,
          role: 'admin',
          city: {
            name: cityName,
            state: 'TX',
          },
        },
      });
    }

    // Call the backend API to get the current user
    const response = await fetch(`${process.env.BACKEND_URL}/api/city-auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.msg || 'Failed to fetch user data' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any /* @ts-ignore */) {
    console.error('Error fetching city user data:', error);

    // Return mock data for development/demo purposes
    if (process.env.NODE_ENV !== 'production') {
      // Try to get user from localStorage if running in browser
      let cityUser = null;

      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('cityUser');
        if (storedUser) {
          try {
            cityUser = JSON.parse(storedUser);
          } catch (e) {
            console.error('Error parsing stored city user:', e);
          }
        }
      }

      // If no stored user, create a dummy one
      if (!cityUser) {
        cityUser = {
          id: 'city-user-123',
          name: 'City Admin',
          email: 'cityadmin@example.gov',
          cityId: 1,
          role: 'admin',
          city: {
            name: 'Austin',
            state: 'TX',
          },
        };
      }

      return NextResponse.json({ user: cityUser });
    }

    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
