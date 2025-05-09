'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { parseWeight } from '@/utils/compliance';

export default function VehicleWeightChart() {
  const supabase = createClientComponentClient<Database>();
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

        // Get auth token from supabase
        const { data: { session } } = await supabase.auth.getSession();

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

        // Use the new API endpoint to get vehicle weight data
        const response = await fetch(`/api/dashboard/vehicle-weights?dateRange=${dateRange}`, {
          headers: {
            'x-auth-token': session.access_token
          }
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

      } catch (error: any) {
        console.error('Error fetching vehicle weight data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase, dateRange]);

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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md">
        <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-primary-700 text-white flex justify-between items-center">
        <h2 className="text-xl font-semibold">Top 5 Vehicles by Weight</h2>
        <div className="flex space-x-2">
          {isAdmin && companyData.length > 0 && (
            <select
              className="bg-primary-800 text-white border border-primary-600 rounded px-2 py-1 text-sm"
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
            className="bg-primary-800 text-white border border-primary-600 rounded px-2 py-1 text-sm"
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
              <BarChart
                data={weightData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value.toLocaleString()} lbs`, 'Weight']} />
                <Legend />
                <Bar dataKey="weight" name="Total Weight (lbs)" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 dark:text-gray-400">No vehicle weight data available for this period</p>
          </div>
        )}
      </div>
    </div>
  );
}
