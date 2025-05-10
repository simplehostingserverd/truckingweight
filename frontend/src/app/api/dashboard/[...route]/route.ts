import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock API handler for dashboard endpoints
 * This provides temporary mock data while the backend is being developed
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { route: string[] } }
) {
  // In Next.js App Router, params is already resolved, but we need to handle it properly
  // to avoid the "params should be awaited" error
  const routeParams = params.route;
  const route = Array.isArray(routeParams) ? routeParams.join('/') : '';

  // Extract query parameters
  const url = new URL(request.url);
  const dateRange = url.searchParams.get('dateRange') || 'week';

  try {
    // Route to appropriate mock data handler
    switch (route) {
      case 'stats':
        return NextResponse.json(getMockStats());
      case 'load-status':
        return NextResponse.json(getMockLoadStatus());
      case 'compliance':
        return NextResponse.json(getMockComplianceData(dateRange));
      case 'vehicle-weights':
        return NextResponse.json(getMockVehicleWeights(dateRange));
      case 'recent-weights':
        return NextResponse.json(getMockRecentWeights());
      default:
        return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Error in mock API (${route}):`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mock data generators
function getMockStats() {
  return {
    vehicleCount: 12,
    driverCount: 8,
    activeLoads: 5,
    weightsToday: 3,
    complianceRate: 92,
    nonCompliantWeights: 2
  };
}

function getMockLoadStatus() {
  return [
    { name: 'Pending', value: 3 },
    { name: 'In Transit', value: 2 },
    { name: 'Delivered', value: 8 },
    { name: 'Cancelled', value: 1 }
  ];
}

function getMockComplianceData(dateRange: string) {
  // Adjust data slightly based on date range
  const multiplier = dateRange === 'week' ? 1 : dateRange === 'month' ? 4 : 12;

  return [
    { name: 'Compliant', value: 42 * multiplier },
    { name: 'Warning', value: 5 * multiplier },
    { name: 'Non-Compliant', value: 3 * multiplier }
  ];
}

function getMockVehicleWeights(dateRange: string) {
  // Adjust data slightly based on date range
  const multiplier = dateRange === 'week' ? 1 : dateRange === 'month' ? 1.5 : 2;

  return [
    { name: 'Truck 101', weight: Math.round(32500 * multiplier) },
    { name: 'Truck 102', weight: Math.round(29800 * multiplier) },
    { name: 'Truck 103', weight: Math.round(34200 * multiplier) },
    { name: 'Truck 104', weight: Math.round(31100 * multiplier) },
    { name: 'Truck 105', weight: Math.round(33400 * multiplier) }
  ];
}

function getMockRecentWeights() {
  return [
    {
      id: 1,
      weight: '32,500 lbs',
      date: '2023-11-15',
      time: '14:30',
      status: 'Compliant',
      created_at: '2023-11-15T14:30:00Z',
      vehicles: { id: 1, name: 'Truck 101' },
      drivers: { id: 1, name: 'John Driver' }
    },
    {
      id: 2,
      weight: '34,200 lbs',
      date: '2023-11-15',
      time: '11:15',
      status: 'Warning',
      created_at: '2023-11-15T11:15:00Z',
      vehicles: { id: 2, name: 'Truck 102' },
      drivers: { id: 2, name: 'Sarah Smith' }
    },
    {
      id: 3,
      weight: '29,800 lbs',
      date: '2023-11-14',
      time: '16:45',
      status: 'Compliant',
      created_at: '2023-11-14T16:45:00Z',
      vehicles: { id: 3, name: 'Truck 103' },
      drivers: { id: 1, name: 'John Driver' }
    }
  ];
}
