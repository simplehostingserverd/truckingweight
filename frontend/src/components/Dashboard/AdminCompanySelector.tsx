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

import { createClient } from '@/utils/supabase/client';
import { useSWROptimized } from '@/hooks/useSWROptimized';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { AdminCompany } from '@/lib/validations';

// Company type is now imported as AdminCompany from validations

interface AdminCompanySelectorProps {
  onCompanyChange: (companyId: number | null) => void;
  selectedCompanyId: number | null;
}

function AdminCompanySelector({ onCompanyChange, selectedCompanyId }: AdminCompanySelectorProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const supabase = createClient();

  // Use the optimized SWR hook for data fetching with caching
  const fetchCompanies = async (key: string) => {
    // Get auth token from supabase
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('No active session');
    }

    // Fetch companies
    const response = await fetch('/api/admin/companies', {
      headers: {
        'x-auth-token': session.access_token,
      },
    });

    if (!response.ok) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch companies');
    }

    return response.json();
  };

  // Use SWR for data fetching with caching and revalidation
  const {
    data: companies,
    error,
    isLoading,
  } = useSWROptimized<AdminCompany[]>('admin-companies', fetchCompanies, {
    localCache: true,
    localCacheTtl: 3600, // Cache for 1 hour
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // 1 minute
  });

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const companyId = value === 'all' ? null : parseInt(value, 10);
    onCompanyChange(companyId);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md">
        <p className="text-red-700 dark:text-red-300 text-sm">
          {error.message || 'Failed to load companies'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full">
          <BuildingOfficeIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-grow">
          <label
            htmlFor="company-selector"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Select Company
          </label>
          <select
            id="company-selector"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            value={selectedCompanyId?.toString() || 'all'}
            onChange={handleCompanyChange}
          >
            <option value="all">All Companies</option>
            {companies?.map(company => (
              <option key={company.id} value={company.id.toString()}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(AdminCompanySelector);
