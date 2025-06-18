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

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Await params before using its properties (Next.js 15 requirement)
  const resolvedParams = await params;
  const cameraId = resolvedParams.id;

  try {
    const supabase = createClient();

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

    // Get camera information
    const { data: camera, error: cameraError } = await supabase
      .from('lpr_cameras')
      .select('*')
      .eq('id', cameraId)
      .single();

    if (cameraError || !camera) {
      return NextResponse.json({ error: 'Camera not found' }, { status: 404 });
    }

    // Check if camera is active
    if (!camera.is_active) {
      return NextResponse.json({ error: 'Camera is not active' }, { status: 400 });
    }

    // Check permissions - admins can access all cameras, regular users only company cameras
    if (!userData.is_admin && camera.city_id !== null) {
      return NextResponse.json({ error: 'Access denied to this camera' }, { status: 403 });
    }

    // Simulate license plate capture
    // In a real implementation, this would connect to the actual camera API
    const success = Math.random() > 0.2; // 80% success rate

    if (success) {
      // Generate a realistic license plate
      const states = ['CA', 'TX', 'FL', 'NY', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
      const state = states[Math.floor(Math.random() * states.length)];
      const numbers = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
      const letters =
        String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
        String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
        String.fromCharCode(65 + Math.floor(Math.random() * 26));
      const licensePlate = `${state} ${numbers} ${letters}`;

      // Generate confidence score
      const confidence = 75 + Math.floor(Math.random() * 25); // 75-99%

      // Create capture result
      const captureResult = {
        success: true,
        licensePlate,
        confidence,
        timestamp: new Date().toISOString(),
        cameraId,
        imageUrl: `https://example.com/lpr/${cameraId}/${Date.now()}.jpg`, // Mock image URL
        rawData: {
          vendor: camera.vendor,
          captureTime: Date.now(),
          location: camera.location || 'Unknown',
          ipAddress: camera.ip_address,
        },
      };

      // In a real implementation, you would also save this capture to the database
      // For now, we'll just return the result

      return NextResponse.json(captureResult);
    } else {
      // Capture failed
      const captureResult = {
        success: false,
        timestamp: new Date().toISOString(),
        cameraId,
        error: 'Failed to recognize license plate - poor image quality or no vehicle detected',
        rawData: {
          vendor: camera.vendor,
          captureTime: Date.now(),
          location: camera.location || 'Unknown',
          ipAddress: camera.ip_address,
        },
      };

      return NextResponse.json(captureResult);
    }
  } catch (error) {
    console.error('Error in LPR capture API:', error);
    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        cameraId: cameraId,
        error: 'Internal server error during capture',
      },
      { status: 500 }
    );
  }
}
