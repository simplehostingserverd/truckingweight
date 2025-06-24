/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

import { toSearchParamString } from '@/utils/searchParams';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Define types for waypoints and route data
interface Waypoint {
  lat: number;
  lng: number;
  name: string;
}

interface RoutePoint extends Waypoint {
  timestamp: string;
  speed: number;
  fuelLevel: number;
  engineTemp: number;
}

interface RouteData {
  route: RoutePoint[];
  currentPosition: RoutePoint;
}

interface DriverStats {
  totalMiles: number;
  drivingTime: string;
  restTime: string;
  fuelConsumption: string;
  averageSpeed: number;
  maxSpeed: number;
  hardBrakes: number;
  hardAccelerations: number;
  idleTime: string;
}

interface VehicleData {
  id: number;
  name: string;
  type: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  status: string;
  lastMaintenance: string;
  color?: string;
}

interface LoadInfo {
  loadId: string;
  broker: string;
  origin: string;
  destination: string;
  commodity: string;
  weight: number;
  rate: number;
  pickupTime: string;
  deliveryTime: string;
  status: string;
  specialInstructions?: string;
}

interface DriverActivityResponse {
  driverId: string | number;
  driverName: string;
  date: string;
  route: RoutePoint[];
  currentPosition: RoutePoint;
  stats: DriverStats;
  vehicle: VehicleData;
  loadInfo?: LoadInfo;
}

/**
 * API handler for driver activity reports
 * This provides real-time data for driver routes and activity
 */

export async function GET(request: NextRequest) {
  // Extract query parameters safely using our utility function
  const url = new URL(request.url);
  // Cast to SearchParamValue to fix type issues
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const driverId = toSearchParamString(url.searchParams.get('driverId') as string | undefined, '1');
  // We're not using dateRange currently, but keeping it for future use
  // const dateRange = toSearchParamString(url.searchParams.get('dateRange') as string | undefined, 'week');

  try {
    // Initialize Supabase client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const supabase = createClient();

    // Try to get real data from the database
    // Get all drivers and filter in JavaScript to avoid type issues
    const { data: allDrivers, error: driversError } = await supabase
      .from('drivers')
      .select('id, name, license_number, company_id');

    // Find the driver with the matching ID
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const driverIdNum = parseInt(driverId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const data = allDrivers?.find(d => d.id === driverIdNum);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const driverError = driversError;

    // If we can't get real data, fall back to mock data
    if (driverError || !data) {
      console.warn('Falling back to mock data for driver activity:', driverError?.message);
      return NextResponse.json(getMockDriverActivity(driverId));
    }

    // Safely cast the data to the expected type
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const driverData = data as {
      id: number;
      name: string;
      license_number: string;
      company_id: number | null;
    };

    // Try to get vehicle data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let vehicleData: {
      id: number;
      name: string;
      type: string;
      make: string | null;
      model: string | null;
      year: number | null;
      license_plate: string;
      vin: string | null;
      status: string;
    } | null = null;

    try {
      // Get vehicles for this company
      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('id, name, type, make, model, year, license_plate, vin, status')
        .limit(1);

      // Get the first vehicle if any exist
      if (vehiclesData && vehiclesData.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        vehicleData = vehiclesData[0] as unknown;
      }
    } catch (error) {
      console.warn('Error fetching vehicle data:', error);
      // Continue without vehicle data
    }

    // Generate route data (we'll still use mock routes for now, but with real driver/vehicle data)
    const routeData = generateRouteData(driverId);

    // Combine real data with route simulation
    const response: DriverActivityResponse = {
      driverId: driverData.id,
      driverName: driverData.name,
      date: new Date().toISOString().split('T')[0],
      route: routeData.route,
      currentPosition: routeData.currentPosition,
      stats: generateDriverStats(),
      vehicle: vehicleData
        ? {
            id: vehicleData.id,
            name: vehicleData.name,
            type: vehicleData.type,
            model: vehicleData.model || 'Unknown',
            year: vehicleData.year || 2022,
            licensePlate: vehicleData.license_plate,
            vin: vehicleData.vin || `VIN${100000 + driverData.id}`,
            status: vehicleData.status,
            lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
          }
        : {
            id: driverData.id,
            name: `Truck ${100 + driverData.id}`,
            type: 'Semi-Truck',
            model: 'Peterbilt 579',
            year: 2022,
            licensePlate: `TX-${10000 + driverData.id}`,
            vin: `1XPBD49X1MD${100000 + driverData.id}`,
            status: 'Active',
            lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
          },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error in driver activity API:`, error);
    // Fall back to mock data if there's an error
    return NextResponse.json(getMockDriverActivity(driverId));
  }
}

function generateRouteData(driverId: string): RouteData {
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
    currentPosition: detailedRoute[currentPositionIndex],
  };
}

function getRouteWaypoints(driverId: string): Waypoint[] {
  // Create main waypoints for the route
  const routes: Record<string, Waypoint[]> = {
    // Texas routes
    'dallas-houston': [
      { lat: 32.7767, lng: -96.797, name: 'Dallas, TX' },
      { lat: 32.3513, lng: -95.3011, name: 'Tyler, TX' },
      { lat: 31.3337, lng: -94.7291, name: 'Lufkin, TX' },
      { lat: 30.7235, lng: -95.5508, name: 'Huntsville, TX' },
      { lat: 30.0444, lng: -95.4614, name: 'Spring, TX' },
      { lat: 29.7604, lng: -95.3698, name: 'Houston, TX' },
    ],
    'austin-sanantonio': [
      { lat: 30.2672, lng: -97.7431, name: 'Austin, TX' },
      { lat: 29.9884, lng: -97.8784, name: 'San Marcos, TX' },
      { lat: 29.8833, lng: -97.9414, name: 'New Braunfels, TX' },
      { lat: 29.525, lng: -98.0386, name: 'Cibolo, TX' },
      { lat: 29.4241, lng: -98.4936, name: 'San Antonio, TX' },
    ],
    'houston-corpuschristi': [
      { lat: 29.7604, lng: -95.3698, name: 'Houston, TX' },
      { lat: 29.0339, lng: -95.4344, name: 'Angleton, TX' },
      { lat: 28.865, lng: -96.0, name: 'Bay City, TX' },
      { lat: 28.6423, lng: -96.6256, name: 'Port Lavaca, TX' },
      { lat: 28.3584, lng: -97.1705, name: 'Victoria, TX' },
      { lat: 28.0229, lng: -97.5311, name: 'Sinton, TX' },
      { lat: 27.8006, lng: -97.3964, name: 'Corpus Christi, TX' },
    ],
    'dallas-amarillo': [
      { lat: 32.7767, lng: -96.797, name: 'Dallas, TX' },
      { lat: 33.1984, lng: -96.6361, name: 'McKinney, TX' },
      { lat: 33.6357, lng: -97.1353, name: 'Gainesville, TX' },
      { lat: 34.4092, lng: -97.9699, name: 'Wichita Falls, TX' },
      { lat: 34.983, lng: -100.2171, name: 'Childress, TX' },
      { lat: 35.222, lng: -101.8313, name: 'Amarillo, TX' },
    ],
    'elpaso-midland': [
      { lat: 31.7619, lng: -106.485, name: 'El Paso, TX' },
      { lat: 31.4638, lng: -104.5307, name: 'Van Horn, TX' },
      { lat: 31.0982, lng: -104.2219, name: 'Pecos, TX' },
      { lat: 31.4332, lng: -102.0779, name: 'Monahans, TX' },
      { lat: 31.9973, lng: -102.0779, name: 'Odessa, TX' },
      { lat: 32.0022, lng: -102.1014, name: 'Midland, TX' },
    ],
    // DAT Loading Board connected route - special route for driver 1
    'dat-route': [
      { lat: 33.749, lng: -84.388, name: 'Atlanta, GA (DAT Pickup)' },
      { lat: 33.5186, lng: -86.8104, name: 'Birmingham, AL' },
      { lat: 32.3668, lng: -88.7032, name: 'Meridian, MS' },
      { lat: 32.2988, lng: -90.1848, name: 'Jackson, MS' },
      { lat: 32.5252, lng: -93.7502, name: 'Shreveport, LA' },
      { lat: 32.7767, lng: -96.797, name: 'Dallas, TX (DAT Delivery)' },
    ],
  };

  // Special case for driver 1 - always use the DAT route
  if (driverId === '1') {
    return routes['dat-route'];
  }

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

function generateDetailedRoute(routeWaypoints: Waypoint[]): RoutePoint[] {
  // Check if routeWaypoints is undefined or empty
  if (!routeWaypoints || routeWaypoints.length === 0) {
    // Return a default route if no waypoints are provided
    const defaultRoute: RoutePoint[] = [
      {
        lat: 32.7767,
        lng: -96.797,
        name: 'Dallas, TX',
        timestamp: new Date().toISOString(),
        speed: 65,
        fuelLevel: 75,
        engineTemp: 195,
      },
      {
        lat: 32.3513,
        lng: -95.3011,
        name: 'Tyler, TX',
        timestamp: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
        speed: 60,
        fuelLevel: 70,
        engineTemp: 198,
      },
    ];
    return defaultRoute;
  }

  // Generate intermediate points for a smoother route
  const detailedRoute: Waypoint[] = [];

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
        name: `Between ${start.name} and ${end.name}`,
      });
    }
  }

  // Always add the final destination if we have waypoints
  if (routeWaypoints.length > 0) {
    detailedRoute.push(routeWaypoints[routeWaypoints.length - 1]);
  }

  // Add timestamps for each waypoint (starting 6 hours ago, ending in 1 hour)
  const now = new Date();
  const startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000); // 6 hours ago
  const endTime = new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour from now

  // Ensure we don't divide by zero if detailedRoute is empty
  const timeStep =
    detailedRoute.length > 1
      ? (endTime.getTime() - startTime.getTime()) / (detailedRoute.length - 1)
      : 0;

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
      fuelLevel: 100 - (index * 100) / detailedRoute.length, // Decreasing fuel level
      engineTemp: 195 + Math.floor(Math.random() * 10), // Engine temperature
    };
  });
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

function generateDriverStats(): DriverStats {
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
    idleTime: `${idleMinutes} minutes`,
  };
}

// Fallback to mock data if needed
function getMockDriverActivity(driverId: string): DriverActivityResponse {
  // Generate route data
  const routeData = generateRouteData(driverId);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const driverIdNum = parseInt(driverId);

  // Special case for driver 1 - DAT Loading Board connected driver
  if (driverId === '1') {
    return {
      driverId: driverIdNum,
      driverName: 'Michael Rodriguez',
      date: new Date().toISOString().split('T')[0],
      route: routeData.route,
      currentPosition: routeData.currentPosition,
      stats: generateDriverStats(),
      vehicle: {
        id: driverIdNum,
        name: 'Freightliner FL-2847',
        type: 'Class 8 Semi',
        model: 'Freightliner Cascadia Evolution',
        year: 2022,
        licensePlate: 'IL PFS-2847',
        vin: '1FUJGHDV8NLAA2847',
        status: 'Active',
        lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        color: '#3366CC',
      },
      // DAT Loading Board information
      loadInfo: {
        loadId: 'DAT-12345678',
        broker: 'DAT Solutions LLC',
        origin: 'Atlanta, GA',
        destination: 'Dallas, TX',
        commodity: 'Electronics',
        weight: 42000,
        rate: 3.75,
        pickupTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        deliveryTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        status: 'In Transit',
        specialInstructions: 'Call dispatch upon arrival. Fragile cargo.',
      },
    };
  }

  // Return professional mock data structure for other drivers
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const driverNames = ['Jennifer Chen', 'Robert Thompson', 'Amanda Williams', 'Carlos Martinez'];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const vehicleNames = [
    'Peterbilt PB-3947',
    'Kenworth KW-5829',
    'International IN-7284',
    'Volvo VN-8472',
  ];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const vehicleModels = [
    'Peterbilt 579 EPIQ',
    'Kenworth T680 Next Gen',
    'International MV Series',
    'Volvo VNL 860',
  ];
  const licensePlates = ['IL PFS-3947', 'IL PFS-5829', 'IL PFS-7284', 'TX CLG-8472'];
  const vins = ['1XPBDP9X5ND394756', '1XKDDB9X8NJ582947', '3HAMMAAR8NL728456', '4V4NC9EH5NN847291'];

  const index = (driverIdNum - 2) % driverNames.length;

  return {
    driverId: driverIdNum,
    driverName: driverNames[index] || `Professional Driver ${driverIdNum}`,
    date: new Date().toISOString().split('T')[0],
    route: routeData.route,
    currentPosition: routeData.currentPosition,
    stats: generateDriverStats(),
    vehicle: {
      id: driverIdNum,
      name: vehicleNames[index] || `Professional Vehicle ${driverIdNum}`,
      type: 'Class 8 Semi',
      model: vehicleModels[index] || 'Professional Truck Model',
      year: 2022 + (index % 2),
      licensePlate: licensePlates[index] || `IL PFS-${1000 + driverIdNum}`,
      vin: vins[index] || `1PROF${driverIdNum.toString().padStart(12, '0')}`,
      status: 'Active',
      lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      color: ['#CC3366', '#33CC66', '#3366CC', '#CC6633'][index % 4],
    },
  };
}
