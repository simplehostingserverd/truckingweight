import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock API handler for driver activity reports
 * This provides temporary mock data for driver routes and activity
 */

export async function GET(request: NextRequest) {
  // Extract query parameters
  const url = new URL(request.url);
  const driverId = url.searchParams.get('driverId') || '1';
  const dateRange = url.searchParams.get('dateRange') || 'week';
  
  try {
    return NextResponse.json(getMockDriverActivity(driverId, dateRange));
  } catch (error) {
    console.error(`Error in mock driver activity API:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getMockDriverActivity(driverId: string, dateRange: string) {
  // Create a route with waypoints between Chicago and Milwaukee
  const routeWaypoints = [
    { lat: 41.8781, lng: -87.6298, name: 'Chicago, IL' },
    { lat: 42.0451, lng: -87.6877, name: 'Evanston, IL' },
    { lat: 42.1083, lng: -87.7312, name: 'Northbrook, IL' },
    { lat: 42.3222, lng: -87.8508, name: 'Waukegan, IL' },
    { lat: 42.4964, lng: -87.9782, name: 'Kenosha, WI' },
    { lat: 42.7261, lng: -87.7828, name: 'Racine, WI' },
    { lat: 43.0389, lng: -87.9065, name: 'Milwaukee, WI' }
  ];

  // Add timestamps for each waypoint (starting 3 hours ago, ending now)
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
  
  const timeStep = (endTime.getTime() - startTime.getTime()) / (routeWaypoints.length - 1);
  
  const routeWithTimestamps = routeWaypoints.map((waypoint, index) => {
    const timestamp = new Date(startTime.getTime() + timeStep * index);
    return {
      ...waypoint,
      timestamp: timestamp.toISOString(),
      speed: 55 + Math.floor(Math.random() * 10), // Speed in mph
      fuelLevel: 100 - (index * 8), // Decreasing fuel level
      engineTemp: 195 + Math.floor(Math.random() * 10) // Engine temperature
    };
  });

  // Driver stats
  const driverStats = {
    totalMiles: 92,
    drivingTime: '2 hours 45 minutes',
    restTime: '15 minutes',
    fuelConsumption: '18 gallons',
    averageSpeed: 58,
    maxSpeed: 65,
    hardBrakes: 2,
    hardAccelerations: 1,
    idleTime: '8 minutes'
  };

  // Return the complete data
  return {
    driverId,
    driverName: driverId === '1' ? 'John Driver' : 'Sarah Smith',
    date: new Date().toISOString().split('T')[0],
    route: routeWithTimestamps,
    currentPosition: routeWithTimestamps[Math.floor(routeWithTimestamps.length * 0.7)], // Truck is 70% along the route
    stats: driverStats,
    vehicle: {
      id: 1,
      name: 'Truck 101',
      type: 'Semi-Truck',
      model: 'Peterbilt 579'
    }
  };
}