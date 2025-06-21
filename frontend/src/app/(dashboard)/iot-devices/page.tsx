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
  DevicePhoneMobileIcon,
  SignalIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  WifiIcon,
  CpuChipIcon,
  Battery100Icon,
  FireIcon,
  PlusIcon,
  Cog6ToothIcon,
  MapPinIcon,
  TruckIcon,
  CalculatorIcon,
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

interface IoTDevice {
  id: number;
  deviceId: string;
  name: string;
  type:
    | 'scale'
    | 'gps_tracker'
    | 'temperature_sensor'
    | 'fuel_sensor'
    | 'tire_pressure'
    | 'door_sensor'
    | 'camera'
    | 'telematics_unit';
  manufacturer: string;
  model: string;
  firmwareVersion: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  batteryLevel?: number;
  signalStrength: number;
  lastSeen: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  assignedTo?: {
    type: 'vehicle' | 'trailer' | 'scale' | 'facility';
    id: number;
    name: string;
  };
  sensorData: SensorReading[];
  configuration: DeviceConfiguration;
  alerts: DeviceAlert[];
  installationDate: string;
  warrantyExpiry?: string;
  maintenanceSchedule?: string;
}

interface SensorReading {
  id: number;
  timestamp: string;
  sensorType: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}

interface DeviceConfiguration {
  reportingInterval: number; // in seconds
  alertThresholds: {
    batteryLow: number;
    signalWeak: number;
    temperatureHigh?: number;
    temperatureLow?: number;
  };
  networkSettings: {
    protocol: 'cellular' | 'wifi' | 'lora' | 'satellite';
    apn?: string;
    frequency?: number;
  };
}

interface DeviceAlert {
  id: number;
  type: 'battery_low' | 'signal_weak' | 'offline' | 'sensor_error' | 'maintenance_due';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface IoTMetrics {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  maintenanceDevices: number;
  errorDevices: number;
  avgBatteryLevel: number;
  avgSignalStrength: number;
  activeAlerts: number;
}

export default function IoTDevicesPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [metrics, setMetrics] = useState<IoTMetrics>({
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    maintenanceDevices: 0,
    errorDevices: 0,
    avgBatteryLevel: 0,
    avgSignalStrength: 0,
    activeAlerts: 0,
  });
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDevicesData();
  }, []);

  const loadDevicesData = async () => {
    try {
      setLoading(true);

      // Professional mock data for investor demonstration
      const mockDevices: IoTDevice[] = [
        {
          id: 1,
          deviceId: 'RL-8500-PFS2847',
          name: 'Rice Lake Weighing Systems RL-8500',
          type: 'scale',
          manufacturer: 'Rice Lake Weighing Systems',
          model: 'RL-8500 IoT Scale Platform',
          firmwareVersion: '3.2.1',
          status: 'online',
          signalStrength: 92,
          lastSeen: '2025-01-20T10:30:00Z',
          location: {
            latitude: 41.8781,
            longitude: -87.6298,
            address: 'Premier Freight Solutions - Chicago Distribution Center',
          },
          assignedTo: {
            type: 'scale',
            id: 1,
            name: 'Primary Truck Scale - Bay 3',
          },
          sensorData: [
            {
              id: 1,
              timestamp: '2025-01-20T10:30:00Z',
              sensorType: 'weight',
              value: 45000,
              unit: 'lbs',
              status: 'normal',
            },
            {
              id: 2,
              timestamp: '2025-01-20T10:30:00Z',
              sensorType: 'temperature',
              value: 72,
              unit: '°F',
              status: 'normal',
            },
          ],
          configuration: {
            reportingInterval: 30,
            alertThresholds: {
              batteryLow: 20,
              signalWeak: 30,
              temperatureHigh: 85,
              temperatureLow: 32,
            },
            networkSettings: {
              protocol: 'cellular',
              apn: 'iot.carrier.com',
            },
          },
          alerts: [],
          installationDate: '2024-06-15T00:00:00Z',
          warrantyExpiry: '2026-06-15T00:00:00Z',
          maintenanceSchedule: '2025-03-15T00:00:00Z',
        },
        {
          id: 2,
          deviceId: 'GEOTAB-GO9-FL2847',
          name: 'Geotab GO9 Telematics Device',
          type: 'gps_tracker',
          manufacturer: 'Geotab Inc.',
          model: 'GO9 Fleet Management Device',
          firmwareVersion: '9.1.3',
          status: 'online',
          batteryLevel: 94,
          signalStrength: 89,
          lastSeen: '2025-01-20T10:29:45Z',
          location: {
            latitude: 42.3601,
            longitude: -71.0589,
            address: 'I-80 W, Nebraska City, NE',
          },
          assignedTo: {
            type: 'vehicle',
            id: 2,
            name: 'Freightliner FL-2847',
          },
          sensorData: [
            {
              id: 3,
              timestamp: '2025-01-20T10:29:45Z',
              sensorType: 'speed',
              value: 65,
              unit: 'mph',
              status: 'normal',
            },
            {
              id: 4,
              timestamp: '2025-01-20T10:29:45Z',
              sensorType: 'fuel_level',
              value: 78,
              unit: '%',
              status: 'normal',
            },
          ],
          configuration: {
            reportingInterval: 60,
            alertThresholds: {
              batteryLow: 15,
              signalWeak: 25,
            },
            networkSettings: {
              protocol: 'cellular',
              apn: 'iot.verizon.com',
            },
          },
          alerts: [],
          installationDate: '2024-08-20T00:00:00Z',
          warrantyExpiry: '2027-08-20T00:00:00Z',
        },
        {
          id: 3,
          deviceId: 'IOT-TEMP-003',
          name: 'Reefer Temperature Monitor',
          type: 'temperature_sensor',
          manufacturer: 'Carrier',
          model: 'TempGuard-IoT',
          firmwareVersion: '1.8.3',
          status: 'online',
          batteryLevel: 67,
          signalStrength: 92,
          lastSeen: '2025-01-20T10:28:30Z',
          location: {
            latitude: 39.7392,
            longitude: -104.9903,
            address: 'Denver Distribution Center, CO',
          },
          assignedTo: {
            type: 'trailer',
            id: 3,
            name: 'Reefer Trailer #003',
          },
          sensorData: [
            {
              id: 5,
              timestamp: '2025-01-20T10:28:30Z',
              sensorType: 'temperature',
              value: -10,
              unit: '°F',
              status: 'normal',
            },
            {
              id: 6,
              timestamp: '2025-01-20T10:28:30Z',
              sensorType: 'humidity',
              value: 45,
              unit: '%',
              status: 'normal',
            },
          ],
          configuration: {
            reportingInterval: 300,
            alertThresholds: {
              batteryLow: 25,
              signalWeak: 30,
              temperatureHigh: 0,
              temperatureLow: -20,
            },
            networkSettings: {
              protocol: 'cellular',
              apn: 'iot.att.com',
            },
          },
          alerts: [
            {
              id: 1,
              type: 'battery_low',
              severity: 'medium',
              message: 'Battery level below 70%',
              timestamp: '2025-01-20T09:15:00Z',
              acknowledged: false,
            },
          ],
          installationDate: '2024-09-10T00:00:00Z',
          warrantyExpiry: '2026-09-10T00:00:00Z',
          maintenanceSchedule: '2025-02-10T00:00:00Z',
        },
        {
          id: 4,
          deviceId: 'IOT-FUEL-004',
          name: 'Fuel Level Sensor #004',
          type: 'fuel_sensor',
          manufacturer: 'Omnicomm',
          model: 'LLS-AF',
          firmwareVersion: '3.1.2',
          status: 'offline',
          batteryLevel: 12,
          signalStrength: 15,
          lastSeen: '2025-01-20T08:45:00Z',
          assignedTo: {
            type: 'vehicle',
            id: 4,
            name: 'Truck #004',
          },
          sensorData: [
            {
              id: 7,
              timestamp: '2025-01-20T08:45:00Z',
              sensorType: 'fuel_level',
              value: 45,
              unit: 'gallons',
              status: 'warning',
            },
          ],
          configuration: {
            reportingInterval: 900,
            alertThresholds: {
              batteryLow: 20,
              signalWeak: 25,
            },
            networkSettings: {
              protocol: 'cellular',
              apn: 'iot.tmobile.com',
            },
          },
          alerts: [
            {
              id: 2,
              type: 'offline',
              severity: 'high',
              message: 'Device has been offline for 2 hours',
              timestamp: '2025-01-20T08:45:00Z',
              acknowledged: false,
            },
            {
              id: 3,
              type: 'battery_low',
              severity: 'critical',
              message: 'Battery critically low at 12%',
              timestamp: '2025-01-20T08:30:00Z',
              acknowledged: false,
            },
          ],
          installationDate: '2024-07-05T00:00:00Z',
          warrantyExpiry: '2026-07-05T00:00:00Z',
          maintenanceSchedule: '2025-01-25T00:00:00Z',
        },
      ];

      const mockMetrics: IoTMetrics = {
        totalDevices: mockDevices.length,
        onlineDevices: mockDevices.filter(d => d.status === 'online').length,
        offlineDevices: mockDevices.filter(d => d.status === 'offline').length,
        maintenanceDevices: mockDevices.filter(d => d.status === 'maintenance').length,
        errorDevices: mockDevices.filter(d => d.status === 'error').length,
        avgBatteryLevel:
          mockDevices
            .filter(d => d.batteryLevel)
            .reduce((sum, d) => sum + (d.batteryLevel || 0), 0) /
          mockDevices.filter(d => d.batteryLevel).length,
        avgSignalStrength:
          mockDevices.reduce((sum, d) => sum + d.signalStrength, 0) / mockDevices.length,
        activeAlerts: mockDevices.reduce(
          (sum, d) => sum + d.alerts.filter(a => !a.acknowledged).length,
          0
        ),
      };

      setDevices(mockDevices);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading IoT devices data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'offline':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'error':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      case 'maintenance':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDeviceTypeIcon = (type: string) => {
    switch (type) {
      case 'scale':
        return <CalculatorIcon className="h-5 w-5" />;
      case 'gps_tracker':
        return <MapPinIcon className="h-5 w-5" />;
      case 'temperature_sensor':
        return <FireIcon className="h-5 w-5" />;
      case 'fuel_sensor':
        return <BoltIcon className="h-5 w-5" />;
      case 'telematics_unit':
        return <TruckIcon className="h-5 w-5" />;
      default:
        return <DevicePhoneMobileIcon className="h-5 w-5" />;
    }
  };

  const getBatteryColor = (level?: number) => {
    if (!level) return 'text-gray-400';
    if (level > 70) return 'text-green-600';
    if (level > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSignalColor = (strength: number) => {
    if (strength > 70) return 'text-green-600';
    if (strength > 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredDevices = devices.filter(device => {
    if (statusFilter !== 'all' && device.status !== statusFilter) return false;
    if (typeFilter !== 'all' && device.type !== typeFilter) return false;
    if (
      searchTerm &&
      !device.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !device.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            IoT Device Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Monitor and manage all IoT devices and sensors across your fleet
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/iot-devices/configure">
            <Button variant="outline">
              <Cog6ToothIcon className="h-5 w-5 mr-2" />
              Configure
            </Button>
          </Link>
          <Link href="/iot-devices/add">
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Device
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
                  Online Devices
                </p>
                <h3 className="text-2xl font-bold mt-1 text-green-600">{metrics.onlineDevices}</h3>
                <p className="text-xs text-gray-500">of {metrics.totalDevices} total</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Avg Battery Level
                </p>
                <h3 className="text-2xl font-bold mt-1">{metrics.avgBatteryLevel.toFixed(0)}%</h3>
                <p className="text-xs text-gray-500">across all devices</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full flex-shrink-0">
                <Battery100Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Signal Strength
                </p>
                <h3 className="text-2xl font-bold mt-1">{metrics.avgSignalStrength.toFixed(0)}%</h3>
                <p className="text-xs text-gray-500">average signal</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full flex-shrink-0">
                <SignalIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Alerts
                </p>
                <h3 className="text-2xl font-bold mt-1 text-red-600">{metrics.activeAlerts}</h3>
                <p className="text-xs text-gray-500">require attention</p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Device Management</TabsTrigger>
          <TabsTrigger value="sensors">Sensor Data</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Device Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Online</span>
                    <span className="font-medium text-green-600">{metrics.onlineDevices}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Offline</span>
                    <span className="font-medium text-red-600">{metrics.offlineDevices}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Maintenance</span>
                    <span className="font-medium text-yellow-600">
                      {metrics.maintenanceDevices}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Error</span>
                    <span className="font-medium text-orange-600">{metrics.errorDevices}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'scale',
                    'gps_tracker',
                    'temperature_sensor',
                    'fuel_sensor',
                    'telematics_unit',
                  ].map(type => {
                    const count = devices.filter(d => d.type === type).length;
                    return (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-gray-600 capitalize">{type.replace('_', ' ')}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Battery</span>
                    <span className={`font-medium ${getBatteryColor(metrics.avgBatteryLevel)}`}>
                      {metrics.avgBatteryLevel.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Signal</span>
                    <span className={`font-medium ${getSignalColor(metrics.avgSignalStrength)}`}>
                      {metrics.avgSignalStrength.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Alerts</span>
                    <span className="font-medium text-red-600">{metrics.activeAlerts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Uptime</span>
                    <span className="font-medium text-green-600">98.7%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Critical Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
                Critical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices
                  .flatMap(device =>
                    device.alerts
                      .filter(
                        alert =>
                          !alert.acknowledged &&
                          (alert.severity === 'high' || alert.severity === 'critical')
                      )
                      .map(alert => ({
                        ...alert,
                        deviceName: device.name,
                        deviceId: device.deviceId,
                      }))
                  )
                  .slice(0, 5)
                  .map(alert => (
                    <div
                      key={`${alert.deviceId}-${alert.id}`}
                      className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{alert.deviceName}</span>
                          <Badge
                            className={`${
                              alert.severity === 'critical'
                                ? 'bg-red-100 text-red-800'
                                : alert.severity === 'high'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Button size="sm">Acknowledge</Button>
                      </div>
                    </div>
                  ))}
                {devices.every(
                  device =>
                    device.alerts.filter(
                      alert =>
                        !alert.acknowledged &&
                        (alert.severity === 'high' || alert.severity === 'critical')
                    ).length === 0
                ) && (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Critical Alerts
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      All devices are operating normally.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Search devices..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Device Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="scale">Scale Sensors</SelectItem>
                    <SelectItem value="gps_tracker">GPS Trackers</SelectItem>
                    <SelectItem value="temperature_sensor">Temperature</SelectItem>
                    <SelectItem value="fuel_sensor">Fuel Sensors</SelectItem>
                    <SelectItem value="telematics_unit">Telematics</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Devices Table */}
          <Card>
            <CardHeader>
              <CardTitle>Device Management ({filteredDevices.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Battery/Signal</TableHead>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Last Seen</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDevices.map(device => (
                      <TableRow
                        key={device.id}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setSelectedDevice(device)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                              {getDeviceTypeIcon(device.type)}
                            </div>
                            <div>
                              <div className="font-medium">{device.name}</div>
                              <div className="text-sm text-gray-500">{device.deviceId}</div>
                              <div className="text-xs text-gray-400">
                                {device.manufacturer} {device.model}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {device.type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(device.status)}
                            <Badge className={getStatusColor(device.status)}>{device.status}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {device.batteryLevel && (
                              <div className="flex items-center gap-1">
                                <Battery100Icon
                                  className={`h-4 w-4 ${getBatteryColor(device.batteryLevel)}`}
                                />
                                <span className={`text-sm ${getBatteryColor(device.batteryLevel)}`}>
                                  {device.batteryLevel}%
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <SignalIcon
                                className={`h-4 w-4 ${getSignalColor(device.signalStrength)}`}
                              />
                              <span className={`text-sm ${getSignalColor(device.signalStrength)}`}>
                                {device.signalStrength}%
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {device.assignedTo ? (
                            <div>
                              <div className="font-medium">{device.assignedTo.name}</div>
                              <div className="text-sm text-gray-500 capitalize">
                                {device.assignedTo.type}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(device.lastSeen).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(device.lastSeen).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/iot-devices/${device.id}`}>
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </Link>
                            <Button size="sm" variant="outline">
                              <Cog6ToothIcon className="h-4 w-4" />
                            </Button>
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

        <TabsContent value="sensors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Sensor Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices
                  .filter(d => d.status === 'online')
                  .map(device => (
                    <Card key={device.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getDeviceTypeIcon(device.type)}
                          {device.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {device.sensorData.map(sensor => (
                            <div key={sensor.id} className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 capitalize">
                                {sensor.sensorType.replace('_', ' ')}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {sensor.value} {sensor.unit}
                                </span>
                                <Badge
                                  className={
                                    sensor.status === 'normal'
                                      ? 'bg-green-100 text-green-800'
                                      : sensor.status === 'warning'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                  }
                                >
                                  {sensor.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                          <div className="text-xs text-gray-400 pt-2 border-t">
                            Last updated: {new Date(device.lastSeen).toLocaleTimeString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Device Alerts & Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices
                  .flatMap(device =>
                    device.alerts.map(alert => ({
                      ...alert,
                      deviceName: device.name,
                      deviceId: device.deviceId,
                      deviceType: device.type,
                    }))
                  )
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map(alert => (
                    <div
                      key={`${alert.deviceId}-${alert.id}`}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{alert.deviceName}</span>
                          <Badge
                            className={`${
                              alert.severity === 'critical'
                                ? 'bg-red-100 text-red-800'
                                : alert.severity === 'high'
                                  ? 'bg-orange-100 text-orange-800'
                                  : alert.severity === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {alert.type.replace('_', ' ')}
                          </Badge>
                          {alert.acknowledged && (
                            <Badge className="bg-green-100 text-green-800">Acknowledged</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {!alert.acknowledged && <Button size="sm">Acknowledge</Button>}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices
                  .filter(d => d.maintenanceSchedule)
                  .map(device => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{device.name}</div>
                        <div className="text-sm text-gray-500">{device.deviceId}</div>
                        <div className="text-xs text-gray-400">
                          Scheduled:{' '}
                          {device.maintenanceSchedule &&
                            new Date(device.maintenanceSchedule).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <Button size="sm" variant="outline">
                          Schedule
                        </Button>
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
