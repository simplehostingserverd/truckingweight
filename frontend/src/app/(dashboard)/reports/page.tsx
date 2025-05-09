import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import {
  DocumentChartBarIcon,
  TruckIcon,
  ScaleIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Dynamically import chart components with no SSR to avoid hydration issues
const ComplianceChart = dynamic(() => import('@/components/Dashboard/ComplianceChart'), { ssr: false });
const VehicleWeightChart = dynamic(() => import('@/components/Dashboard/VehicleWeightChart'), { ssr: false });

export default async function Reports() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Get user data
  const { data: { user } } = await supabase.auth.getUser();
  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user?.id)
    .single();

  // Get company data
  const { data: companyData } = await supabase
    .from('companies')
    .select('name')
    .eq('id', userData?.company_id)
    .single();

  // Get counts for summary
  const { data: vehicleCount } = await supabase
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', userData?.company_id);

  const { data: driverCount } = await supabase
    .from('drivers')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', userData?.company_id);

  const { data: weightCount } = await supabase
    .from('weights')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', userData?.company_id);

  const { data: loadCount } = await supabase
    .from('loads')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', userData?.company_id);

  // Get non-compliant weights count
  const { data: nonCompliantCount } = await supabase
    .from('weights')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', userData?.company_id)
    .eq('status', 'Non-Compliant');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Reports</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Analytics and reports for {companyData?.name || 'your company'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Last 30 Days
          </button>

          <button
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export All Reports
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
              <TruckIcon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{vehicleCount?.count || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
              <UserGroupIcon className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Drivers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{driverCount?.count || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 mr-4">
              <ScaleIcon className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Weights</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{weightCount?.count || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 mr-4">
              <DocumentChartBarIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loads</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{loadCount?.count || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900 mr-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Non-Compliant</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{nonCompliantCount?.count || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-primary-700 text-white">
            <h2 className="text-xl font-semibold">Weight Compliance</h2>
          </div>
          <ComplianceChart />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-primary-700 text-white">
            <h2 className="text-xl font-semibold">Vehicle Weight Distribution</h2>
          </div>
          <VehicleWeightChart />
        </div>
      </div>

      {/* Available Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 bg-primary-700 text-white">
          <h2 className="text-xl font-semibold">Available Reports</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center mb-4">
                <DocumentTextIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Weight Compliance Report</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Detailed analysis of weight measurements and compliance status across your fleet.
              </p>
              <Link
                href="/reports/weight-compliance"
                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm"
              >
                Generate Report →
              </Link>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center mb-4">
                <DocumentTextIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Vehicle Performance Report</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Analysis of vehicle usage, maintenance status, and weight distribution.
              </p>
              <Link
                href="/reports/vehicle-performance"
                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm"
              >
                Generate Report →
              </Link>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center mb-4">
                <DocumentTextIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Driver Activity Report</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Summary of driver assignments, loads completed, and compliance records.
              </p>
              <div className="flex justify-between">
                <Link
                  href="/reports/driver-activity"
                  className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm"
                >
                  Generate Report →
                </Link>
                <Link
                  href="/driver-tracking"
                  className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-medium text-sm"
                >
                  Live Tracking →
                </Link>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center mb-4">
                <DocumentTextIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Load Management Report</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Overview of load statuses, delivery performance, and route efficiency.
              </p>
              <Link
                href="/reports/load-management"
                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm"
              >
                Generate Report →
              </Link>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center mb-4">
                <DocumentTextIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Compliance Trend Report</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Historical analysis of compliance trends and potential risk areas.
              </p>
              <Link
                href="/reports/compliance-trends"
                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm"
              >
                Generate Report →
              </Link>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center mb-4">
                <DocumentTextIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Custom Report</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Create a custom report with specific parameters and data points.
              </p>
              <Link
                href="/reports/custom"
                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm"
              >
                Create Custom Report →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
