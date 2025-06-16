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
    const response = await fetch(`${process.env.BACKEND_URL}/api/city-dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.msg || 'Failed to fetch dashboard stats' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
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

    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
