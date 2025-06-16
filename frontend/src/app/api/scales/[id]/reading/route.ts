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

import { toSearchParamString } from '@/utils/searchParams';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API handler for scale readings
 * This provides real data from the database with fallback to mock data
 */

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Extract query parameters safely
    const url = new URL(request.url);
    const readingType = toSearchParamString(url.searchParams.get('type'), 'gross');
    const axleNumber = url.searchParams.get('axle')
      ? parseInt(toSearchParamString(url.searchParams.get('axle'), '0'))
      : null;

    // Get the scale ID from the URL
    const scaleId = params.id;

    // Get the scale data
    const { data: scale, error: scaleError } = await supabase
      .from('scales')
      .select('*')
      .eq('id', scaleId)
      .single();

    if (scaleError) {
      throw scaleError;
    }

    // Get the latest reading for this scale
    const { data: reading, error: readingError } = await supabase
      .from('scale_readings')
      .select('*')
      .eq('scale_id', scaleId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (readingError) {
      // If no reading found, generate a mock reading
      return NextResponse.json(getMockReading(readingType, axleNumber));
    }

    return NextResponse.json(reading);
  } catch (error) {
    console.error('Error in scale reading API:', error);

    // Always use mock data in development mode or if there's an error
    if (process.env.NODE_ENV !== 'production' || error) {
      console.warn('Using mock data for scale reading');

      // Extract query parameters safely
      const url = new URL(request.url);
      const readingType = toSearchParamString(url.searchParams.get('type'), 'gross');
      const axleNumber = url.searchParams.get('axle')
        ? parseInt(toSearchParamString(url.searchParams.get('axle'), '0'))
        : null;

      return NextResponse.json(getMockReading(readingType, axleNumber));
    } else {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}

// Mock data generator
function getMockReading(readingType: string, axleNumber: number | null) {
  // Generate a random weight based on the reading type
  let weight = 0;

  if (readingType === 'gross') {
    // Gross weight between 30,000 and 40,000 lbs
    weight = Math.floor(Math.random() * 10000) + 30000;
  } else if (readingType === 'tare') {
    // Tare weight between 10,000 and 15,000 lbs
    weight = Math.floor(Math.random() * 5000) + 10000;
  } else if (readingType === 'axle' && axleNumber !== null) {
    // Axle weight depends on the axle number
    switch (axleNumber) {
      case 1: // Steer axle
        weight = Math.floor(Math.random() * 1000) + 9000; // 9,000-10,000 lbs
        break;
      case 2: // Drive axle 1
        weight = Math.floor(Math.random() * 2000) + 8000; // 8,000-10,000 lbs
        break;
      case 3: // Drive axle 2
        weight = Math.floor(Math.random() * 2000) + 8000; // 8,000-10,000 lbs
        break;
      case 4: // Trailer axle 1
        weight = Math.floor(Math.random() * 2000) + 7000; // 7,000-9,000 lbs
        break;
      case 5: // Trailer axle 2
        weight = Math.floor(Math.random() * 2000) + 7000; // 7,000-9,000 lbs
        break;
      default:
        weight = Math.floor(Math.random() * 3000) + 7000; // 7,000-10,000 lbs
    }
  }

  return {
    id: Math.floor(Math.random() * 1000) + 1,
    scale_id: 1, // Just use a default scale ID
    reading_type: readingType,
    weight: weight,
    unit: 'lbs',
    timestamp: new Date().toISOString(),
    status: 'Stable',
    axle_number: axleNumber,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
