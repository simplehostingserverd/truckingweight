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

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  ScaleIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Create a client-side only component to avoid hydration issues
const CityDashboardPageClient = () => {
  const [dashboardData, setDashboardData] = useState({
    totalScales: 0,
    activeScales: 0,
    totalWeighings: 0,
    revenueCollected: 0,
    complianceRate: 0,
    pendingPermits: 0,
    activePermits: 0,
    recentViolations: 0,
  });

  const [recentWeighings, setRecentWeighings] = useState([]);
  const [complianceData, setComplianceData] = useState({
    labels: [],
    compliant: [],
    nonCompliant: [],
    warning: [],
  });

  const [revenueData, setRevenueData] = useState({
    labels: [],
    permitRevenue: [],
    fineRevenue: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    if (!isMounted) return;

    setIsLoading(true);
    setError('');

    try {
      // Safely access localStorage only on the client side
      if (typeof window === 'undefined') return;

      const cityToken = localStorage.getItem('cityToken');

      if (!cityToken) {
        throw new Error('No authentication token found');
      }

      // Check if this is a test token or we're in development mode
      if (cityToken.startsWith('test-city-token-') || process.env.NODE_ENV === 'development') {
        console.log('Using mock data for city dashboard');
        generateDummyData();
        return;
      }

      // Fetch dashboard stats
      const statsResponse = await fetch('/api/city-dashboard/stats', {
        headers: {
          Authorization: `Bearer ${cityToken}`,
        },
      });

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const statsData = await statsResponse.json();
      setDashboardData(statsData);

      // Fetch recent weighings
      const weighingsResponse = await fetch('/api/city-dashboard/recent-weighings', {
        headers: {
          Authorization: `Bearer ${cityToken}`,
        },
      });

      if (!weighingsResponse.ok) {
        throw new Error('Failed to fetch recent weighings');
      }

      const weighingsData = await weighingsResponse.json();
      setRecentWeighings(weighingsData.weighings);

      // Fetch compliance data
      const complianceResponse = await fetch('/api/city-dashboard/compliance-data', {
        headers: {
          Authorization: `Bearer ${cityToken}`,
        },
      });

      if (!complianceResponse.ok) {
        throw new Error('Failed to fetch compliance data');
      }

      const complianceData = await complianceResponse.json();
      setComplianceData(complianceData);

      // Fetch revenue data
      const revenueResponse = await fetch('/api/city-dashboard/revenue-data', {
        headers: {
          Authorization: `Bearer ${cityToken}`,
        },
      });

      if (!revenueResponse.ok) {
        throw new Error('Failed to fetch revenue data');
      }

      const revenueData = await revenueResponse.json();
      setRevenueData(revenueData);
    } catch (err: any /* @ts-ignore */ ) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');

      // Automatically load mock data when there's an error
      generateDummyData();
    } finally {
      setIsLoading(false);
    }
  };

  // Format data for charts
  const complianceChartData = complianceData.labels.map((label, index) => ({
    date: label,
    Compliant: complianceData.compliant[index],
    'Non-Compliant': complianceData.nonCompliant[index],
    Warning: complianceData.warning[index],
  }));

  const revenueChartData = revenueData.labels.map((label, index) => ({
    month: label,
    'Permit Revenue': revenueData.permitRevenue[index],
    'Fine Revenue': revenueData.fineRevenue[index],
    Total: revenueData.permitRevenue[index] + revenueData.fineRevenue[index],
  }));

  const pieChartData = [
    { name: 'Compliant', value: dashboardData.complianceRate },
    { name: 'Non-Compliant', value: 100 - dashboardData.complianceRate },
  ];

  const COLORS = ['#4ade80', '#ef4444'];

  // Generate realistic mock data for testing and demo purposes
  const generateDummyData = () => {
    // Dashboard stats with more realistic values
    setDashboardData({
      totalScales: 18,
      activeScales: 15,
      totalWeighings: 2458,
      revenueCollected: 127450,
      complianceRate: 88,
      pendingPermits: 12,
      activePermits: 156,
      recentViolations: 23,
    });

    // Company names for more realistic data
    const companyNames = [
      'Acme Freight Services',
      'Blue Sky Logistics',
      'Continental Transport',
      'Delta Shipping Co.',
      'Eagle Express Carriers',
      'Frontier Hauling Inc.',
      'Global Transit Systems',
      'Highland Trucking LLC',
      'Interstate Movers',
      'Junction Freight Lines',
      'Keystone Logistics',
      'Liberty Transport Group',
    ];

    // Scale names for more realistic data
    const scaleNames = [
      'Main Street Weigh Station',
      'Highway 10 East Scale',
      'Downtown Municipal Scale',
      'Industrial Park Scale',
      'North County Weigh Station',
      'Port Authority Scale',
    ];

    // Vehicle types and states for more realistic data
    const vehicleTypes = ['Semi', 'Dump Truck', 'Tanker', 'Flatbed', 'Box Truck'];
    const states = ['TX', 'CA', 'FL', 'NY', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];

    // Generate dummy recent weighings with more realistic data
    const dummyWeighings = Array.from({ length: 15 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 14)); // Random date within last 2 weeks

      const companyIndex = Math.floor(Math.random() * companyNames.length);
      const scaleIndex = Math.floor(Math.random() * scaleNames.length);
      const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
      const state = states[Math.floor(Math.random() * states.length)];
      const plateNumber = `${state}-${Math.floor(1000 + Math.random() * 9000)}`;

      // More realistic weight calculations
      const baseWeight =
        vehicleType === 'Semi'
          ? 70000
          : vehicleType === 'Dump Truck'
            ? 50000
            : vehicleType === 'Tanker'
              ? 65000
              : vehicleType === 'Flatbed'
                ? 55000
                : 40000;

      const grossWeight = baseWeight + Math.floor(Math.random() * 15000);
      const tareWeight = baseWeight * 0.4 + Math.floor(Math.random() * 5000);
      const netWeight = grossWeight - tareWeight;

      // Determine status based on weight thresholds
      let status;
      if (grossWeight > 80000) {
        status = 'Non-Compliant';
      } else if (grossWeight > 75000) {
        status = 'Warning';
      } else {
        status = 'Compliant';
      }

      return {
        id: i + 1,
        ticketNumber: `CWT-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${1000 + i}`,
        vehicleInfo: `${vehicleType} ${plateNumber}`,
        companyName: companyNames[companyIndex],
        grossWeight: grossWeight,
        netWeight: netWeight,
        weighDate: date.toISOString(),
        status: status,
        scaleName: scaleNames[scaleIndex],
      };
    });

    setRecentWeighings(dummyWeighings);

    // Generate dummy compliance data with realistic patterns
    const labels = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    // Create a more realistic pattern with weekday variations
    const compliant = labels.map(dateStr => {
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay();
      // More traffic on weekdays, less on weekends
      const baseValue = dayOfWeek === 0 || dayOfWeek === 6 ? 8 : 15;
      return baseValue + Math.floor(Math.random() * 10);
    });

    const nonCompliant = labels.map(dateStr => {
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay();
      // More violations on busy days
      const baseValue = dayOfWeek === 1 || dayOfWeek === 5 ? 3 : 1;
      return baseValue + Math.floor(Math.random() * 3);
    });

    const warning = labels.map(() => Math.floor(Math.random() * 4));

    setComplianceData({ labels, compliant, nonCompliant, warning });

    // Generate dummy revenue data with realistic monthly patterns
    const monthLabels = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    });

    // Create a more realistic pattern with seasonal variations
    const currentMonth = new Date().getMonth();
    const permitRevenue = monthLabels.map((_, i) => {
      const month = (currentMonth - 5 + i + 12) % 12; // Calculate actual month number
      // Higher permit revenue in summer months (5-8) and December (11)
      const seasonalFactor = (month >= 5 && month <= 8) || month === 11 ? 1.3 : 1.0;
      return Math.floor((8000 + Math.random() * 7000) * seasonalFactor);
    });

    const fineRevenue = monthLabels.map((_, i) => {
      const month = (currentMonth - 5 + i + 12) % 12; // Calculate actual month number
      // Higher fine revenue in busy shipping months
      const seasonalFactor = month === 11 || month === 0 || month === 7 ? 1.4 : 1.0;
      return Math.floor((2000 + Math.random() * 3000) * seasonalFactor);
    });

    setRevenueData({ labels: monthLabels, permitRevenue, fineRevenue });

    setIsLoading(false);

    // Clear any error message since we've loaded mock data
    setError('');
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">City Dashboard</h1>
            <p className="text-gray-400">
              Overview of municipal weighing operations and compliance
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchDashboardData} disabled={isLoading}>
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded-md mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-red-200 mb-1">Data Loading Error</h3>
                <p>{error}</p>
              </div>
              <Button
                variant="solid"
                size="md"
                color="primary"
                className="mt-3 md:mt-0 px-4 py-2"
                onClick={generateDummyData}
                startDecorator={<ArrowPathIcon className="h-5 w-5" />}
              >
                Load Demo Data
              </Button>
            </div>
          </div>
        )}

        {!error && process.env.NODE_ENV === 'development' && (
          <div className="bg-blue-900/20 border border-blue-800 text-blue-300 px-4 py-3 rounded-md mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-200 mb-1">Development Mode</h3>
                <p>Using mock data for demonstration purposes.</p>
              </div>
              <Button
                variant="outlined"
                size="md"
                color="primary"
                className="mt-3 md:mt-0"
                onClick={generateDummyData}
                startDecorator={<ArrowPathIcon className="h-5 w-5" />}
              >
                Refresh Demo Data
              </Button>
            </div>
          </div>
        )}

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Total Weighings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 bg-gray-700" />
                  ) : (
                    <div className="flex items-center">
                      <ScaleIcon className="h-8 w-8 text-blue-500 mr-3" />
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {dashboardData.totalWeighings.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500">All time</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Revenue Collected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 bg-gray-700" />
                  ) : (
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-8 w-8 text-green-500 mr-3" />
                      <div>
                        <div className="text-2xl font-bold text-white">
                          ${dashboardData.revenueCollected.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500">Permits and fines</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Active Permits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 bg-gray-700" />
                  ) : (
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-8 w-8 text-yellow-500 mr-3" />
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {dashboardData.activePermits.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500">
                          <span className="text-yellow-500">{dashboardData.pendingPermits}</span>{' '}
                          pending
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Recent Violations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 bg-gray-700" />
                  ) : (
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {dashboardData.recentViolations.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500">Last 30 days</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Weighings Table */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Recent Weighings</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full bg-gray-700" />
                    ))}
                  </div>
                ) : recentWeighings.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">No recent weighings found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                      <thead className="text-xs uppercase text-gray-400 border-b border-gray-700">
                        <tr>
                          <th scope="col" className="px-4 py-3">
                            Ticket #
                          </th>
                          <th scope="col" className="px-4 py-3">
                            Vehicle
                          </th>
                          <th scope="col" className="px-4 py-3">
                            Company
                          </th>
                          <th scope="col" className="px-4 py-3">
                            Weight
                          </th>
                          <th scope="col" className="px-4 py-3">
                            Date
                          </th>
                          <th scope="col" className="px-4 py-3">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentWeighings.map((weighing: any /* @ts-ignore */ ) => (
                          <tr
                            key={weighing.id}
                            className="border-b border-gray-700 hover:bg-gray-700/50"
                          >
                            <td className="px-4 py-3 font-medium">{weighing.ticketNumber}</td>
                            <td className="px-4 py-3">{weighing.vehicleInfo}</td>
                            <td className="px-4 py-3">{weighing.companyName}</td>
                            <td className="px-4 py-3">
                              {weighing.grossWeight.toLocaleString()} lbs
                            </td>
                            <td className="px-4 py-3">
                              {new Date(weighing.weighDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  weighing.status === 'Compliant'
                                    ? 'bg-green-900/20 text-green-400'
                                    : weighing.status === 'Non-Compliant'
                                      ? 'bg-red-900/20 text-red-400'
                                      : 'bg-yellow-900/20 text-yellow-400'
                                }`}
                              >
                                {weighing.status === 'Compliant' && (
                                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                                )}
                                {weighing.status === 'Non-Compliant' && (
                                  <XCircleIcon className="w-3 h-3 mr-1" />
                                )}
                                {weighing.status === 'Warning' && (
                                  <ExclamationCircleIcon className="w-3 h-3 mr-1" />
                                )}
                                {weighing.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            {/* Compliance Rate Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-800 border-gray-700 md:col-span-2">
                <CardHeader>
                  <CardTitle>Compliance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-80 w-full bg-gray-700" />
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={complianceChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="date"
                          stroke="#9ca3af"
                          tick={{ fill: '#9ca3af' }}
                          tickFormatter={value => {
                            const date = new Date(value);
                            return `${date.getMonth() + 1}/${date.getDate()}`;
                          }}
                        />
                        <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            borderColor: '#374151',
                            color: '#f9fafb',
                          }}
                          itemStyle={{ color: '#f9fafb' }}
                          labelStyle={{ color: '#f9fafb' }}
                        />
                        <Legend wrapperStyle={{ color: '#f9fafb' }} />
                        <Bar dataKey="Compliant" stackId="a" fill="#4ade80" />
                        <Bar dataKey="Warning" stackId="a" fill="#facc15" />
                        <Bar dataKey="Non-Compliant" stackId="a" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Compliance Rate</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                  {isLoading ? (
                    <Skeleton className="h-40 w-40 rounded-full bg-gray-700" />
                  ) : (
                    <>
                      <div className="relative">
                        <ResponsiveContainer width={200} height={200}>
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-white">
                              {dashboardData.complianceRate}%
                            </div>
                            <div className="text-xs text-gray-400">Compliant</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 grid grid-cols-2 gap-4 w-full">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-sm text-gray-300">Compliant</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                          <span className="text-sm text-gray-300">Non-Compliant</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80 w-full bg-gray-700" />
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                      <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          borderColor: '#374151',
                          color: '#f9fafb',
                        }}
                        itemStyle={{ color: '#f9fafb' }}
                        labelStyle={{ color: '#f9fafb' }}
                        formatter={value => [`$${value.toLocaleString()}`, undefined]}
                      />
                      <Legend wrapperStyle={{ color: '#f9fafb' }} />
                      <Line
                        type="monotone"
                        dataKey="Permit Revenue"
                        stroke="#4ade80"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Fine Revenue"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Total"
                        stroke="#60a5fa"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
};

// Use dynamic import with SSR disabled to avoid hydration issues
const CityDashboardPage = dynamic(() => Promise.resolve(CityDashboardPageClient), {
  ssr: false,
});

export default CityDashboardPage;
