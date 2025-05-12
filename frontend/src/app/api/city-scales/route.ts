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
    
    // Call the backend API to get city scales
    const response = await fetch(`${process.env.BACKEND_URL}/api/city-scales`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.msg || 'Failed to fetch city scales' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching city scales:', error);
    
    // Return mock data for development/demo purposes
    if (process.env.NODE_ENV !== 'production') {
      const dummyScales = [
        { 
          id: 1, 
          name: 'Main Street Scale', 
          location: '123 Main St', 
          scale_type: 'fixed', 
          status: 'Active', 
          max_capacity: 80000,
          precision: 20,
          calibration_date: '2023-05-15',
          next_calibration_date: '2023-11-15'
        },
        { 
          id: 2, 
          name: 'Highway 35 Scale', 
          location: 'Highway 35 Exit 12', 
          scale_type: 'fixed', 
          status: 'Active', 
          max_capacity: 100000,
          precision: 50,
          calibration_date: '2023-06-22',
          next_calibration_date: '2023-12-22'
        },
        { 
          id: 3, 
          name: 'Downtown Scale', 
          location: '456 Center Ave', 
          scale_type: 'portable', 
          status: 'Maintenance', 
          max_capacity: 60000,
          precision: 10,
          calibration_date: '2023-03-10',
          next_calibration_date: '2023-09-10'
        },
        { 
          id: 4, 
          name: 'Industrial Park Scale', 
          location: '789 Industry Blvd', 
          scale_type: 'fixed', 
          status: 'Active', 
          max_capacity: 120000,
          precision: 100,
          calibration_date: '2023-07-05',
          next_calibration_date: '2024-01-05'
        },
        { 
          id: 5, 
          name: 'Mobile Unit 1', 
          location: 'Variable', 
          scale_type: 'portable', 
          status: 'Active', 
          max_capacity: 40000,
          precision: 20,
          calibration_date: '2023-08-01',
          next_calibration_date: '2024-02-01'
        },
      ];
      
      return NextResponse.json({ scales: dummyScales });
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
