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
  BoltIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, Button, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Load {
  id: number;
  loadNumber: string;
  customer: string;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: string;
  deliveryDate: string;
  weight: number;
  rate: number;
  status: 'available' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  equipmentType: string;
  distance: number;
  assignedDriver?: string;
  assignedVehicle?: string;
  estimatedRevenue: number;
  stops: LoadStop[];
  specialInstructions?: string;
}

interface LoadStop {
  id: number;
  type: 'pickup' | 'delivery' | 'stop';
  location: string;
  scheduledTime: string;
  actualTime?: string;
  status: 'pending' | 'arrived' | 'completed' | 'delayed';
  contactName?: string;
  contactPhone?: string;
  notes?: string;
}

interface DispatchMetrics {
  totalLoads: number;
  availableLoads: number;
  assignedLoads: number;
  inTransitLoads: number;
  deliveredLoads: number;
  availableDrivers: number;
  utilizationRate: number;
  avgRevenuePerMile: number;
  onTimeDeliveryRate: number;
  totalRevenue: number;
}

interface Driver {
  id: number;
  name: string;
  status: 'available' | 'assigned' | 'driving' | 'off_duty';
  currentLocation?: string;
  hoursRemaining: number;
  vehicleId?: number;
  vehicleName?: string;
  currentLoad?: string;
}

export default function DispatchPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loads, setLoads] = useState<Load[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [metrics, setMetrics] = useState<DispatchMetrics>({
    totalLoads: 0,
    availableLoads: 0,
    assignedLoads: 0,
    inTransitLoads: 0,
    deliveredLoads: 0,
    availableDrivers: 0,
    utilizationRate: 0,
    avgRevenuePerMile: 0,
    onTimeDeliveryRate: 0,
    totalRevenue: 0,
  });
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    loadDispatchData();
  }, []);

  const loadDispatchData = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockLoads: Load[] = [
        {
          id: 1,
          loadNumber: 'LOAD-2025-001',
          customer: 'ABC Manufacturing',
          pickupLocation: 'Chicago, IL',
          deliveryLocation: 'Detroit, MI',
          pickupDate: '2025-01-20T08:00:00Z',
          deliveryDate: '2025-01-20T16:00:00Z',
          weight: 45000,
          rate: 2850,
          status: 'available',
          priority: 'high',
          equipmentType: 'Dry Van',
          distance: 280,
          estimatedRevenue: 2850,
          stops: [
            {
              id: 1,
              type: 'pickup',
              location: 'ABC Manufacturing, 123 Industrial Blvd, Chicago, IL',
              scheduledTime: '2025-01-20T08:00:00Z',
              status: 'pending',
              contactName: 'John Smith',
              contactPhone: '(555) 123-4567',
            },
            {
              id: 2,
              type: 'delivery',
              location: 'XYZ Distribution, 456 Warehouse Dr, Detroit, MI',
              scheduledTime: '2025-01-20T16:00:00Z',
              status: 'pending',
              contactName: 'Sarah Johnson',
              contactPhone: '(555) 987-6543',
            },
          ],
          specialInstructions: 'Temperature sensitive cargo - maintain 65-70°F',
        },
        {
          id: 2,
          loadNumber: 'LOAD-2025-002',
          customer: 'Global Logistics Inc',
          pickupLocation: 'Atlanta, GA',
          deliveryLocation: 'Miami, FL',
          pickupDate: '2025-01-21T06:00:00Z',
          deliveryDate: '2025-01-22T14:00:00Z',
          weight: 38000,
          rate: 3200,
          status: 'assigned',
          priority: 'medium',
          equipmentType: 'Refrigerated',
          distance: 650,
          assignedDriver: 'Mike Johnson',
          assignedVehicle: 'Truck #003',
          estimatedRevenue: 3200,
          stops: [
            {
              id: 3,
              type: 'pickup',
              location: 'Global Logistics Warehouse, 789 Shipping Way, Atlanta, GA',
              scheduledTime: '2025-01-21T06:00:00Z',
              status: 'pending',
              contactName: 'Robert Davis',
              contactPhone: '(555) 456-7890',
            },
            {
              id: 4,
              type: 'stop',
              location: 'Mid-Point Distribution, 321 Transit St, Gainesville, FL',
              scheduledTime: '2025-01-21T18:00:00Z',
              status: 'pending',
              contactName: 'Lisa Wilson',
              contactPhone: '(555) 234-5678',
            },
            {
              id: 5,
              type: 'delivery',
              location: 'Miami Fresh Market, 654 Ocean Ave, Miami, FL',
              scheduledTime: '2025-01-22T14:00:00Z',
              status: 'pending',
              contactName: 'Carlos Rodriguez',
              contactPhone: '(555) 345-6789',
            },
          ],
          specialInstructions: 'Frozen goods - maintain -10°F throughout transport',
        },
        {
          id: 3,
          loadNumber: 'LOAD-2025-003',
          customer: 'Tech Solutions Corp',
          pickupLocation: 'San Francisco, CA',
          deliveryLocation: 'Seattle, WA',
          pickupDate: '2025-01-19T10:00:00Z',
          deliveryDate: '2025-01-20T08:00:00Z',
          weight: 25000,
          rate: 4100,
          status: 'in_transit',
          priority: 'urgent',
          equipmentType: 'Flatbed',
          distance: 800,
          assignedDriver: 'Sarah Wilson',
          assignedVehicle: 'Truck #001',
          estimatedRevenue: 4100,
          stops: [
            {
              id: 6,
              type: 'pickup',
              location: 'Tech Solutions Facility, 987 Innovation Dr, San Francisco, CA',
              scheduledTime: '2025-01-19T10:00:00Z',
              actualTime: '2025-01-19T09:45:00Z',
              status: 'completed',
              contactName: 'Jennifer Lee',
              contactPhone: '(555) 567-8901',
            },
            {
              id: 7,
              type: 'delivery',
              location: 'Seattle Tech Hub, 147 Digital Blvd, Seattle, WA',
              scheduledTime: '2025-01-20T08:00:00Z',
              status: 'pending',
              contactName: 'David Kim',
              contactPhone: '(555) 678-9012',
            },
          ],
          specialInstructions: 'High-value electronics - secure transport required',
        },
      ];

      const mockDrivers: Driver[] = [
        {
          id: 1,
          name: 'John Smith',
          status: 'available',
          currentLocation: 'Chicago, IL',
          hoursRemaining: 8.5,
          vehicleId: 2,
          vehicleName: 'Truck #002',
        },
        {
          id: 2,
          name: 'Mike Johnson',
          status: 'assigned',
          currentLocation: 'Atlanta, GA',
          hoursRemaining: 6.2,
          vehicleId: 3,
          vehicleName: 'Truck #003',
          currentLoad: 'LOAD-2025-002',
        },
        {
          id: 3,
          name: 'Sarah Wilson',
          status: 'driving',
          currentLocation: 'Portland, OR',
          hoursRemaining: 4.8,
          vehicleId: 1,
          vehicleName: 'Truck #001',
          currentLoad: 'LOAD-2025-003',
        },
        {
          id: 4,
          name: 'Tom Rodriguez',
          status: 'off_duty',
          currentLocation: 'Phoenix, AZ',
          hoursRemaining: 0,
          vehicleId: 4,
          vehicleName: 'Truck #004',
        },
      ];

      const mockMetrics: DispatchMetrics = {
        totalLoads: mockLoads.length,
        availableLoads: mockLoads.filter(l => l.status === 'available').length,
        assignedLoads: mockLoads.filter(l => l.status === 'assigned').length,
        inTransitLoads: mockLoads.filter(l => l.status === 'in_transit').length,
        deliveredLoads: mockLoads.filter(l => l.status === 'delivered').length,
        availableDrivers: mockDrivers.filter(d => d.status === 'available').length,
        utilizationRate: 75.5,
        avgRevenuePerMile: 4.85,
        onTimeDeliveryRate: 94.2,
        totalRevenue: mockLoads.reduce((sum, load) => sum + load.estimatedRevenue, 0),
      };

      setLoads(mockLoads);
      setDrivers(mockDrivers);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading dispatch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'in_transit':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'delivered':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getDriverStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'driving':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'off_duty':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const filteredLoads = loads.filter(load => {
    if (statusFilter !== 'all' && load.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && load.priority !== priorityFilter) return false;
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dispatch Center</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage loads, drivers, and optimize routes for maximum efficiency
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/loads/create">
            <Button variant="outline">
              <TruckIcon className="h-5 w-5 mr-2" />
              New Load
            </Button>
          </Link>
          <Link href="/dispatch/auto-assign">
            <Button>
              <BoltIcon className="h-5 w-5 mr-2" />
              Auto Assign
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
                  Available Loads
                </p>
                <h3 className="text-2xl font-bold mt-1 text-blue-600">{metrics.availableLoads}</h3>
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Available Drivers
                </p>
                <h3 className="text-2xl font-bold mt-1 text-green-600">
                  {metrics.availableDrivers}
                </h3>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Fleet Utilization
                </p>
                <h3 className="text-2xl font-bold mt-1">{metrics.utilizationRate}%</h3>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue/Mile</p>
                <h3 className="text-2xl font-bold mt-1">${metrics.avgRevenuePerMile.toFixed(2)}</h3>
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
          <TabsTrigger value="loads">Load Management</TabsTrigger>
          <TabsTrigger value="drivers">Driver Assignment</TabsTrigger>
          <TabsTrigger value="optimization">Route Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Load Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Available</span>
                    <span className="font-medium text-blue-600">{metrics.availableLoads}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Assigned</span>
                    <span className="font-medium text-yellow-600">{metrics.assignedLoads}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">In Transit</span>
                    <span className="font-medium text-green-600">{metrics.inTransitLoads}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Delivered</span>
                    <span className="font-medium text-gray-600">{metrics.deliveredLoads}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Driver Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['available', 'assigned', 'driving', 'off_duty'].map(status => {
                    const count = drivers.filter(d => d.status === status).length;
                    return (
                      <div key={status} className="flex justify-between items-center">
                        <span className="text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    );
                  })}
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
                    <span className="text-gray-600">On-Time Delivery</span>
                    <span className="font-medium text-green-600">
                      {metrics.onTimeDeliveryRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Revenue</span>
                    <span className="font-medium">${metrics.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Revenue/Mile</span>
                    <span className="font-medium">${metrics.avgRevenuePerMile.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Fleet Utilization</span>
                    <span className="font-medium">{metrics.utilizationRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Urgent Loads Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
                Urgent Loads Requiring Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loads
                  .filter(l => l.priority === 'urgent' && l.status === 'available')
                  .slice(0, 3)
                  .map(load => (
                    <div
                      key={load.id}
                      className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{load.loadNumber}</span>
                          <Badge className={getPriorityColor(load.priority)}>{load.priority}</Badge>
                          <Badge className={getStatusColor(load.status)}>{load.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{load.customer}</p>
                        <p className="text-sm text-gray-500">
                          {load.pickupLocation} → {load.deliveryLocation}
                        </p>
                        <p className="text-xs text-gray-400">
                          Pickup: {new Date(load.pickupDate).toLocaleDateString()} at{' '}
                          {new Date(load.pickupDate).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ${load.rate.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">{load.distance} miles</div>
                        <Button size="sm" className="mt-2">
                          Assign Now
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loads" className="space-y-6">
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
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter('all');
                    setPriorityFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
                <Link href="/loads/create">
                  <Button className="w-full">Add New Load</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Loads Table */}
          <Card>
            <CardHeader>
              <CardTitle>Load Management ({filteredLoads.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Load #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Pickup Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLoads.map(load => (
                      <TableRow
                        key={load.id}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setSelectedLoad(load)}
                      >
                        <TableCell>
                          <div className="font-medium">{load.loadNumber}</div>
                          <div className="text-sm text-gray-500">{load.equipmentType}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{load.customer}</div>
                          <div className="text-sm text-gray-500">
                            {load.weight.toLocaleString()} lbs
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{load.pickupLocation}</div>
                            <div className="text-gray-500">→ {load.deliveryLocation}</div>
                            <div className="text-gray-400">{load.distance} miles</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(load.pickupDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(load.pickupDate).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(load.priority)}>{load.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(load.status)}>
                            {load.status.replace('_', ' ')}
                          </Badge>
                          {load.assignedDriver && (
                            <div className="text-xs text-gray-500 mt-1">{load.assignedDriver}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">${load.rate.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">
                            ${(load.rate / load.distance).toFixed(2)}/mi
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/loads/${load.id}`}>
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </Link>
                            {load.status === 'available' && <Button size="sm">Assign</Button>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Driver Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {drivers.map(driver => (
                  <div
                    key={driver.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{driver.name}</span>
                        <Badge className={getDriverStatusColor(driver.status)}>
                          {driver.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {driver.vehicleName} • {driver.currentLocation}
                      </div>
                      <div className="text-xs text-gray-400">
                        Hours remaining: {driver.hoursRemaining}
                        {driver.currentLoad && (
                          <span className="ml-2">Current load: {driver.currentLoad}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {driver.status === 'available' ? (
                        <Button size="sm">Assign Load</Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Route Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Optimization Options</CardTitle>
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
                          <span>Fuel Efficient Routes</span>
                          <input type="checkbox" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Consider Traffic</span>
                          <input type="checkbox" defaultChecked />
                        </div>
                        <Button className="w-full">Optimize Routes</Button>
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
                          <span>Total Distance Saved:</span>
                          <span className="font-medium text-green-600">127 miles</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fuel Cost Savings:</span>
                          <span className="font-medium text-green-600">$89.50</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time Saved:</span>
                          <span className="font-medium text-green-600">2.3 hours</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Routes Optimized:</span>
                          <span className="font-medium">8 routes</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Optimized Routes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loads
                        .filter(l => l.status === 'assigned')
                        .map(load => (
                          <div
                            key={load.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="font-medium">{load.loadNumber}</div>
                              <div className="text-sm text-gray-500">
                                {load.pickupLocation} → {load.deliveryLocation}
                              </div>
                              <div className="text-xs text-gray-400">
                                Driver: {load.assignedDriver} • {load.distance} miles
                              </div>
                            </div>
                            <div className="text-right">
                              <Button size="sm" variant="outline">
                                View Route
                              </Button>
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
      </Tabs>
    </div>
  );
}
