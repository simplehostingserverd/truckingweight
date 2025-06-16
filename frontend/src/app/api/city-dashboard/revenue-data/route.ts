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
      console.log('Using test data for city dashboard revenue data');

      // Generate dummy revenue data
      const monthLabels = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return date.toLocaleString('default', { month: 'short', year: 'numeric' });
      });

      const permitRevenue = Array.from(
        { length: 6 },
        () => Math.floor(Math.random() * 10000) + 5000
      );
      const fineRevenue = Array.from({ length: 6 }, () => Math.floor(Math.random() * 5000) + 1000);

      return NextResponse.json({
        labels: monthLabels,
        permitRevenue,
        fineRevenue,
      });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const months = searchParams.get('months') || '6';

    // Call the backend API to get revenue data
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/city-dashboard/revenue-data?months=${months}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.msg || 'Failed to fetch revenue data' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any /* @ts-ignore */) {
    console.error('Error fetching revenue data:', error);

    // Return mock data for development/demo purposes
    if (process.env.NODE_ENV !== 'production') {
      // Generate dummy revenue data
      const monthLabels = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return date.toLocaleString('default', { month: 'short', year: 'numeric' });
      });

      const permitRevenue = Array.from(
        { length: 6 },
        () => Math.floor(Math.random() * 10000) + 5000
      );
      const fineRevenue = Array.from({ length: 6 }, () => Math.floor(Math.random() * 5000) + 1000);

      return NextResponse.json({
        labels: monthLabels,
        permitRevenue,
        fineRevenue,
      });
    }

    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
