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
          .select('weight, vehicle_id')
          .eq('company_id', userData.company_id)
          .gte('date', formattedStartDate)
          .lte('date', formattedEndDate);
          
        if (weightsError) {
          throw weightsError;
        }
        
        // Fetch vehicles for the company
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('id, name')
          .eq('company_id', userData.company_id);
          
        if (vehiclesError) {
          throw vehiclesError;
        }
        
        // Calculate weights by vehicle
        const weightsByVehicleMap = new Map();
        
        weightsData?.forEach(weight => {
          const vehicle = vehiclesData?.find(v => v.id === weight.vehicle_id);
          if (vehicle) {
            const vehicleName = vehicle.name;
            const weightValue = parseWeight(weight.weight);
            
            if (weightsByVehicleMap.has(vehicleName)) {
              weightsByVehicleMap.set(vehicleName, weightsByVehicleMap.get(vehicleName) + weightValue);
            } else {
              weightsByVehicleMap.set(vehicleName, weightValue);
            }
          }
        });
        
        const weightsByVehicleArray = Array.from(weightsByVehicleMap.entries()).map(([name, weight]) => ({
          name,
          weight: Math.round(weight as number)
        }));
        
        setWeightData(weightsByVehicleArray.sort((a, b) => b.weight - a.weight).slice(0, 5));
        
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
