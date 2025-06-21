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
    const permitType = searchParams.get('permitType');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const limit = searchParams.get('limit') || '20';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const offset = searchParams.get('offset') || '0';

    // Check if this is a test token
    if (token.startsWith('test-city-token-')) {
      console.warn('Using test data for city permits');

      // Mock data
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const dummyPermits = [
        {
          id: 1,
          permitNumber: 'OW-2023-001',
          companyName: 'Heavy Haulers Inc.',
          vehicleInfo: 'Peterbilt 389 - TX12345',
          permitType: 'overweight',
          maxWeight: 95000,
          startDate: '2023-11-01',
          endDate: '2023-12-01',
          feeAmount: 250.0,
          paymentStatus: 'Paid',
          status: 'Active',
          createdAt: '2023-10-28T10:30:00Z',
        },
        {
          id: 2,
          permitNumber: 'OS-2023-002',
          companyName: 'Wide Load Transport',
          vehicleInfo: 'Kenworth T800 - TX54321',
          permitType: 'oversize',
          dimensions: {
            length: 75,
            width: 12,
            height: 14,
          },
          startDate: '2023-11-05',
          endDate: '2023-12-05',
          feeAmount: 300.0,
          paymentStatus: 'Paid',
          status: 'Active',
          createdAt: '2023-11-01T14:15:00Z',
        },
        {
          id: 3,
          permitNumber: 'OW-2023-003',
          companyName: 'Construction Materials Co.',
          vehicleInfo: 'Mack Granite - TX98765',
          permitType: 'overweight',
          maxWeight: 88000,
          startDate: '2023-11-10',
          endDate: '2023-12-10',
          feeAmount: 225.0,
          paymentStatus: 'Pending',
          status: 'Pending',
          createdAt: '2023-11-08T09:45:00Z',
        },
        {
          id: 4,
          permitNumber: 'OB-2023-004',
          companyName: 'Mega Movers LLC',
          vehicleInfo: 'Freightliner Cascadia - TX24680',
          permitType: 'both',
          maxWeight: 105000,
          dimensions: {
            length: 85,
            width: 14,
            height: 15,
          },
          startDate: '2023-10-15',
          endDate: '2023-11-15',
          feeAmount: 450.0,
          paymentStatus: 'Paid',
          status: 'Expired',
          createdAt: '2023-10-10T11:20:00Z',
        },
        {
          id: 5,
          permitNumber: 'OS-2023-005',
          companyName: 'Texas Wind Turbines',
          vehicleInfo: 'Volvo VNL - TX13579',
          permitType: 'oversize',
          dimensions: {
            length: 110,
            width: 16,
            height: 16,
          },
          startDate: '2023-11-20',
          endDate: '2023-12-20',
          feeAmount: 500.0,
          paymentStatus: 'Pending',
          status: 'Pending',
          createdAt: '2023-11-15T16:30:00Z',
        },
      ];

      // Apply filters if provided
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let filteredPermits = [...dummyPermits];

      if (status) {
        filteredPermits = filteredPermits.filter(
          permit => permit.status.toLowerCase() === status.toLowerCase()
        );
      }

      if (permitType) {
        filteredPermits = filteredPermits.filter(
          permit => permit.permitType.toLowerCase() === permitType.toLowerCase()
        );
      }

      // Apply pagination
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const limitNum = parseInt(limit);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const offsetNum = parseInt(offset);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const paginatedPermits = filteredPermits.slice(offsetNum, offsetNum + limitNum);

      return NextResponse.json({
        permits: paginatedPermits,
        total: filteredPermits.length,
      });
    }

    // Call the backend API to get city permits
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let url = `${process.env.BACKEND_URL}/api/city-permits?limit=${limit}&offset=${offset}`;

    if (status) {
      url += `&status=${_status}`;
    }

    if (permitType) {
      url += `&permitType=${permitType}`;
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
        { _error: data.msg || 'Failed to fetch city permits' },
        { _status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (_error: unknown) {
    console.error('Error fetching city permits:', error);

    // Return mock data for development/demo purposes
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const dummyPermits = [
        {
          id: 1,
          permitNumber: 'OW-2023-001',
          companyName: 'Heavy Haulers Inc.',
          vehicleInfo: 'Peterbilt 389 - TX12345',
          permitType: 'overweight',
          maxWeight: 95000,
          startDate: '2023-11-01',
          endDate: '2023-12-01',
          feeAmount: 250.0,
          paymentStatus: 'Paid',
          status: 'Active',
          createdAt: '2023-10-28T10:30:00Z',
        },
        {
          id: 2,
          permitNumber: 'OS-2023-002',
          companyName: 'Wide Load Transport',
          vehicleInfo: 'Kenworth T800 - TX54321',
          permitType: 'oversize',
          dimensions: {
            length: 75,
            width: 12,
            height: 14,
          },
          startDate: '2023-11-05',
          endDate: '2023-12-05',
          feeAmount: 300.0,
          paymentStatus: 'Paid',
          status: 'Active',
          createdAt: '2023-11-01T14:15:00Z',
        },
        {
          id: 3,
          permitNumber: 'OW-2023-003',
          companyName: 'Construction Materials Co.',
          vehicleInfo: 'Mack Granite - TX98765',
          permitType: 'overweight',
          maxWeight: 88000,
          startDate: '2023-11-10',
          endDate: '2023-12-10',
          feeAmount: 225.0,
          paymentStatus: 'Pending',
          status: 'Pending',
          createdAt: '2023-11-08T09:45:00Z',
        },
        {
          id: 4,
          permitNumber: 'OB-2023-004',
          companyName: 'Mega Movers LLC',
          vehicleInfo: 'Freightliner Cascadia - TX24680',
          permitType: 'both',
          maxWeight: 105000,
          dimensions: {
            length: 85,
            width: 14,
            height: 15,
          },
          startDate: '2023-10-15',
          endDate: '2023-11-15',
          feeAmount: 450.0,
          paymentStatus: 'Paid',
          status: 'Expired',
          createdAt: '2023-10-10T11:20:00Z',
        },
        {
          id: 5,
          permitNumber: 'OS-2023-005',
          companyName: 'Texas Wind Turbines',
          vehicleInfo: 'Volvo VNL - TX13579',
          permitType: 'oversize',
          dimensions: {
            length: 110,
            width: 16,
            height: 16,
          },
          startDate: '2023-11-20',
          endDate: '2023-12-20',
          feeAmount: 500.0,
          paymentStatus: 'Pending',
          status: 'Pending',
          createdAt: '2023-11-15T16:30:00Z',
        },
      ];

      return NextResponse.json({
        permits: dummyPermits,
        total: dummyPermits.length,
      });
    }

    return NextResponse.json({ _error: _error.message || 'Internal server error' }, { _status: 500 });
  }
}
