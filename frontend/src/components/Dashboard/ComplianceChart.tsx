'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface ComplianceChartProps {
  companyId?: number | null;
}

export default function ComplianceChart({ companyId }: ComplianceChartProps) {
  const supabase = createClientComponentClient<Database>();
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('week'); // 'week', 'month', 'year'

  // Colors for compliance status
  const COLORS = {
    Compliant: '#22c55e', // bright green
    Warning: '#f59e0b',   // amber
    'Non-Compliant': '#ef4444', // red
  };

  // Add state for admin view
  const [isAdmin, setIsAdmin] = useState(false);
  const [companyData, setCompanyData] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('overall');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Get auth token from supabase
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          throw new Error('No active session');
        }

        // Check if user is admin
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data: userDetails } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', userData.user.id)
            .single();

          setIsAdmin(userDetails?.is_admin === true);
        }

        // Use the new API endpoint to get compliance data
        const url = companyId
          ? `/api/dashboard/compliance?dateRange=${dateRange}&companyId=${companyId}`
          : `/api/dashboard/compliance?dateRange=${dateRange}`;

        const response = await fetch(url, {
          headers: {
            'x-auth-token': session.access_token
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch compliance data');
        }

        const data = await response.json();

        // Handle different data formats based on admin status
        if (data.overall && data.byCompany) {
          // Admin view with company breakdown
          setCompanyData(data.byCompany);
          setComplianceData(data.overall);
        } else {
          // Regular user view or admin with specific company filter
          setComplianceData(data);
        }

      } catch (error: any) {
        console.error('Error fetching compliance data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase, dateRange, companyId]);

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateRange(e.target.value);
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = e.target.value;
    setSelectedCompany(companyId);

    if (companyId === 'overall') {
      // Show overall data
      setComplianceData(companyData.overall);
    } else {
      // Find the selected company data
      const company = companyData.find(c => c.companyId.toString() === companyId);
      if (company) {
        setComplianceData(company.data);
      }
    }
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
        <p className="text-red-400 text-sm">{error}</p>
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
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} weights`, 'Count']}
                  contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: '4px' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#aaa' }}
                />
                <Legend
                  formatter={(value) => <span style={{ color: '#fff' }}>{value}</span>}
                />
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
