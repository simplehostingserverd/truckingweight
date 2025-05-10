import { NextRequest, NextResponse } from 'next/server';
import { toSearchParamString } from '@/utils/searchParams';

/**
 * Mock API handler for load details
 * This provides temporary mock data while the backend is being developed
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Safely convert the ID parameter to a string
  const id = toSearchParamString(params.id, '1');

  try {
    // Return mock load data
    return NextResponse.json({
      id: parseInt(id),
      description: 'Construction materials delivery',
      origin: 'Chicago, IL',
      destination: 'Milwaukee, WI',
      weight: '28,500 lbs',
      status: 'In Transit',
      created_at: '2023-11-14T10:30:00Z',
      updated_at: '2023-11-14T14:45:00Z',
      estimated_departure: '2023-11-14T08:00:00Z',
      estimated_arrival: '2023-11-14T16:00:00Z',
      actual_departure: '2023-11-14T08:15:00Z',
      actual_arrival: null,
      distance: '92 miles',
      duration: '1 hour 45 minutes',
      route_details: JSON.stringify({
        waypoints: [
          { lat: 41.8781, lng: -87.6298, name: 'Chicago, IL' },
          { lat: 43.0389, lng: -87.9065, name: 'Milwaukee, WI' }
        ],
        totalDistance: 92,
        totalDuration: 105
      }),
      vehicles: { id: 1, name: 'Truck 101', license_plate: 'ABC-1234' },
      drivers: { id: 1, name: 'John Driver', license_number: 'DL12345678' }
    });
  } catch (error) {
    console.error(`Error in mock load API:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
