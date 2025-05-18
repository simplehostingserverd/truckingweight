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
      console.log('Using test data for city dashboard compliance data');

      // Generate dummy compliance data
      const labels = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });

      const compliant = Array.from({ length: 30 }, () => Math.floor(Math.random() * 20) + 10);
      const nonCompliant = Array.from({ length: 30 }, () => Math.floor(Math.random() * 5));
      const warning = Array.from({ length: 30 }, () => Math.floor(Math.random() * 3));

      return NextResponse.json({ labels, compliant, nonCompliant, warning });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const days = searchParams.get('days') || '30';

    // Call the backend API to get compliance data
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/city-dashboard/compliance-data?days=${days}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.msg || 'Failed to fetch compliance data' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any /* @ts-ignore */ ) {
    console.error('Error fetching compliance data:', error);

    // Return mock data for development/demo purposes
    if (process.env.NODE_ENV !== 'production') {
      // Generate dummy compliance data
      const labels = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });

      const compliant = Array.from({ length: 30 }, () => Math.floor(Math.random() * 20) + 10);
      const nonCompliant = Array.from({ length: 30 }, () => Math.floor(Math.random() * 5));
      const warning = Array.from({ length: 30 }, () => Math.floor(Math.random() * 3));

      return NextResponse.json({ labels, compliant, nonCompliant, warning });
    }

    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
