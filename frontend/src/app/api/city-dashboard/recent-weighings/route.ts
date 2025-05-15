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
      console.log('Using test data for city dashboard recent weighings');

      // Generate dummy recent weighings data
      const dummyWeighings = Array.from({ length: 10 }, (_, i) => {
        const date = new Date();
        date.setHours(date.getHours() - i * 2);

        const grossWeight = Math.floor(Math.random() * 30000) + 20000;
        const tareWeight = Math.floor(Math.random() * 10000) + 10000;

        return {
          id: `dummy-${i}`,
          ticket_number: `WT-${100000 + i}`,
          vehicle_info: `Truck ${['Peterbilt', 'Kenworth', 'Freightliner', 'Mack'][i % 4]} ${['379', '389', 'W900', 'Cascadia'][i % 4]}`,
          company_name: `${['ABC Trucking', 'XYZ Logistics', 'Fast Freight', 'Eagle Transport'][i % 4]}`,
          gross_weight: grossWeight,
          tare_weight: tareWeight,
          net_weight: grossWeight - tareWeight,
          weigh_date: date.toISOString(),
          status: ['Compliant', 'Compliant', 'Compliant', 'Warning', 'Non-Compliant'][i % 5],
          city_scales: {
            name: `Scale ${(i % 3) + 1}`,
          },
        };
      });

      return NextResponse.json({ weighings: dummyWeighings });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '10';

    // Call the backend API to get recent weighings
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/city-dashboard/recent-weighings?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

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
        status:
          Math.random() > 0.2 ? 'Compliant' : Math.random() > 0.5 ? 'Non-Compliant' : 'Warning',
        scaleName: `Scale ${(i % 3) + 1}`,
      }));

      return NextResponse.json({ weighings: dummyWeighings });
    }

    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
