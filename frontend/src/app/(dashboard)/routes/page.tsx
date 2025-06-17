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
  MapPinIcon,
  RouteIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TruckIcon,
  CalendarIcon,
  ChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import Link from 'next/link';

interface Route {
  id: number;
  routeName: string;
  loadId: number;
  loadNumber: string;
  driverId: number;
  driverName: string;
  vehicleId: number;
  vehicleName: string;
  status: 'planned' | 'active' | 'completed' | 'delayed';
  totalMiles: number;
  estimatedDuration: number; // in hours
  actualDuration?: number;
  fuelCost: number;
  tollCost: number;
  totalCost: number;
  revenue: number;
  profit: number;
  stops: RouteStop[];
  optimizationScore: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

interface RouteStop {
  id: number;
  type: 'pickup' | 'delivery' | 'fuel' | 'rest' | 'inspection';
  location: string;
  address: string;
  scheduledTime: string;
  actualTime?: string;
  estimatedDuration: number; // in minutes
  status: 'pending' | 'arrived' | 'in_progress' | 'completed' | 'skipped';
  notes?: string;
  contactInfo?: {
    name: string;
    phone: string;
  };
}

interface RouteMetrics {
  totalRoutes: number;
  activeRoutes: number;
  completedRoutes: number;
  delayedRoutes: number;
  avgOptimizationScore: number;
  totalMilesSaved: number;
  totalCostSavings: number;
  onTimePerformance: number;
}

export default function RoutesPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [metrics, setMetrics] = useState<RouteMetrics>({
    totalRoutes: 0,
    activeRoutes: 0,
    completedRoutes: 0,
    delayedRoutes: 0,
    avgOptimizationScore: 0,
    totalMilesSaved: 0,
    totalCostSavings: 0,
    onTimePerformance: 0,
  });
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadRoutesData();
  }, []);

  const loadRoutesData = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockRoutes: Route[] = [
        {
          id: 1,
          routeName: 'Chicago to Detroit Express',
          loadId: 1,
          loadNumber: 'LOAD-2025-001',
          driverId: 1,
          driverName: 'John Smith',
          vehicleId: 2,
          vehicleName: 'Truck #002',
          status: 'active',
          totalMiles: 280,
          estimatedDuration: 5.5,
          fuelCost: 168.0,
          tollCost: 25.5,
          totalCost: 193.5,
          revenue: 2850,
          profit: 2656.5,
          optimizationScore: 92,
          createdAt: '2025-01-20T06:00:00Z',
          startedAt: '2025-01-20T08:00:00Z',
          stops: [
            {
              id: 1,
              type: 'pickup',
              location: 'ABC Manufacturing',
              address: '123 Industrial Blvd, Chicago, IL',
              scheduledTime: '2025-01-20T08:00:00Z',
              actualTime: '2025-01-20T07:55:00Z',
              estimatedDuration: 30,
              status: 'completed',
              contactInfo: {
                name: 'John Smith',
                phone: '(555) 123-4567',
              },
            },
            {
              id: 2,
              type: 'fuel',
              location: 'Pilot Travel Center',
              address: '456 Highway 94, Kalamazoo, MI',
              scheduledTime: '2025-01-20T11:30:00Z',
              estimatedDuration: 20,
              status: 'pending',
            },
            {
              id: 3,
              type: 'delivery',
              location: 'XYZ Distribution',
              address: '456 Warehouse Dr, Detroit, MI',
              scheduledTime: '2025-01-20T16:00:00Z',
              estimatedDuration: 45,
              status: 'pending',
              contactInfo: {
                name: 'Sarah Johnson',
                phone: '(555) 987-6543',
              },
            },
          ],
        },
        {
          id: 2,
          routeName: 'Atlanta to Miami Cold Chain',
          loadId: 2,
          loadNumber: 'LOAD-2025-002',
          driverId: 2,
          driverName: 'Mike Johnson',
          vehicleId: 3,
          vehicleName: 'Truck #003',
          status: 'planned',
          totalMiles: 650,
          estimatedDuration: 12.5,
          fuelCost: 390.0,
          tollCost: 45.0,
          totalCost: 435.0,
          revenue: 3200,
          profit: 2765.0,
          optimizationScore: 88,
          createdAt: '2025-01-20T10:00:00Z',
          stops: [
            {
              id: 4,
              type: 'pickup',
              location: 'Global Logistics Warehouse',
              address: '789 Shipping Way, Atlanta, GA',
              scheduledTime: '2025-01-21T06:00:00Z',
              estimatedDuration: 45,
              status: 'pending',
              contactInfo: {
                name: 'Robert Davis',
                phone: '(555) 456-7890',
              },
            },
            {
              id: 5,
              type: 'rest',
              location: 'TA Travel Center',
              address: '321 Interstate Dr, Gainesville, FL',
              scheduledTime: '2025-01-21T14:00:00Z',
              estimatedDuration: 600, // 10 hours rest
              status: 'pending',
            },
            {
              id: 6,
              type: 'delivery',
              location: 'Miami Fresh Market',
              address: '654 Ocean Ave, Miami, FL',
              scheduledTime: '2025-01-22T14:00:00Z',
              estimatedDuration: 60,
              status: 'pending',
              contactInfo: {
                name: 'Carlos Rodriguez',
                phone: '(555) 345-6789',
              },
            },
          ],
        },
        {
          id: 3,
          routeName: 'San Francisco to Seattle Tech Run',
          loadId: 3,
          loadNumber: 'LOAD-2025-003',
          driverId: 3,
          driverName: 'Sarah Wilson',
          vehicleId: 1,
          vehicleName: 'Truck #001',
          status: 'completed',
          totalMiles: 800,
          estimatedDuration: 14.0,
          actualDuration: 13.5,
          fuelCost: 480.0,
          tollCost: 65.0,
          totalCost: 545.0,
          revenue: 4100,
          profit: 3555.0,
          optimizationScore: 95,
          createdAt: '2025-01-18T08:00:00Z',
          startedAt: '2025-01-19T10:00:00Z',
          completedAt: '2025-01-20T08:30:00Z',
          stops: [
            {
              id: 7,
              type: 'pickup',
              location: 'Tech Solutions Facility',
              address: '987 Innovation Dr, San Francisco, CA',
              scheduledTime: '2025-01-19T10:00:00Z',
              actualTime: '2025-01-19T09:45:00Z',
              estimatedDuration: 30,
              status: 'completed',
              contactInfo: {
                name: 'Jennifer Lee',
                phone: '(555) 567-8901',
              },
            },
            {
              id: 8,
              type: 'delivery',
              location: 'Seattle Tech Hub',
              address: '147 Digital Blvd, Seattle, WA',
              scheduledTime: '2025-01-20T08:00:00Z',
              actualTime: '2025-01-20T08:30:00Z',
              estimatedDuration: 45,
              status: 'completed',
              contactInfo: {
                name: 'David Kim',
                phone: '(555) 678-9012',
              },
            },
          ],
        },
      ];

      const mockMetrics: RouteMetrics = {
        totalRoutes: mockRoutes.length,
        activeRoutes: mockRoutes.filter(r => r.status === 'active').length,
        completedRoutes: mockRoutes.filter(r => r.status === 'completed').length,
        delayedRoutes: mockRoutes.filter(r => r.status === 'delayed').length,
        avgOptimizationScore:
          mockRoutes.reduce((sum, r) => sum + r.optimizationScore, 0) / mockRoutes.length,
        totalMilesSaved: 127,
        totalCostSavings: 1250.75,
        onTimePerformance: 94.2,
      };

      setRoutes(mockRoutes);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading routes data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'delayed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStopStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'arrived':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'skipped':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getOptimizationScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredRoutes = routes.filter(route => {
    if (statusFilter !== 'all' && route.status !== statusFilter) return false;
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Route Planning</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Optimize routes for maximum efficiency and cost savings
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/routes/optimize">
            <Button variant="outline">
              <BoltIcon className="h-5 w-5 mr-2" />
              Optimize Routes
            </Button>
          </Link>
          <Link href="/routes/create">
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              Plan Route
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Routes
                </p>
                <h3 className="text-2xl font-bold mt-1 text-green-600">{metrics.activeRoutes}</h3>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full flex-shrink-0">
                <RouteIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Optimization Score
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {metrics.avgOptimizationScore.toFixed(1)}%
                </h3>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Miles Saved</p>
                <h3 className="text-2xl font-bold mt-1 text-purple-600">
                  {metrics.totalMilesSaved}
                </h3>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full flex-shrink-0">
                <MapPinIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Cost Savings</p>
                <h3 className="text-2xl font-bold mt-1 text-orange-600">
                  ${metrics.totalCostSavings.toLocaleString()}
                </h3>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="routes">Route Management</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Route Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Route Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Planned</span>
                    <span className="font-medium text-blue-600">
                      {routes.filter(r => r.status === 'planned').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active</span>
                    <span className="font-medium text-green-600">{metrics.activeRoutes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-medium text-gray-600">{metrics.completedRoutes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Delayed</span>
                    <span className="font-medium text-red-600">{metrics.delayedRoutes}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">On-Time Performance</span>
                    <span className="font-medium text-green-600">{metrics.onTimePerformance}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Optimization</span>
                    <span className="font-medium">{metrics.avgOptimizationScore.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Miles Saved</span>
                    <span className="font-medium text-purple-600">{metrics.totalMilesSaved}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cost Savings</span>
                    <span className="font-medium text-green-600">
                      ${metrics.totalCostSavings.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efficiency Gains</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Fuel Savings</span>
                    <span className="font-medium text-green-600">$890.25</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Time Savings</span>
                    <span className="font-medium text-blue-600">18.5 hrs</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Toll Savings</span>
                    <span className="font-medium text-purple-600">$360.50</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">CO2 Reduction</span>
                    <span className="font-medium text-green-600">2.1 tons</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Routes Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TruckIcon className="h-5 w-5 mr-2 text-blue-500" />
                Active Routes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routes
                  .filter(r => r.status === 'active')
                  .map(route => (
                    <div
                      key={route.id}
                      className="flex items-center justify-between p-4 border rounded-lg border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{route.routeName}</span>
                          <Badge className={getStatusColor(route.status)}>{route.status}</Badge>
                          <Badge
                            className={`${getOptimizationScoreColor(route.optimizationScore)} bg-gray-100 dark:bg-gray-800`}
                          >
                            {route.optimizationScore}% optimized
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {route.driverName} • {route.vehicleName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {route.totalMiles} miles • Est. {route.estimatedDuration}h
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ${route.profit.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Profit</div>
                        <Button size="sm" className="mt-2">
                          Track Route
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setStatusFilter('all')}>
                  Clear Filters
                </Button>
                <Link href="/routes/optimize">
                  <Button variant="outline" className="w-full">
                    Optimize All
                  </Button>
                </Link>
                <Link href="/routes/create">
                  <Button className="w-full">Plan New Route</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Routes Table */}
          <Card>
            <CardHeader>
              <CardTitle>Route Management ({filteredRoutes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route</TableHead>
                      <TableHead>Driver/Vehicle</TableHead>
                      <TableHead>Distance/Time</TableHead>
                      <TableHead>Cost/Profit</TableHead>
                      <TableHead>Optimization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoutes.map(route => (
                      <TableRow
                        key={route.id}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setSelectedRoute(route)}
                      >
                        <TableCell>
                          <div className="font-medium">{route.routeName}</div>
                          <div className="text-sm text-gray-500">{route.loadNumber}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{route.driverName}</div>
                          <div className="text-sm text-gray-500">{route.vehicleName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{route.totalMiles} miles</div>
                            <div className="text-gray-500">
                              {route.estimatedDuration}h est.
                              {route.actualDuration && (
                                <span className="ml-1">({route.actualDuration}h actual)</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="text-red-600">${route.totalCost.toLocaleString()}</div>
                            <div className="text-green-600 font-medium">
                              ${route.profit.toLocaleString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className={`font-medium ${getOptimizationScoreColor(route.optimizationScore)}`}
                          >
                            {route.optimizationScore}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(route.status)}>{route.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/routes/${route.id}`}>
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </Link>
                            {route.status === 'planned' && <Button size="sm">Start</Button>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Route Details Panel */}
          {selectedRoute && (
            <Card>
              <CardHeader>
                <CardTitle>Route Details: {selectedRoute.routeName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Route Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Load Number:</span>
                        <span className="font-medium">{selectedRoute.loadNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Driver:</span>
                        <span className="font-medium">{selectedRoute.driverName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vehicle:</span>
                        <span className="font-medium">{selectedRoute.vehicleName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Distance:</span>
                        <span className="font-medium">{selectedRoute.totalMiles} miles</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Duration:</span>
                        <span className="font-medium">{selectedRoute.estimatedDuration} hours</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Financial Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span className="font-medium text-green-600">
                          ${selectedRoute.revenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fuel Cost:</span>
                        <span className="font-medium text-red-600">
                          ${selectedRoute.fuelCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Toll Cost:</span>
                        <span className="font-medium text-red-600">
                          ${selectedRoute.tollCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Cost:</span>
                        <span className="font-medium text-red-600">
                          ${selectedRoute.totalCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Profit:</span>
                        <span className="font-bold text-green-600">
                          ${selectedRoute.profit.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Route Stops</h4>
                  <div className="space-y-3">
                    {selectedRoute.stops.map((stop, index) => (
                      <div
                        key={stop.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium text-gray-500">#{index + 1}</div>
                          <div className="flex-1">
                            <div className="font-medium capitalize">
                              {stop.type}: {stop.location}
                            </div>
                            <div className="text-sm text-gray-500">{stop.address}</div>
                            <div className="text-xs text-gray-400">
                              Scheduled: {new Date(stop.scheduledTime).toLocaleString()}
                              {stop.actualTime && (
                                <span className="ml-2">
                                  Actual: {new Date(stop.actualTime).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge className={getStopStatusColor(stop.status)}>{stop.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Route Optimization Engine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Optimization Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Minimize Distance</span>
                        <input type="checkbox" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Avoid Tolls</span>
                        <input type="checkbox" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Fuel Efficiency Priority</span>
                        <input type="checkbox" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Consider Traffic Patterns</span>
                        <input type="checkbox" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Bridge Height Restrictions</span>
                        <input type="checkbox" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>HAZMAT Route Compliance</span>
                        <input type="checkbox" />
                      </div>
                      <Button className="w-full">Run Optimization</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Optimization Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Routes Analyzed:</span>
                        <span className="font-medium">12 routes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Distance Saved:</span>
                        <span className="font-medium text-green-600">127 miles</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time Saved:</span>
                        <span className="font-medium text-blue-600">3.2 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fuel Cost Savings:</span>
                        <span className="font-medium text-green-600">$89.50</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Toll Savings:</span>
                        <span className="font-medium text-purple-600">$45.25</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Total Savings:</span>
                        <span className="font-bold text-green-600">$134.75</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Route Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Avg Optimization Score:</span>
                        <span className="font-medium">
                          {metrics.avgOptimizationScore.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>On-Time Performance:</span>
                        <span className="font-medium text-green-600">
                          {metrics.onTimePerformance}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Route Efficiency:</span>
                        <span className="font-medium text-blue-600">87.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost per Mile:</span>
                        <span className="font-medium">$1.89</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Environmental Impact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>CO2 Emissions Saved:</span>
                        <span className="font-medium text-green-600">2.1 tons</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fuel Consumption Reduced:</span>
                        <span className="font-medium text-green-600">149 gallons</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Miles Optimized:</span>
                        <span className="font-medium text-purple-600">
                          {metrics.totalMilesSaved}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Efficiency Score:</span>
                        <span className="font-medium text-blue-600">A+</span>
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
