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
  BuildingOfficeIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { Button, Badge } from '@/components/ui';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface MaintenanceStats {
  totalSchedules: number;
  overdueSchedules: number;
  upcomingSchedules: number;
  activeWorkOrders: number;
  completedThisMonth: number;
  totalCostThisMonth: number;
  partsLowStock: number;
  averageCompletionTime: number;
}

interface MaintenanceSchedule {
  id: number;
  vehicleId: string;
  vehicleName: string;
  maintenanceType: string;
  nextDueDate: string;
  nextDueMiles: number;
  currentMiles: number;
  priority: number;
  status: 'upcoming' | 'overdue' | 'completed';
  estimatedCost: number;
  vendor?: string;
}

interface WorkOrder {
  id: number;
  workOrderNumber: string;
  vehicleId: string;
  vehicleName: string;
  workType: 'preventive' | 'corrective' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string;
  scheduledDate: string;
  estimatedCost: number;
  actualCost?: number;
  createdAt: string;
}

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<MaintenanceStats>({
    totalSchedules: 0,
    overdueSchedules: 0,
    upcomingSchedules: 0,
    activeWorkOrders: 0,
    completedThisMonth: 0,
    totalCostThisMonth: 0,
    partsLowStock: 0,
    averageCompletionTime: 0,
  });

  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load maintenance data
    loadMaintenanceData();
  }, []);

  const loadMaintenanceData = async () => {
    try {
      setLoading(true);

      // For now, use mock data - will be replaced with API calls
      const mockStats: MaintenanceStats = {
        totalSchedules: 45,
        overdueSchedules: 8,
        upcomingSchedules: 12,
        activeWorkOrders: 15,
        completedThisMonth: 23,
        totalCostThisMonth: 18750.5,
        partsLowStock: 6,
        averageCompletionTime: 4.2,
      };

      const mockSchedules: MaintenanceSchedule[] = [
        {
          id: 1,
          vehicleId: 'VH001',
          vehicleName: 'Freightliner Cascadia #001',
          maintenanceType: 'Oil Change',
          nextDueDate: '2025-01-20',
          nextDueMiles: 125000,
          currentMiles: 124500,
          priority: 8,
          status: 'upcoming',
          estimatedCost: 250.0,
          vendor: 'Quick Lube Pro',
        },
        {
          id: 2,
          vehicleId: 'VH002',
          vehicleName: 'Peterbilt 579 #002',
          maintenanceType: 'Brake Inspection',
          nextDueDate: '2025-01-15',
          nextDueMiles: 130000,
          currentMiles: 131200,
          priority: 9,
          status: 'overdue',
          estimatedCost: 450.0,
          vendor: 'Brake Masters',
        },
        {
          id: 3,
          vehicleId: 'VH003',
          vehicleName: 'Kenworth T680 #003',
          maintenanceType: 'Annual DOT Inspection',
          nextDueDate: '2025-02-01',
          nextDueMiles: 140000,
          currentMiles: 135000,
          priority: 10,
          status: 'upcoming',
          estimatedCost: 350.0,
          vendor: 'DOT Inspection Center',
        },
      ];

      const mockWorkOrders: WorkOrder[] = [
        {
          id: 1,
          workOrderNumber: 'WO-2025-001',
          vehicleId: 'VH001',
          vehicleName: 'Freightliner Cascadia #001',
          workType: 'corrective',
          priority: 'high',
          description: 'Replace worn brake pads and rotors',
          status: 'in_progress',
          assignedTo: 'Mike Johnson',
          scheduledDate: '2025-01-18',
          estimatedCost: 850.0,
          createdAt: '2025-01-15',
        },
        {
          id: 2,
          workOrderNumber: 'WO-2025-002',
          vehicleId: 'VH002',
          vehicleName: 'Peterbilt 579 #002',
          workType: 'preventive',
          priority: 'medium',
          description: 'Scheduled oil change and filter replacement',
          status: 'open',
          assignedTo: 'Sarah Wilson',
          scheduledDate: '2025-01-20',
          estimatedCost: 275.0,
          createdAt: '2025-01-16',
        },
        {
          id: 3,
          workOrderNumber: 'WO-2025-003',
          vehicleId: 'VH003',
          vehicleName: 'Kenworth T680 #003',
          workType: 'emergency',
          priority: 'critical',
          description: 'Engine overheating - coolant system repair',
          status: 'in_progress',
          assignedTo: 'Tom Rodriguez',
          scheduledDate: '2025-01-17',
          estimatedCost: 1250.0,
          createdAt: '2025-01-17',
        },
      ];

      setStats(mockStats);
      setSchedules(mockSchedules);
      setWorkOrders(mockWorkOrders);
    } catch (error) {
      console.error('Error loading maintenance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 9) return 'bg-red-500';
    if (priority >= 7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'open':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getWorkTypeBadge = (workType: string) => {
    switch (workType) {
      case 'preventive':
        return <Badge className="bg-green-100 text-green-800">Preventive</Badge>;
      case 'corrective':
        return <Badge className="bg-yellow-100 text-yellow-800">Corrective</Badge>;
      case 'emergency':
        return <Badge className="bg-red-100 text-red-800">Emergency</Badge>;
      default:
        return <Badge>{workType}</Badge>;
    }
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Maintenance Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Comprehensive fleet maintenance tracking and scheduling
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/work-orders/new">
            <Button>
              <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
              New Work Order
            </Button>
          </Link>
          <Link href="/maintenance/schedule">
            <Button variant="outline">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Schedule Maintenance
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Overdue Maintenance
                </p>
                <h3 className="text-2xl font-bold mt-1 text-red-600">{stats.overdueSchedules}</h3>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Work Orders
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.activeWorkOrders}</h3>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full flex-shrink-0">
                <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Cost</p>
                <h3 className="text-2xl font-bold mt-1">
                  ${stats.totalCostThisMonth.toLocaleString()}
                </h3>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Avg. Completion
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.averageCompletionTime} days</h3>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="workorders">Work Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Maintenance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Upcoming Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedules.slice(0, 5).map(schedule => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <TruckIcon className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{schedule.vehicleName}</span>
                          <div
                            className={`w-2 h-2 rounded-full ${getPriorityColor(schedule.priority)}`}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{schedule.maintenanceType}</p>
                        <p className="text-xs text-gray-400">
                          Due: {new Date(schedule.nextDueDate).toLocaleDateString()} |
                          {schedule.nextDueMiles.toLocaleString()} miles
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(schedule.status)}>{schedule.status}</Badge>
                        <p className="text-sm font-medium mt-1">${schedule.estimatedCost}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link href="/maintenance/schedules">
                    <Button variant="outline" className="w-full">
                      View All Schedules
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Active Work Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
                  Active Work Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workOrders.slice(0, 5).map(workOrder => (
                    <div
                      key={workOrder.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{workOrder.workOrderNumber}</span>
                          {getWorkTypeBadge(workOrder.workType)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{workOrder.vehicleName}</p>
                        <p className="text-xs text-gray-400">{workOrder.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Assigned to: {workOrder.assignedTo}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(workOrder.status)}>
                          {workOrder.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-sm font-medium mt-1">${workOrder.estimatedCost}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link href="/work-orders">
                    <Button variant="outline" className="w-full">
                      View All Work Orders
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/maintenance/emergency">
                  <Button variant="outline" className="w-full h-20 flex flex-col">
                    <ExclamationTriangleIcon className="h-6 w-6 mb-2 text-red-500" />
                    Emergency Repair
                  </Button>
                </Link>
                <Link href="/parts">
                  <Button variant="outline" className="w-full h-20 flex flex-col">
                    <Cog6ToothIcon className="h-6 w-6 mb-2" />
                    Parts Inventory
                  </Button>
                </Link>
                <Link href="/vendors">
                  <Button variant="outline" className="w-full h-20 flex flex-col">
                    <BuildingOfficeIcon className="h-6 w-6 mb-2" />
                    Vendor Management
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedules.map(schedule => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <TruckIcon className="h-5 w-5 text-gray-500" />
                        <div>
                          <h4 className="font-medium">{schedule.vehicleName}</h4>
                          <p className="text-sm text-gray-500">{schedule.maintenanceType}</p>
                        </div>
                        <div
                          className={`w-3 h-3 rounded-full ${getPriorityColor(schedule.priority)}`}
                        ></div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Due Date:</span>
                          <p className="font-medium">
                            {new Date(schedule.nextDueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Due Miles:</span>
                          <p className="font-medium">{schedule.nextDueMiles.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Current Miles:</span>
                          <p className="font-medium">{schedule.currentMiles.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Vendor:</span>
                          <p className="font-medium">{schedule.vendor || 'Not assigned'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(schedule.status)}>{schedule.status}</Badge>
                      <p className="text-lg font-bold mt-2">${schedule.estimatedCost}</p>
                      <Button size="sm" className="mt-2">
                        Create Work Order
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workorders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Work Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workOrders.map(workOrder => (
                  <div
                    key={workOrder.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <WrenchScrewdriverIcon className="h-5 w-5 text-gray-500" />
                        <div>
                          <h4 className="font-medium">{workOrder.workOrderNumber}</h4>
                          <p className="text-sm text-gray-500">{workOrder.vehicleName}</p>
                        </div>
                        {getWorkTypeBadge(workOrder.workType)}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{workOrder.description}</p>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Assigned To:</span>
                          <p className="font-medium">{workOrder.assignedTo}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Scheduled:</span>
                          <p className="font-medium">
                            {new Date(workOrder.scheduledDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Priority:</span>
                          <p className="font-medium capitalize">{workOrder.priority}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <p className="font-medium">
                            {new Date(workOrder.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(workOrder.status)}>
                        {workOrder.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-lg font-bold mt-2">${workOrder.estimatedCost}</p>
                      <Button size="sm" className="mt-2">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Maintenance Costs Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart placeholder - Maintenance costs over time
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fleet Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart placeholder - Fleet health metrics
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-green-600">92%</h3>
                  <p className="text-sm text-gray-500">On-Time Completion</p>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-blue-600">4.2 days</h3>
                  <p className="text-sm text-gray-500">Avg. Completion Time</p>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-purple-600">$1,250</h3>
                  <p className="text-sm text-gray-500">Avg. Cost per Vehicle</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
