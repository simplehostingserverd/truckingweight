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

'use client';

import React from 'react';
import RoutePlanner from '@/components/Loads/RoutePlanner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Vehicle, Driver, RouteDetails } from '@/types/fleet';

export default function CreateLoad() {
  const [description, setDescription] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [weight, setWeight] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [estimatedDeparture, setEstimatedDeparture] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState('');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [_isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get authenticated user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/login');
          return;
        }

        // Get user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (userError) {
          throw userError;
        }

        // Get vehicles
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('id, name, type, license_plate')
          .eq('company_id', userData.company_id)
          .eq('status', 'Active')
          .order('name');

        if (vehiclesError) {
          throw vehiclesError;
        }

        // Get drivers
        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('id, name, license_number')
          .eq('company_id', userData.company_id)
          .eq('status', 'Active')
          .order('name');

        if (driversError) {
          throw driversError;
        }

        setVehicles(vehiclesData || []);
        setDrivers(driversData || []);
      } catch (err: unknown) {
        // Handle data fetching errors gracefully
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [router, supabase]);

  // Calculate route details
  const _calculateRoute = async () => {
    if (!origin || !destination) {
      setError('Origin and destination are required to calculate route');
      return;
    }

    setIsCalculatingRoute(true);
    setError('');

    try {
      // In a real application, you would call a routing API like Google Maps, MapBox, etc.
      // For this example, we'll simulate a response

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate random distance between 100-1000 miles
      const distanceValue = Math.floor(Math.random() * 900) + 100;
      const distanceStr = `${distanceValue} miles`;

      // Generate random duration between 2-24 hours
      const durationHours = Math.floor(Math.random() * 22) + 2;
      const durationStr = `${durationHours} hours`;

      // Calculate estimated departure and arrival
      const now = new Date();
      const departureDate = new Date(now);
      departureDate.setDate(departureDate.getDate() + 1); // Set to tomorrow
      departureDate.setHours(8, 0, 0, 0); // 8:00 AM

      const arrivalDate = new Date(departureDate);
      arrivalDate.setHours(arrivalDate.getHours() + durationHours);

      // Format dates for input fields
      const formatDateForInput = (date: Date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      };

      const estimatedDepartureStr = formatDateForInput(departureDate);
      const estimatedArrivalStr = formatDateForInput(arrivalDate);

      // Set route details
      setDistance(distanceStr);
      setDuration(durationStr);
      setEstimatedDeparture(estimatedDepartureStr);
      setEstimatedArrival(estimatedArrivalStr);

      // Set route details object (would contain waypoints, etc. in a real app)
      setRouteDetails({
        distance: distanceValue,
        duration: durationHours * 60 * 60, // seconds
        waypoints: [
          { lat: 40.7128, lng: -74.006 }, // Example coordinates
          { lat: 34.0522, lng: -118.2437 },
        ],
      });
    } catch (err: unknown) {
      // Handle route calculation errors with a user-friendly message
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to calculate route: ${errorMessage}`);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Get authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push({ pathname: '/login' });
        return;
      }

      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (userError) {
        throw userError;
      }

      // Create load record with route details
      const { data: _newLoad, error: loadError } = await supabase
        .from('loads')
        .insert([
          {
            description,
            origin,
            destination,
            weight,
            vehicle_id: vehicleId ? parseInt(vehicleId) : null,
            driver_id: driverId ? parseInt(driverId) : null,
            status: 'Pending',
            company_id: userData.company_id,
            estimated_departure: estimatedDeparture || null,
            estimated_arrival: estimatedArrival || null,
            distance: distance || null,
            duration: duration || null,
            route_details: routeDetails ? JSON.stringify(routeDetails) : null,
          },
        ])
        .select()
        .single();

      if (loadError) {
        throw loadError;
      }

      // Redirect to loads list
      router.push('/loads');
    } catch (err: unknown) {
      // Handle load creation errors with a user-friendly message
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`An error occurred while creating the load: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Create New Load</h1>

          <Link
            href="/loads"
            className="px-4 py-2 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Link>
        </div>

        {error && (
          <div className="rounded-md bg-red-900/30 p-4 mb-6 border border-red-800">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-200">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#1A1A1A] shadow-lg rounded-lg overflow-hidden border border-gray-800">
          <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Load Information</h2>
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          </div>

          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white">
                Description
              </label>
              <input
                id="description"
                name="description"
                type="text"
                required
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* Route Planner Component */}
            <RoutePlanner
              initialOrigin={origin}
              initialDestination={destination}
              onRouteChange={routeData => {
                setOrigin(routeData.waypoints[0].address || '');
                setDestination(routeData.waypoints[routeData.waypoints.length - 1].address || '');
                setDistance(routeData.distance);
                setDuration(routeData.duration);
                setEstimatedDeparture(routeData.estimatedDeparture);
                setEstimatedArrival(routeData.estimatedArrival);
                setRouteDetails({
                  distance: parseFloat(routeData.distance.replace(/[^0-9.]/g, '')),
                  duration: routeData.route?.duration || 0,
                  waypoints: routeData.waypoints.map(wp => ({
                    lat: wp.coordinates[1],
                    lng: wp.coordinates[0],
                    name: wp.name,
                    address: wp.address,
                  })),
                });
              }}
            />

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-white">
                Weight
              </label>
              <input
                id="weight"
                name="weight"
                type="text"
                required
                placeholder="e.g. 32,500 lbs"
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                value={weight}
                onChange={e => setWeight(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="vehicle" className="block text-sm font-medium text-white">
                Vehicle (optional)
              </label>
              <select
                id="vehicle"
                name="vehicle"
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                value={vehicleId}
                onChange={e => setVehicleId(e.target.value)}
              >
                <option value="">Select a vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} ({vehicle.license_plate})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="driver" className="block text-sm font-medium text-white">
                Driver (optional)
              </label>
              <select
                id="driver"
                name="driver"
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                value={driverId}
                onChange={e => setDriverId(e.target.value)}
              >
                <option value="">Select a driver</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} ({driver.license_number})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
              >
                {isLoading ? 'Creating...' : 'Create Load'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
