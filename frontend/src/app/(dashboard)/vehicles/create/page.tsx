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
import {
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  IdentificationIcon,
  ScaleIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { _useState } from 'react';

export default function CreateVehicle() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [name, setName] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [type, setType] = useState('Semi');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [licensePlate, setLicensePlate] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [vin, setVin] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [make, setMake] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [model, setModel] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [year, setYear] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [status, setStatus] = useState('Active');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [maxWeight, setMaxWeight] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSuccess, setIsSuccess] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _router = useRouter();
  null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _supabase = createClient();

  const handleSubmit = async (_e: _React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setIsSuccess(false);

    try {
      // Get user's company ID
      const {
        data: { _user },
      } = await supabase.auth.getUser();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _data: userData, _error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user?.id)
        .single();

      if (userError) {
        throw userError;
      }

      // Create vehicle record
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _data: vehicle, _error: vehicleError } = await supabase
        .from('vehicles')
        .insert({
          name,
          type,
          license_plate: licensePlate,
          vin: vin || null,
          make: make || null,
          model: model || null,
          year: year ? parseInt(year) : null,
          status,
          max_weight: maxWeight || null,
          company_id: userData.company_id,
        })
        .select()
        .single();

      if (vehicleError) {
        throw vehicleError;
      }

      setIsSuccess(true);

      // Reset form after successful submission
      setName('');
      setType('Semi');
      setLicensePlate('');
      setVin('');
      setMake('');
      setModel('');
      setYear('');
      setStatus('Active');
      setMaxWeight('');

      // Redirect to vehicle list after a short delay
      setTimeout(() => {
        router.push('/vehicles');
        router.refresh();
      }, 1500);
    } catch (_err: unknown) {
      setError((err instanceof Error ? err.message : String(err)) || 'An error occurred while creating the vehicle');
      console.error('Create vehicle error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate years for dropdown (from current year back to 1990)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentYear = new Date().getFullYear();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Add New Vehicle</h1>
        <Link
          href="/vehicles"
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Back to Vehicles
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-primary-700 text-white">
          <h2 className="text-xl font-semibold">Vehicle Information</h2>
        </div>

        {isSuccess && (
          <div className="p-4 m-6 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-md flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Vehicle created successfully! Redirecting...
          </div>
        )}

        {error && (
          <div className="p-4 m-6 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
            {_error}
          </div>
        )}

        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Vehicle Name *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TruckIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  required
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Truck 101"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Vehicle Type *
              </label>
              <select
                id="type"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                <option value="Semi">Semi</option>
                <option value="Box Truck">Box Truck</option>
                <option value="Flatbed">Flatbed</option>
                <option value="Tanker">Tanker</option>
                <option value="Reefer">Reefer</option>
                <option value="Dump Truck">Dump Truck</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="licensePlate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                License Plate *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IdentificationIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="licensePlate"
                  required
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="ABC-1234"
                  value={licensePlate}
                  onChange={e => setLicensePlate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="vin"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                VIN
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IdentificationIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="vin"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="1HGCM82633A123456"
                  value={vin}
                  onChange={e => setVin(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="make"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Make
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="make"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Freightliner"
                  value={make}
                  onChange={e => setMake(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="model"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Model
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TruckIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="model"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Cascadia"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="year"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Year
              </label>
              <select
                id="year"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={year}
                onChange={e => setYear(e.target.value)}
              >
                <option value="">Select Year</option>
                {years.map(y => (
                  <option key={y} value={y}>
                    {y}
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={_status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="maxWeight"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Maximum Weight
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ScaleIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="maxWeight"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="80,000 lbs"
                  value={maxWeight}
                  onChange={e => setMaxWeight(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href="/vehicles"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={_isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
