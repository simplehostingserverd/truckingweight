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
 * API handler for scales data
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

    // Query to get scales
    let query = supabase.from('scales').select('*');

    // If not admin, filter by company_id
    if (!isAdmin && companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query.order('name');

    if (error) {
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in scales API:', error);

    // Always use mock data in development mode or if there's an error
    if (process.env.NODE_ENV !== 'production' || error) {
      console.warn('Using mock data for scales');
      return NextResponse.json(getMockScales());
    } else {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}

// Mock data generator
function getMockScales() {
  return [
    {
      id: 1,
      name: 'Main Facility Scale',
      location: 'Warehouse A',
      scale_type: 'fixed',
      max_capacity: 80000,
      precision: 20,
      status: 'Active',
      company_id: 1,
      created_at: '2023-01-15T00:00:00Z',
      updated_at: '2023-01-15T00:00:00Z',
      calibration_date: '2023-05-15T00:00:00Z',
      next_calibration_date: '2023-11-15T00:00:00Z',
    },
    {
      id: 2,
      name: 'Distribution Center Scale',
      location: 'Distribution Center',
      scale_type: 'fixed',
      max_capacity: 100000,
      precision: 50,
      status: 'Active',
      company_id: 1,
      created_at: '2023-02-20T00:00:00Z',
      updated_at: '2023-02-20T00:00:00Z',
      calibration_date: '2023-06-22T00:00:00Z',
      next_calibration_date: '2023-12-22T00:00:00Z',
    },
    {
      id: 3,
      name: 'Mobile Scale Unit',
      location: 'Variable',
      scale_type: 'portable',
      max_capacity: 40000,
      precision: 10,
      status: 'Active',
      company_id: 1,
      created_at: '2023-03-10T00:00:00Z',
      updated_at: '2023-03-10T00:00:00Z',
      calibration_date: '2023-07-10T00:00:00Z',
      next_calibration_date: '2024-01-10T00:00:00Z',
    },
    {
      id: 4,
      name: 'Maintenance Scale',
      location: 'Maintenance Bay',
      scale_type: 'fixed',
      max_capacity: 60000,
      precision: 20,
      status: 'Maintenance',
      company_id: 1,
      created_at: '2023-04-05T00:00:00Z',
      updated_at: '2023-04-05T00:00:00Z',
      calibration_date: '2023-08-05T00:00:00Z',
      next_calibration_date: '2024-02-05T00:00:00Z',
    },
    {
      id: 5,
      name: 'Shipping Dock Scale',
      location: 'Shipping Dock',
      scale_type: 'fixed',
      max_capacity: 120000,
      precision: 100,
      status: 'Active',
      company_id: 1,
      created_at: '2023-05-15T00:00:00Z',
      updated_at: '2023-05-15T00:00:00Z',
      calibration_date: '2023-09-15T00:00:00Z',
      next_calibration_date: '2024-03-15T00:00:00Z',
    },
  ];
}
