import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import StatsCard from '@/components/Dashboard/StatsCard';
import RecentWeightsTable from '@/components/Dashboard/RecentWeightsTable';
import QuickActions from '@/components/Dashboard/QuickActions';

export default async function Dashboard() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Get user data
  const { data: { session } } = await supabase.auth.getSession();
  const { data: userData } = await supabase
    .from('users')
    .select('*, companies(*)')
    .eq('id', session?.user.id)
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

  const stats = [
    { label: 'Total Vehicles', value: vehicleCount?.count?.toString() || '0' },
    { label: 'Weights Today', value: weightsToday?.count?.toString() || '0' },
    { label: 'Compliance Rate', value: `${complianceRate}%` },
    { label: 'Active Loads', value: activeLoads?.count?.toString() || '0' },
  ];

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} label={stat.label} value={stat.value} />
        ))}
      </div>

      {/* Recent Weights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 bg-primary-700 text-white">
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

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
