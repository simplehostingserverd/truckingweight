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
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditWeight({ params }: { params: { id: string } }) {
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
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

        // Get weight data
        const { data: weightData, error: weightError } = await supabase
          .from('weights')
          .select('*')
          .eq('id', id)
          .single();

        if (weightError) {
          throw weightError;
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
        setVehicleId(weightData.vehicle_id?.toString() || '');
        setDriverId(weightData.driver_id?.toString() || '');
        setWeight(weightData.weight || '');
        setDate(weightData.date || '');
        setTime(weightData.time || '');
        setStatus(weightData.status || '');

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

  const calculateStatus = (weightValue: string): string => {
    // Simple example logic - in a real app, this would be more complex
    const numericWeight = parseInt(weightValue.replace(/[^0-9]/g, ''), 10);

    if (numericWeight <= 30000) {
      return 'Compliant';
    } else if (numericWeight <= 35000) {
      return 'Warning';
    } else {
      return 'Non-Compliant';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Calculate status based on weight
      const newStatus = calculateStatus(weight);

      // Update weight record
      const { error: weightError } = await supabase
        .from('weights')
        .update({
          vehicle_id: parseInt(vehicleId),
          driver_id: parseInt(driverId),
          weight,
          date,
          time: time || null,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (weightError) {
        throw weightError;
      }

      // Redirect to weight detail
      router.push(`/weights/${id}`);
    } catch (err: any /* @ts-ignore */) {
      setError(err.message || 'An error occurred while updating the weight record');
      console.error('Update weight error:', err);
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Edit Weight Measurement
          </h1>

          <Link
            href={`/weights/${id}`}
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
            <h2 className="text-xl font-semibold">Weight Information</h2>
          </div>

          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="vehicle"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Vehicle
              </label>
              <select
                id="vehicle"
                name="vehicle"
                required
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
                Driver
              </label>
              <select
                id="driver"
                name="driver"
                required
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
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Time (optional)
              </label>
              <input
                id="time"
                name="time"
                type="time"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
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
