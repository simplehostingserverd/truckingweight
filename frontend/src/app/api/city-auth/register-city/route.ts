import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { name, state, zip_code, address, contact_email, contact_phone } = await request.json();

    if (!name || !state) {
      return NextResponse.json(
        { error: 'City name and state are required' },
        { status: 400 }
      );
    }

    // Call the backend API to register the city
    const response = await fetch(`${process.env.BACKEND_URL}/api/city-auth/register-city`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        state,
        zip_code,
        address,
        contact_email,
        contact_phone,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.msg || 'Failed to register city' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('City registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
