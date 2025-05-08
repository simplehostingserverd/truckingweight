'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

export default function LoadStatusChart() {
  const supabase = createClientComponentClient<Database>();
  const [loadData, setLoadData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Colors for load status
  const COLORS = {
    Pending: '#6366F1',   // indigo
    'In Transit': '#8B5CF6', // purple
    Delivered: '#10B981', // green
    Cancelled: '#6B7280'  // gray
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }
        
        if (!user) {
          throw new Error('User not found');
        }
        
        // Get user details including company_id
        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (userDataError) {
          throw userDataError;
        }
        
        // Fetch loads for the company
        const { data: loadsData, error: loadsError } = await supabase
          .from('loads')
          .select('status')
          .eq('company_id', userData.company_id);
          
        if (loadsError) {
          throw loadsError;
        }
        
        // Calculate loads by status
        const loadsByStatusMap = new Map();
        
        loadsData?.forEach(load => {
          const status = load.status;
          
          if (loadsByStatusMap.has(status)) {
            loadsByStatusMap.set(status, loadsByStatusMap.get(status) + 1);
          } else {
            loadsByStatusMap.set(status, 1);
          }
        });
        
        const loadsByStatusArray = Array.from(loadsByStatusMap.entries()).map(([name, count]) => ({
          name,
          value: count
        }));
        
        setLoadData(loadsByStatusArray);
        
      } catch (error: any) {
        console.error('Error fetching load status data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [supabase]);
  
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
      <div className="px-6 py-4 bg-primary-700 text-white">
        <h2 className="text-xl font-semibold">Loads by Status</h2>
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
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} loads`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 dark:text-gray-400">No load data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
