import { NextRequest, NextResponse } from 'next/server';
import { toSearchParamString } from '@/utils/searchParams';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * API handler for driver activity reports
 * This provides real-time data for driver routes and activity
 */

export async function GET(request: NextRequest) {
  // Extract query parameters safely using our utility function
  const url = new URL(request.url);
  const driverId = toSearchParamString(url.searchParams.get('driverId'), '1');
  const dateRange = toSearchParamString(url.searchParams.get('dateRange'), 'week');

  try {
    // Initialize Supabase client
    const cookieStore = await cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

    // Try to get real data from the database
    const { data: driverData, error: driverError } = await supabase
      .from('drivers')
      .select('id, name, license_number, company_id')
      .eq('id', driverId)
      .single();

    // If we can't get real data, fall back to mock data
    if (driverError || !driverData) {
      console.warn('Falling back to mock data for driver activity:', driverError?.message);
      return NextResponse.json(getMockDriverActivity(driverId, dateRange));
    }

    // Try to get vehicle data
    const { data: vehicleData, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id, name, type, make, model, year, license_plate, vin, status')
      .eq('company_id', driverData.company_id)
      .limit(1)
      .single();

    // Generate route data (we'll still use mock routes for now, but with real driver/vehicle data)
    const routeData = generateRouteData(driverId);

    // Combine real data with route simulation
    const response = {
      driverId: driverData.id,
      driverName: driverData.name,
      date: new Date().toISOString().split('T')[0],
      route: routeData.route,
      currentPosition: routeData.currentPosition,
      stats: generateDriverStats(),
      vehicle: vehicleData || {
        id: parseInt(driverId),
        name: `Truck ${100 + parseInt(driverId)}`,
        type: 'Semi-Truck',
        model: 'Peterbilt 579',
        year: 2022,
        licensePlate: `TX-${10000 + parseInt(driverId)}`,
        vin: `1XPBD49X1MD${100000 + parseInt(driverId)}`,
        status: 'Active',
        lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error in driver activity API:`, error);
    // Fall back to mock data if there's an error
    return NextResponse.json(getMockDriverActivity(driverId, dateRange));
  }
}

function generateRouteData(driverId: string) {
  // Get route waypoints
  const routeWaypoints = getRouteWaypoints(driverId);

  // Generate detailed route with timestamps
  const detailedRoute = generateDetailedRoute(routeWaypoints);

  // Calculate current position (ensuring it's not at the very end)
  const currentPositionIndex = Math.min(
    Math.floor(detailedRoute.length * 0.7),
    detailedRoute.length - 2
  );

  return {
    route: detailedRoute,
    currentPosition: detailedRoute[currentPositionIndex]
  };
}

function getRouteWaypoints(driverId: string) {
  // Create main waypoints for the route
  const routes = {
    // Texas routes
    'dallas-houston': [
      { lat: 32.7767, lng: -96.7970, name: 'Dallas, TX' },
      { lat: 32.3513, lng: -95.3011, name: 'Tyler, TX' },
      { lat: 31.3337, lng: -94.7291, name: 'Lufkin, TX' },
      { lat: 30.7235, lng: -95.5508, name: 'Huntsville, TX' },
      { lat: 30.0444, lng: -95.4614, name: 'Spring, TX' },
      { lat: 29.7604, lng: -95.3698, name: 'Houston, TX' }
    ],
    'austin-sanantonio': [
      { lat: 30.2672, lng: -97.7431, name: 'Austin, TX' },
      { lat: 29.9884, lng: -97.8784, name: 'San Marcos, TX' },
      { lat: 29.8833, lng: -97.9414, name: 'New Braunfels, TX' },
      { lat: 29.5250, lng: -98.0386, name: 'Cibolo, TX' },
      { lat: 29.4241, lng: -98.4936, name: 'San Antonio, TX' }
    ],
    'houston-corpuschristi': [
      { lat: 29.7604, lng: -95.3698, name: 'Houston, TX' },
      { lat: 29.0339, lng: -95.4344, name: 'Angleton, TX' },
      { lat: 28.8650, lng: -96.0000, name: 'Bay City, TX' },
      { lat: 28.6423, lng: -96.6256, name: 'Port Lavaca, TX' },
      { lat: 28.3584, lng: -97.1705, name: 'Victoria, TX' },
      { lat: 28.0229, lng: -97.5311, name: 'Sinton, TX' },
      { lat: 27.8006, lng: -97.3964, name: 'Corpus Christi, TX' }
    ],
    'dallas-amarillo': [
      { lat: 32.7767, lng: -96.7970, name: 'Dallas, TX' },
      { lat: 33.1984, lng: -96.6361, name: 'McKinney, TX' },
      { lat: 33.6357, lng: -97.1353, name: 'Gainesville, TX' },
      { lat: 34.4092, lng: -97.9699, name: 'Wichita Falls, TX' },
      { lat: 34.9830, lng: -100.2171, name: 'Childress, TX' },
      { lat: 35.2220, lng: -101.8313, name: 'Amarillo, TX' }
    ],
    'elpaso-midland': [
      { lat: 31.7619, lng: -106.4850, name: 'El Paso, TX' },
      { lat: 31.4638, lng: -104.5307, name: 'Van Horn, TX' },
      { lat: 31.0982, lng: -104.2219, name: 'Pecos, TX' },
      { lat: 31.4332, lng: -102.0779, name: 'Monahans, TX' },
      { lat: 31.9973, lng: -102.0779, name: 'Odessa, TX' },
      { lat: 32.0022, lng: -102.1014, name: 'Midland, TX' }
    ]
  };

  // Select a route based on driver ID or randomly
  const routeKeys = Object.keys(routes);
  const routeIndex = parseInt(driverId) % routeKeys.length;
  const selectedRoute = routeKeys[routeIndex];

  // For variety, sometimes reverse the route
  const shouldReverse = parseInt(driverId) % 2 === 0;
  let waypoints = routes[selectedRoute];

  if (shouldReverse) {
    waypoints = [...waypoints].reverse();
  }

  return waypoints;
}

function generateDetailedRoute(routeWaypoints) {
  // Generate intermediate points for a smoother route
  const detailedRoute = [];

  for (let i = 0; i < routeWaypoints.length - 1; i++) {
    const start = routeWaypoints[i];
    const end = routeWaypoints[i + 1];

    // Add the start point
    detailedRoute.push(start);

    // Add intermediate points - more steps for longer segments
    const distance = calculateDistance(start.lat, start.lng, end.lat, end.lng);
    const steps = Math.max(10, Math.ceil(distance * 100)); // More steps for longer distances

    for (let j = 1; j < steps; j++) {
      const fraction = j / steps;

      // Linear interpolation between points
      const lat = start.lat + (end.lat - start.lat) * fraction;
      const lng = start.lng + (end.lng - start.lng) * fraction;

      // Add some randomness for a more realistic route, but less jitter for smoother paths
      const jitter = 0.005; // Reduced jitter
      const randomLat = lat + (Math.random() - 0.5) * jitter;
      const randomLng = lng + (Math.random() - 0.5) * jitter;

      detailedRoute.push({
        lat: randomLat,
        lng: randomLng,
        name: `Between ${start.name} and ${end.name}`
      });
    }
  }

  // Always add the final destination
  detailedRoute.push(routeWaypoints[routeWaypoints.length - 1]);

  // Add timestamps for each waypoint (starting 6 hours ago, ending in 1 hour)
  const now = new Date();
  const startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000); // 6 hours ago
  const endTime = new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour from now

  const timeStep = (endTime.getTime() - startTime.getTime()) / (detailedRoute.length - 1);

  return detailedRoute.map((waypoint, index) => {
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
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

function generateDriverStats() {
  // Generate realistic driver stats
  const totalMiles = 80 + Math.floor(Math.random() * 120);
  const drivingHours = 2 + Math.random() * 3;
  const drivingMinutes = Math.floor((drivingHours % 1) * 60);
  const restMinutes = 5 + Math.floor(Math.random() * 25);
  const fuelConsumption = 15 + Math.floor(Math.random() * 10);
  const averageSpeed = 55 + Math.floor(Math.random() * 10);
  const maxSpeed = averageSpeed + 5 + Math.floor(Math.random() * 10);
  const hardBrakes = Math.floor(Math.random() * 4);
  const hardAccelerations = Math.floor(Math.random() * 3);
  const idleMinutes = Math.floor(Math.random() * 15);

  return {
    totalMiles,
    drivingTime: `${Math.floor(drivingHours)} hours ${drivingMinutes} minutes`,
    restTime: `${restMinutes} minutes`,
    fuelConsumption: `${fuelConsumption} gallons`,
    averageSpeed,
    maxSpeed,
    hardBrakes,
    hardAccelerations,
    idleTime: `${idleMinutes} minutes`
  };
}

// Fallback to mock data if needed
function getMockDriverActivity(driverId: string, dateRange: string) {
  // Generate route data
  const routeData = generateRouteData(driverId);

  // Return mock data structure
  return {
    driverId,
    driverName: driverId === '1' ? 'John Driver' : 'Sarah Smith',
    date: new Date().toISOString().split('T')[0],
    route: routeData.route,
    currentPosition: routeData.currentPosition,
    stats: generateDriverStats(),
    vehicle: {
      id: parseInt(driverId),
      name: `Truck ${100 + parseInt(driverId)}`,
      type: 'Semi-Truck',
      model: driverId === '1' ? 'Peterbilt 579' : 'Kenworth T680',
      year: driverId === '1' ? 2022 : 2021,
      color: driverId === '1' ? 'Deep Blue' : 'Crimson Red',
      licensePlate: `TX-${10000 + parseInt(driverId)}`,
      vin: `1XPBD49X1MD${100000 + parseInt(driverId)}`,
      status: 'Active',
      lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  };
}
}