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

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface Company {
  id: number;
  name: string;
}

interface AdminCompanySelectorProps {
  onCompanyChange: (companyId: number | null) => void;
  selectedCompanyId: number | null;
}

export default function AdminCompanySelector({
  onCompanyChange,
  selectedCompanyId,
}: AdminCompanySelectorProps) {
  const supabase = createClientComponentClient<Database>();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);

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
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch companies');
        }

        const companiesData = await response.json();
        setCompanies(companiesData);
      } catch (error: any /* @ts-ignore */ ) {
        console.error('Error fetching companies:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [supabase]);

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
        <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
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
            {companies.map(company => (
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
