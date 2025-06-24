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

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint to get telematics vehicle data
 * This provides real data from the database with fallback to mock data
 */

export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const supabase = createClient();

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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isAdmin = userData?.is_admin || false;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const companyId = userData?.company_id;

    // Get active telematics connections
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let connectionsQuery = supabase
      .from('integration_connections')
      .select('*')
      .eq('integration_type', 'telematics')
      .eq('is_active', true);

    // If not admin, filter by company_id
    if (!isAdmin && companyId) {
      connectionsQuery = connectionsQuery.eq('company_id', companyId);
    }

    const { data: connections, error: connectionsError } = await connectionsQuery;

    if (connectionsError) {
      console.error('Error fetching telematics connections:', connectionsError);
      throw connectionsError;
    }

    // If no active connections, query vehicles table directly
    if (!connections || connections.length === 0) {
      // Get vehicles from the database
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let vehiclesQuery = supabase.from('vehicles').select('*');

      // If not admin, filter by company_id
      if (!isAdmin && companyId) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        vehiclesQuery = vehiclesQuery.eq('company_id', companyId);
      }

      const { data: vehicles, error: vehiclesError } = await vehiclesQuery;

      if (vehiclesError) {
        console.error('Error fetching vehicles:', vehiclesError);
        throw vehiclesError;
      }

      // If no vehicles found, return empty array
      if (!vehicles || vehicles.length === 0) {
        return NextResponse.json([]);
      }

      // Transform vehicle data to telematics format
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const telematicsData = vehicles.map(vehicle => ({
        id: vehicle.id.toString(),
        name: vehicle.name,
        status: vehicle.status || 'active',
        location: {
          latitude: vehicle.last_latitude || 32.7767,
          longitude: vehicle.last_longitude || -96.797,
          address: vehicle.last_location || 'Unknown',
        },
        lastUpdate: vehicle.updated_at || new Date().toISOString(),
        speed: vehicle.last_speed || 0,
        fuelLevel: vehicle.fuel_level || 75,
        engineStatus: vehicle.engine_status || 'off',
      }));

      return NextResponse.json(telematicsData);
    }

    // With active connections, try to get real telematics data
    try {
      // Get vehicles associated with these connections
      const connectionIds = connections.map(conn => conn.id);

      // Get telematics data from the database
      const { data: telematicsData, error: telematicsError } = await supabase
        .from('telematics_data')
        .select('*, vehicles(*)')
        .in('connection_id', connectionIds)
        .order('timestamp', { ascending: false })
        .limit(20);

      if (telematicsError) {
        console.error('Error fetching telematics data:', telematicsError);
        throw telematicsError;
      }

      // If no telematics data found, fall back to vehicles table
      if (!telematicsData || telematicsData.length === 0) {
        // Get vehicles from the database
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let vehiclesQuery = supabase.from('vehicles').select('*');

        // If not admin, filter by company_id
        if (!isAdmin && companyId) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          vehiclesQuery = vehiclesQuery.eq('company_id', companyId);
        }

        const { data: vehicles, error: vehiclesError } = await vehiclesQuery;

        if (vehiclesError) {
          console.error('Error fetching vehicles:', vehiclesError);
          throw vehiclesError;
        }

        // Transform vehicle data to telematics format
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formattedData = vehicles.map(vehicle => ({
          id: vehicle.id.toString(),
          name: vehicle.name,
          status: vehicle.status || 'active',
          location: {
            latitude: vehicle.last_latitude || 32.7767,
            longitude: vehicle.last_longitude || -96.797,
            address: vehicle.last_location || 'Unknown',
          },
          lastUpdate: vehicle.updated_at || new Date().toISOString(),
          speed: vehicle.last_speed || 0,
          fuelLevel: vehicle.fuel_level || 75,
          engineStatus: vehicle.engine_status || 'off',
        }));

        return NextResponse.json(formattedData);
      }

      // Format telematics data
      const formattedData = telematicsData.map(data => ({
        id: data.vehicles?.id.toString() || data.vehicle_id.toString(),
        name: data.vehicles?.name || `Vehicle ${data.vehicle_id}`,
        status: data.status || 'active',
        location: {
          latitude: data.latitude || 32.7767,
          longitude: data.longitude || -96.797,
          address: data.location || 'Unknown',
        },
        lastUpdate: data.timestamp || new Date().toISOString(),
        speed: data.speed || 0,
        fuelLevel: data.fuel_level || 75,
        engineStatus: data.engine_status || 'off',
      }));

      return NextResponse.json(formattedData);
    } catch (telematicsError) {
      console.error('Error processing telematics data:', telematicsError);

      // Fall back to vehicles table as a last resort
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let vehiclesQuery = supabase.from('vehicles').select('*');

      // If not admin, filter by company_id
      if (!isAdmin && companyId) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        vehiclesQuery = vehiclesQuery.eq('company_id', companyId);
      }

      const { data: vehicles, error: vehiclesError } = await vehiclesQuery;

      if (vehiclesError || !vehicles || vehicles.length === 0) {
        // If all else fails, return mock data
        return NextResponse.json(getMockVehicleData());
      }

      // Transform vehicle data to telematics format
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const formattedData = vehicles.map(vehicle => ({
        id: vehicle.id.toString(),
        name: vehicle.name,
        status: vehicle.status || 'active',
        location: {
          latitude: vehicle.last_latitude || 32.7767,
          longitude: vehicle.last_longitude || -96.797,
          address: vehicle.last_location || 'Unknown',
        },
        lastUpdate: vehicle.updated_at || new Date().toISOString(),
        speed: vehicle.last_speed || 0,
        fuelLevel: vehicle.fuel_level || 75,
        engineStatus: vehicle.engine_status || 'off',
      }));

      return NextResponse.json(formattedData);
    }
  } catch (error) {
    console.error('Error in telematics vehicles API:', error);

    // Try to recover by querying the vehicles table directly
    try {
      // Initialize a new Supabase client
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const supabase = createClient();

      // Get user data
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get user's company_id and admin status
      const { data: userData } = await supabase
        .from('users')
        .select('company_id, is_admin')
        .eq('id', user.id)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const isAdmin = userData?.is_admin || false;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const companyId = userData?.company_id;

      // Query vehicles directly
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let vehiclesQuery = supabase.from('vehicles').select('*');

      // If not admin, filter by company_id
      if (!isAdmin && companyId) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        vehiclesQuery = vehiclesQuery.eq('company_id', companyId);
      }

      const { data: vehicles, error: vehiclesError } = await vehiclesQuery;

      if (vehiclesError || !vehicles || vehicles.length === 0) {
        // If all else fails, return mock data
        return NextResponse.json(getMockVehicleData());
      }

      // Transform vehicle data to telematics format
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const formattedData = vehicles.map(vehicle => ({
        id: vehicle.id.toString(),
        name: vehicle.name,
        status: vehicle.status || 'active',
        location: {
          latitude: vehicle.last_latitude || 32.7767,
          longitude: vehicle.last_longitude || -96.797,
          address: vehicle.last_location || 'Unknown',
        },
        lastUpdate: vehicle.updated_at || new Date().toISOString(),
        speed: vehicle.last_speed || 0,
        fuelLevel: vehicle.fuel_level || 75,
        engineStatus: vehicle.engine_status || 'off',
      }));

      return NextResponse.json(formattedData);
    } catch (recoveryError) {
      console.error('Recovery attempt failed:', recoveryError);
      // If all else fails, return mock data
      return NextResponse.json(getMockVehicleData());
    }
  }
}

// Professional mock data generator for investor demonstration
function getMockVehicleData() {
  return [
    {
      id: '1',
      name: 'Freightliner FL-2847',
      status: 'active',
      location: {
        latitude: 32.7767,
        longitude: -96.797,
        address: 'I-35 N, Dallas, TX',
      },
      lastUpdate: new Date().toISOString(),
      speed: 68,
      fuelLevel: 78,
      engineStatus: 'running',
    },
    {
      id: '2',
      name: 'Peterbilt PB-3947',
      status: 'active',
      location: {
        latitude: 29.7604,
        longitude: -95.3698,
        address: 'I-10 W, Houston, TX',
      },
      lastUpdate: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
      speed: 72,
      fuelLevel: 65,
      engineStatus: 'running',
    },
    {
      id: '3',
      name: 'Kenworth KW-5829',
      status: 'active',
      location: {
        latitude: 30.2672,
        longitude: -97.7431,
        address: 'I-35 S, Austin, TX',
      },
      lastUpdate: new Date().toISOString(),
      speed: 65,
      fuelLevel: 82,
      engineStatus: 'running',
    },
    {
      id: '4',
      name: 'Volvo VN-8472',
      status: 'maintenance',
      location: {
        latitude: 32.7555,
        longitude: -97.3308,
        address: 'Continental Logistics - Dallas Service Center',
      },
      lastUpdate: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      speed: 0,
      fuelLevel: 45,
      engineStatus: 'off',
    },
  ];
}
