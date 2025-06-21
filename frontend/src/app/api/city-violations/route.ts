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

    // Get query parameters
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const searchParams = request.nextUrl.searchParams;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _status = searchParams.get('status');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _violationType = searchParams.get('violationType');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const limit = searchParams.get('limit') || '20';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const offset = searchParams.get('offset') || '0';

    // Check if this is a test token
    if (token.startsWith('test-city-token-')) {
      console.warn('Using test data for city violations');

      // Mock data
      const dummyViolations = [
        {
          id: 1,
          violationNumber: 'V-2023-001',
          companyName: 'Heavy Haulers Inc.',
          vehicleInfo: 'Peterbilt 389 - TX12345',
          violationType: 'overweight',
          violationDate: '2023-11-05',
          location: '123 Main St',
          weight: 105000,
          permittedWeight: 95000,
          overageAmount: 10000,
          fineAmount: 500.0,
          paymentStatus: 'Paid',
          status: 'Closed',
          notes: 'Driver acknowledged violation and paid fine on site.',
          createdAt: '2023-11-05T10:30:00Z',
        },
        {
          id: 2,
          violationNumber: 'V-2023-002',
          companyName: 'Wide Load Transport',
          vehicleInfo: 'Kenworth T800 - TX54321',
          violationType: 'oversize',
          violationDate: '2023-11-08',
          location: '456 Highway 10',
          dimensions: {
            width: 14,
            permittedWidth: 12,
            overageAmount: 2,
          },
          fineAmount: 350.0,
          paymentStatus: 'Pending',
          status: 'Open',
          notes: 'Citation issued, awaiting payment.',
          createdAt: '2023-11-08T14:15:00Z',
        },
        {
          id: 3,
          violationNumber: 'V-2023-003',
          companyName: 'Construction Materials Co.',
          vehicleInfo: 'Mack Granite - TX98765',
          violationType: 'no_permit',
          violationDate: '2023-11-10',
          location: '789 Center Ave',
          weight: 88000,
          fineAmount: 750.0,
          paymentStatus: 'Pending',
          status: 'Open',
          notes: 'Vehicle had no valid permit for weight. Driver claimed unaware of requirements.',
          createdAt: '2023-11-10T09:45:00Z',
        },
        {
          id: 4,
          violationNumber: 'V-2023-004',
          companyName: 'Mega Movers LLC',
          vehicleInfo: 'Freightliner Cascadia - TX24680',
          violationType: 'both',
          violationDate: '2023-10-20',
          location: 'Industrial Park Scale',
          weight: 110000,
          permittedWeight: 105000,
          overageAmount: 5000,
          dimensions: {
            height: 16,
            permittedHeight: 15,
            overageAmount: 1,
          },
          fineAmount: 850.0,
          paymentStatus: 'Paid',
          status: 'Closed',
          notes: 'Multiple violations. Company representative came to pay fine.',
          createdAt: '2023-10-20T11:20:00Z',
        },
        {
          id: 5,
          violationNumber: 'V-2023-005',
          companyName: 'Texas Wind Turbines',
          vehicleInfo: 'Volvo VNL - TX13579',
          violationType: 'expired_permit',
          violationDate: '2023-11-16',
          location: 'Highway 10 Scale',
          dimensions: {
            length: 110,
            width: 16,
            height: 16,
          },
          fineAmount: 400.0,
          paymentStatus: 'Disputed',
          status: 'Under Review',
          notes: "Company claims they filed for renewal but hasn't been processed yet.",
          createdAt: '2023-11-16T16:30:00Z',
        },
      ];

      // Apply filters if provided
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let filteredViolations = [...dummyViolations];

      if (status) {
        filteredViolations = filteredViolations.filter(
          violation => violation.status.toLowerCase() === status.toLowerCase()
        );
      }

      if (violationType) {
        filteredViolations = filteredViolations.filter(
          violation => violation.violationType.toLowerCase() === violationType.toLowerCase()
        );
      }

      // Apply pagination
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const limitNum = parseInt(limit);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const offsetNum = parseInt(offset);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const paginatedViolations = filteredViolations.slice(offsetNum, offsetNum + limitNum);

      return NextResponse.json({
        violations: paginatedViolations,
        total: filteredViolations.length,
      });
    }

    // Call the backend API to get city violations
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let url = `${process.env.BACKEND_URL}/api/city-violations?limit=${limit}&offset=${offset}`;

    if (status) {
      url += `&status=${_status}`;
    }

    if (violationType) {
      url += `&violationType=${_violationType}`;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { _error: data.msg || 'Failed to fetch city violations' },
        { _status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (_error: unknown) {
    console.error('Error fetching city violations:', error);

    // Return mock data for development/demo purposes
    if (process.env.NODE_ENV !== 'production') {
      const dummyViolations = [
        {
          id: 1,
          violationNumber: 'V-2023-001',
          companyName: 'Heavy Haulers Inc.',
          vehicleInfo: 'Peterbilt 389 - TX12345',
          violationType: 'overweight',
          violationDate: '2023-11-05',
          location: '123 Main St',
          weight: 105000,
          permittedWeight: 95000,
          overageAmount: 10000,
          fineAmount: 500.0,
          paymentStatus: 'Paid',
          status: 'Closed',
          notes: 'Driver acknowledged violation and paid fine on site.',
          createdAt: '2023-11-05T10:30:00Z',
        },
        {
          id: 2,
          violationNumber: 'V-2023-002',
          companyName: 'Wide Load Transport',
          vehicleInfo: 'Kenworth T800 - TX54321',
          violationType: 'oversize',
          violationDate: '2023-11-08',
          location: '456 Highway 10',
          dimensions: {
            width: 14,
            permittedWidth: 12,
            overageAmount: 2,
          },
          fineAmount: 350.0,
          paymentStatus: 'Pending',
          status: 'Open',
          notes: 'Citation issued, awaiting payment.',
          createdAt: '2023-11-08T14:15:00Z',
        },
        {
          id: 3,
          violationNumber: 'V-2023-003',
          companyName: 'Construction Materials Co.',
          vehicleInfo: 'Mack Granite - TX98765',
          violationType: 'no_permit',
          violationDate: '2023-11-10',
          location: '789 Center Ave',
          weight: 88000,
          fineAmount: 750.0,
          paymentStatus: 'Pending',
          status: 'Open',
          notes: 'Vehicle had no valid permit for weight. Driver claimed unaware of requirements.',
          createdAt: '2023-11-10T09:45:00Z',
        },
        {
          id: 4,
          violationNumber: 'V-2023-004',
          companyName: 'Mega Movers LLC',
          vehicleInfo: 'Freightliner Cascadia - TX24680',
          violationType: 'both',
          violationDate: '2023-10-20',
          location: 'Industrial Park Scale',
          weight: 110000,
          permittedWeight: 105000,
          overageAmount: 5000,
          dimensions: {
            height: 16,
            permittedHeight: 15,
            overageAmount: 1,
          },
          fineAmount: 850.0,
          paymentStatus: 'Paid',
          status: 'Closed',
          notes: 'Multiple violations. Company representative came to pay fine.',
          createdAt: '2023-10-20T11:20:00Z',
        },
        {
          id: 5,
          violationNumber: 'V-2023-005',
          companyName: 'Texas Wind Turbines',
          vehicleInfo: 'Volvo VNL - TX13579',
          violationType: 'expired_permit',
          violationDate: '2023-11-16',
          location: 'Highway 10 Scale',
          dimensions: {
            length: 110,
            width: 16,
            height: 16,
          },
          fineAmount: 400.0,
          paymentStatus: 'Disputed',
          status: 'Under Review',
          notes: "Company claims they filed for renewal but hasn't been processed yet.",
          createdAt: '2023-11-16T16:30:00Z',
        },
      ];

      return NextResponse.json({
        violations: dummyViolations,
        total: dummyViolations.length,
      });
    }

    return NextResponse.json({ _error: _error.message || 'Internal server error' }, { _status: 500 });
  }
}
