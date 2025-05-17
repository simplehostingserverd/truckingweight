/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * 
 * This file contains proprietary and confidential information of 
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */


'use client';

import ErrorBoundary from '@/components/ErrorBoundary';

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
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-400">
              Welcome back, {userName || 'User'}! Here's what's happening with your fleet.
            </p>
          </div>
          <div className="flex space-x-2">
            <Link
              href="/weights/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ScaleIcon className="h-4 w-4 mr-2" />
              New Weight
            </Link>
            <Link
              href="/weights/capture"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
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
        <DashboardStats initialUserName={userName || 'User'} companyId={selectedCompanyId} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden border border-gray-800">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Weight Compliance</h2>
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            </div>
            <ComplianceChart companyId={selectedCompanyId} />
          </div>

          <div className="bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden border border-gray-800">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Vehicle Weight Distribution</h2>
              <div className="h-2 w-2 rounded-full bg-orange-500"></div>
            </div>
            <VehicleWeightChart companyId={selectedCompanyId} />
          </div>
        </div>

        {/* Recent Weights and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden border border-gray-800">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Recent Weight Measurements</h2>
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            </div>
            <RecentWeightsTable companyId={selectedCompanyId} />
            <div className="px-6 py-3 border-t border-gray-800">
              <Link href="/weights" className="text-blue-500 hover:text-blue-400 font-medium">
                View all weights →
              </Link>
            </div>
          </div>

          <div className="bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden border border-gray-800">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Alerts & Notifications</h2>
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="h-5 w-5 bg-blue-600 rounded-full mt-0.5 mr-3 flex-shrink-0 animate-pulse"></div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-400">Loading alerts...</h3>
                    <p className="mt-1 text-sm text-gray-400">
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
          <div className="bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden border border-gray-800">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Load Status Distribution</h2>
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
            </div>
            <LoadStatusChart companyId={selectedCompanyId} />
          </div>

          <div className="bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden border border-gray-800">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
            </div>
            <div className="p-6">
              <QuickActions />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
