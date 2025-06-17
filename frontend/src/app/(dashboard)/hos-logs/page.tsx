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
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TruckIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  BellIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  EyeIcon,
  PlusIcon,
  PrinterIcon,
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

interface HOSLog {
  id: number;
  driverId: number;
  driverName: string;
  vehicleId?: number;
  vehicleNumber?: string;
  logDate: string;
  dutyStatus: 'off_duty' | 'sleeper_berth' | 'driving' | 'on_duty_not_driving';
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  location?: string;
  odometer?: number;
  engineHours?: number;
  notes?: string;
  violations: HOSViolation[];
  certificationStatus: 'pending' | 'certified' | 'rejected';
  certifiedAt?: string;
  eldDevice?: string;
  isManualEntry: boolean;
  editReason?: string;
}

interface HOSViolation {
  id: number;
  type: 'driving_time' | 'on_duty_time' | 'rest_break' | 'weekly_limit' | 'daily_limit';
  severity: 'warning' | 'violation';
  description: string;
  timestamp: string;
  resolved: boolean;
}

interface HOSStatus {
  driverId: number;
  driverName: string;
  currentStatus: 'off_duty' | 'sleeper_berth' | 'driving' | 'on_duty_not_driving';
  availableDriveTime: number; // minutes
  availableOnDutyTime: number; // minutes
  availableWorkShift: number; // minutes
  availableCycle: number; // minutes
  nextRequiredBreak?: string;
  nextRequiredRest?: string;
  violations: HOSViolation[];
  lastActivity: string;
  eldConnected: boolean;
  vehicleId?: number;
  vehicleNumber?: string;
}

interface HOSMetrics {
  totalDrivers: number;
  activeDrivers: number;
  driversInViolation: number;
  pendingCertifications: number;
  totalViolations: number;
  avgDriveTime: number;
  avgOnDutyTime: number;
  complianceRate: number;
}

export default function HOSLogsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hosLogs, setHosLogs] = useState<HOSLog[]>([]);
  const [hosStatuses, setHosStatuses] = useState<HOSStatus[]>([]);
  const [metrics, setMetrics] = useState<HOSMetrics>({
    totalDrivers: 0,
    activeDrivers: 0,
    driversInViolation: 0,
    pendingCertifications: 0,
    totalViolations: 0,
    avgDriveTime: 0,
    avgOnDutyTime: 0,
    complianceRate: 0,
  });
  const [selectedDriver, setSelectedDriver] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadHOSData();
  }, [selectedDriver, selectedDate]);

  const loadHOSData = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockHOSLogs: HOSLog[] = [
        {
          id: 1,
          driverId: 1,
          driverName: 'John Smith',
          vehicleId: 1,
          vehicleNumber: 'TRK-001',
          logDate: '2025-01-20',
          dutyStatus: 'driving',
          startTime: '2025-01-20T06:00:00Z',
          endTime: '2025-01-20T14:00:00Z',
          duration: 480, // 8 hours
          location: 'Chicago, IL to Detroit, MI',
          odometer: 125000,
          engineHours: 8500,
          notes: 'Regular delivery route',
          violations: [],
          certificationStatus: 'certified',
          certifiedAt: '2025-01-20T14:30:00Z',
          eldDevice: 'Geotab GO9',
          isManualEntry: false,
        },
        {
          id: 2,
          driverId: 2,
          driverName: 'Sarah Johnson',
          vehicleId: 2,
          vehicleNumber: 'TRK-002',
          logDate: '2025-01-20',
          dutyStatus: 'on_duty_not_driving',
          startTime: '2025-01-20T05:30:00Z',
          endTime: '2025-01-20T06:30:00Z',
          duration: 60, // 1 hour
          location: 'Terminal - Pre-trip inspection',
          odometer: 98500,
          engineHours: 7200,
          notes: 'Pre-trip inspection and vehicle check',
          violations: [],
          certificationStatus: 'certified',
          certifiedAt: '2025-01-20T06:45:00Z',
          eldDevice: 'Omnitracs IVG',
          isManualEntry: false,
        },
        {
          id: 3,
          driverId: 3,
          driverName: 'Mike Wilson',
          vehicleId: 3,
          vehicleNumber: 'TRK-003',
          logDate: '2025-01-20',
          dutyStatus: 'driving',
          startTime: '2025-01-20T07:00:00Z',
          endTime: '2025-01-20T18:00:00Z',
          duration: 660, // 11 hours
          location: 'Long haul route',
          odometer: 156000,
          engineHours: 9800,
          notes: 'Extended driving period',
          violations: [
            {
              id: 1,
              type: 'driving_time',
              severity: 'violation',
              description: 'Exceeded 11-hour driving limit',
              timestamp: '2025-01-20T18:00:00Z',
              resolved: false,
            },
          ],
          certificationStatus: 'pending',
          eldDevice: 'PeopleNet',
          isManualEntry: false,
        },
        {
          id: 4,
          driverId: 1,
          driverName: 'John Smith',
          logDate: '2025-01-20',
          dutyStatus: 'off_duty',
          startTime: '2025-01-20T14:00:00Z',
          duration: 600, // 10 hours
          location: 'Rest area - I-94',
          violations: [],
          certificationStatus: 'certified',
          certifiedAt: '2025-01-20T14:15:00Z',
          eldDevice: 'Geotab GO9',
          isManualEntry: false,
        },
      ];

      const mockHOSStatuses: HOSStatus[] = [
        {
          driverId: 1,
          driverName: 'John Smith',
          currentStatus: 'off_duty',
          availableDriveTime: 660, // 11 hours
          availableOnDutyTime: 840, // 14 hours
          availableWorkShift: 420, // 7 hours
          availableCycle: 4200, // 70 hours
          nextRequiredBreak: '2025-01-21T06:00:00Z',
          nextRequiredRest: '2025-01-21T00:00:00Z',
          violations: [],
          lastActivity: '2025-01-20T14:00:00Z',
          eldConnected: true,
          vehicleId: 1,
          vehicleNumber: 'TRK-001',
        },
        {
          driverId: 2,
          driverName: 'Sarah Johnson',
          currentStatus: 'driving',
          availableDriveTime: 540, // 9 hours
          availableOnDutyTime: 720, // 12 hours
          availableWorkShift: 480, // 8 hours
          availableCycle: 3900, // 65 hours
          violations: [],
          lastActivity: '2025-01-20T10:30:00Z',
          eldConnected: true,
          vehicleId: 2,
          vehicleNumber: 'TRK-002',
        },
        {
          driverId: 3,
          driverName: 'Mike Wilson',
          currentStatus: 'on_duty_not_driving',
          availableDriveTime: 0, // Exceeded limit
          availableOnDutyTime: 0, // Exceeded limit
          availableWorkShift: 0,
          availableCycle: 3600, // 60 hours
          violations: [
            {
              id: 1,
              type: 'driving_time',
              severity: 'violation',
              description: 'Exceeded 11-hour driving limit',
              timestamp: '2025-01-20T18:00:00Z',
              resolved: false,
            },
          ],
          lastActivity: '2025-01-20T18:00:00Z',
          eldConnected: true,
          vehicleId: 3,
          vehicleNumber: 'TRK-003',
        },
      ];

      const mockMetrics: HOSMetrics = {
        totalDrivers: mockHOSStatuses.length,
        activeDrivers: mockHOSStatuses.filter(
          s => s.currentStatus === 'driving' || s.currentStatus === 'on_duty_not_driving'
        ).length,
        driversInViolation: mockHOSStatuses.filter(s => s.violations.length > 0).length,
        pendingCertifications: mockHOSLogs.filter(l => l.certificationStatus === 'pending').length,
        totalViolations: mockHOSLogs.reduce((sum, l) => sum + l.violations.length, 0),
        avgDriveTime: 480, // 8 hours average
        avgOnDutyTime: 600, // 10 hours average
        complianceRate: 85.7, // percentage
      };

      setHosLogs(mockHOSLogs);
      setHosStatuses(mockHOSStatuses);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading HOS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDutyStatusColor = (status: string) => {
    switch (status) {
      case 'driving':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'on_duty_not_driving':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'off_duty':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'sleeper_berth':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getDutyStatusIcon = (status: string) => {
    switch (status) {
      case 'driving':
        return <TruckIcon className="h-4 w-4" />;
      case 'on_duty_not_driving':
        return <ClockIcon className="h-4 w-4" />;
      case 'off_duty':
        return <PauseIcon className="h-4 w-4" />;
      case 'sleeper_berth':
        return <StopIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getViolationColor = (severity: string) => {
    return severity === 'violation'
      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  };

  const filteredLogs = hosLogs.filter(log => {
    if (selectedDriver !== 'all' && log.driverId.toString() !== selectedDriver) return false;
    if (statusFilter !== 'all' && log.dutyStatus !== statusFilter) return false;
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Hours of Service (HOS) Logs
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            DOT-compliant electronic logging and driver hours tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <PrinterIcon className="h-5 w-5 mr-2" />
            Export Logs
          </Button>
          <Link href="/hos-logs/create">
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              Manual Entry
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
                  Active Drivers
                </p>
                <h3 className="text-2xl font-bold mt-1 text-blue-600">{metrics.activeDrivers}</h3>
                <p className="text-xs text-gray-500">of {metrics.totalDrivers} total</p>
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Violations</p>
                <h3 className="text-2xl font-bold mt-1 text-red-600">
                  {metrics.driversInViolation}
                </h3>
                <p className="text-xs text-gray-500">drivers in violation</p>
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
                  Compliance Rate
                </p>
                <h3 className="text-2xl font-bold mt-1 text-green-600">
                  {metrics.complianceRate}%
                </h3>
                <p className="text-xs text-gray-500">DOT compliance</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full flex-shrink-0">
                <ShieldCheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pending Certifications
                </p>
                <h3 className="text-2xl font-bold mt-1 text-yellow-600">
                  {metrics.pendingCertifications}
                </h3>
                <p className="text-xs text-gray-500">require review</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Live Status</TabsTrigger>
          <TabsTrigger value="logs">HOS Logs</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Driver Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                Current Driver Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hosStatuses.map(status => (
                  <div
                    key={status.driverId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <UserIcon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{status.driverName}</div>
                        <div className="text-sm text-gray-500">
                          {status.vehicleNumber
                            ? `Vehicle: ${status.vehicleNumber}`
                            : 'No vehicle assigned'}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {getDutyStatusIcon(status.currentStatus)}
                          <Badge className={getDutyStatusColor(status.currentStatus)}>
                            {status.currentStatus.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {status.eldConnected ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              ELD Connected
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              ELD Disconnected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Drive Time</div>
                          <div
                            className={`font-medium ${status.availableDriveTime <= 60 ? 'text-red-600' : 'text-green-600'}`}
                          >
                            {formatDuration(status.availableDriveTime)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">On Duty</div>
                          <div
                            className={`font-medium ${status.availableOnDutyTime <= 60 ? 'text-red-600' : 'text-green-600'}`}
                          >
                            {formatDuration(status.availableOnDutyTime)}
                          </div>
                        </div>
                      </div>
                      {status.violations.length > 0 && (
                        <Badge className="bg-red-100 text-red-800 text-xs mt-2">
                          {status.violations.length} violations
                        </Badge>
                      )}
                      <div className="mt-2">
                        <Button size="sm" variant="outline">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Critical Violations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
                Critical Violations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hosStatuses
                  .filter(s => s.violations.length > 0)
                  .map(status =>
                    status.violations.map(violation => (
                      <div
                        key={`${status.driverId}-${violation.id}`}
                        className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{status.driverName}</span>
                            <Badge className={getViolationColor(violation.severity)}>
                              {violation.severity}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {violation.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{violation.description}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(violation.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Button size="sm" className="mr-2">
                            Resolve
                          </Button>
                          <Button size="sm" variant="outline">
                            Details
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                {hosStatuses.every(s => s.violations.length === 0) && (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Active Violations
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      All drivers are currently in compliance with HOS regulations.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Drivers</SelectItem>
                    <SelectItem value="1">John Smith</SelectItem>
                    <SelectItem value="2">Sarah Johnson</SelectItem>
                    <SelectItem value="3">Mike Wilson</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Duty Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="driving">Driving</SelectItem>
                    <SelectItem value="on_duty_not_driving">On Duty (Not Driving)</SelectItem>
                    <SelectItem value="off_duty">Off Duty</SelectItem>
                    <SelectItem value="sleeper_berth">Sleeper Berth</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDriver('all');
                    setStatusFilter('all');
                    setSelectedDate(new Date().toISOString().split('T')[0]);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* HOS Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>HOS Logs ({filteredLogs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Duty Status</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Certification</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            <span className="font-medium">{log.driverName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {new Date(log.logDate).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(log.startTime).toLocaleTimeString()} -
                              {log.endTime ? new Date(log.endTime).toLocaleTimeString() : 'Ongoing'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDutyStatusIcon(log.dutyStatus)}
                            <Badge className={getDutyStatusColor(log.dutyStatus)}>
                              {log.dutyStatus.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{formatDuration(log.duration)}</span>
                        </TableCell>
                        <TableCell>
                          {log.vehicleNumber ? (
                            <div>
                              <div className="font-medium">{log.vehicleNumber}</div>
                              {log.odometer && (
                                <div className="text-sm text-gray-500">
                                  {log.odometer.toLocaleString()} mi
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">No vehicle</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{log.location || 'Not specified'}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              log.certificationStatus === 'certified'
                                ? 'bg-green-100 text-green-800'
                                : log.certificationStatus === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }
                          >
                            {log.certificationStatus}
                          </Badge>
                          {log.violations.length > 0 && (
                            <Badge className="bg-red-100 text-red-800 text-xs mt-1">
                              {log.violations.length} violations
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            {log.certificationStatus === 'pending' && (
                              <Button size="sm">Certify</Button>
                            )}
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

        <TabsContent value="violations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>HOS Violations Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hosLogs
                  .filter(log => log.violations.length > 0)
                  .map(log =>
                    log.violations.map(violation => (
                      <div
                        key={`${log.id}-${violation.id}`}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{log.driverName}</span>
                            <Badge className={getViolationColor(violation.severity)}>
                              {violation.severity}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {violation.type.replace('_', ' ')}
                            </Badge>
                            {violation.resolved && (
                              <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{violation.description}</p>
                          <div className="text-xs text-gray-400 mt-1">
                            Date: {new Date(log.logDate).toLocaleDateString()} • Vehicle:{' '}
                            {log.vehicleNumber || 'N/A'} • Time:{' '}
                            {new Date(violation.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          {!violation.resolved && (
                            <Button size="sm" className="mr-2">
                              Resolve
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            Details
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                {hosLogs.every(log => log.violations.length === 0) && (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Violations Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      All HOS logs are compliant with DOT regulations.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>HOS Reports & Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compliance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Drivers:</span>
                        <span className="font-medium">{metrics.totalDrivers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Compliance Rate:</span>
                        <span className="font-medium text-green-600">
                          {metrics.complianceRate}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Violations:</span>
                        <span className="font-medium text-red-600">{metrics.totalViolations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Drive Time:</span>
                        <span className="font-medium">{formatDuration(metrics.avgDriveTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg On-Duty Time:</span>
                        <span className="font-medium">{formatDuration(metrics.avgOnDutyTime)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Available Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                        Daily HOS Summary
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                        Weekly Driver Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                        Violation Analysis
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                        DOT Audit Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                        ELD Malfunction Report
                      </Button>
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
