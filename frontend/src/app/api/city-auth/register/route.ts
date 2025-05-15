import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, cityId, role } = await request.json();

    if (!name || !email || !password || !cityId || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, cityId, and role are required' },
        { status: 400 }
      );
    }

    // Validate email domain - only .gov domains are allowed
    if (!email.toLowerCase().endsWith('.gov')) {
      return NextResponse.json(
        { error: 'Only .gov email domains are allowed for city registration' },
        { status: 400 }
      );
    }

    // Call the backend API to register the city user
    const response = await fetch(`${process.env.BACKEND_URL}/api/city-auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        cityId,
        role,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.msg || 'Failed to register user' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('City user registration error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
