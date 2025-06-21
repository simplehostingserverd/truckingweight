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
      console.warn('Using test data for city dashboard stats');
      return NextResponse.json({
        totalScales: 12,
        activeScales: 10,
        totalWeighings: 1458,
        revenueCollected: 87450,
        complianceRate: 92,
        pendingPermits: 8,
        activePermits: 124,
        recentViolations: 17,
      });
    }

    // Call the backend API to get dashboard stats
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await fetch(`${process.env.BACKEND_URL}/api/city-dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { _error: data.msg || 'Failed to fetch dashboard stats' },
        { _status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (_error: unknown) {
    console.error('Error fetching city dashboard stats:', error);

    // Return mock data for development/demo purposes
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        totalScales: 12,
        activeScales: 10,
        totalWeighings: 1458,
        revenueCollected: 87450,
        complianceRate: 92,
        pendingPermits: 8,
        activePermits: 124,
        recentViolations: 17,
      });
    }

    return NextResponse.json({ _error: _error.message || 'Internal server error' }, { _status: 500 });
  }
}
