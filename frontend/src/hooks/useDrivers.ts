/**
 * Drivers Hook
 * Custom hook for managing driver data
 */

import { useState, useEffect } from 'react';

interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  license_number: string;
  license_class: string;
  phone: string;
  email: string;
  status: string;
  hire_date: string;
}

export const useDrivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data for now - will be replaced with actual API calls
    const mockDrivers: Driver[] = [
      {
        id: 1,
        first_name: 'John',
        last_name: 'Smith',
        license_number: 'CDL123456789',
        license_class: 'Class A',
        phone: '555-0101',
        email: 'john.smith@company.com',
        status: 'active',
        hire_date: '2023-01-15',
      },
      {
        id: 2,
        first_name: 'Sarah',
        last_name: 'Johnson',
        license_number: 'CDL987654321',
        license_class: 'Class A',
        phone: '555-0102',
        email: 'sarah.johnson@company.com',
        status: 'active',
        hire_date: '2022-08-20',
      },
      {
        id: 3,
        first_name: 'Mike',
        last_name: 'Davis',
        license_number: 'CDL456789123',
        license_class: 'Class A',
        phone: '555-0103',
        email: 'mike.davis@company.com',
        status: 'on_leave',
        hire_date: '2021-03-10',
      },
    ];

    setDrivers(mockDrivers);
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/drivers');
      // const data = await response.json();
      // setDrivers(data.drivers);
    } catch (error) {
      setError('Failed to fetch drivers');
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    drivers,
    loading,
    error,
    fetchDrivers,
  };
};
