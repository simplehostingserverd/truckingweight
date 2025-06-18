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

import React, { useState, useEffect } from 'react';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoltIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ShieldCheckIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import {
  Button,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface KPIMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target?: number;
  previousValue?: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  category: 'operational' | 'financial' | 'safety' | 'efficiency';
  description: string;
  lastUpdated: string;
}

interface PerformanceBenchmark {
  category: string;
  metrics: {
    name: string;
    current: number;
    target: number;
    industry: number;
    unit: string;
    status: 'above' | 'at' | 'below';
  }[];
}

interface KPIDashboardData {
  overallScore: number;
  metrics: KPIMetric[];
  benchmarks: PerformanceBenchmark[];
  alerts: {
    id: string;
    type: 'performance' | 'target' | 'benchmark';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    metric: string;
    timestamp: string;
  }[];
  trends: {
    period: string;
    operational: number;
    financial: number;
    safety: number;
    efficiency: number;
  }[];
}

export default function KPIDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dashboardData, setDashboardData] = useState<KPIDashboardData>({
    overallScore: 0,
    metrics: [],
    benchmarks: [],
    alerts: [],
    trends: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKPIData();
  }, [selectedPeriod, selectedCategory]);

  const loadKPIData = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockMetrics: KPIMetric[] = [
        {
          id: 'revenue-per-mile',
          name: 'Revenue per Mile',
          value: 2.85,
          unit: '$/mile',
          target: 3.0,
          previousValue: 2.78,
          trend: 'up',
          trendPercentage: 2.5,
          status: 'good',
          category: 'financial',
          description: 'Average revenue generated per mile driven',
          lastUpdated: '2025-01-20T10:30:00Z',
        },
        {
          id: 'cost-per-mile',
          name: 'Cost per Mile',
          value: 1.95,
          unit: '$/mile',
          target: 1.8,
          previousValue: 1.88,
          trend: 'up',
          trendPercentage: 3.7,
          status: 'warning',
          category: 'financial',
          description: 'Total operating cost per mile driven',
          lastUpdated: '2025-01-20T10:30:00Z',
        },
        {
          id: 'fleet-utilization',
          name: 'Fleet Utilization',
          value: 87.5,
          unit: '%',
          target: 90.0,
          previousValue: 85.2,
          trend: 'up',
          trendPercentage: 2.7,
          status: 'good',
          category: 'operational',
          description: 'Percentage of fleet actively generating revenue',
          lastUpdated: '2025-01-20T10:30:00Z',
        },
        {
          id: 'on-time-delivery',
          name: 'On-Time Delivery',
          value: 94.2,
          unit: '%',
          target: 95.0,
          previousValue: 92.8,
          trend: 'up',
          trendPercentage: 1.5,
          status: 'good',
          category: 'operational',
          description: 'Percentage of deliveries completed on time',
          lastUpdated: '2025-01-20T10:30:00Z',
        },
        {
          id: 'safety-score',
          name: 'Safety Score',
          value: 85.7,
          unit: '/100',
          target: 90.0,
          previousValue: 83.4,
          trend: 'up',
          trendPercentage: 2.8,
          status: 'good',
          category: 'safety',
          description: 'Overall fleet safety performance score',
          lastUpdated: '2025-01-20T10:30:00Z',
        },
        {
          id: 'fuel-efficiency',
          name: 'Fuel Efficiency',
          value: 6.8,
          unit: 'MPG',
          target: 7.2,
          previousValue: 6.5,
          trend: 'up',
          trendPercentage: 4.6,
          status: 'good',
          category: 'efficiency',
          description: 'Average miles per gallon across fleet',
          lastUpdated: '2025-01-20T10:30:00Z',
        },
        {
          id: 'driver-retention',
          name: 'Driver Retention',
          value: 78.5,
          unit: '%',
          target: 85.0,
          previousValue: 76.2,
          trend: 'up',
          trendPercentage: 3.0,
          status: 'warning',
          category: 'operational',
          description: 'Annual driver retention rate',
          lastUpdated: '2025-01-20T10:30:00Z',
        },
        {
          id: 'maintenance-cost',
          name: 'Maintenance Cost per Mile',
          value: 0.18,
          unit: '$/mile',
          target: 0.15,
          previousValue: 0.2,
          trend: 'down',
          trendPercentage: -10.0,
          status: 'warning',
          category: 'financial',
          description: 'Average maintenance cost per mile driven',
          lastUpdated: '2025-01-20T10:30:00Z',
        },
      ];

      const mockBenchmarks: PerformanceBenchmark[] = [
        {
          category: 'Financial Performance',
          metrics: [
            {
              name: 'Revenue per Mile',
              current: 2.85,
              target: 3.0,
              industry: 2.65,
              unit: '$/mile',
              status: 'above',
            },
            {
              name: 'Operating Ratio',
              current: 68.4,
              target: 65.0,
              industry: 72.1,
              unit: '%',
              status: 'above',
            },
            {
              name: 'Profit Margin',
              current: 31.6,
              target: 35.0,
              industry: 27.9,
              unit: '%',
              status: 'above',
            },
          ],
        },
        {
          category: 'Operational Efficiency',
          metrics: [
            {
              name: 'Fleet Utilization',
              current: 87.5,
              target: 90.0,
              industry: 82.3,
              unit: '%',
              status: 'above',
            },
            {
              name: 'On-Time Delivery',
              current: 94.2,
              target: 95.0,
              industry: 91.7,
              unit: '%',
              status: 'above',
            },
            {
              name: 'Load Factor',
              current: 89.3,
              target: 92.0,
              industry: 85.6,
              unit: '%',
              status: 'above',
            },
          ],
        },
        {
          category: 'Safety & Compliance',
          metrics: [
            {
              name: 'Safety Score',
              current: 85.7,
              target: 90.0,
              industry: 78.4,
              unit: '/100',
              status: 'above',
            },
            {
              name: 'DOT Compliance',
              current: 92.5,
              target: 95.0,
              industry: 88.9,
              unit: '%',
              status: 'above',
            },
            {
              name: 'Accident Rate',
              current: 0.8,
              target: 0.5,
              industry: 1.2,
              unit: '/million miles',
              status: 'below',
            },
          ],
        },
      ];

      const mockAlerts = [
        {
          id: '1',
          type: 'target' as const,
          severity: 'medium' as const,
          message: 'Cost per Mile is 8.3% above target',
          metric: 'cost-per-mile',
          timestamp: '2025-01-20T09:15:00Z',
        },
        {
          id: '2',
          type: 'benchmark' as const,
          severity: 'low' as const,
          message: 'Driver Retention below industry average',
          metric: 'driver-retention',
          timestamp: '2025-01-20T08:30:00Z',
        },
        {
          id: '3',
          type: 'performance' as const,
          severity: 'high' as const,
          message: 'Fuel Efficiency declining for 3 consecutive weeks',
          metric: 'fuel-efficiency',
          timestamp: '2025-01-20T07:45:00Z',
        },
      ];

      const mockTrends = [
        { period: 'Week 1', operational: 85.2, financial: 78.9, safety: 82.1, efficiency: 79.3 },
        { period: 'Week 2', operational: 86.7, financial: 80.4, safety: 83.8, efficiency: 81.2 },
        { period: 'Week 3', operational: 88.1, financial: 82.1, safety: 84.9, efficiency: 82.7 },
        { period: 'Week 4', operational: 87.5, financial: 81.6, safety: 85.7, efficiency: 83.4 },
      ];

      const overallScore =
        mockMetrics.reduce((sum, metric) => {
          const score = metric.target ? Math.min((metric.value / metric.target) * 100, 100) : 85;
          return sum + score;
        }, 0) / mockMetrics.length;

      setDashboardData({
        overallScore: Math.round(overallScore),
        metrics: mockMetrics,
        benchmarks: mockBenchmarks,
        alerts: mockAlerts,
        trends: mockTrends,
      });
    } catch (error) {
      console.error('Error loading KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'good':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'critical':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string, percentage: number) => {
    if (trend === 'up') {
      return (
        <ArrowUpIcon className={`h-4 w-4 ${percentage > 0 ? 'text-green-500' : 'text-red-500'}`} />
      );
    } else if (trend === 'down') {
      return (
        <ArrowDownIcon
          className={`h-4 w-4 ${percentage < 0 ? 'text-green-500' : 'text-red-500'}`}
        />
      );
    }
    return <span className="text-gray-400">→</span>;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'operational':
        return <TruckIcon className="h-5 w-5" />;
      case 'financial':
        return <CurrencyDollarIcon className="h-5 w-5" />;
      case 'safety':
        return <ShieldCheckIcon className="h-5 w-5" />;
      case 'efficiency':
        return <BoltIcon className="h-5 w-5" />;
      default:
        return <ChartBarIcon className="h-5 w-5" />;
    }
  };

  const filteredMetrics =
    selectedCategory === 'all'
      ? dashboardData.metrics
      : dashboardData.metrics.filter(m => m.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">KPI Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Key Performance Indicators and business metrics overview
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Export Report
          </Button>
          <Link href="/kpi/configure">
            <Button>
              <Cog6ToothIcon className="h-5 w-5 mr-2" />
              Configure KPIs
            </Button>
          </Link>
        </div>
      </div>

      {/* Overall Performance Score */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Overall Performance Score
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Composite score based on all key performance indicators
              </p>
            </div>
            <div className="text-center">
              <div
                className={`text-6xl font-bold ${
                  dashboardData.overallScore >= 90
                    ? 'text-green-600'
                    : dashboardData.overallScore >= 80
                      ? 'text-blue-600'
                      : dashboardData.overallScore >= 70
                        ? 'text-yellow-600'
                        : 'text-red-600'
                }`}
              >
                {dashboardData.overallScore}
              </div>
              <div className="text-lg text-gray-500">out of 100</div>
              <Badge
                className={
                  dashboardData.overallScore >= 90
                    ? 'bg-green-100 text-green-800'
                    : dashboardData.overallScore >= 80
                      ? 'bg-blue-100 text-blue-800'
                      : dashboardData.overallScore >= 70
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                }
              >
                {dashboardData.overallScore >= 90
                  ? 'Excellent'
                  : dashboardData.overallScore >= 80
                    ? 'Good'
                    : dashboardData.overallScore >= 70
                      ? 'Fair'
                      : 'Needs Improvement'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {dashboardData.alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length >
        0 && (
        <Card className="mb-8 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800 dark:text-red-400">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              Critical Performance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.alerts
                .filter(a => a.severity === 'high' || a.severity === 'critical')
                .map(alert => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            alert.severity === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-orange-100 text-orange-800'
                          }
                        >
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {alert.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">KPI Overview</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Category Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Filter by Category:</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="efficiency">Efficiency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMetrics.map(metric => (
              <Card key={metric.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(metric.category)}
                      {metric.name}
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(metric.status)}
                      {getTrendIcon(metric.trend, metric.trendPercentage)}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800 dark:text-white">
                        {metric.value.toLocaleString()} {metric.unit}
                      </div>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status.toUpperCase()}
                      </Badge>
                    </div>

                    {metric.target && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>
                            Target: {metric.target} {metric.unit}
                          </span>
                          <span
                            className={
                              metric.value >= metric.target ? 'text-green-600' : 'text-red-600'
                            }
                          >
                            {((metric.value / metric.target) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={Math.min((metric.value / metric.target) * 100, 100)}
                          className="h-2"
                        />
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1">
                        {getTrendIcon(metric.trend, metric.trendPercentage)}
                        <span
                          className={
                            metric.trendPercentage > 0
                              ? 'text-green-600'
                              : metric.trendPercentage < 0
                                ? 'text-red-600'
                                : 'text-gray-500'
                          }
                        >
                          {Math.abs(metric.trendPercentage).toFixed(1)}%
                        </span>
                      </div>
                      <span className="text-gray-400">vs previous period</span>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500">{metric.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Updated: {new Date(metric.lastUpdated).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <div className="space-y-6">
            {dashboardData.benchmarks.map((benchmark, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{benchmark.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {benchmark.metrics.map((metric, metricIndex) => (
                      <div key={metricIndex} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium">{metric.name}</h4>
                          <Badge
                            className={
                              metric.status === 'above'
                                ? 'bg-green-100 text-green-800'
                                : metric.status === 'at'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                            }
                          >
                            {metric.status === 'above'
                              ? 'Above Target'
                              : metric.status === 'at'
                                ? 'At Target'
                                : 'Below Target'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Current</div>
                            <div className="text-lg font-bold">
                              {metric.current} {metric.unit}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Target</div>
                            <div className="text-lg font-bold text-blue-600">
                              {metric.target} {metric.unit}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Industry Avg</div>
                            <div className="text-lg font-bold text-gray-600">
                              {metric.industry} {metric.unit}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>vs Target</span>
                            <span
                              className={
                                metric.current >= metric.target ? 'text-green-600' : 'text-red-600'
                              }
                            >
                              {((metric.current / metric.target - 1) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress
                            value={Math.min((metric.current / metric.target) * 100, 100)}
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs">
                            <span>vs Industry</span>
                            <span
                              className={
                                metric.current >= metric.industry
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }
                            >
                              {((metric.current / metric.industry - 1) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress
                            value={Math.min((metric.current / metric.industry) * 100, 100)}
                            className="h-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Trend Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Operational</p>
                          <p className="text-2xl font-bold">87.5%</p>
                        </div>
                        <TruckIcon className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="mt-2 flex items-center text-sm">
                        <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">+2.7%</span>
                        <span className="text-gray-500 ml-1">vs last period</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Financial</p>
                          <p className="text-2xl font-bold">81.6%</p>
                        </div>
                        <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
                      </div>
                      <div className="mt-2 flex items-center text-sm">
                        <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-red-600">-0.6%</span>
                        <span className="text-gray-500 ml-1">vs last period</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Safety</p>
                          <p className="text-2xl font-bold">85.7%</p>
                        </div>
                        <ShieldCheckIcon className="h-8 w-8 text-yellow-500" />
                      </div>
                      <div className="mt-2 flex items-center text-sm">
                        <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">+0.8%</span>
                        <span className="text-gray-500 ml-1">vs last period</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Efficiency</p>
                          <p className="text-2xl font-bold">83.4%</p>
                        </div>
                        <BoltIcon className="h-8 w-8 text-purple-500" />
                      </div>
                      <div className="mt-2 flex items-center text-sm">
                        <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">+0.7%</span>
                        <span className="text-gray-500 ml-1">vs last period</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Trend Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Performance Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.trends.map((trend, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="font-medium">{trend.period}</div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div className="text-center">
                              <div className="text-blue-600 font-medium">{trend.operational}%</div>
                              <div className="text-gray-500">Operational</div>
                            </div>
                            <div className="text-center">
                              <div className="text-green-600 font-medium">{trend.financial}%</div>
                              <div className="text-gray-500">Financial</div>
                            </div>
                            <div className="text-center">
                              <div className="text-yellow-600 font-medium">{trend.safety}%</div>
                              <div className="text-gray-500">Safety</div>
                            </div>
                            <div className="text-center">
                              <div className="text-purple-600 font-medium">{trend.efficiency}%</div>
                              <div className="text-gray-500">Efficiency</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Alerts & Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.alerts.map(alert => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            alert.severity === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : alert.severity === 'high'
                                ? 'bg-orange-100 text-orange-800'
                                : alert.severity === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                          }
                        >
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {alert.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <div className="text-xs text-gray-400 mt-1">
                        Metric: {alert.metric} • {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <Button size="sm" variant="outline" className="mr-2">
                        Acknowledge
                      </Button>
                      <Button size="sm">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
                {dashboardData.alerts.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Active Alerts
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      All KPIs are performing within acceptable ranges.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
