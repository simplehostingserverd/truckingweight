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
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const cameraId = params.id;

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get camera
    const { data: camera, error } = await supabase
      .from('lpr_cameras')
      .select('*')
      .eq('id', cameraId)
      .single();

    if (error || !camera) {
      return NextResponse.json({ error: 'Camera not found' }, { status: 404 });
    }

    return NextResponse.json(camera);
  } catch (error) {
    console.error('Error in LPR camera GET API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const cameraId = params.id;

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data to check permissions
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('*, companies(*)')
      .eq('id', user.id)
      .single();

    if (userDataError) {
      return NextResponse.json({ error: 'User data not found' }, { status: 404 });
    }

    // Only admins can update cameras
    if (!userData.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

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
      is_active,
      location,
      notes,
      city_id,
    } = body;

    // Validate required fields
    if (!name || !vendor || !ip_address) {
      return NextResponse.json(
        { error: 'Missing required fields: name, vendor, ip_address' },
        { status: 400 }
      );
    }

    // Update camera record
    const { data: updatedCamera, error } = await supabase
      .from('lpr_cameras')
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq('id', cameraId)
      .select()
      .single();

    if (error) {
      console.error('Error updating LPR camera:', error);
      return NextResponse.json({ error: 'Failed to update camera' }, { status: 500 });
    }

    return NextResponse.json(updatedCamera);
  } catch (error) {
    console.error('Error in LPR camera PUT API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const cameraId = params.id;

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data to check permissions
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('*, companies(*)')
      .eq('id', user.id)
      .single();

    if (userDataError) {
      return NextResponse.json({ error: 'User data not found' }, { status: 404 });
    }

    // Only admins can delete cameras
    if (!userData.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check if camera exists
    const { data: camera, error: checkError } = await supabase
      .from('lpr_cameras')
      .select('id')
      .eq('id', cameraId)
      .single();

    if (checkError || !camera) {
      return NextResponse.json({ error: 'Camera not found' }, { status: 404 });
    }

    // Delete camera record
    const { error } = await supabase
      .from('lpr_cameras')
      .delete()
      .eq('id', cameraId);

    if (error) {
      console.error('Error deleting LPR camera:', error);
      return NextResponse.json({ error: 'Failed to delete camera' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Camera deleted successfully' });
  } catch (error) {
    console.error('Error in LPR camera DELETE API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
