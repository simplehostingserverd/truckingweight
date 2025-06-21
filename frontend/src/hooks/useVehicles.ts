/**
 * Vehicles Hook
 * Custom hook for managing vehicle data
 */

import { useState, useEffect } from 'react';

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin: string;
  vehicle_type: string;
  _status: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useVehicles = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data for now - will be replaced with actual API calls
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mockVehicles: Vehicle[] = [
      {
        id: 1,
        make: 'Freightliner',
        model: 'Cascadia',
        year: 2022,
        license_plate: 'TRK-001',
        vin: '1FUJGHDV8NLAA1234',
        vehicle_type: 'Semi-Truck',
        status: 'active',
      },
      {
        id: 2,
        make: 'Peterbilt',
        model: '579',
        year: 2021,
        license_plate: 'TRK-002',
        vin: '1XPWD40X1ED123456',
        vehicle_type: 'Semi-Truck',
        status: 'active',
      },
      {
        id: 3,
        make: 'Kenworth',
        model: 'T680',
        year: 2023,
        license_plate: 'TRK-003',
        vin: '1XKWD40X5JJ789012',
        vehicle_type: 'Semi-Truck',
        status: 'maintenance',
      },
    ];

    setVehicles(mockVehicles);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // const response = await fetch('/api/vehicles');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // const _data = await response.json();
      // setVehicles(data.vehicles);
    } catch (error) {
      setError('Failed to fetch vehicles');
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    vehicles,
    loading,
    error,
    fetchVehicles,
  };
};
