'use client';

import ErrorBoundary from '@/components/ErrorBoundary';

import { useState, useEffect } from 'react';
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

export default function CityDashboardPage() {
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const cityToken = localStorage.getItem('cityToken');

      if (!cityToken) {
        throw new Error('No authentication token found');
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
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
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

  // Generate dummy data for testing if needed
  const generateDummyData = () => {
    setDashboardData({
      totalScales: 12,
      activeScales: 10,
      totalWeighings: 1458,
      revenueCollected: 87450,
      complianceRate: 92,
      pendingPermits: 8,
      activePermits: 124,
      recentViolations: 17,
    });

    // Generate dummy recent weighings
    const dummyWeighings = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      ticketNumber: `CWT-001-${20230701 + i}-${1000 + i}`,
      vehicleInfo: `ABC-${1000 + i}`,
      companyName: `Trucking Company ${i + 1}`,
      grossWeight: 35000 + Math.floor(Math.random() * 10000),
      netWeight: 25000 + Math.floor(Math.random() * 8000),
      weighDate: new Date(2023, 6, 1 + i).toISOString(),
      status: Math.random() > 0.2 ? 'Compliant' : Math.random() > 0.5 ? 'Non-Compliant' : 'Warning',
      scaleName: `Scale ${(i % 3) + 1}`,
    }));

    setRecentWeighings(dummyWeighings);

    // Generate dummy compliance data
    const labels = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const compliant = Array.from({ length: 30 }, () => Math.floor(Math.random() * 20) + 10);
    const nonCompliant = Array.from({ length: 30 }, () => Math.floor(Math.random() * 5));
    const warning = Array.from({ length: 30 }, () => Math.floor(Math.random() * 3));

    setComplianceData({ labels, compliant, nonCompliant, warning });

    // Generate dummy revenue data
    const monthLabels = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    });

    const permitRevenue = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10000) + 5000);
    const fineRevenue = Array.from({ length: 6 }, () => Math.floor(Math.random() * 5000) + 1000);

    setRevenueData({ labels: monthLabels, permitRevenue, fineRevenue });

    setIsLoading(false);
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
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-red-300 border-red-800 hover:bg-red-800/20"
              onClick={generateDummyData}
            >
              Load Demo Data
            </Button>
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
                        {recentWeighings.map((weighing: any) => (
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
}
