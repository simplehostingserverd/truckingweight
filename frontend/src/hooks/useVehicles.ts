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
  status: string;
}

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data for now - will be replaced with actual API calls
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

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/vehicles');
      // const data = await response.json();
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
