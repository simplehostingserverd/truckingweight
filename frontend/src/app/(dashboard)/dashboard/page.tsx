import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import StatsCard from '@/components/Dashboard/StatsCard';
import RecentWeightsTable from '@/components/Dashboard/RecentWeightsTable';
import QuickActions from '@/components/Dashboard/QuickActions';
import dynamic from 'next/dynamic';
import {
  TruckIcon,
  ScaleIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Dynamically import chart components with no SSR to avoid hydration issues
const ComplianceChart = dynamic(() => import('@/components/Dashboard/ComplianceChart'), { ssr: false });
const VehicleWeightChart = dynamic(() => import('@/components/Dashboard/VehicleWeightChart'), { ssr: false });
const LoadStatusChart = dynamic(() => import('@/components/Dashboard/LoadStatusChart'), { ssr: false });

export default async function Dashboard() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Get user data
  const { data: { user } } = await supabase.auth.getUser();
  const { data: userData } = await supabase
    .from('users')
    .select('*, companies(*)')
    .eq('id', user?.id)
    .single();

  // Get stats
  const { data: vehicleCount } = await supabase
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', userData?.company_id);

  const { data: weightsToday } = await supabase
    .from('weights')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', userData?.company_id)
    .gte('date', new Date().toISOString().split('T')[0]);

  const { data: weights } = await supabase
    .from('weights')
    .select('*')
    .eq('company_id', userData?.company_id)
    .order('created_at', { ascending: false });

  const { data: activeLoads } = await supabase
    .from('loads')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', userData?.company_id)
    .in('status', ['Pending', 'In Transit']);

  // Calculate compliance rate
  const totalWeights = weights?.length || 0;
  const compliantWeights = weights?.filter(w => w.status === 'Compliant').length || 0;
  const complianceRate = totalWeights > 0
    ? Math.round((compliantWeights / totalWeights) * 100)
    : 0;

  // Get recent weights with vehicle and driver info
  const { data: recentWeights } = await supabase
    .from('weights')
    .select(`
      id,
      weight,
      date,
      time,
      status,
      vehicle_id,
      driver_id,
      vehicles(id, name),
      drivers(id, name)
    `)
    .eq('company_id', userData?.company_id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get drivers count
  const { data: driverCount } = await supabase
    .from('drivers')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', userData?.company_id);

  // Get non-compliant weights count
  const nonCompliantWeights = weights?.filter(w => w.status === 'Non-Compliant').length || 0;

  const stats = [
    {
      label: 'Total Vehicles',
      value: vehicleCount?.count?.toString() || '0',
      icon: TruckIcon,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    },
    {
      label: 'Active Drivers',
      value: driverCount?.count?.toString() || '0',
      icon: CalendarDaysIcon,
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    },
    {
      label: 'Compliance Rate',
      value: `${complianceRate}%`,
      icon: CheckCircleIcon,
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    },
    {
      label: 'Active Loads',
      value: activeLoads?.count?.toString() || '0',
      icon: ClockIcon,
      color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    },
    {
      label: 'Weights Today',
      value: weightsToday?.count?.toString() || '0',
      icon: ScaleIcon,
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    },
    {
      label: 'Non-Compliant',
      value: nonCompliantWeights.toString(),
      icon: ExclamationTriangleIcon,
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    },
  ];

  // Get upcoming license expirations
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const { data: expiringLicenses } = await supabase
    .from('drivers')
    .select('*')
    .eq('company_id', userData?.company_id)
    .gte('license_expiry', today.toISOString())
    .lte('license_expiry', thirtyDaysFromNow.toISOString());

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Welcome back, {userData?.name || 'User'}! Here's what's happening with your fleet.
          </p>
        </div>
        <div className="flex space-x-2">
          <Link
            href="/weights/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ScaleIcon className="h-4 w-4 mr-2" />
            New Weight
          </Link>
          <Link
            href="/weights/capture"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <ScaleIcon className="h-4 w-4 mr-2" />
            Weight Capture
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ComplianceChart />
        <VehicleWeightChart />
      </div>

      {/* Recent Weights and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
            <h2 className="text-xl font-semibold">Recent Weight Measurements</h2>
          </div>
          <RecentWeightsTable weights={recentWeights || []} />
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900">
            <Link
              href="/weights"
              className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              View all weights →
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-800 text-white">
            <h2 className="text-xl font-semibold">Alerts & Notifications</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {nonCompliantWeights > 0 && (
                <div className="flex items-start p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Non-Compliant Weights</h3>
                    <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                      You have {nonCompliantWeights} non-compliant weight records that need attention.
                    </p>
                  </div>
                </div>
              )}

              {(expiringLicenses?.length || 0) > 0 && (
                <div className="flex items-start p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <ClockIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Expiring Licenses</h3>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                      {expiringLicenses?.length} driver licenses will expire in the next 30 days.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <TruckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Active Loads</h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                    You have {activeLoads?.count || 0} active loads currently in transit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-800 text-white">
            <h2 className="text-xl font-semibold">Weight Compliance</h2>
          </div>
          <ComplianceChart />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
            <h2 className="text-xl font-semibold">Vehicle Weight Distribution</h2>
          </div>
          <VehicleWeightChart />
        </div>
      </div>

      {/* Load Status Chart and Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
            <h2 className="text-xl font-semibold">Load Status Distribution</h2>
          </div>
          <LoadStatusChart />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
          </div>
          <div className="p-6">
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}
