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

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';

interface FleetMetrics {
  totalVehicles: number;
  activeVehicles: number;
  utilizationRate: number;
  averageMPG: number;
  totalMilesDriven: number;
  maintenanceCosts: number;
  fuelCosts: number;
  revenuePerMile: number;
  costPerMile: number;
  profitMargin: number;
}

interface VehiclePerformance {
  vehicleId: number;
  vehicleName: string;
  milesDriven: number;
  fuelEfficiency: number;
  utilizationRate: number;
  maintenanceCost: number;
  revenue: number;
  profit: number;
  safetyScore: number;
}

interface MonthlyTrend {
  month: string;
  milesDriven: number;
  fuelCosts: number;
  maintenanceCosts: number;
  revenue: number;
  utilizationRate: number;
}

export default function FleetAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [metrics, setMetrics] = useState<FleetMetrics>({
    totalVehicles: 0,
    activeVehicles: 0,
    utilizationRate: 0,
    averageMPG: 0,
    totalMilesDriven: 0,
    maintenanceCosts: 0,
    fuelCosts: 0,
    revenuePerMile: 0,
    costPerMile: 0,
    profitMargin: 0,
  });
  const [vehiclePerformance, setVehiclePerformance] = useState<VehiclePerformance[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, selectedVehicle]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockMetrics: FleetMetrics = {
        totalVehicles: 25,
        activeVehicles: 22,
        utilizationRate: 78.5,
        averageMPG: 6.8,
        totalMilesDriven: 125000,
        maintenanceCosts: 45000,
        fuelCosts: 85000,
        revenuePerMile: 2.85,
        costPerMile: 2.19,
        profitMargin: 23.2,
      };

      const mockVehiclePerformance: VehiclePerformance[] = [
        {
          vehicleId: 1,
          vehicleName: 'Freightliner #001',
          milesDriven: 8500,
          fuelEfficiency: 7.2,
          utilizationRate: 85.5,
          maintenanceCost: 2800,
          revenue: 24225,
          profit: 5640,
          safetyScore: 95,
        },
        {
          vehicleId: 2,
          vehicleName: 'Peterbilt #002',
          milesDriven: 7200,
          fuelEfficiency: 6.8,
          utilizationRate: 82.1,
          maintenanceCost: 1950,
          revenue: 20520,
          profit: 4890,
          safetyScore: 92,
        },
        {
          vehicleId: 3,
          vehicleName: 'Kenworth #003',
          milesDriven: 9100,
          fuelEfficiency: 6.5,
          utilizationRate: 88.2,
          maintenanceCost: 3200,
          revenue: 25935,
          profit: 6120,
          safetyScore: 89,
        },
        {
          vehicleId: 4,
          vehicleName: 'Volvo #004',
          milesDriven: 6800,
          fuelEfficiency: 7.1,
          utilizationRate: 75.3,
          maintenanceCost: 2100,
          revenue: 19380,
          profit: 4250,
          safetyScore: 96,
        },
        {
          vehicleId: 5,
          vehicleName: 'Mack #005',
          milesDriven: 8900,
          fuelEfficiency: 6.3,
          utilizationRate: 86.7,
          maintenanceCost: 3500,
          revenue: 25365,
          profit: 5890,
          safetyScore: 88,
        },
      ];

      const mockMonthlyTrends: MonthlyTrend[] = [
        {
          month: 'Jan',
          milesDriven: 95000,
          fuelCosts: 65000,
          maintenanceCosts: 28000,
          revenue: 270750,
          utilizationRate: 72.5,
        },
        {
          month: 'Feb',
          milesDriven: 102000,
          fuelCosts: 70000,
          maintenanceCosts: 32000,
          revenue: 290700,
          utilizationRate: 75.8,
        },
        {
          month: 'Mar',
          milesDriven: 108000,
          fuelCosts: 74000,
          maintenanceCosts: 35000,
          revenue: 307800,
          utilizationRate: 78.2,
        },
        {
          month: 'Apr',
          milesDriven: 115000,
          fuelCosts: 79000,
          maintenanceCosts: 38000,
          revenue: 327750,
          utilizationRate: 80.1,
        },
        {
          month: 'May',
          milesDriven: 118000,
          fuelCosts: 81000,
          maintenanceCosts: 41000,
          revenue: 336300,
          utilizationRate: 81.5,
        },
        {
          month: 'Jun',
          milesDriven: 125000,
          fuelCosts: 85000,
          maintenanceCosts: 45000,
          revenue: 356250,
          utilizationRate: 78.5,
        },
      ];

      setMetrics(mockMetrics);
      setVehiclePerformance(mockVehiclePerformance);
      setMonthlyTrends(mockMonthlyTrends);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (value: number, threshold: { good: number; average: number }) => {
    if (value >= threshold.good) return 'text-green-600';
    if (value >= threshold.average) return 'text-yellow-600';
    return 'text-red-600';
  };

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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Fleet Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Comprehensive fleet performance and efficiency metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vehicles</SelectItem>
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              {vehiclePerformance.map(vehicle => (
                <SelectItem key={vehicle.vehicleId} value={vehicle.vehicleId.toString()}>
                  {vehicle.vehicleName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Fleet Utilization
                </p>
                <h3 className="text-2xl font-bold mt-1">{metrics.utilizationRate}%</h3>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full flex-shrink-0">
                <TruckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average MPG</p>
                <h3 className="text-2xl font-bold mt-1">{metrics.averageMPG}</h3>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full flex-shrink-0">
                <BoltIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue/Mile</p>
                <h3 className="text-2xl font-bold mt-1">${metrics.revenuePerMile.toFixed(2)}</h3>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Profit Margin
                </p>
                <h3 className="text-2xl font-bold mt-1">{metrics.profitMargin}%</h3>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Fleet Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fleet Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Vehicles</span>
                    <span className="font-medium">{metrics.totalVehicles}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Vehicles</span>
                    <span className="font-medium text-green-600">{metrics.activeVehicles}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Out of Service</span>
                    <span className="font-medium text-red-600">
                      {metrics.totalVehicles - metrics.activeVehicles}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Utilization Rate</span>
                    <span className="font-medium">{metrics.utilizationRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Miles Driven</span>
                    <span className="font-medium">{metrics.totalMilesDriven.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average MPG</span>
                    <span className="font-medium">{metrics.averageMPG}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Revenue/Mile</span>
                    <span className="font-medium text-green-600">
                      ${metrics.revenuePerMile.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cost/Mile</span>
                    <span className="font-medium text-red-600">
                      ${metrics.costPerMile.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Fuel Costs</span>
                    <span className="font-medium">${metrics.fuelCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Maintenance</span>
                    <span className="font-medium">
                      ${metrics.maintenanceCosts.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Costs</span>
                    <span className="font-medium">
                      ${(metrics.fuelCosts + metrics.maintenanceCosts).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Profit Margin</span>
                    <span className="font-medium text-green-600">{metrics.profitMargin}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyTrends.map((trend, index) => (
                  <div
                    key={trend.month}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-medium">{trend.month}</div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-blue-600">
                          Miles: {trend.milesDriven.toLocaleString()}
                        </span>
                        <span className="text-green-600">
                          Revenue: ${trend.revenue.toLocaleString()}
                        </span>
                        <span className="text-red-600">
                          Costs: ${(trend.fuelCosts + trend.maintenanceCosts).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{trend.utilizationRate}%</div>
                      <div className="text-sm text-gray-500">Utilization</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Performance Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehiclePerformance
                  .sort((a, b) => b.profit - a.profit)
                  .map((vehicle, index) => (
                    <div
                      key={vehicle.vehicleId}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                        <div>
                          <div className="font-medium">{vehicle.vehicleName}</div>
                          <div className="text-sm text-gray-500">
                            {vehicle.milesDriven.toLocaleString()} miles • {vehicle.fuelEfficiency}{' '}
                            MPG
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ${vehicle.profit.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Profit</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fuel Efficiency Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehiclePerformance
                  .sort((a, b) => b.fuelEfficiency - a.fuelEfficiency)
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  .map(vehicle => (
                    <div
                      key={vehicle.vehicleId}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{vehicle.vehicleName}</div>
                        <div className="text-sm text-gray-500">
                          {vehicle.milesDriven.toLocaleString()} miles driven
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${getPerformanceColor(vehicle.fuelEfficiency, { good: 7.0, average: 6.5 })}`}
                        >
                          {vehicle.fuelEfficiency} MPG
                        </div>
                        <div className="text-sm text-gray-500">
                          {vehicle.utilizationRate}% utilization
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Analysis by Vehicle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehiclePerformance
                  .sort((a, b) => b.maintenanceCost - a.maintenanceCost)
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  .map(vehicle => (
                    <div
                      key={vehicle.vehicleId}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{vehicle.vehicleName}</div>
                        <div className="text-sm text-gray-500">
                          Revenue: ${vehicle.revenue.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">
                          ${vehicle.maintenanceCost.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Maintenance</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
