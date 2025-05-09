'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ScaleIcon } from '@heroicons/react/24/outline';
import ComplianceChart from '@/components/Dashboard/ComplianceChart';
import VehicleWeightChart from '@/components/Dashboard/VehicleWeightChart';
import LoadStatusChart from '@/components/Dashboard/LoadStatusChart';
import DashboardStats from '@/components/Dashboard/DashboardStats';
import AdminCompanySelector from '@/components/Dashboard/AdminCompanySelector';
import QuickActions from '@/components/Dashboard/QuickActions';
import RecentWeightsTable from '@/components/Dashboard/RecentWeightsTable';

interface DashboardClientProps {
  userName: string;
  isAdmin: boolean;
}

export default function DashboardClient({ userName, isAdmin }: DashboardClientProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  const handleCompanyChange = (companyId: number | null) => {
    setSelectedCompanyId(companyId);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Welcome back, {userName || 'User'}! Here's what's happening with your fleet.
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

      {/* Admin Company Selector */}
      {isAdmin && (
        <AdminCompanySelector 
          onCompanyChange={handleCompanyChange} 
          selectedCompanyId={selectedCompanyId} 
        />
      )}

      {/* Stats Cards */}
      <DashboardStats 
        initialUserName={userName || 'User'} 
        companyId={selectedCompanyId} 
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-800 text-white">
            <h2 className="text-xl font-semibold">Weight Compliance</h2>
          </div>
          <ComplianceChart companyId={selectedCompanyId} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
            <h2 className="text-xl font-semibold">Vehicle Weight Distribution</h2>
          </div>
          <VehicleWeightChart companyId={selectedCompanyId} />
        </div>
      </div>

      {/* Recent Weights and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
            <h2 className="text-xl font-semibold">Recent Weight Measurements</h2>
          </div>
          <RecentWeightsTable companyId={selectedCompanyId} />
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
              <div className="flex items-start p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="h-5 w-5 bg-blue-200 dark:bg-blue-700 rounded-full mt-0.5 mr-3 flex-shrink-0 animate-pulse"></div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Loading alerts...</h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                    Please wait while we fetch your notifications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Load Status Chart and Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
            <h2 className="text-xl font-semibold">Load Status Distribution</h2>
          </div>
          <LoadStatusChart companyId={selectedCompanyId} />
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
