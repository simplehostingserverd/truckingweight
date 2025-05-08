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

export default function ComplianceChart() {
  const supabase = createClientComponentClient<Database>();
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('week'); // 'week', 'month', 'year'

  // Colors for compliance status
  const COLORS = {
    Compliant: '#10B981', // green
    Warning: '#F59E0B',   // amber
    'Non-Compliant': '#EF4444', // red
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
        
        // Get date range for filtering
        const today = new Date();
        let startDate = new Date();
        
        switch (dateRange) {
          case 'week':
            startDate.setDate(today.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(today.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(today.getFullYear() - 1);
            break;
          default:
            startDate.setDate(today.getDate() - 7);
        }
        
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = today.toISOString().split('T')[0];
        
        // Fetch weights for the company within date range
        const { data: weightsData, error: weightsError } = await supabase
          .from('weights')
          .select('status')
          .eq('company_id', userData.company_id)
          .gte('date', formattedStartDate)
          .lte('date', formattedEndDate);
          
        if (weightsError) {
          throw weightsError;
        }
        
        // Calculate compliance statistics
        const compliantCount = weightsData?.filter(w => w.status === 'Compliant').length || 0;
        const warningCount = weightsData?.filter(w => w.status === 'Warning').length || 0;
        const nonCompliantCount = weightsData?.filter(w => w.status === 'Non-Compliant').length || 0;
        
        setComplianceData([
          { name: 'Compliant', value: compliantCount },
          { name: 'Warning', value: warningCount },
          { name: 'Non-Compliant', value: nonCompliantCount }
        ]);
        
      } catch (error: any) {
        console.error('Error fetching compliance data:', error);
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
        <h2 className="text-xl font-semibold">Weight Compliance</h2>
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
      
      <div className="p-6">
        {complianceData.length > 0 && complianceData.some(item => item.value > 0) ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} weights`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 dark:text-gray-400">No compliance data available for this period</p>
          </div>
        )}
      </div>
    </div>
  );
}
