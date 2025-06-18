/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved;
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cosmo Exploit Group LLC Weight Management System;
 * Unauthorized copying of this file, via any medium is strictly prohibited;
 *
 * This file contains proprietary and confidential information of
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission;
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowDownTrayIcon,
  BoltIcon,
  ChartBarIcon,
  ClockIcon,
  Cog6ToothIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PresentationChartLineIcon,
  ShieldCheckIcon,
  TruckIcon,
  UserIcon,
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
import { AnalyticsWidget, AnalyticsDashboard, AnalyticsReport } from '@/types/analytics';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function AdvancedAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('dashboards');
  const [dashboards, setDashboards] = useState<AnalyticsDashboard[]>([]);
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [_selectedDashboard, setSelectedDashboard] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockDashboards: AnalyticsDashboard[] = [
        {
          id: 'executive-dashboard',
          name: 'Executive Dashboard',
          description: 'High-level KPIs and business metrics for executive leadership',
          widgets: [
            {
              id: 'revenue-trend',
              title: 'Revenue Trend',
              type: 'chart',
              category: 'financial',
              description: 'Monthly revenue trend with year-over-year comparison',
              dataSource: 'financial_data',
              refreshRate: 60,
              lastUpdated: '2025-01-20T10:30:00Z',
              config: {
                timeRange: '12_months',
                filters: {},
                visualization: { chartType: 'line', showComparison: true },
              },
              data: {
                current: [850000, 920000, 1050000, 980000, 1120000, 1200000],
                previous: [780000, 850000, 950000, 890000, 1020000, 1100000],
                labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              },
              insights: [
                'Revenue increased 9.1% compared to last year',
                'December showed strongest performance with $1.2M',
                'Q4 exceeded targets by 12%',
              ],
            },
            {
              id: 'fleet-utilization',
              title: 'Fleet Utilization',
              type: 'gauge',
              category: 'operational',
              description: 'Real-time fleet utilization percentage',
              dataSource: 'fleet_data',
              refreshRate: 15,
              lastUpdated: '2025-01-20T10:30:00Z',
              config: {
                timeRange: 'real_time',
                filters: {},
                visualization: { gaugeType: 'circular', target: 90 },
              },
              data: {
                value: 87.5,
                target: 90,
                status: 'good',
              },
              insights: [
                'Utilization is 2.5% below target',
                '3 vehicles currently idle',
                'Peak utilization typically occurs at 2 PM',
              ],
            },
          ],
          layout: { columns: 3, rows: 2 },
          permissions: ['executive', 'manager'],
          isDefault: true,
          createdBy: 'System',
          createdAt: '2024-01-01T00:00:00Z',
          lastModified: '2025-01-20T10:00:00Z',
        },
        {
          id: 'operations-dashboard',
          name: 'Operations Dashboard',
          description: 'Detailed operational metrics for fleet managers and dispatchers',
          widgets: [
            {
              id: 'driver-performance',
              title: 'Driver Performance Matrix',
              type: 'table',
              category: 'driver',
              description: 'Driver performance metrics including safety scores and efficiency',
              dataSource: 'driver_data',
              refreshRate: 30,
              lastUpdated: '2025-01-20T10:25:00Z',
              config: {
                timeRange: '30_days',
                filters: { status: 'active' },
                visualization: { sortBy: 'safety_score', order: 'desc' },
              },
              data: {
                drivers: [
                  { name: 'John Smith', safetyScore: 92, efficiency: 88, miles: 12500 },
                  { name: 'Sarah Johnson', safetyScore: 78, efficiency: 85, miles: 11200 },
                  { name: 'Mike Wilson', safetyScore: 65, efficiency: 72, miles: 10800 },
                ],
              },
              insights: [
                'Top 20% of drivers average 90+ safety scores',
                'Efficiency correlates strongly with experience',
                '3 drivers require additional training',
              ],
            },
          ],
          layout: { columns: 2, rows: 3 },
          permissions: ['manager', 'dispatcher'],
          isDefault: false,
          createdBy: 'Operations Manager',
          createdAt: '2024-06-15T00:00:00Z',
          lastModified: '2025-01-18T14:30:00Z',
        },
        {
          id: 'safety-dashboard',
          name: 'Safety Analytics',
          description: 'Comprehensive safety metrics and incident analysis',
          widgets: [
            {
              id: 'safety-incidents',
              title: 'Safety Incident Trends',
              type: 'chart',
              category: 'safety',
              description: 'Monthly safety incident tracking with severity breakdown',
              dataSource: 'safety_data',
              refreshRate: 120,
              lastUpdated: '2025-01-20T09:00:00Z',
              config: {
                timeRange: '6_months',
                filters: {},
                visualization: { chartType: 'bar', stackBy: 'severity' },
              },
              data: {
                incidents: [2, 1, 3, 0, 1, 2],
                severity: ['minor', 'major', 'critical'],
                labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
              },
              insights: [
                'Incidents decreased 40% over 6 months',
                'No critical incidents in November',
                'Training program showing positive results',
              ],
            },
          ],
          layout: { columns: 2, rows: 2 },
          permissions: ['safety_manager', 'executive'],
          isDefault: false,
          createdBy: 'Safety Manager',
          createdAt: '2024-09-01T00:00:00Z',
          lastModified: '2025-01-15T11:20:00Z',
        },
      ];

      const mockReports: AnalyticsReport[] = [
        {
          id: 'daily-operations',
          name: 'Daily Operations Report',
          type: 'scheduled',
          category: 'operational',
          description: 'Daily summary of fleet operations, deliveries, and performance metrics',
          schedule: {
            frequency: 'daily',
            time: '06:00',
            recipients: ['operations@company.com', 'manager@company.com'],
          },
          parameters: {
            includeDriverMetrics: true,
            includeVehicleStatus: true,
            includeFinancials: false,
          },
          lastRun: '2025-01-20T06:00:00Z',
          nextRun: '2025-01-21T06:00:00Z',
          status: 'active',
        },
        {
          id: 'weekly-financial',
          name: 'Weekly Financial Summary',
          type: 'scheduled',
          category: 'financial',
          description: 'Weekly financial performance including revenue, costs, and profitability',
          schedule: {
            frequency: 'weekly',
            time: '08:00',
            recipients: ['finance@company.com', 'cfo@company.com'],
          },
          parameters: {
            includeRevenue: true,
            includeCosts: true,
            includeProfitability: true,
            compareToTarget: true,
          },
          lastRun: '2025-01-20T08:00:00Z',
          nextRun: '2025-01-27T08:00:00Z',
          status: 'active',
        },
        {
          id: 'monthly-safety',
          name: 'Monthly Safety Report',
          type: 'scheduled',
          category: 'safety',
          description: 'Comprehensive monthly safety analysis and compliance report',
          schedule: {
            frequency: 'monthly',
            time: '09:00',
            recipients: ['safety@company.com', 'compliance@company.com'],
          },
          parameters: {
            includeIncidents: true,
            includeTraining: true,
            includeCompliance: true,
            includeBenchmarks: true,
          },
          lastRun: '2025-01-01T09:00:00Z',
          nextRun: '2025-02-01T09:00:00Z',
          status: 'active',
        },
        {
          id: 'driver-performance-analysis',
          name: 'Driver Performance Analysis',
          type: 'on_demand',
          category: 'driver',
          description: 'Detailed analysis of individual driver performance and recommendations',
          parameters: {
            driverId: null,
            timeRange: '90_days',
            includeComparisons: true,
            includeRecommendations: true,
          },
          status: 'active',
        },
      ];

      setDashboards(mockDashboards);
      setReports(mockReports);
      if (mockDashboards.length > 0) {
        setSelectedDashboard(mockDashboards[0].id);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'operational':
        return <TruckIcon className="h-5 w-5" />;
      case 'financial':
        return <CurrencyDollarIcon className="h-5 w-5" />;
      case 'driver':
        return <UserIcon className="h-5 w-5" />;
      case 'vehicle':
        return <TruckIcon className="h-5 w-5" />;
      case 'route':
        return <MapPinIcon className="h-5 w-5" />;
      case 'safety':
        return <ShieldCheckIcon className="h-5 w-5" />;
      default:
        return <ChartBarIcon className="h-5 w-5" />;
    }
  };

  const getWidgetTypeIcon = (type: string) => {
    switch (type) {
      case 'chart':
        return <PresentationChartLineIcon className="h-4 w-4" />;
      case 'table':
        return <DocumentChartBarIcon className="h-4 w-4" />;
      case 'gauge':
        return <BoltIcon className="h-4 w-4" />;
      case 'map':
        return <MapPinIcon className="h-4 w-4" />;
      default:
        return <ChartBarIcon className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const filteredDashboards = dashboards.filter(dashboard => {
    if (selectedCategory !== 'all' && !dashboard.widgets.some(w => w.category === selectedCategory))
      return false;
    if (
      searchTerm &&
      !dashboard.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !dashboard.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  const filteredReports = reports.filter(report => {
    if (selectedCategory !== 'all' && report.category !== selectedCategory) return false;
    if (
      searchTerm &&
      !report.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !report.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Advanced Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Interactive dashboards, reports, and business intelligence tools
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export Data
          </Button>
          <Link href="/analytics/builder">
            <Button>
              <CpuChipIcon className="h-5 w-5 mr-2" />
              Dashboard Builder
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboards" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search dashboards..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="driver">Driver Analytics</SelectItem>
                    <SelectItem value="vehicle">Vehicle Analytics</SelectItem>
                    <SelectItem value="route">Route Analytics</SelectItem>
                    <SelectItem value="safety">Safety Analytics</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                >
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dashboards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDashboards.map(dashboard => (
              <Card key={dashboard.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ChartBarIcon className="h-5 w-5" />
                      {dashboard.name}
                    </div>
                    {dashboard.isDefault && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">Default</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{dashboard.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(dashboard.widgets.map(w => w.category))).map(category => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Widgets ({dashboard.widgets.length})
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {dashboard.widgets.slice(0, 4).map(widget => (
                          <div
                            key={widget.id}
                            className="flex items-center gap-2 text-xs text-gray-500"
                          >
                            {getWidgetTypeIcon(widget.type)}
                            <span className="truncate">{widget.title}</span>
                          </div>
                        ))}
                        {dashboard.widgets.length > 4 && (
                          <div className="text-xs text-gray-400">
                            +{dashboard.widgets.length - 4} more
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>
                          Modified: {new Date(dashboard.lastModified).toLocaleDateString()}
                        </span>
                        <span>By: {dashboard.createdBy}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/analytics/dashboard/${dashboard.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline">
                        <Cog6ToothIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDashboards.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Dashboards Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No dashboards match your current filters;
                  </p>
                  <Button>
                    <CpuChipIcon className="h-4 w-4 mr-2" />
                    Create Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="driver">Driver Reports</SelectItem>
                    <SelectItem value="safety">Safety Reports</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                >
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.map(report => (
              <Card key={report.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        {getCategoryIcon(report.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{report.name}</h3>
                          <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                          <Badge variant="outline" className="capitalize">
                            {report.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                        <div className="text-xs text-gray-400 mt-2">
                          {report.schedule && (
                            <>
                              Schedule: {report.schedule.frequency} at {report.schedule.time} •
                              Recipients: {report.schedule.recipients.length} •
                            </>
                          )}
                          {report.lastRun && (
                            <>Last run: {new Date(report.lastRun).toLocaleString()}</>
                          )}
                          {report.nextRun && (
                            <> • Next run: {new Date(report.nextRun).toLocaleString()}</>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {report.type === 'on_demand' && <Button size="sm">Run Now</Button>}
                      <Button size="sm" variant="outline">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Cog6ToothIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <DocumentChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Reports Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No reports match your current filters;
                  </p>
                  <Button>Create Report</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CpuChipIcon className="h-5 w-5" />
                AI-Powered Business Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Key Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                          <TruckIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900 dark:text-blue-100">
                            Fleet Optimization Opportunity
                          </h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            AI analysis suggests redistributing 3 vehicles from Route A to Route C
                            could increase overall efficiency by 12% and reduce fuel costs by
                            $2,400/month;
                          </p>
                          <div className="mt-3">
                            <Badge className="bg-blue-100 text-blue-800 text-xs">High Impact</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                          <UserIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-green-900 dark:text-green-100">
                            Driver Performance Pattern
                          </h4>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            Drivers with 3+ years experience show 23% better fuel efficiency;
                            Consider pairing new drivers with experienced mentors;
                          </p>
                          <div className="mt-3">
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Training Opportunity
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-lg">
                          <ClockIcon className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                            Maintenance Prediction
                          </h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            Vehicle #247 shows early indicators of transmission issues. Schedule
                            preventive maintenance within 2 weeks to avoid breakdown;
                          </p>
                          <div className="mt-3">
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                              Preventive Action
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                          <CurrencyDollarIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-purple-900 dark:text-purple-100">
                            Revenue Optimization
                          </h4>
                          <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                            Peak demand hours (2-4 PM) show 18% higher rates. Adjust scheduling to
                            capture more high-value loads during this window;
                          </p>
                          <div className="mt-3">
                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                              Revenue Growth
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Trend Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Predictive Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Fuel Cost Forecast</h4>
                          <Badge className="bg-blue-100 text-blue-800">Next 30 Days</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Based on historical patterns and market trends, fuel costs are expected to
                          increase by 8-12% over the next month;
                        </p>
                        <div className="text-sm">
                          <span className="font-medium">Recommendation:</span> Consider fuel hedging
                          strategies or route optimization to mitigate impact;
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Demand Prediction</h4>
                          <Badge className="bg-green-100 text-green-800">Next Quarter</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Seasonal analysis indicates 25% increase in shipping demand starting
                          March. Current capacity may be insufficient;
                        </p>
                        <div className="text-sm">
                          <span className="font-medium">Recommendation:</span> Consider expanding
                          fleet or partnering with additional carriers;
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg w-fit mx-auto mb-3">
                          <ChartBarIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="font-medium mb-2">Create Dashboard</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Build custom dashboards with drag-and-drop widgets
                        </p>
                        <Button size="sm" className="w-full">
                          Start Building
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg w-fit mx-auto mb-3">
                          <DocumentChartBarIcon className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="font-medium mb-2">Design Report</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Create automated reports with custom schedules
                        </p>
                        <Button size="sm" className="w-full">
                          Design Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg w-fit mx-auto mb-3">
                          <CpuChipIcon className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="font-medium mb-2">AI Analysis</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Set up AI-powered insights and predictions
                        </p>
                        <Button size="sm" className="w-full">
                          Configure AI
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Templates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dashboard Templates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-center gap-3">
                          <TruckIcon className="h-6 w-6 text-blue-600" />
                          <div>
                            <h4 className="font-medium">Fleet Operations</h4>
                            <p className="text-sm text-gray-600">
                              Vehicle utilization, driver performance, route efficiency
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-center gap-3">
                          <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                          <div>
                            <h4 className="font-medium">Financial Performance</h4>
                            <p className="text-sm text-gray-600">
                              Revenue, costs, profitability, cash flow
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-center gap-3">
                          <ShieldCheckIcon className="h-6 w-6 text-yellow-600" />
                          <div>
                            <h4 className="font-medium">Safety & Compliance</h4>
                            <p className="text-sm text-gray-600">
                              Safety scores, incidents, compliance metrics
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-center gap-3">
                          <UserIcon className="h-6 w-6 text-purple-600" />
                          <div>
                            <h4 className="font-medium">Driver Analytics</h4>
                            <p className="text-sm text-gray-600">
                              Performance, training, retention, satisfaction
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
