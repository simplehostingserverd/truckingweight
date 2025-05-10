import { NextRequest, NextResponse } from 'next/server';
import { toSearchParamString } from '@/utils/searchParams';

/**
 * Mock API handler for driver activity reports
 * This provides temporary mock data for driver routes and activity
 */

export async function GET(request: NextRequest) {
  // Extract query parameters safely using our utility function
  const url = new URL(request.url);
  const driverId = toSearchParamString(url.searchParams.get('driverId'), '1');
  const dateRange = toSearchParamString(url.searchParams.get('dateRange'), 'week');

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
  // Create main waypoints for the route
  let routeWaypoints = [];

  // Different routes based on driver ID
  if (driverId === '1') {
    // Chicago to New York route for driver 1
    routeWaypoints = [
      { lat: 41.8781, lng: -87.6298, name: 'Chicago, IL' },
      { lat: 41.6005, lng: -83.6376, name: 'Toledo, OH' },
      { lat: 41.4993, lng: -81.6944, name: 'Cleveland, OH' },
      { lat: 42.8864, lng: -78.8784, name: 'Buffalo, NY' },
      { lat: 42.0987, lng: -75.9180, name: 'Binghamton, NY' },
      { lat: 41.0340, lng: -73.7629, name: 'White Plains, NY' },
      { lat: 40.7128, lng: -74.0060, name: 'New York, NY' }
    ];
  } else {
    // Los Angeles to Las Vegas route for driver 2
    routeWaypoints = [
      { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, CA' },
      { lat: 34.1083, lng: -117.2898, name: 'San Bernardino, CA' },
      { lat: 34.8697, lng: -116.8187, name: 'Barstow, CA' },
      { lat: 35.2675, lng: -116.0678, name: 'Baker, CA' },
      { lat: 35.6152, lng: -115.4734, name: 'Primm, NV' },
      { lat: 36.0144, lng: -115.1728, name: 'Henderson, NV' },
      { lat: 36.1699, lng: -115.1398, name: 'Las Vegas, NV' }
    ];
  }

  // Generate intermediate points for a smoother route
  const detailedRoute = [];

  for (let i = 0; i < routeWaypoints.length - 1; i++) {
    const start = routeWaypoints[i];
    const end = routeWaypoints[i + 1];

    // Add the start point
    detailedRoute.push(start);

    // Add intermediate points
    const steps = 10;
    for (let j = 1; j < steps; j++) {
      const fraction = j / steps;

      // Linear interpolation between points
      const lat = start.lat + (end.lat - start.lat) * fraction;
      const lng = start.lng + (end.lng - start.lng) * fraction;

      // Add some randomness for a more realistic route
      const jitter = 0.02;
      const randomLat = lat + (Math.random() - 0.5) * jitter;
      const randomLng = lng + (Math.random() - 0.5) * jitter;

      detailedRoute.push({
        lat: randomLat,
        lng: randomLng,
        name: `Between ${start.name} and ${end.name}`
      });
    }
  }

  // Add the final destination
  detailedRoute.push(routeWaypoints[routeWaypoints.length - 1]);

  // Add timestamps for each waypoint (starting 6 hours ago, ending in 2 hours)
  const now = new Date();
  const startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000); // 6 hours ago
  const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

  const timeStep = (endTime.getTime() - startTime.getTime()) / (detailedRoute.length - 1);

  const routeWithTimestamps = detailedRoute.map((waypoint, index) => {
    const timestamp = new Date(startTime.getTime() + timeStep * index);

    // Calculate speed based on position in route
    let speed;
    if (index < 5) {
      // Starting, accelerating
      speed = 45 + index * 5;
    } else if (index > detailedRoute.length - 5) {
      // Approaching destination, slowing down
      speed = 45 + (detailedRoute.length - index) * 5;
    } else {
      // Cruising speed with some variation
      speed = 65 + Math.sin(index * 0.2) * 5;
    }

    return {
      ...waypoint,
      timestamp: timestamp.toISOString(),
      speed: Math.round(speed), // Speed in mph
      fuelLevel: 100 - (index * 100 / detailedRoute.length), // Decreasing fuel level
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
      id: driverId === '1' ? 1 : 2,
      name: driverId === '1' ? 'Truck 101' : 'Truck 202',
      type: 'Semi-Truck',
      model: driverId === '1' ? 'Peterbilt 579' : 'Kenworth T680',
      year: driverId === '1' ? 2022 : 2021,
      color: driverId === '1' ? 'Deep Blue' : 'Crimson Red',
      licensePlate: driverId === '1' ? 'IL-TW1001' : 'CA-TW2002',
      vin: driverId === '1' ? '1XPBD49X1MD123456' : '2NKHHM6X7MM654321',
      status: 'Active',
      lastMaintenance: driverId === '1' ? '2023-10-15' : '2023-11-02'
    }
  };
}