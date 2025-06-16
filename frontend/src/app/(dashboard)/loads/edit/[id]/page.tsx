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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

export default function EditLoad({ params }: { params: { id: string } }) {
  const [description, setDescription] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [weight, setWeight] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [status, setStatus] = useState('');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const { id } = params;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push('/login');
          return;
        }

        // Get user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          throw userError;
        }

        // Get load data
        const { data: loadData, error: loadError } = await supabase
          .from('loads')
          .select('*')
          .eq('id', id)
          .single();

        if (loadError) {
          throw loadError;
        }

        // Get vehicles
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('id, name, type, license_plate')
          .eq('company_id', userData.company_id)
          .order('name');

        if (vehiclesError) {
          throw vehiclesError;
        }

        // Get drivers
        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('id, name, license_number')
          .eq('company_id', userData.company_id)
          .order('name');

        if (driversError) {
          throw driversError;
        }

        // Set form data
        setDescription(loadData.description || '');
        setOrigin(loadData.origin || '');
        setDestination(loadData.destination || '');
        setWeight(loadData.weight || '');
        setVehicleId(loadData.vehicle_id?.toString() || '');
        setDriverId(loadData.driver_id?.toString() || '');
        setStatus(loadData.status || '');

        setVehicles(vehiclesData || []);
        setDrivers(driversData || []);
      } catch (err: any /* @ts-ignore */) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [id, router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Update load record
      const { error: loadError } = await supabase
        .from('loads')
        .update({
          description,
          origin,
          destination,
          weight,
          vehicle_id: vehicleId ? parseInt(vehicleId) : null,
          driver_id: driverId ? parseInt(driverId) : null,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (loadError) {
        throw loadError;
      }

      // Redirect to load detail
      router.push({ pathname: `/loads/${id}` });
    } catch (err: any /* @ts-ignore */) {
      setError(err.message || 'An error occurred while updating the load');
      console.error('Update load error:', err);
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit Load</h1>

          <Link
            href={`/loads/${id}`}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </Link>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/30 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-primary-700 text-white">
            <h2 className="text-xl font-semibold">Load Information</h2>
          </div>

          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description
              </label>
              <input
                id="description"
                name="description"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="origin"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Origin
                </label>
                <input
                  id="origin"
                  name="origin"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={origin}
                  onChange={e => setOrigin(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="destination"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Destination
                </label>
                <input
                  id="destination"
                  name="destination"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Weight
              </label>
              <input
                id="weight"
                name="weight"
                type="text"
                required
                placeholder="e.g. 32,500 lbs"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={weight}
                onChange={e => setWeight(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="vehicle"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Vehicle (optional)
              </label>
              <select
                id="vehicle"
                name="vehicle"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              <label
                htmlFor="driver"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Driver (optional)
              </label>
              <select
                id="driver"
                name="driver"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
