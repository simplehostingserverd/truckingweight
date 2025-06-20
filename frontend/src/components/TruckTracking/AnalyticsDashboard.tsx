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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChartBarIcon,
  TruckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { DriverMetrics, FleetMetrics, AnalyticsReport } from '@/services/analyticsService';

interface AnalyticsDashboardProps {
  driverId?: string;
  driverMetrics?: DriverMetrics | null;
  fleetMetrics?: FleetMetrics | null;
  reports?: AnalyticsReport[];
  onGenerateReport?: (type: 'driver' | 'fleet', targetId?: string) => void;
  isLoading?: boolean;
}

export default function AnalyticsDashboard({
  driverId,
  driverMetrics,
  fleetMetrics,
  reports = [],
  onGenerateReport,
  isLoading = false,
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'driver' | 'fleet' | 'reports'>('overview');

  // Auto-switch to driver tab if driver metrics are available
  useEffect(() => {
    if (driverMetrics && activeTab === 'overview') {
      setActiveTab('driver');
    }
  }, [driverMetrics, activeTab]);

  const formatNumber = (num: number, decimals = 0) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-5 w-5" />
            <span>Analytics Dashboard</span>
          </div>
          <div className="flex space-x-2">
            {driverId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onGenerateReport?.('driver', driverId)}
                disabled={isLoading}
              >
                <DocumentChartBarIcon className="h-4 w-4 mr-2" />
                Driver Report
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onGenerateReport?.('fleet')}
              disabled={isLoading}
            >
              <DocumentChartBarIcon className="h-4 w-4 mr-2" />
              Fleet Report
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="driver" disabled={!driverMetrics}>Driver</TabsTrigger>
            <TabsTrigger value="fleet" disabled={!fleetMetrics}>Fleet</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Quick Stats */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TruckIcon className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Active Vehicles</p>
                      <p className="text-2xl font-bold">{fleetMetrics?.overview.activeVehicles || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Active Drivers</p>
                      <p className="text-2xl font-bold">{fleetMetrics?.overview.activeDrivers || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">On-Time Rate</p>
                      <p className="text-2xl font-bold">{fleetMetrics?.performance.onTimePerformance.toFixed(1) || 0}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CurrencyDollarIcon className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Cost per Mile</p>
                      <p className="text-2xl font-bold">{formatCurrency(fleetMetrics?.costs.costPerMile || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Fleet safety score improved by 2.3%</span>
                    </div>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm">3 drivers exceeded speed limits today</span>
                    </div>
                    <span className="text-xs text-gray-500">4 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <TruckIcon className="h-5 w-5 text-blue-500" />
                      <span className="text-sm">Vehicle maintenance completed for 5 trucks</span>
                    </div>
                    <span className="text-xs text-gray-500">6 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="driver" className="space-y-6">
            {driverMetrics && (
              <>
                {/* Driver Performance Scores */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Overall Score</p>
                        <p className={`text-3xl font-bold ${getScoreColor(driverMetrics.performance.overallScore)}`}>
                          {driverMetrics.performance.overallScore.toFixed(0)}
                        </p>
                        <Progress value={driverMetrics.performance.overallScore} className="mt-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Safety Score</p>
                        <p className={`text-2xl font-bold ${getScoreColor(driverMetrics.performance.safetyScore)}`}>
                          {driverMetrics.performance.safetyScore.toFixed(0)}
                        </p>
                        <Progress value={driverMetrics.performance.safetyScore} className="mt-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Efficiency</p>
                        <p className={`text-2xl font-bold ${getScoreColor(driverMetrics.performance.efficiencyScore)}`}>
                          {driverMetrics.performance.efficiencyScore.toFixed(0)}
                        </p>
                        <Progress value={driverMetrics.performance.efficiencyScore} className="mt-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Punctuality</p>
                        <p className={`text-2xl font-bold ${getScoreColor(driverMetrics.performance.punctualityScore)}`}>
                          {driverMetrics.performance.punctualityScore.toFixed(0)}
                        </p>
                        <Progress value={driverMetrics.performance.punctualityScore} className="mt-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Driver Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Driving Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Total Miles</span>
                          <span className="font-medium">{formatNumber(driverMetrics.driving.totalMiles)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Total Hours</span>
                          <span className="font-medium">{formatNumber(driverMetrics.driving.totalHours)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Average Speed</span>
                          <span className="font-medium">{formatNumber(driverMetrics.driving.averageSpeed, 1)} mph</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Fuel Efficiency</span>
                          <span className="font-medium">{formatNumber(driverMetrics.driving.fuelEfficiency, 1)} MPG</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Idle Time</span>
                          <span className="font-medium">{formatNumber(driverMetrics.driving.idleTime)} min</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Total Deliveries</span>
                          <span className="font-medium">{driverMetrics.delivery.totalDeliveries}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">On-Time Deliveries</span>
                          <span className="font-medium text-green-600">{driverMetrics.delivery.onTimeDeliveries}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Late Deliveries</span>
                          <span className="font-medium text-red-600">{driverMetrics.delivery.lateDeliveries}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Average Delay</span>
                          <span className="font-medium">{formatNumber(driverMetrics.delivery.averageDelayMinutes, 1)} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Customer Rating</span>
                          <span className="font-medium">{formatNumber(driverMetrics.delivery.customerRating, 1)}/5</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Compliance & Safety */}
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance & Safety</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{driverMetrics.compliance.speedViolations}</p>
                        <p className="text-sm text-gray-500">Speed Violations</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{driverMetrics.compliance.hosViolations}</p>
                        <p className="text-sm text-gray-500">HOS Violations</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">{driverMetrics.compliance.geofenceViolations}</p>
                        <p className="text-sm text-gray-500">Geofence Violations</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{driverMetrics.compliance.inspectionsPassed}</p>
                        <p className="text-sm text-gray-500">Inspections Passed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="fleet" className="space-y-6">
            {fleetMetrics && (
              <>
                {/* Fleet Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Fleet Safety Score</p>
                        <p className={`text-2xl font-bold ${getScoreColor(fleetMetrics.performance.fleetSafetyScore)}`}>
                          {fleetMetrics.performance.fleetSafetyScore.toFixed(0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Efficiency Score</p>
                        <p className={`text-2xl font-bold ${getScoreColor(fleetMetrics.performance.fleetEfficiencyScore)}`}>
                          {fleetMetrics.performance.fleetEfficiencyScore.toFixed(0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Fuel Efficiency</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {fleetMetrics.performance.fuelEfficiency.toFixed(1)} MPG
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Utilization</p>
                        <p className="text-2xl font-bold text-green-600">
                          {fleetMetrics.overview.averageUtilization.toFixed(1)}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Cost Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Total Operating Cost</p>
                        <p className="text-2xl font-bold">{formatCurrency(fleetMetrics.costs.totalOperatingCost)}</p>
                        <div className="flex items-center mt-1">
                          {getTrendIcon(fleetMetrics.trends.costsGrowth > 0 ? 'up' : 'down')}
                          <span className="text-sm ml-1">{fleetMetrics.trends.costsGrowth.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Fuel Cost</p>
                        <p className="text-2xl font-bold">{formatCurrency(fleetMetrics.costs.totalFuelCost)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Maintenance Cost</p>
                        <p className="text-2xl font-bold">{formatCurrency(fleetMetrics.costs.totalMaintenanceCost)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fleet Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Fleet Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          {getTrendIcon(fleetMetrics.trends.milesGrowth > 0 ? 'up' : 'down')}
                          <span className="ml-2 text-lg font-bold">{fleetMetrics.trends.milesGrowth.toFixed(1)}%</span>
                        </div>
                        <p className="text-sm text-gray-500">Miles Growth</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          {getTrendIcon(fleetMetrics.trends.deliveriesGrowth > 0 ? 'up' : 'down')}
                          <span className="ml-2 text-lg font-bold">{fleetMetrics.trends.deliveriesGrowth.toFixed(1)}%</span>
                        </div>
                        <p className="text-sm text-gray-500">Deliveries Growth</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          {getTrendIcon(fleetMetrics.trends.efficiencyGrowth > 0 ? 'up' : 'down')}
                          <span className="ml-2 text-lg font-bold">{fleetMetrics.trends.efficiencyGrowth.toFixed(1)}%</span>
                        </div>
                        <p className="text-sm text-gray-500">Efficiency Growth</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                          <span className="ml-2 text-lg font-bold">{fleetMetrics.incidents.violations}</span>
                        </div>
                        <p className="text-sm text-gray-500">Total Violations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <DocumentChartBarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No reports generated yet</p>
                  <p className="text-sm">Generate your first report using the buttons above</p>
                </div>
              ) : (
                reports.map(report => (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <Badge variant="outline">{report.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-sm text-gray-500">
                          Generated: {new Date(report.generatedAt).toLocaleString()}
                        </div>
                        
                        {/* Insights */}
                        {report.insights.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Key Insights</h4>
                            <div className="space-y-2">
                              {report.insights.slice(0, 3).map((insight, index) => (
                                <div key={index} className="flex items-center space-x-2 text-sm">
                                  {insight.type === 'positive' && <CheckCircleIcon className="h-4 w-4 text-green-500" />}
                                  {insight.type === 'warning' && <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />}
                                  {insight.type === 'negative' && <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />}
                                  <span>{insight.title}</span>
                                  {insight.value && <Badge variant="outline">{insight.value}</Badge>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {report.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Recommendations</h4>
                            <div className="space-y-2">
                              {report.recommendations.slice(0, 2).map((rec, index) => (
                                <div key={index} className="text-sm">
                                  <div className="flex items-center space-x-2">
                                    <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                                      {rec.priority}
                                    </Badge>
                                    <span className="font-medium">{rec.title}</span>
                                  </div>
                                  <p className="text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
