'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { determineComplianceStatus, getComplianceDetails } from '@/utils/compliance';

export default function NewWeight() {
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [complianceDetails, setComplianceDetails] = useState<any>(null);
  const [stateCode, setStateCode] = useState('');
  const [axleType, setAxleType] = useState<'SINGLE_AXLE' | 'TANDEM_AXLE' | 'GROSS_VEHICLE_WEIGHT'>('GROSS_VEHICLE_WEIGHT');
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get session
        const { data: { session } } = await supabase.auth.getSession();

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

        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        setDate(today);

      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [router, supabase]);

  // Update compliance details when weight, axle type, or state changes
  useEffect(() => {
    if (weight) {
      const details = getComplianceDetails(weight, axleType, stateCode);
      setComplianceDetails(details);
    } else {
      setComplianceDetails(null);
    }
  }, [weight, axleType, stateCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Get session
      const { data: { session } } = await supabase.auth.getSession();

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

      // Get compliance status
      const status = complianceDetails ? complianceDetails.status : determineComplianceStatus(weight, axleType, stateCode);

      // Create weight record
      const { data: newWeight, error: weightError } = await supabase
        .from('weights')
        .insert([
          {
            vehicle_id: parseInt(vehicleId),
            driver_id: parseInt(driverId),
            weight,
            date,
            time: time || null,
            status,
            company_id: userData.company_id,
            axle_type: axleType,
            state_code: stateCode || null,
            compliance_details: complianceDetails ? JSON.stringify(complianceDetails) : null,
          }
        ])
        .select()
        .single();

      if (weightError) {
        throw weightError;
      }

      // Redirect to weights list
      router.push('/weights');
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the weight record');
      console.error('Create weight error:', err);
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">New Weight Measurement</h1>

          <Link
            href="/weights"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </Link>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/30 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error}
                </h3>
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
              <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Vehicle
              </label>
              <select
                id="vehicle"
                name="vehicle"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
              >
                <option value="">Select a vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} ({vehicle.license_plate})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="driver" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Driver
              </label>
              <select
                id="driver"
                name="driver"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
              >
                <option value="">Select a driver</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} ({driver.license_number})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="axleType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Axle Type
              </label>
              <select
                id="axleType"
                name="axleType"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={axleType}
                onChange={(e) => setAxleType(e.target.value as any)}
              >
                <option value="GROSS_VEHICLE_WEIGHT">Gross Vehicle Weight</option>
                <option value="SINGLE_AXLE">Single Axle</option>
                <option value="TANDEM_AXLE">Tandem Axle</option>
              </select>
            </div>

            <div>
              <label htmlFor="stateCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                State (optional)
              </label>
              <select
                id="stateCode"
                name="stateCode"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
              >
                <option value="">Federal Regulations Only</option>
                <option value="CA">California</option>
                <option value="TX">Texas</option>
                <option value="NY">New York</option>
                <option value="FL">Florida</option>
                <option value="IL">Illinois</option>
              </select>
            </div>

            {complianceDetails && (
              <div className={`p-4 rounded-md ${
                complianceDetails.status === 'Compliant'
                  ? 'bg-green-50 dark:bg-green-900/30'
                  : complianceDetails.status === 'Warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/30'
                    : 'bg-red-50 dark:bg-red-900/30'
              }`}>
                <h3 className={`text-sm font-medium ${
                  complianceDetails.status === 'Compliant'
                    ? 'text-green-800 dark:text-green-200'
                    : complianceDetails.status === 'Warning'
                      ? 'text-yellow-800 dark:text-yellow-200'
                      : 'text-red-800 dark:text-red-200'
                }`}>
                  {complianceDetails.status}: {complianceDetails.message}
                </h3>
                <div className="mt-2 text-sm">
                  <p className="text-gray-700 dark:text-gray-300">
                    Weight: {complianceDetails.weightInPounds.toLocaleString()} lbs
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Federal Limit: {complianceDetails.federalLimit.toLocaleString()} lbs
                  </p>
                  {complianceDetails.stateLimit && (
                    <p className="text-gray-700 dark:text-gray-300">
                      State Limit: {complianceDetails.stateLimit.toLocaleString()} lbs
                    </p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Time (optional)
              </label>
              <input
                id="time"
                name="time"
                type="time"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400"
              >
                {isLoading ? 'Saving...' : 'Save Weight'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
