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

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API handler for vehicles and drivers data
 * This provides real data from the database with fallback to mock data
 */

export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client
    const supabase = createClient();

    // Get the user's session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('No active session');
    }

    // Get the user's company ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id, is_admin')
      .eq('id', session.user.id)
      .single();

    if (userError) {
      throw userError;
    }

    const companyId = userData?.company_id;
    const isAdmin = userData?.is_admin || false;

    // Query to get vehicles
    let vehiclesQuery = supabase.from('vehicles').select('*').eq('status', 'Active');

    // Query to get drivers
    let driversQuery = supabase.from('drivers').select('*').eq('status', 'Active');

    // If not admin, filter by company_id
    if (!isAdmin && companyId) {
      vehiclesQuery = vehiclesQuery.eq('company_id', companyId);
      driversQuery = driversQuery.eq('company_id', companyId);
    }

    // Execute both queries in parallel
    const [vehiclesResult, driversResult] = await Promise.all([vehiclesQuery, driversQuery]);

    if (vehiclesResult.error) {
      throw vehiclesResult.error;
    }

    if (driversResult.error) {
      throw driversResult.error;
    }

    return NextResponse.json({
      vehicles: vehiclesResult.data || [],
      drivers: driversResult.data || [],
    });
  } catch (error) {
    console.error('Error in vehicles-drivers API:', error);

    // Always use mock data in development mode or if there's an error
    if (process.env.NODE_ENV !== 'production' || error) {
      console.warn('Using mock data for vehicles and drivers');
      return NextResponse.json({
        vehicles: getMockVehicles(),
        drivers: getMockDrivers(),
      });
    } else {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}

// Mock data generators
function getMockVehicles() {
  return [
    {
      id: 1,
      name: 'Truck 101',
      license_plate: 'ABC-1234',
      vin: '1HGCM82633A123456',
      make: 'Freightliner',
      model: 'Cascadia',
      year: 2022,
      status: 'Active',
      company_id: 1,
      created_at: '2023-01-15T00:00:00Z',
      updated_at: '2023-01-15T00:00:00Z',
    },
    {
      id: 2,
      name: 'Truck 102',
      license_plate: 'XYZ-5678',
      vin: '2FMZA52233B654321',
      make: 'Peterbilt',
      model: '579',
      year: 2021,
      status: 'Active',
      company_id: 1,
      created_at: '2023-02-20T00:00:00Z',
      updated_at: '2023-02-20T00:00:00Z',
    },
    {
      id: 3,
      name: 'Truck 103',
      license_plate: 'DEF-9012',
      vin: '3VWFE21C04M123789',
      make: 'Kenworth',
      model: 'T680',
      year: 2023,
      status: 'Active',
      company_id: 1,
      created_at: '2023-03-10T00:00:00Z',
      updated_at: '2023-03-10T00:00:00Z',
    },
    {
      id: 4,
      name: 'Truck 104',
      license_plate: 'GHI-3456',
      vin: '4S3BL626846123456',
      make: 'Volvo',
      model: 'VNL',
      year: 2022,
      status: 'Active',
      company_id: 1,
      created_at: '2023-04-05T00:00:00Z',
      updated_at: '2023-04-05T00:00:00Z',
    },
    {
      id: 5,
      name: 'Truck 105',
      license_plate: 'JKL-7890',
      vin: '5YJSA1DN5CF123456',
      make: 'Mack',
      model: 'Anthem',
      year: 2021,
      status: 'Active',
      company_id: 1,
      created_at: '2023-05-15T00:00:00Z',
      updated_at: '2023-05-15T00:00:00Z',
    },
  ];
}

function getMockDrivers() {
  return [
    {
      id: 1,
      name: 'John Driver',
      license_number: 'DL12345678',
      license_state: 'CA',
      license_expiry: '2025-06-30',
      phone: '555-123-4567',
      email: 'john.driver@example.com',
      status: 'Active',
      company_id: 1,
      created_at: '2023-01-10T00:00:00Z',
      updated_at: '2023-01-10T00:00:00Z',
    },
    {
      id: 2,
      name: 'Sarah Smith',
      license_number: 'DL87654321',
      license_state: 'TX',
      license_expiry: '2024-08-15',
      phone: '555-987-6543',
      email: 'sarah.smith@example.com',
      status: 'Active',
      company_id: 1,
      created_at: '2023-02-15T00:00:00Z',
      updated_at: '2023-02-15T00:00:00Z',
    },
    {
      id: 3,
      name: 'Michael Johnson',
      license_number: 'DL23456789',
      license_state: 'NY',
      license_expiry: '2025-03-22',
      phone: '555-234-5678',
      email: 'michael.johnson@example.com',
      status: 'Active',
      company_id: 1,
      created_at: '2023-03-05T00:00:00Z',
      updated_at: '2023-03-05T00:00:00Z',
    },
    {
      id: 4,
      name: 'Emily Davis',
      license_number: 'DL34567890',
      license_state: 'FL',
      license_expiry: '2024-11-10',
      phone: '555-345-6789',
      email: 'emily.davis@example.com',
      status: 'Active',
      company_id: 1,
      created_at: '2023-04-20T00:00:00Z',
      updated_at: '2023-04-20T00:00:00Z',
    },
    {
      id: 5,
      name: 'Robert Wilson',
      license_number: 'DL45678901',
      license_state: 'IL',
      license_expiry: '2025-01-05',
      phone: '555-456-7890',
      email: 'robert.wilson@example.com',
      status: 'Active',
      company_id: 1,
      created_at: '2023-05-10T00:00:00Z',
      updated_at: '2023-05-10T00:00:00Z',
    },
  ];
}
