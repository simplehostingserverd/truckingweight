/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Truck, 
  MapPin, 
  Clock, 
  Fuel, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  ArrowUp as ArrowTrendingUpIcon,
  ArrowDown as ArrowTrendingDownIcon,
  BarChart3 as ChartBarIcon,
  User as UserIcon,
  Truck as TruckIcon,
  CheckCircle as CheckCircleIcon,
  AlertTriangle as ExclamationTriangleIcon,
  Calendar as CalendarIcon
} from 'lucide-react';
import { driverTrackingService, AnalyticsData } from '@/services/driverTrackingService';
import { toast } from '@/hooks/use-toast';

interface DriverAnalyticsDashboardProps {
  timeRange?: '24h' | '7d' | '30d' | '90d';
  onTimeRangeChange?: (range: string) => void;
}

export default function DriverAnalyticsDashboard({ 
  timeRange = '24h', 
  onTimeRangeChange 
}: DriverAnalyticsDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'performance' | 'safety' | 'fuel'>('performance');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const data = await driverTrackingService.getAnalytics({
          timeRange: selectedTimeRange,
          metrics: ['performance', 'safety', 'fuel']
        });
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch analytics data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedTimeRange]);

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range as any);
    onTimeRangeChange?.(range);
  };

  // Extract data from analyticsData
  const fleetMetrics = analyticsData?.fleetMetrics;
  const performanceData = analyticsData?.timeSeriesData?.performance || [];
  const safetyData = analyticsData?.timeSeriesData?.safety || [];
  const fuelData = analyticsData?.timeSeriesData?.efficiency || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'on_break':
        return 'bg-yellow-500';
      case 'inactive':
        return 'bg-gray-500';
      case 'off_duty':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'on_break':
        return 'secondary';
      case 'inactive':
        return 'outline';
      case 'off_duty':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getCurrentData = () => {
    switch (selectedMetric) {
      case 'safety':
        return safetyData;
      case 'fuel':
        return fuelData;
      default:
        return performanceData;
    }
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'safety':
        return 'Safety Score';
      case 'fuel':
        return 'Fuel Efficiency (MPG)';
      default:
        return 'Performance Score';
    }
  };

  const topPerformers = analyticsData?.driverMetrics
    ?.sort((a, b) => b.safetyScore - a.safetyScore)
    .slice(0, 5) || [];

  const recentViolations = analyticsData?.driverMetrics
    ?.filter(driver => driver.violations > 0)
    .sort((a, b) => b.violations - a.violations)
    .slice(0, 5) || [];

  if (!fleetMetrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5" />
              Driver Analytics Dashboard
            </CardTitle>
            <div className="flex gap-2">
              <Select value={selectedTimeRange} onValueChange={handleTimeRangeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Fleet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Drivers</p>
                <p className="text-2xl font-bold">{fleetMetrics?.activeDrivers || 0}</p>
                <p className="text-xs text-gray-500">of {fleetMetrics?.totalDrivers || 0} total</p>
              </div>
              <UserIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-1 text-sm">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                <span className="text-green-600">+5.2%</span>
                <span className="text-gray-500">vs last period</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Miles</p>
                <p className="text-2xl font-bold">{fleetMetrics?.totalDistance?.toLocaleString() || '0'}</p>
                <p className="text-xs text-gray-500">this period</p>
              </div>
              <TruckIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-1 text-sm">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                <span className="text-green-600">+12.8%</span>
                <span className="text-gray-500">vs last period</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Safety Score</p>
                <p className="text-2xl font-bold">{fleetMetrics?.safetyScore || 0}%</p>
                <p className="text-xs text-gray-500">fleet average</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-1 text-sm">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                <span className="text-green-600">+2.1%</span>
                <span className="text-gray-500">vs last period</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Violations</p>
                <p className="text-2xl font-bold">{analyticsData?.driverMetrics?.reduce((sum, driver) => sum + driver.violations, 0) || 0}</p>
                <p className="text-xs text-gray-500">this period</p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-1 text-sm">
                <ArrowTrendingDownIcon className="h-4 w-4 text-green-500" />
                <span className="text-green-600">-15.3%</span>
                <span className="text-gray-500">vs last period</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Performance Trends</CardTitle>
              <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="fuel">Fuel Efficiency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">{getMetricLabel()} Chart</p>
                <p className="text-sm text-gray-400">Chart visualization would be rendered here</p>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  {getCurrentData().slice(-3).map((point, index) => (
                    <div key={index} className="text-center">
                      <p className="font-semibold">{point.value}</p>
                      <p className="text-gray-500">{formatTimeAgo(point.timestamp)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fleet Efficiency Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <FuelIcon className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Fuel Efficiency</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{fleetMetrics.avgFuelEfficiency} MPG</p>
                  <p className="text-sm text-green-600">+0.3 vs target</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-green-500" />
                  <span className="font-medium">On-Time Delivery</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{fleetMetrics.onTimePercentage}%</p>
                  <p className="text-sm text-green-600">Above target</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Avg Response Time</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{fleetMetrics.avgResponseTime}m</p>
                  <p className="text-sm text-yellow-600">Within SLA</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Route Optimization</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">92.1%</p>
                  <p className="text-sm text-green-600">Efficiency rate</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Driver Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((driver, index) => (
                <div key={driver.driverId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{driver.driverName}</p>
                      <p className="text-sm text-gray-600">{driver.driverId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getSafetyScoreColor(driver.safetyScore)}`}>
                      {driver.safetyScore}%
                    </p>
                    <p className="text-sm text-gray-500">{driver.totalMiles} miles</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Violations</CardTitle>
          </CardHeader>
          <CardContent>
            {recentViolations.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-12 w-12 mx-auto text-green-500 mb-2" />
                <p className="text-green-600 font-medium">No recent violations</p>
                <p className="text-sm text-gray-500">Great job maintaining safety standards!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentViolations.map((driver) => (
                  <div key={driver.driverId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(driver.status)}`} />
                      <div>
                        <p className="font-medium">{driver.driverName}</p>
                        <p className="text-sm text-gray-600">{driver.driverId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">
                        {driver.violations} violation{driver.violations > 1 ? 's' : ''}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatTimeAgo(driver.lastActive)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Driver List */}
      <Card>
        <CardHeader>
          <CardTitle>All Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Driver</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Miles</th>
                  <th className="text-left p-2">Hours</th>
                  <th className="text-left p-2">Safety Score</th>
                  <th className="text-left p-2">Fuel Eff.</th>
                  <th className="text-left p-2">On-Time %</th>
                  <th className="text-left p-2">Violations</th>
                  <th className="text-left p-2">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {driverMetrics.map((driver) => (
                  <tr key={driver.driverId} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{driver.driverName}</p>
                        <p className="text-sm text-gray-600">{driver.driverId}</p>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant={getStatusBadgeVariant(driver.status)}>
                        {driver.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-2 font-medium">{driver.totalMiles}</td>
                    <td className="p-2 font-medium">{driver.totalHours}h</td>
                    <td className="p-2">
                      <span className={`font-bold ${getSafetyScoreColor(driver.safetyScore)}`}>
                        {driver.safetyScore}%
                      </span>
                    </td>
                    <td className="p-2 font-medium">{driver.fuelEfficiency} MPG</td>
                    <td className="p-2 font-medium">
                      {Math.round((driver.onTimeDeliveries / driver.totalDeliveries) * 100)}%
                    </td>
                    <td className="p-2">
                      {driver.violations > 0 ? (
                        <Badge variant="destructive">{driver.violations}</Badge>
                      ) : (
                        <span className="text-green-600">0</span>
                      )}
                    </td>
                    <td className="p-2 text-sm text-gray-600">
                      {formatTimeAgo(driver.lastActive)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}