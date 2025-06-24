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

import React, { useState } from 'react';
import {
  TruckIcon,
  UserIcon,
  MapPinIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const OperationsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('fleet');

  // Mock data
  const fleetData = [
    {
      id: 'TRK-001',
      driver: 'John Smith',
      status: 'active',
      location: 'I-95 North, Mile 245',
      destination: 'Boston, MA',
      eta: '2:30 PM',
      fuelLevel: 78,
      mileage: 245680,
      lastMaintenance: '2025-01-15',
    },
    {
      id: 'TRK-002',
      driver: 'Sarah Johnson',
      status: 'idle',
      location: 'Terminal A',
      destination: 'Loading',
      eta: 'N/A',
      fuelLevel: 92,
      mileage: 198450,
      lastMaintenance: '2025-01-10',
    },
    {
      id: 'TRK-003',
      driver: 'Mike Wilson',
      status: 'maintenance',
      location: 'Service Center',
      destination: 'Maintenance',
      eta: 'N/A',
      fuelLevel: 45,
      mileage: 312890,
      lastMaintenance: '2025-01-20',
    },
  ];

  const driverPerformance = [
    {
      name: 'John Smith',
      safetyScore: 92,
      efficiency: 88,
      miles: 12500,
      deliveries: 45,
      rating: 4.8,
      status: 'active',
    },
    {
      name: 'Sarah Johnson',
      safetyScore: 78,
      efficiency: 85,
      miles: 11200,
      deliveries: 42,
      rating: 4.6,
      status: 'active',
    },
    {
      name: 'Mike Wilson',
      safetyScore: 65,
      efficiency: 72,
      miles: 10800,
      deliveries: 38,
      rating: 4.2,
      status: 'training',
    },
    {
      name: 'Lisa Davis',
      safetyScore: 95,
      efficiency: 91,
      miles: 13200,
      deliveries: 48,
      rating: 4.9,
      status: 'active',
    },
  ];

  const routeEfficiency = [
    { route: 'Route A', distance: 245, time: 4.2, fuel: 28.5, deliveries: 12 },
    { route: 'Route B', distance: 180, time: 3.1, fuel: 21.2, deliveries: 8 },
    { route: 'Route C', distance: 320, time: 5.8, fuel: 38.1, deliveries: 15 },
    { route: 'Route D', distance: 150, time: 2.5, fuel: 17.8, deliveries: 6 },
  ];

  const maintenanceAlerts = [
    {
      vehicle: 'TRK-001',
      type: 'Oil Change',
      priority: 'medium',
      dueDate: '2025-01-25',
      mileage: 245680,
    },
    {
      vehicle: 'TRK-005',
      type: 'Brake Inspection',
      priority: 'high',
      dueDate: '2025-01-22',
      mileage: 298450,
    },
    {
      vehicle: 'TRK-003',
      type: 'Tire Rotation',
      priority: 'low',
      dueDate: '2025-01-30',
      mileage: 312890,
    },
  ];

  const fuelConsumption = [
    { month: 'Aug', consumption: 12500, cost: 45000 },
    { month: 'Sep', consumption: 13200, cost: 47500 },
    { month: 'Oct', consumption: 11800, cost: 42800 },
    { month: 'Nov', consumption: 12900, cost: 46200 },
    { month: 'Dec', consumption: 13500, cost: 48600 },
    { month: 'Jan', consumption: 12200, cost: 44100 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'idle':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      case 'training':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Vehicles
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">124</p>
                <p className="text-sm text-green-600">87.3% utilization</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TruckIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  On-Duty Drivers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">118</p>
                <p className="text-sm text-green-600">+5 from yesterday</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <UserIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Routes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">89</p>
                <p className="text-sm text-blue-600">12 pending dispatch</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <MapPinIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Maintenance Alerts
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">7</p>
                <p className="text-sm text-red-600">2 high priority</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <WrenchScrewdriverIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fleet">Fleet Status</TabsTrigger>
          <TabsTrigger value="drivers">Driver Performance</TabsTrigger>
          <TabsTrigger value="routes">Route Analytics</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="fleet" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fleet Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle ID</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Fuel</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fleetData.map(vehicle => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.id}</TableCell>
                      <TableCell>{vehicle.driver}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(vehicle.status)}>{vehicle.status}</Badge>
                      </TableCell>
                      <TableCell>{vehicle.location}</TableCell>
                      <TableCell>{vehicle.destination}</TableCell>
                      <TableCell>{vehicle.eta}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                vehicle.fuelLevel > 50
                                  ? 'bg-green-500 w-3/4'
                                  : vehicle.fuelLevel > 25
                                    ? 'bg-yellow-500 w-1/2'
                                    : 'bg-red-500 w-1/4'
                              }`}
                            />
                          </div>
                          <span className="text-sm">{vehicle.fuelLevel}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Driver Performance Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Safety Score</TableHead>
                    <TableHead>Efficiency</TableHead>
                    <TableHead>Miles (30d)</TableHead>
                    <TableHead>Deliveries</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driverPerformance.map((driver, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{driver.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                driver.safetyScore >= 90
                                  ? 'bg-green-500 w-full'
                                  : driver.safetyScore >= 75
                                    ? 'bg-yellow-500 w-3/4'
                                    : 'bg-red-500 w-1/2'
                              }`}
                            />
                          </div>
                          <span className="text-sm">{driver.safetyScore}</span>
                        </div>
                      </TableCell>
                      <TableCell>{driver.efficiency}%</TableCell>
                      <TableCell>{driver.miles.toLocaleString()}</TableCell>
                      <TableCell>{driver.deliveries}</TableCell>
                      <TableCell>{driver.rating}/5.0</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(driver.status)}>{driver.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Route Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Avg Time</TableHead>
                      <TableHead>Fuel Usage</TableHead>
                      <TableHead>Deliveries</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routeEfficiency.map((route, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{route.route}</TableCell>
                        <TableCell>{route.distance} mi</TableCell>
                        <TableCell>{route.time} hrs</TableCell>
                        <TableCell>{route.fuel} gal</TableCell>
                        <TableCell>{route.deliveries}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fuel Consumption Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={fuelConsumption}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="consumption"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        name="Gallons"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <WrenchScrewdriverIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{alert.vehicle}</div>
                        <div className="text-sm text-gray-600">{alert.type}</div>
                        <div className="text-xs text-gray-500">
                          Due: {alert.dueDate} • {alert.mileage.toLocaleString()} miles
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(alert.priority)}>{alert.priority}</Badge>
                      <Button size="sm">Schedule</Button>
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
};

export default OperationsDashboard;
