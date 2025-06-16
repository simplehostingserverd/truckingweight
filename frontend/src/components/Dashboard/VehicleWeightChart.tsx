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

import { createClient } from '@/utils/supabase/client';
import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface VehicleWeightChartProps {
  companyId?: number | null;
}

function VehicleWeightChart({ companyId }: VehicleWeightChartProps) {
  const supabase = createClient();
  const [weightData, setWeightData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('week'); // 'week', 'month', 'year'
  const [isAdmin, setIsAdmin] = useState(false);
  const [companyData, setCompanyData] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('overall');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Get auth token from supabase
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error('No active session');
        }

        // Check if user is admin
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data: userDetails } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', userData.user.id)
            .single();

          setIsAdmin(userDetails?.is_admin === true);
        }

        // Use the API endpoint to get vehicle weight data
        const url = companyId
          ? `/api/dashboard/vehicle-weights?dateRange=${dateRange}&companyId=${companyId}`
          : `/api/dashboard/vehicle-weights?dateRange=${dateRange}`;

        const response = await fetch(url, {
          headers: {
            'x-auth-token': session.access_token || '',
          },
          // Add cache control to ensure fresh data
          cache: 'no-cache',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch vehicle weight data');
        }

        const data = await response.json();

        // Handle different data formats based on admin status
        if (data.overall && data.byCompany) {
          // Admin view with company breakdown
          setCompanyData(data.byCompany);
          setWeightData(data.overall);
        } else {
          // Regular user view or admin with specific company filter
          setWeightData(data);
        }
      } catch (error: any /* @ts-ignore */) {
        console.error('Error fetching vehicle weight data:', error);
        setError(error.message);

        // Try to recover by querying the database directly
        try {
          // Query vehicles directly from the database
          // Note: Using max_weight instead of weight as per the database schema
          let vehiclesQuery = supabase.from('vehicles').select('id, name, max_weight');

          // If not admin and we have a company ID, filter by it
          if (!isAdmin && companyId) {
            vehiclesQuery = vehiclesQuery.eq('company_id', companyId);
          }

          const { data: vehicles, error: vehiclesError } = await vehiclesQuery;

          if (vehiclesError) {
            throw vehiclesError;
          }

          // If we have vehicles, format them for the chart
          if (vehicles && vehicles.length > 0) {
            // Group by vehicle name and calculate average weight
            const vehicleWeights = {};

            vehicles.forEach(vehicle => {
              const weightValue = parseFloat(vehicle.max_weight || '0');

              if (!isNaN(weightValue) && weightValue > 0) {
                if (!vehicleWeights[vehicle.name]) {
                  vehicleWeights[vehicle.name] = {
                    total: 0,
                    count: 0,
                  };
                }

                vehicleWeights[vehicle.name].total += weightValue;
                vehicleWeights[vehicle.name].count++;
              }
            });

            // Format for chart
            const formattedData = Object.entries(vehicleWeights)
              .map(([name, data]) => ({
                name,
                weight: Math.round(data.total / data.count),
              }))
              .sort((a, b) => b.weight - a.weight)
              .slice(0, 5); // Top 5 vehicles by weight

            setWeightData(formattedData);
            setError('Using local data - connection to API failed');
          }
        } catch (recoveryError) {
          console.error('Recovery attempt failed:', recoveryError);
          // Keep the original error
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase, dateRange, companyId, isAdmin]);

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateRange(e.target.value);
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = e.target.value;
    setSelectedCompany(companyId);

    if (companyId === 'overall') {
      // Show overall data
      setWeightData(companyData.overall);
    } else {
      // Find the selected company data
      const company = companyData.find(c => c.companyId.toString() === companyId);
      if (company) {
        setWeightData(company.data);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 p-4 rounded-md border border-red-800">
        <p className="text-red-400 text-sm">
          Error loading vehicle weight data. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden border border-gray-800">
      <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Top 5 Vehicles by Weight</h2>
        <div className="flex space-x-2">
          {isAdmin && companyData.length > 0 && (
            <select
              aria-label="Select company"
              className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCompany}
              onChange={handleCompanyChange}
            >
              <option value="overall">All Companies</option>
              {companyData.map(company => (
                <option key={company.companyId} value={company.companyId.toString()}>
                  {company.companyName}
                </option>
              ))}
            </select>
          )}
          <select
            aria-label="Select date range"
            className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={dateRange}
            onChange={handleDateRangeChange}
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        {weightData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weightData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" tick={{ fill: '#fff' }} />
                <YAxis tick={{ fill: '#fff' }} />
                <Tooltip
                  formatter={value => [`${value.toLocaleString()} lbs`, 'Weight']}
                  contentStyle={{
                    backgroundColor: '#1E1E1E',
                    border: '1px solid #333',
                    borderRadius: '4px',
                  }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#aaa' }}
                />
                <Legend formatter={value => <span className="text-white">{value}</span>} />
                <Bar dataKey="weight" name="Total Weight (lbs)" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-400">No vehicle weight data available for this period</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(VehicleWeightChart);
