'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import {
  TruckIcon,
  ScaleIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface DashboardStatsProps {
  initialUserName: string;
  companyId?: number | null;
}

export default function DashboardStats({ initialUserName, companyId }: DashboardStatsProps) {
  const supabase = createClientComponentClient<Database>();
  const [stats, setStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState(initialUserName);
  const [expiringLicenses, setExpiringLicenses] = useState<number>(0);
  const [recentWeights, setRecentWeights] = useState<any[]>([]);

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

        // Use the new API endpoint to get dashboard stats
        const url = companyId
          ? `/api/dashboard/stats?companyId=${companyId}`
          : '/api/dashboard/stats';

        const response = await fetch(url, {
          headers: {
            'x-auth-token': session.access_token || '',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch dashboard stats');
        }

        const statsData = await response.json();

        // Get recent weights
        const weightsUrl = companyId
          ? `/api/dashboard/recent-weights?companyId=${companyId}`
          : '/api/dashboard/recent-weights';

        const weightsResponse = await fetch(weightsUrl, {
          headers: {
            'x-auth-token': session.access_token || '',
          },
        });

        if (!weightsResponse.ok) {
          throw new Error('Failed to fetch recent weights');
        }

        const weightsData = await weightsResponse.json();
        setRecentWeights(weightsData);

        // Get user data
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data: userDetails } = await supabase
            .from('users')
            .select('name')
            .eq('id', userData.user.id)
            .single();

          if (userDetails?.name) {
            setUserName(userDetails.name);
          }
        }

        // Get expiring licenses
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const { data: licenses } = await supabase
          .from('drivers')
          .select('*', { count: 'exact', head: true })
          .gte('license_expiry', today.toISOString())
          .lte('license_expiry', thirtyDaysFromNow.toISOString());

        setExpiringLicenses(licenses?.count || 0);

        // Format stats for display
        const formattedStats = [
          {
            label: 'Total Vehicles',
            value: statsData.vehicleCount.toString(),
            icon: TruckIcon,
            color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          },
          {
            label: 'Active Drivers',
            value: statsData.driverCount.toString(),
            icon: CalendarDaysIcon,
            color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          },
          {
            label: 'Compliance Rate',
            value: `${statsData.complianceRate}%`,
            icon: CheckCircleIcon,
            color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
          },
          {
            label: 'Active Loads',
            value: statsData.activeLoads.toString(),
            icon: ClockIcon,
            color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
          },
          {
            label: 'Weights Today',
            value: statsData.weightsToday.toString(),
            icon: ScaleIcon,
            color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
          },
          {
            label: 'Non-Compliant',
            value: statsData.nonCompliantWeights.toString(),
            icon: ExclamationTriangleIcon,
            color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          },
        ];

        setStats(formattedStats);
      } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        setError(error.message);

        // Try to recover by querying the database directly
        try {
          // Query the database directly for stats
          const [
            { data: vehicles, error: vehiclesError },
            { data: drivers, error: driversError },
            { data: loads, error: loadsError },
            { data: weights, error: weightsError },
          ] = await Promise.all([
            // Get vehicles count
            supabase.from('vehicles').select('id', { count: 'exact', head: true }),
            // Get drivers count
            supabase.from('drivers').select('id', { count: 'exact', head: true }),
            // Get active loads count
            supabase
              .from('loads')
              .select('id', { count: 'exact', head: true })
              .eq('status', 'In Transit'),
            // Get weights count
            supabase.from('weights').select('id, status', { count: 'exact' }),
          ]);

          if (vehiclesError || driversError || loadsError || weightsError) {
            throw new Error('Failed to fetch recovery data');
          }

          // Calculate compliance rate
          const totalWeights = weights?.length || 0;
          const nonCompliantWeights =
            weights?.filter(w => w.status === 'Non-Compliant').length || 0;
          const complianceRate =
            totalWeights > 0
              ? Math.round(((totalWeights - nonCompliantWeights) / totalWeights) * 100)
              : 100;

          // Get today's weights
          const today = new Date().toISOString().split('T')[0];
          const weightsToday =
            weights?.filter(w => w.created_at && w.created_at.startsWith(today)).length || 0;

          // Format stats for display
          const formattedStats = [
            {
              label: 'Total Vehicles',
              value: vehicles?.count?.toString() || '0',
              icon: TruckIcon,
              color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            },
            {
              label: 'Active Drivers',
              value: drivers?.count?.toString() || '0',
              icon: CalendarDaysIcon,
              color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            },
            {
              label: 'Compliance Rate',
              value: `${complianceRate}%`,
              icon: CheckCircleIcon,
              color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            },
            {
              label: 'Active Loads',
              value: loads?.count?.toString() || '0',
              icon: ClockIcon,
              color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
            },
            {
              label: 'Weights Today',
              value: weightsToday.toString(),
              icon: ScaleIcon,
              color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
            },
            {
              label: 'Non-Compliant',
              value: nonCompliantWeights.toString(),
              icon: ExclamationTriangleIcon,
              color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            },
          ];

          setStats(formattedStats);
          setError('Using local data - connection to API failed');
        } catch (recoveryError) {
          console.error('Recovery attempt failed:', recoveryError);
          // Keep the original error
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase, initialUserName, companyId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse"
          >
            <div className="flex items-center">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-12 w-12 mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md mb-8">
        <p className="text-red-700 dark:text-red-300">
          Error loading dashboard statistics. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${stat.color} mr-4`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
