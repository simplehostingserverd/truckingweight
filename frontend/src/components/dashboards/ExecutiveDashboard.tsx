/**
 * Copyright (c) 2025 Cargo Scale Pro. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

'use client';

import React from 'react';
import {
  TruckIcon,
  CurrencyDollarIcon,
  UserIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const ExecutiveDashboard: React.FC = () => {
  // Mock data for charts
  const revenueData = [
    { month: 'Jul', current: 850000, previous: 780000 },
    { month: 'Aug', current: 920000, previous: 850000 },
    { month: 'Sep', current: 1050000, previous: 950000 },
    { month: 'Oct', current: 980000, previous: 890000 },
    { month: 'Nov', current: 1120000, previous: 1020000 },
    { month: 'Dec', current: 1200000, previous: 1100000 },
  ];

  const fleetUtilizationData = [
    { name: 'Active', value: 87.5, color: '#10B981' },
    { name: 'Idle', value: 12.5, color: '#EF4444' },
  ];

  const performanceMetrics = [
    { category: 'Delivery', current: 94.2, target: 95, trend: 'up' },
    { category: 'Safety', current: 98.7, target: 99, trend: 'up' },
    { category: 'Fuel Efficiency', current: 6.8, target: 7.2, trend: 'down' },
    { category: 'Customer Satisfaction', current: 4.6, target: 4.5, trend: 'up' },
  ];

  const monthlyOperations = [
    { month: 'Aug', deliveries: 1240, revenue: 920000, incidents: 2 },
    { month: 'Sep', deliveries: 1380, revenue: 1050000, incidents: 1 },
    { month: 'Oct', deliveries: 1290, revenue: 980000, incidents: 3 },
    { month: 'Nov', deliveries: 1450, revenue: 1120000, incidents: 0 },
    { month: 'Dec', deliveries: 1520, revenue: 1200000, incidents: 1 },
    { month: 'Jan', deliveries: 1380, revenue: 1150000, incidents: 2 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Monthly Revenue */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Monthly Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(1200000)}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+9.1% vs last year</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fleet Utilization */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Fleet Utilization
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPercentage(87.5)}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowDownIcon className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-yellow-600">2.5% below target</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TruckIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Drivers */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Drivers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">142</p>
                <div className="flex items-center mt-1">
                  <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8 this month</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <UserIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Score */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Safety Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">98.7</p>
                <div className="flex items-center mt-1">
                  <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Excellent</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <ShieldCheckIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={value => `$${value / 1000}K`} />
                  <Tooltip formatter={value => formatCurrency(value as number)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="current"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    name="Current Year"
                  />
                  <Line
                    type="monotone"
                    dataKey="previous"
                    stroke="#94A3B8"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Previous Year"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">YoY Growth:</span>
                <Badge className="bg-green-100 text-green-800">+9.1%</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Q4 Performance:</span>
                <Badge className="bg-blue-100 text-blue-800">+12% vs Target</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fleet Utilization Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TruckIcon className="h-5 w-5" />
              Fleet Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fleetUtilizationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {fleetUtilizationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={value => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Vehicles:</span>
                <span className="font-medium">124 / 142</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Idle Vehicles:</span>
                <span className="font-medium">18 / 142</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Target Utilization:</span>
                <Badge variant="outline">90%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{metric.category}</span>
                  {metric.trend === 'up' ? (
                    <ArrowUpIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="text-2xl font-bold">
                  {metric.category === 'Customer Satisfaction'
                    ? `${metric.current}/5.0`
                    : metric.category === 'Fuel Efficiency'
                      ? `${metric.current} MPG`
                      : `${metric.current}%`}
                </div>
                <div className="text-sm text-gray-500">
                  Target:{' '}
                  {metric.category === 'Customer Satisfaction'
                    ? `${metric.target}/5.0`
                    : metric.category === 'Fuel Efficiency'
                      ? `${metric.target} MPG`
                      : `${metric.target}%`}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      metric.current >= metric.target
                        ? 'bg-green-500 w-full'
                        : 'bg-yellow-500 w-5/6'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Operations Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Operations Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyOperations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="deliveries" fill="#3B82F6" name="Deliveries" />
                <Bar yAxisId="right" dataKey="incidents" fill="#EF4444" name="Safety Incidents" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutiveDashboard;
