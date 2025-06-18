/**
 * Loads Hook
 * Custom hook for managing load/shipment data
 */

import { useState, useEffect } from 'react';

interface Load {
  id: number;
  load_number: string;
  pickup_location: string;
  delivery_location: string;
  pickup_date: string;
  delivery_date: string;
  weight: number;
  status: string;
  rate: number;
  customer_name: string;
}

export const useLoads = () => {
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data for now - will be replaced with actual API calls
    const mockLoads: Load[] = [
      {
        id: 1,
        load_number: 'LD-2025-001',
        pickup_location: 'Chicago, IL',
        delivery_location: 'Atlanta, GA',
        pickup_date: '2025-01-21T08:00:00Z',
        delivery_date: '2025-01-22T17:00:00Z',
        weight: 45000,
        status: 'in_transit',
        rate: 2500.00,
        customer_name: 'ABC Manufacturing',
      },
      {
        id: 2,
        load_number: 'LD-2025-002',
        pickup_location: 'Los Angeles, CA',
        delivery_location: 'Phoenix, AZ',
        pickup_date: '2025-01-21T10:00:00Z',
        delivery_date: '2025-01-21T20:00:00Z',
        weight: 38000,
        status: 'scheduled',
        rate: 1800.00,
        customer_name: 'XYZ Logistics',
      },
      {
        id: 3,
        load_number: 'LD-2025-003',
        pickup_location: 'Miami, FL',
        delivery_location: 'New York, NY',
        pickup_date: '2025-01-22T06:00:00Z',
        delivery_date: '2025-01-23T18:00:00Z',
        weight: 42000,
        status: 'pending',
        rate: 3200.00,
        customer_name: 'DEF Shipping',
      },
    ];

    setLoads(mockLoads);
  }, []);

  const fetchLoads = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/loads');
      // const data = await response.json();
      // setLoads(data.loads);
    } catch (error) {
      setError('Failed to fetch loads');
      console.error('Error fetching loads:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loads,
    loading,
    error,
    fetchLoads,
  };
};
