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

import useSWRFetch from '@/hooks/useSWRFetch';
import { createClient } from '@/utils/supabase/client';
import React, { useMemo, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface ComplianceChartProps {
  companyId?: number | null;
}

function ComplianceChart({ companyId }: ComplianceChartProps) {
  const _supabase = createClient();
  const [dateRange, setDateRange] = useState('week'); // 'week', 'month', 'year'
  const [selectedCompany, setSelectedCompany] = useState<string>('overall');

  // Colors for compliance status - memoized to prevent recreation on each render
  const COLORS = useMemo(
    () => ({
      Compliant: '#22c55e', // bright green
      Warning: '#f59e0b', // amber
      'Non-Compliant': '#ef4444', // red
    }),
    []
  );

  // Fetch auth token for API requests
  const { data: session, error: sessionError } = useSWRFetch('/api/auth/session');

  // Fetch user data to check admin status
  const { data: userData } = useSWRFetch(session ? '/api/auth/user' : null, {
    headers: {
      'x-auth-token': session?.token || '',
    },
  });

  const isAdmin = userData?.is_admin === true || userData?.user?.is_admin === true;

  // Construct the URL for compliance data
  const complianceUrl = companyId
    ? `/api/dashboard/compliance?dateRange=${dateRange}&companyId=${companyId}`
    : `/api/dashboard/compliance?dateRange=${dateRange}`;

  // Fetch compliance data
  const {
    data: complianceApiData,
    error,
    isLoading,
  } = useSWRFetch(
    session ? complianceUrl : null,
    {
      headers: {
        'x-auth-token': session?.token || '',
      },
    },
    {
      // Increase retry attempts for better reliability
      errorRetryCount: 3,
      // Decrease revalidation interval to ensure fresh data
      dedupingInterval: 10000, // 10 seconds
      // Enable revalidation on focus and reconnect
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Process the data based on admin status - memoized to prevent recalculation on each render
  const companyData = useMemo(() => complianceApiData?.byComponent || [], [complianceApiData]);

  // Memoize the compliance data to prevent unnecessary recalculations
  const complianceData = useMemo(() => {
    if (complianceApiData?.overall) {
      if (selectedCompany === 'overall') {
        return complianceApiData.overall;
      } else {
        return (
          companyData.find((c: unknown) => c.companyId.toString() === selectedCompany)
            ?.data || []
        );
      }
    }
    return complianceApiData || [];
  }, [complianceApiData, selectedCompany, companyData]);

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateRange(e.target.value);
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = e.target.value;
    setSelectedCompany(companyId);
    // The data will be automatically updated based on the selectedCompany state
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 p-4 rounded-md border border-red-800">
        <p className="text-red-400 text-sm">
          Error loading compliance data. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden border border-gray-800">
      <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Weight Compliance</h2>
        <div className="flex space-x-2">
          {isAdmin && companyData.length > 0 && (
            <select
              aria-label="Select company"
              className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCompany}
              onChange={handleCompanyChange}
            >
              <option value="overall">All Companies</option>
              {companyData.map(company => (
                <option key={company.companyId} value={company.companyId.toString()}>
                  {company.companyName}
                </option>
              ))}
            </select>
          )}
          <select
            aria-label="Select date range"
            className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={dateRange}
            onChange={handleDateRangeChange}
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        {complianceData.length > 0 && complianceData.some(item => item.value > 0) ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {complianceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={value => [`${value} weights`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#1E1E1E',
                    border: '1px solid #333',
                    borderRadius: '4px',
                  }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#aaa' }}
                />
                <Legend formatter={value => <span className="text-white">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-400">No compliance data available for this period</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(ComplianceChart);
