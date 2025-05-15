import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization token from the request headers
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token is required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Check if this is a test token
    if (token.startsWith('test-city-token-')) {
      console.log('Using test data for city profile');

      // Mock data
      const dummyProfile = {
        id: 1,
        name: 'Houston',
        state: 'TX',
        country: 'USA',
        address: '901 Bagby St',
        zip_code: '77002',
        contact_email: 'info@houston.gov',
        contact_phone: '(713) 837-0311',
        website: 'https://www.houstontx.gov',
        logo_url: '/images/houston-logo.png',
        status: 'Active',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-11-15T00:00:00Z',
      };

      return NextResponse.json({ city: dummyProfile });
    }

    // Call the backend API to get city profile
    const response = await fetch(`${process.env.BACKEND_URL}/api/city-profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.msg || 'Failed to fetch city profile' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching city profile:', error);

    // Return mock data for development/demo purposes
    if (process.env.NODE_ENV !== 'production') {
      const dummyProfile = {
        id: 1,
        name: 'Houston',
        state: 'TX',
        country: 'USA',
        address: '901 Bagby St',
        zip_code: '77002',
        contact_email: 'info@houston.gov',
        contact_phone: '(713) 837-0311',
        website: 'https://www.houstontx.gov',
        logo_url: '/images/houston-logo.png',
        status: 'Active',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-11-15T00:00:00Z',
      };

      return NextResponse.json({ city: dummyProfile });
    }

    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the authorization token from the request headers
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token is required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Get request body
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.state) {
      return NextResponse.json({ error: 'City name and state are required' }, { status: 400 });
    }

    // For development/demo purposes, handle the request locally if no backend URL
    if (!process.env.BACKEND_URL || process.env.NODE_ENV !== 'production') {
      console.log('Using mock data for city profile update');

      // Create updated profile with the provided data
      const updatedProfile = {
        id: 1,
        name: body.name,
        state: body.state,
        country: body.country || 'USA',
        address: body.address || '',
        zip_code: body.zip_code || '',
        contact_email: body.contact_email || '',
        contact_phone: body.contact_phone || '',
        website: body.website || '',
        logo_url: body.logo_url || '/images/houston-logo.png',
        status: 'Active',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
      };

      return NextResponse.json({ city: updatedProfile });
    }

    // Call the backend API to update city profile
    const response = await fetch(`${process.env.BACKEND_URL}/api/city-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.msg || 'Failed to update city profile' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating city profile:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
