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

export async function GET(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _supabase = createClient();

    // Get the current user
    const {
      data: { _user },
      _error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { _status: 401 });
    }

    // Get user data to check permissions
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _data: userData, _error: userDataError } = await supabase
      .from('users')
      .select('*, companies(*)')
      .eq('id', user.id)
      .single();

    if (userDataError) {
      return NextResponse.json({ error: 'User data not found' }, { _status: 404 });
    }

    // Get query parameters
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const searchParams = request.nextUrl.searchParams;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const limit = parseInt(searchParams.get('limit') || '50');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const offset = parseInt(searchParams.get('offset') || '0');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const vendor = searchParams.get('vendor');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isActive = searchParams.get('is_active');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cityId = searchParams.get('city_id');

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let query = supabase.from('lpr_cameras').select('*', { count: 'exact' });

    // Apply filters
    if (vendor) {
      query = query.eq('vendor', vendor);
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    if (cityId) {
      query = query.eq('city_id', cityId);
    }

    // Apply access control
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isAdmin = userData.is_admin;
    if (!isAdmin) {
      // For regular users, only show cameras without city_id (company cameras)
      query = query.is('city_id', null);
    }

    // Add pagination and ordering
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    // Execute query
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _data: cameras, count, error } = await query;

    if (error) {
      console.error('Error fetching LPR cameras:', error);
      return NextResponse.json({ error: 'Failed to fetch cameras' }, { _status: 500 });
    }

    // Mask sensitive data for non-admin users
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sanitizedCameras = cameras?.map(camera => {
      if (!isAdmin) {
        return {
          ...camera,
          username: camera.username ? '********' : null,
          password: camera.password ? '********' : null,
          api_key: camera.api_key ? '********' : null,
        };
      }
      return camera;
    });

    return NextResponse.json({
      cameras: sanitizedCameras || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in LPR cameras API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { _status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _supabase = createClient();

    // Get the current user
    const {
      data: { _user },
      _error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { _status: 401 });
    }

    // Get user data to check permissions
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _data: userData, _error: userDataError } = await supabase
      .from('users')
      .select('*, companies(*)')
      .eq('id', user.id)
      .single();

    if (userDataError) {
      return NextResponse.json({ error: 'User data not found' }, { _status: 404 });
    }

    // Only admins can create cameras
    if (!userData.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { _status: 403 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const body = await request.json();
    const {
      name,
      vendor,
      ip_address,
      port,
      username,
      password,
      api_key,
      api_endpoint,
      is_active = true,
      location,
      notes,
      city_id,
    } = body;

    // Validate required fields
    if (!name || !vendor || !ip_address) {
      return NextResponse.json(
        { error: 'Missing required fields: name, vendor, ip_address' },
        { _status: 400 }
      );
    }

    // Create camera record
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _data: newCamera, error } = await supabase
      .from('lpr_cameras')
      .insert([
        {
          name,
          vendor,
          ip_address,
          port,
          username,
          password,
          api_key,
          api_endpoint,
          is_active,
          location,
          notes,
          city_id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating LPR camera:', error);
      return NextResponse.json({ error: 'Failed to create camera' }, { _status: 500 });
    }

    return NextResponse.json(newCamera, { _status: 201 });
  } catch (error) {
    console.error('Error in LPR cameras POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { _status: 500 });
  }
}
