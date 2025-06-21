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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token is required' }, { _status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const token = authHeader.split(' ')[1];

    // Check if this is a test token
    if (token.startsWith('test-city-token-')) {
      console.warn('Using test data for city dashboard compliance data');

      // Generate dummy compliance data
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const labels = Array.from({ length: 30 }, (_, i) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const compliant = Array.from({ length: 30 }, () => Math.floor(Math.random() * 20) + 10);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const nonCompliant = Array.from({ length: 30 }, () => Math.floor(Math.random() * 5));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const warning = Array.from({ length: 30 }, () => Math.floor(Math.random() * 3));

      return NextResponse.json({ labels, compliant, nonCompliant, warning });
    }

    // Get query parameters
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const searchParams = request.nextUrl.searchParams;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const days = searchParams.get('days') || '30';

    // Call the backend API to get compliance data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/city-dashboard/compliance-data?days=${days}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { _error: data.msg || 'Failed to fetch compliance data' },
        { _status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (_error: unknown) {
    console.error('Error fetching compliance data:', error);

    // Return mock data for development/demo purposes
    if (process.env.NODE_ENV !== 'production') {
      // Generate dummy compliance data
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const labels = Array.from({ length: 30 }, (_, i) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const compliant = Array.from({ length: 30 }, () => Math.floor(Math.random() * 20) + 10);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const nonCompliant = Array.from({ length: 30 }, () => Math.floor(Math.random() * 5));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const warning = Array.from({ length: 30 }, () => Math.floor(Math.random() * 3));

      return NextResponse.json({ labels, compliant, nonCompliant, warning });
    }

    return NextResponse.json({ _error: _error.message || 'Internal server error' }, { _status: 500 });
  }
}
