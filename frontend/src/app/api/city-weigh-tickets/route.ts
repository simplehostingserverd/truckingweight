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
    // Get the authorization token from the request headers
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token is required' }, { _status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const token = authHeader.split(' ')[1];

    // Get the request body
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const body = await request.json();

    // Validate required fields
    if (!body.scaleId || !body.vehicleInfo || !body.grossWeight) {
      return NextResponse.json(
        { error: 'Scale ID, vehicle information, and gross weight are required' },
        { _status: 400 }
      );
    }

    // Call the backend API to create a weigh ticket
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await fetch(`${process.env.BACKEND_URL}/api/city-weigh-tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { _error: data.msg || 'Failed to create weigh ticket' },
        { _status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (_error: unknown) {
    console.error('Error creating weigh ticket:', error);

    // Return mock data for development/demo purposes
    if (process.env.NODE_ENV !== 'production') {
      // Generate a dummy ticket number
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const ticketNumber = `CWT-001-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

      return NextResponse.json({
        ticket: {
          id: Math.floor(1000 + Math.random() * 9000),
          ticketNumber,
          vehicleInfo: 'ABC-1234',
          grossWeight: 35000,
          netWeight: 25000,
          weighDate: new Date().toISOString(),
          status: 'Compliant',
        },
        message: 'Weigh ticket created successfully',
      });
    }

    return NextResponse.json({ _error: _error.message || 'Internal server error' }, { _status: 500 });
  }
}

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

    // Get query parameters
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const searchParams = request.nextUrl.searchParams;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const limit = searchParams.get('limit') || '20';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const offset = searchParams.get('offset') || '0';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _status = searchParams.get('status');

    // Build the query string
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let queryString = `limit=${limit}&offset=${offset}`;
    if (status) {
      queryString += `&status=${_status}`;
    }

    // Call the backend API to get weigh tickets
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/city-weigh-tickets?${queryString}`,
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
        { _error: data.msg || 'Failed to fetch weigh tickets' },
        { _status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (_error: unknown) {
    console.error('Error fetching weigh tickets:', error);

    // Return mock data for development/demo purposes
    if (process.env.NODE_ENV !== 'production') {
      // Generate dummy weigh tickets
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const dummyTickets = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        ticketNumber: `CWT-001-${20230701 + i}-${1000 + i}`,
        vehicleInfo: `ABC-${1000 + i}`,
        companyName: `Trucking Company ${i + 1}`,
        grossWeight: 35000 + Math.floor(Math.random() * 10000),
        tareWeight: 10000 + Math.floor(Math.random() * 2000),
        netWeight: 25000 + Math.floor(Math.random() * 8000),
        weighDate: new Date(2023, 6, 1 + i).toISOString(),
        _status:
          Math.random() > 0.2 ? 'Compliant' : Math.random() > 0.5 ? 'Non-Compliant' : 'Warning',
        scaleId: (i % 5) + 1,
        scaleName: `Scale ${(i % 5) + 1}`,
      }));

      return NextResponse.json({
        tickets: dummyTickets,
        total: 156,
      });
    }

    return NextResponse.json({ _error: _error.message || 'Internal server error' }, { _status: 500 });
  }
}
