/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

'use client';

import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

import AdminCompanySelector from '@/components/Dashboard/AdminCompanySelector';
import DashboardStats from '@/components/Dashboard/DashboardStats';
import QuickActions from '@/components/Dashboard/QuickActions';
import RecentWeightsTable from '@/components/Dashboard/RecentWeightsTable';
import LiveDriverActivity from '@/components/Dashboard/LiveDriverActivity';
import { Alert, AlertDescription } from '@/components/ui';
import { ScaleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, lazy, useState, useEffect } from 'react';

// Dynamically import chart components to reduce initial bundle size
const ComplianceChart = lazy(() => import('@/components/Dashboard/ComplianceChart'));
const VehicleWeightChart = lazy(() => import('@/components/Dashboard/VehicleWeightChart'));
const LoadStatusChart = lazy(() => import('@/components/Dashboard/LoadStatusChart'));

interface DashboardClientProps {
  userName: string;
  isAdmin: boolean;
}

export default function DashboardClient({ userName, isAdmin }: DashboardClientProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for access denied error in URL parameters
    if (searchParams.get('error') === 'access_denied') {
      setShowAccessDenied(true);
      // Clear the error parameter from URL without page reload
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  const handleCompanyChange = (companyId: number | null) => {
    setSelectedCompanyId(companyId);
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-6">
        {/* Access Denied Alert */}
        {showAccessDenied && (
          <Alert className="mb-6 border-red-600 bg-red-900/20">
            <XMarkIcon className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              Access denied. Company administrators do not have permission to access that feature.
              <button
                onClick={() => setShowAccessDenied(false)}
                className="ml-2 text-red-400 hover:text-red-300 underline"
              >
                Dismiss
              </button>
            </AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-400">
              Welcome back, {userName || 'User'}! Here's what's happening with your fleet.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/weights/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Create new weight record"
            >
              <ScaleIcon className="h-4 w-4 mr-2" aria-hidden="true" />
              <span>New Weight</span>
            </Link>
            <Link
              href="/weights/capture"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              aria-label="Capture weight from scale"
            >
              <ScaleIcon className="h-4 w-4 mr-2" aria-hidden="true" />
              <span>Weight Capture</span>
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
        <DashboardStats initialUserName={userName || 'User'} companyId={selectedCompanyId} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden border border-gray-800">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-800 flex flex-wrap justify-between items-center">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Weight Compliance</h2>
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            </div>
            <div className="px-2 sm:px-0">
              <Suspense fallback={<ChartSkeleton />}>
                <ComplianceChart companyId={selectedCompanyId} />
              </Suspense>
            </div>
          </div>

          <div className="bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden border border-gray-800">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-800 flex flex-wrap justify-between items-center">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                Vehicle Weight Distribution
              </h2>
              <div className="h-2 w-2 rounded-full bg-orange-500"></div>
            </div>
            <div className="px-2 sm:px-0">
              <Suspense fallback={<ChartSkeleton />}>
                <VehicleWeightChart companyId={selectedCompanyId} />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Recent Weights and Live Driver Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden border border-gray-800">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-800 flex flex-wrap justify-between items-center">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                Recent Weight Measurements
              </h2>
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            </div>
            <div className="overflow-x-auto">
              <RecentWeightsTable companyId={selectedCompanyId} />
            </div>
            <div className="px-4 sm:px-6 py-3 border-t border-gray-800">
              <Link
                href="/weights"
                className="text-blue-500 hover:text-blue-400 font-medium inline-flex items-center"
                aria-label="View all weight measurements"
              >
                <span>View all weights</span>
                <span aria-hidden="true" className="ml-1">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Live Driver Activity - Real-time updates from driver dashboard */}
          <LiveDriverActivity companyId={selectedCompanyId} maxItems={15} />
        </div>

        {/* Load Status Chart and Quick Actions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden border border-gray-800">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-800 flex flex-wrap justify-between items-center">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                Load Status Distribution
              </h2>
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
            </div>
            <div className="px-2 sm:px-0">
              <Suspense fallback={<ChartSkeleton />}>
                <LoadStatusChart companyId={selectedCompanyId} />
              </Suspense>
            </div>
          </div>

          <div className="bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden border border-gray-800">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-800 flex flex-wrap justify-between items-center">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Quick Actions</h2>
              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
            </div>
            <div className="p-4 sm:p-6">
              <QuickActions />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

// Loading skeleton for charts
function ChartSkeleton() {
  return (
    <div className="p-4 sm:p-6">
      <div className="h-64 flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"
          role="status"
          aria-label="Loading chart data"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  );
}
