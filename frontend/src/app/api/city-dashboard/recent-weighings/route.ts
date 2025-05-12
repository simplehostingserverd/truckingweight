import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization token from the request headers
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token is required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '10';
    
    // Call the backend API to get recent weighings
    const response = await fetch(`${process.env.BACKEND_URL}/api/city-dashboard/recent-weighings?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.msg || 'Failed to fetch recent weighings' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching recent weighings:', error);
    
    // Return mock data for development/demo purposes
    if (process.env.NODE_ENV !== 'production') {
      // Generate dummy recent weighings
      const dummyWeighings = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        ticketNumber: `CWT-001-${20230701 + i}-${1000 + i}`,
        vehicleInfo: `ABC-${1000 + i}`,
        companyName: `Trucking Company ${i + 1}`,
        grossWeight: 35000 + Math.floor(Math.random() * 10000),
        netWeight: 25000 + Math.floor(Math.random() * 8000),
        weighDate: new Date(2023, 6, 1 + i).toISOString(),
        status: Math.random() > 0.2 ? 'Compliant' : Math.random() > 0.5 ? 'Non-Compliant' : 'Warning',
        scaleName: `Scale ${(i % 3) + 1}`
      }));
      
      return NextResponse.json({ weighings: dummyWeighings });
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
