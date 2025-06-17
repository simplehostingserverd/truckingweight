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

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowDownIcon,
  ArrowPathIcon,
  ArrowUpIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Create a client-side only component to avoid hydration issues
const CityRevenuePageClient = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('6');

  const [revenueData, setRevenueData] = useState({
    labels: [],
    permitRevenue: [],
    fineRevenue: [],
  });

  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    permitRevenue: 0,
    fineRevenue: 0,
    pendingRevenue: 0,
    revenueGrowth: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState([]);

  // Fetch revenue data
  const fetchRevenueData = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Safely access localStorage only on the client side
      if (typeof window === 'undefined') return;

      const cityToken = localStorage.getItem('cityToken');

      if (!cityToken) {
        throw new Error('No authentication token found');
      }

      // Fetch revenue data
      const response = await fetch(`/api/city-dashboard/revenue-data?months=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${cityToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch revenue data');
      }

      const data = await response.json();
      setRevenueData(data);

      // Calculate revenue stats
      const totalPermitRevenue = data.permitRevenue.reduce((sum, val) => sum + val, 0);
      const totalFineRevenue = data.fineRevenue.reduce((sum, val) => sum + val, 0);
      const totalRevenue = totalPermitRevenue + totalFineRevenue;

      // Calculate growth (compare last month to previous month)
      const lastMonthTotal =
        data.permitRevenue[data.permitRevenue.length - 1] +
        data.fineRevenue[data.fineRevenue.length - 1];
      const previousMonthTotal =
        data.permitRevenue[data.permitRevenue.length - 2] +
        data.fineRevenue[data.fineRevenue.length - 2];
      const growth = previousMonthTotal
        ? ((lastMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
        : 0;

      setRevenueStats({
        totalRevenue,
        permitRevenue: totalPermitRevenue,
        fineRevenue: totalFineRevenue,
        pendingRevenue: Math.round(totalRevenue * 0.15), // Mock pending revenue (15% of total)
        revenueGrowth: growth,
      });

      // Generate mock recent transactions
      generateMockTransactions();
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      setError(err.message || 'Failed to load revenue data');
      // Generate dummy data for testing
      generateDummyData();
    } finally {
      setIsLoading(false);
    }
  };

  // Generate dummy data for testing
  const generateDummyData = () => {
    // Generate month labels for the last 6 months
    const monthLabels = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    });

    const permitRevenue = [5200, 6100, 5800, 7200, 6500, 8100];
    const fineRevenue = [1800, 1500, 2200, 1900, 2500, 2800];

    setRevenueData({
      labels: monthLabels,
      permitRevenue,
      fineRevenue,
    });

    const totalPermitRevenue = permitRevenue.reduce((sum, val) => sum + val, 0);
    const totalFineRevenue = fineRevenue.reduce((sum, val) => sum + val, 0);

    setRevenueStats({
      totalRevenue: totalPermitRevenue + totalFineRevenue,
      permitRevenue: totalPermitRevenue,
      fineRevenue: totalFineRevenue,
      pendingRevenue: 4500,
      revenueGrowth: 12.5,
    });

    generateMockTransactions();
  };

  // Generate mock transactions
  const generateMockTransactions = () => {
    const transactions = [
      {
        id: 1,
        date: '2023-11-20',
        type: 'Permit Fee',
        reference: 'OW-2023-001',
        company: 'Heavy Haulers Inc.',
        amount: 250.0,
        status: 'Paid',
      },
      {
        id: 2,
        date: '2023-11-18',
        type: 'Violation Fine',
        reference: 'V-2023-002',
        company: 'Wide Load Transport',
        amount: 350.0,
        status: 'Pending',
      },
      {
        id: 3,
        date: '2023-11-15',
        type: 'Permit Fee',
        reference: 'OS-2023-005',
        company: 'Texas Wind Turbines',
        amount: 500.0,
        status: 'Paid',
      },
      {
        id: 4,
        date: '2023-11-12',
        type: 'Violation Fine',
        reference: 'V-2023-004',
        company: 'Mega Movers LLC',
        amount: 850.0,
        status: 'Paid',
      },
      {
        id: 5,
        date: '2023-11-10',
        type: 'Permit Fee',
        reference: 'OW-2023-003',
        company: 'Construction Materials Co.',
        amount: 225.0,
        status: 'Pending',
      },
    ];

    setRecentTransactions(transactions);
  };

  // Load revenue data on component mount and when timeRange changes
  useEffect(() => {
    fetchRevenueData();
  }, [timeRange]);

  // Format data for charts
  const revenueChartData = revenueData.labels.map((label, index) => ({
    month: label,
    'Permit Revenue': revenueData.permitRevenue[index],
    'Fine Revenue': revenueData.fineRevenue[index],
    Total: revenueData.permitRevenue[index] + revenueData.fineRevenue[index],
  }));

  const revenuePieData = [
    { name: 'Permit Revenue', value: revenueStats.permitRevenue },
    { name: 'Fine Revenue', value: revenueStats.fineRevenue },
  ];

  const COLORS = ['#4ade80', '#ef4444'];

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Revenue</h1>
            <p className="text-gray-400">
              Track and analyze municipal revenue from permits and fines
            </p>
          </div>
          <div className="flex space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="3">Last 3 months</SelectItem>
                <SelectItem value="6">Last 6 months</SelectItem>
                <SelectItem value="12">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchRevenueData} disabled={isLoading}>
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 bg-gray-700" />
                  ) : (
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-8 w-8 text-blue-500 mr-3" />
                      <div>
                        <div className="text-2xl font-bold text-white">
                          ${revenueStats.totalRevenue.toLocaleString()}
                        </div>
                        <div className="flex items-center text-xs">
                          <span
                            className={
                              revenueStats.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'
                            }
                          >
                            {revenueStats.revenueGrowth >= 0 ? (
                              <ArrowUpIcon className="h-3 w-3 inline mr-1" />
                            ) : (
                              <ArrowDownIcon className="h-3 w-3 inline mr-1" />
                            )}
                            {Math.abs(revenueStats.revenueGrowth).toFixed(1)}%
                          </span>
                          <span className="text-gray-500 ml-1">vs previous period</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Permit Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 bg-gray-700" />
                  ) : (
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-8 w-8 text-green-500 mr-3" />
                      <div>
                        <div className="text-2xl font-bold text-white">
                          ${revenueStats.permitRevenue.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500">
                          {((revenueStats.permitRevenue / revenueStats.totalRevenue) * 100).toFixed(
                            1
                          )}
                          % of total
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Fine Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 bg-gray-700" />
                  ) : (
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
                      <div>
                        <div className="text-2xl font-bold text-white">
                          ${revenueStats.fineRevenue.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500">
                          {((revenueStats.fineRevenue / revenueStats.totalRevenue) * 100).toFixed(
                            1
                          )}
                          % of total
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Pending Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 bg-gray-700" />
                  ) : (
                    <div className="flex items-center">
                      <CalendarIcon className="h-8 w-8 text-yellow-500 mr-3" />
                      <div>
                        <div className="text-2xl font-bold text-white">
                          ${revenueStats.pendingRevenue.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500">Awaiting payment</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Revenue Distribution Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Revenue Distribution</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                  {isLoading ? (
                    <Skeleton className="h-64 w-full bg-gray-700" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={revenuePieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {revenuePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={value => [`$${value.toLocaleString()}`, undefined]}
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            borderColor: '#374151',
                            color: '#f9fafb',
                          }}
                          itemStyle={{ color: '#f9fafb' }}
                          labelStyle={{ color: '#f9fafb' }}
                        />
                        <Legend wrapperStyle={{ color: '#f9fafb' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full bg-gray-700" />
                      ))}
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700 hover:bg-gray-800">
                            <TableHead className="text-gray-400">Date</TableHead>
                            <TableHead className="text-gray-400">Type</TableHead>
                            <TableHead className="text-gray-400">Company</TableHead>
                            <TableHead className="text-gray-400 text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentTransactions.slice(0, 5).map(transaction => (
                            <TableRow
                              key={transaction.id}
                              className="border-gray-700 hover:bg-gray-700"
                            >
                              <TableCell className="text-gray-300">
                                {new Date(transaction.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-gray-300">{transaction.type}</TableCell>
                              <TableCell className="text-gray-300">{transaction.company}</TableCell>
                              <TableCell className="text-right font-medium text-white">
                                ${transaction.amount.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80 w-full bg-gray-700" />
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                      <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                        tickFormatter={value => `$${value.toLocaleString()}`}
                      />
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

          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(10)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full bg-gray-700" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700 hover:bg-gray-800">
                        <TableHead className="text-gray-400">Date</TableHead>
                        <TableHead className="text-gray-400">Type</TableHead>
                        <TableHead className="text-gray-400">Reference</TableHead>
                        <TableHead className="text-gray-400">Company</TableHead>
                        <TableHead className="text-gray-400 text-right">Amount</TableHead>
                        <TableHead className="text-gray-400 text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.map(transaction => (
                        <TableRow
                          key={transaction.id}
                          className="border-gray-700 hover:bg-gray-700"
                        >
                          <TableCell className="text-gray-300">
                            {new Date(transaction.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-gray-300">{transaction.type}</TableCell>
                          <TableCell className="text-gray-300">{transaction.reference}</TableCell>
                          <TableCell className="text-gray-300">{transaction.company}</TableCell>
                          <TableCell className="text-right font-medium text-white">
                            ${transaction.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                transaction.status === 'Paid'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}
                            >
                              {transaction.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
const CityRevenuePage = dynamic(() => Promise.resolve(CityRevenuePageClient), {
  ssr: false,
});

export default function Page() {
  return <CityRevenuePage />;
}
