'use client';

import Link from 'next/link';
import {
  DocumentChartBarIcon,
  TruckIcon,
  ScaleIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import ComplianceChart from '@/components/Dashboard/ComplianceChart';
import VehicleWeightChart from '@/components/Dashboard/VehicleWeightChart';

interface ReportsClientProps {
  companyName: string;
  vehicleCount: number;
  driverCount: number;
  weightCount: number;
  loadCount: number;
  nonCompliantCount: number;
  companyId: number;
}

export default function ReportsClient({
  companyName,
  vehicleCount,
  driverCount,
  weightCount,
  loadCount,
  nonCompliantCount,
  companyId,
}: ReportsClientProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Reports</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Analytics and reports for {companyName || 'your company'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Last 30 Days
          </button>

          <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{vehicleCount}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{driverCount}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{weightCount}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{loadCount}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {nonCompliantCount}
              </p>
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
          <ComplianceChart companyId={companyId} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-primary-700 text-white">
            <h2 className="text-xl font-semibold">Vehicle Weight Distribution</h2>
          </div>
          <VehicleWeightChart companyId={companyId} />
        </div>
      </div>

      {/* Available Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 bg-primary-700 text-white">
          <h2 className="text-xl font-semibold">Available Reports</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Report cards */}
            {[
              {
                title: 'Weight Compliance Report',
                description:
                  'Detailed analysis of weight measurements and compliance status across your fleet.',
                link: '/reports/weight-compliance',
              },
              {
                title: 'Vehicle Performance Report',
                description:
                  'Analysis of vehicle usage, maintenance status, and weight distribution.',
                link: '/reports/vehicle-performance',
              },
              {
                title: 'Driver Activity Report',
                description:
                  'Summary of driver assignments, loads completed, and compliance records.',
                link: '/reports/driver-activity',
                secondaryLink: {
                  text: 'Live Tracking',
                  href: '/driver-tracking',
                },
              },
              {
                title: 'Load Management Report',
                description:
                  'Overview of load statuses, delivery performance, and route efficiency.',
                link: '/reports/load-management',
              },
              {
                title: 'Compliance Trend Report',
                description: 'Historical analysis of compliance trends and potential risk areas.',
                link: '/reports/compliance-trends',
              },
              {
                title: 'Custom Report',
                description: 'Create a custom report with specific parameters and data points.',
                link: '/reports/custom',
              },
            ].map((report, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center mb-4">
                  <DocumentTextIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {report.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {report.description}
                </p>
                <div className="flex justify-between">
                  <Link
                    href={report.link}
                    className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm"
                  >
                    Generate Report →
                  </Link>
                  {report.secondaryLink && (
                    <Link
                      href={report.secondaryLink.href}
                      className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-medium text-sm"
                    >
                      {report.secondaryLink.text} →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
