import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock login API endpoint
 * This provides a temporary login mechanism while the backend is being developed
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // For demo purposes, accept any email with a password of "password"
    if (password === 'password') {
      // Create a mock user and session
      const user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email,
        name: 'Demo User',
        company_id: 1,
        is_admin: email.includes('admin')
      };

      // Return success response with mock session
      return NextResponse.json({
        user,
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_at: Date.now() + 3600 * 1000 // 1 hour from now
        }
      });
    }

    // Return error for invalid credentials
    return NextResponse.json(
      { error: 'Invalid login credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error in mock login API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
