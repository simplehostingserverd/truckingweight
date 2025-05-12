import { NextRequest, NextResponse } from 'next/server';
import { toSearchParamString } from '@/utils/searchParams';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * API handler for dashboard endpoints
 * This provides real data from the database with fallback to mock data
 */

export async function GET(request: NextRequest, { params }: { params: { route: string[] } }) {
  // In Next.js 15.3.2, we need to handle params differently to avoid the
  // "params should be awaited" error
  const paramsValue = await params;
  const routeParams = Array.isArray(paramsValue.route) ? [...paramsValue.route] : [];
  const route = routeParams.join('/');

  // Extract query parameters safely using our utility function
  const url = new URL(request.url);
  const dateRange = toSearchParamString(url.searchParams.get('dateRange'), 'week');

  try {
    // Initialize Supabase client
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get user data
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's company_id and admin status
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id, is_admin')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json({ error: 'Error fetching user data' }, { status: 500 });
    }

    const isAdmin = userData?.is_admin || false;
    const companyId = userData?.company_id;

    // Route to appropriate data handler
    switch (route) {
      case 'stats':
        return NextResponse.json(await getStats(supabase, isAdmin, companyId));
      case 'load-status':
        return NextResponse.json(await getLoadStatus(supabase, isAdmin, companyId));
      case 'compliance':
        return NextResponse.json(await getComplianceData(supabase, isAdmin, companyId, dateRange));
      case 'vehicle-weights':
        return NextResponse.json(await getVehicleWeights(supabase, isAdmin, companyId, dateRange));
      case 'recent-weights':
        return NextResponse.json(await getRecentWeights(supabase, isAdmin, companyId));
      default:
        return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Error in dashboard API (${route}):`, error);

    // Always use mock data in development mode or if there's an error
    if (process.env.NODE_ENV !== 'production' || error) {
      console.log(`Using mock data for ${route} in ${process.env.NODE_ENV} mode`);
      try {
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
      } catch (fallbackError) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}

// Live data functions
async function getStats(supabase, isAdmin, companyId) {
  // Get counts for various entities
  let vehicleQuery = supabase.from('vehicles').select('*', { count: 'exact', head: true });
  let driverQuery = supabase.from('drivers').select('*', { count: 'exact', head: true });
  let loadQuery = supabase
    .from('loads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'In Transit');

  // If not admin, filter by company_id
  if (!isAdmin && companyId) {
    vehicleQuery = vehicleQuery.eq('company_id', companyId);
    driverQuery = driverQuery.eq('company_id', companyId);
    loadQuery = loadQuery.eq('company_id', companyId);
  }

  // Get today's date in ISO format (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  // Get weights created today
  let weightQuery = supabase
    .from('weights')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${today}T00:00:00Z`)
    .lte('created_at', `${today}T23:59:59Z`);

  // Get non-compliant weights
  let nonCompliantQuery = supabase
    .from('weights')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Non-Compliant');

  // Get all weights for compliance rate calculation
  let allWeightsQuery = supabase.from('weights').select('*', { count: 'exact', head: true });

  // If not admin, filter by company_id
  if (!isAdmin && companyId) {
    weightQuery = weightQuery.eq('company_id', companyId);
    nonCompliantQuery = nonCompliantQuery.eq('company_id', companyId);
    allWeightsQuery = allWeightsQuery.eq('company_id', companyId);
  }

  // Execute all queries in parallel
  const [
    { count: vehicleCount },
    { count: driverCount },
    { count: activeLoads },
    { count: weightsToday },
    { count: nonCompliantWeights },
    { count: totalWeights },
  ] = await Promise.all([
    vehicleQuery,
    driverQuery,
    loadQuery,
    weightQuery,
    nonCompliantQuery,
    allWeightsQuery,
  ]);

  // Calculate compliance rate
  const complianceRate =
    totalWeights > 0
      ? Math.round(((totalWeights - nonCompliantWeights) / totalWeights) * 100)
      : 100;

  return {
    vehicleCount: vehicleCount || 0,
    driverCount: driverCount || 0,
    activeLoads: activeLoads || 0,
    weightsToday: weightsToday || 0,
    complianceRate,
    nonCompliantWeights: nonCompliantWeights || 0,
  };
}

async function getLoadStatus(supabase, isAdmin, companyId) {
  // Query to get load counts by status
  let query = supabase.from('loads').select('status');

  // If not admin, filter by company_id
  if (!isAdmin && companyId) {
    query = query.eq('company_id', companyId);
  }

  const { data: loads, error } = await query;

  if (error) {
    console.error('Error fetching load status:', error);
    throw error;
  }

  // Count loads by status
  const statusCounts = {
    Pending: 0,
    'In Transit': 0,
    Delivered: 0,
    Cancelled: 0,
  };

  loads.forEach(load => {
    const status = load.status || 'Pending';
    if (statusCounts[status] !== undefined) {
      statusCounts[status]++;
    }
  });

  // Convert to array format
  return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
}

async function getComplianceData(supabase, isAdmin, companyId, dateRange) {
  // Determine date range
  const now = new Date();
  let startDate;

  if (dateRange === 'week') {
    // Last 7 days
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
  } else if (dateRange === 'month') {
    // Last 30 days
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 30);
  } else {
    // Last 365 days (year)
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 365);
  }

  // Format dates for query
  const startDateStr = startDate.toISOString();
  const endDateStr = now.toISOString();

  // Query to get weights by status in the date range
  let query = supabase
    .from('weights')
    .select('status')
    .gte('created_at', startDateStr)
    .lte('created_at', endDateStr);

  // If not admin, filter by company_id
  if (!isAdmin && companyId) {
    query = query.eq('company_id', companyId);
  }

  const { data: weights, error } = await query;

  if (error) {
    console.error('Error fetching compliance data:', error);
    throw error;
  }

  // Count weights by status
  const statusCounts = {
    Compliant: 0,
    Warning: 0,
    'Non-Compliant': 0,
  };

  weights.forEach(weight => {
    const status = weight.status || 'Compliant';
    if (statusCounts[status] !== undefined) {
      statusCounts[status]++;
    }
  });

  // Convert to array format
  return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
}

async function getVehicleWeights(supabase, isAdmin, companyId, dateRange) {
  // Determine date range
  const now = new Date();
  let startDate;

  if (dateRange === 'week') {
    // Last 7 days
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
  } else if (dateRange === 'month') {
    // Last 30 days
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 30);
  } else {
    // Last 365 days (year)
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 365);
  }

  // Format dates for query
  const startDateStr = startDate.toISOString();
  const endDateStr = now.toISOString();

  // Query to get weights with vehicle info
  let query = supabase
    .from('weights')
    .select(
      `
      weight,
      vehicles(id, name)
    `
    )
    .gte('created_at', startDateStr)
    .lte('created_at', endDateStr);

  // If not admin, filter by company_id
  if (!isAdmin && companyId) {
    query = query.eq('company_id', companyId);
  }

  const { data: weights, error } = await query;

  if (error) {
    console.error('Error fetching vehicle weights:', error);
    throw error;
  }

  // Group weights by vehicle and calculate average
  const vehicleWeights = {};

  weights.forEach(weight => {
    if (!weight.vehicles) return;

    const vehicleName = weight.vehicles.name;
    const weightValue = parseFloat(weight.weight.replace(/[^\d.-]/g, ''));

    if (!isNaN(weightValue)) {
      if (!vehicleWeights[vehicleName]) {
        vehicleWeights[vehicleName] = {
          total: 0,
          count: 0,
        };
      }

      vehicleWeights[vehicleName].total += weightValue;
      vehicleWeights[vehicleName].count++;
    }
  });

  // Calculate average weights and format for chart
  return Object.entries(vehicleWeights)
    .map(([name, data]) => ({
      name,
      weight: Math.round(data.total / data.count),
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5); // Top 5 vehicles by weight
}

async function getRecentWeights(supabase, isAdmin, companyId) {
  // Query to get recent weights with vehicle and driver info
  let query = supabase
    .from('weights')
    .select(
      `
      id,
      weight,
      date,
      time,
      status,
      created_at,
      vehicles(id, name),
      drivers(id, name)
    `
    )
    .order('created_at', { ascending: false })
    .limit(10);

  // If not admin, filter by company_id
  if (!isAdmin && companyId) {
    query = query.eq('company_id', companyId);
  } else if (isAdmin) {
    // For admin, include company info
    query = supabase
      .from('weights')
      .select(
        `
        id,
        weight,
        date,
        time,
        status,
        created_at,
        vehicles(id, name),
        drivers(id, name),
        companies(id, name)
      `
      )
      .order('created_at', { ascending: false })
      .limit(10);
  }

  const { data: weights, error } = await query;

  if (error) {
    console.error('Error fetching recent weights:', error);
    throw error;
  }

  return weights;
}

// Mock data generators (fallback)
function getMockStats() {
  return {
    vehicleCount: 12,
    driverCount: 8,
    activeLoads: 5,
    weightsToday: 3,
    complianceRate: 92,
    nonCompliantWeights: 2,
  };
}

function getMockLoadStatus() {
  return [
    { name: 'Pending', value: 3 },
    { name: 'In Transit', value: 2 },
    { name: 'Delivered', value: 8 },
    { name: 'Cancelled', value: 1 },
  ];
}

function getMockComplianceData(dateRange: string) {
  // Adjust data slightly based on date range
  const multiplier = dateRange === 'week' ? 1 : dateRange === 'month' ? 4 : 12;

  return [
    { name: 'Compliant', value: 42 * multiplier },
    { name: 'Warning', value: 5 * multiplier },
    { name: 'Non-Compliant', value: 3 * multiplier },
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
    { name: 'Truck 105', weight: Math.round(33400 * multiplier) },
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
      drivers: { id: 1, name: 'John Driver' },
    },
    {
      id: 2,
      weight: '34,200 lbs',
      date: '2023-11-15',
      time: '11:15',
      status: 'Warning',
      created_at: '2023-11-15T11:15:00Z',
      vehicles: { id: 2, name: 'Truck 102' },
      drivers: { id: 2, name: 'Sarah Smith' },
    },
    {
      id: 3,
      weight: '29,800 lbs',
      date: '2023-11-14',
      time: '16:45',
      status: 'Compliant',
      created_at: '2023-11-14T16:45:00Z',
      vehicles: { id: 3, name: 'Truck 103' },
      drivers: { id: 1, name: 'John Driver' },
    },
  ];
}
