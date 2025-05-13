'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface LoadStatusChartProps {
  companyId?: number | null;
}

export default function LoadStatusChart({ companyId }: LoadStatusChartProps) {
  const supabase = createClientComponentClient<Database>();
  const [loadData, setLoadData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Colors for load status
  const COLORS = {
    Pending: '#3b82f6', // blue
    'In Transit': '#8b5cf6', // purple
    Delivered: '#22c55e', // green
    Cancelled: '#6b7280', // gray
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Get auth token from supabase
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error('No active session');
        }

        // Use the new API endpoint to get load status data
        const url = companyId
          ? `/api/dashboard/load-status?companyId=${companyId}`
          : '/api/dashboard/load-status';

        const response = await fetch(url, {
          headers: {
            'x-auth-token': session.access_token,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch load status data');
        }

        const loadData = await response.json();

        // Set the load data
        setLoadData(loadData);
      } catch (error: any) {
        console.error('Error fetching load status data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase, companyId]);

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
          Error loading load status data. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden border border-gray-800">
      <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Loads by Status</h2>
        <div className="h-2 w-2 rounded-full bg-green-500"></div>
      </div>

      <div className="p-6">
        {loadData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={loadData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {loadData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={value => [`${value} loads`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#1E1E1E',
                    border: '1px solid #333',
                    borderRadius: '4px',
                  }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#aaa' }}
                />
                <Legend formatter={value => <span style={{ color: '#fff' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-400">No load data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
