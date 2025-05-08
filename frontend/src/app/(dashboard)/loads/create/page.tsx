'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

export default function CreateLoad() {
  const [description, setDescription] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [weight, setWeight] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [estimatedDeparture, setEstimatedDeparture] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState('');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [routeDetails, setRouteDetails] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
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

      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [router, supabase]);

  // Calculate route details
  const calculateRoute = async () => {
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
          { lat: 40.7128, lng: -74.0060 }, // Example coordinates
          { lat: 34.0522, lng: -118.2437 }
        ]
      });

    } catch (err: any) {
      setError('Failed to calculate route: ' + (err.message || 'Unknown error'));
      console.error('Route calculation error:', err);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

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

      // Create load record with route details
      const { data: newLoad, error: loadError } = await supabase
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
            route_details: routeDetails ? JSON.stringify(routeDetails) : null
          }
        ])
        .select()
        .single();

      if (loadError) {
        throw loadError;
      }

      // Redirect to loads list
      router.push('/loads');
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the load');
      console.error('Create load error:', err);
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Create New Load</h1>

          <Link
            href="/loads"
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
            <h2 className="text-xl font-semibold">Load Information</h2>
          </div>

          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <input
                id="description"
                name="description"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="origin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Origin
                </label>
                <input
                  id="origin"
                  name="origin"
                  type="text"
                  required
                  placeholder="e.g. New York, NY"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Destination
                </label>
                <input
                  id="destination"
                  name="destination"
                  type="text"
                  required
                  placeholder="e.g. Los Angeles, CA"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={calculateRoute}
                disabled={isCalculatingRoute || !origin || !destination}
                className="px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 disabled:bg-secondary-400"
              >
                {isCalculatingRoute ? 'Calculating...' : 'Calculate Route'}
              </button>
            </div>

            {routeDetails && (
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Route Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Distance: {distance}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Duration: {duration}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="estimatedDeparture" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estimated Departure
                </label>
                <input
                  id="estimatedDeparture"
                  name="estimatedDeparture"
                  type="datetime-local"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={estimatedDeparture}
                  onChange={(e) => setEstimatedDeparture(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="estimatedArrival" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estimated Arrival
                </label>
                <input
                  id="estimatedArrival"
                  name="estimatedArrival"
                  type="datetime-local"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={estimatedArrival}
                  onChange={(e) => setEstimatedArrival(e.target.value)}
                />
              </div>
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
              <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Vehicle (optional)
              </label>
              <select
                id="vehicle"
                name="vehicle"
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
                Driver (optional)
              </label>
              <select
                id="driver"
                name="driver"
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

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400"
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
