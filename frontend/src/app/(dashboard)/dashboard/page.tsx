import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import RecentWeightsTable from '@/components/Dashboard/RecentWeightsTable';
import QuickActions from '@/components/Dashboard/QuickActions';
import dynamic from 'next/dynamic';
import { ScaleIcon } from '@heroicons/react/24/outline';
import DashboardClient from './client';

// Dynamically import chart components with no SSR to avoid hydration issues
const ComplianceChart = dynamic(() => import('@/components/Dashboard/ComplianceChart'), { ssr: false });
const VehicleWeightChart = dynamic(() => import('@/components/Dashboard/VehicleWeightChart'), { ssr: false });
const LoadStatusChart = dynamic(() => import('@/components/Dashboard/LoadStatusChart'), { ssr: false });
const DashboardStats = dynamic(() => import('@/components/Dashboard/DashboardStats'), { ssr: false });
const AdminCompanySelector = dynamic(() => import('@/components/Dashboard/AdminCompanySelector'), { ssr: false });

export default async function Dashboard() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Get minimal user data for initial rendering
  const { data: { user } } = await supabase.auth.getUser();
  const { data: userData } = await supabase
    .from('users')
    .select('name, is_admin')
    .eq('id', user?.id)
    .single();

  return <DashboardClient userName={userData?.name || 'User'} isAdmin={userData?.is_admin || false} />;
}
