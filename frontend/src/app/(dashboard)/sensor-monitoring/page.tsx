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
  ChartBarIcon,
  BoltIcon,
  ScaleIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  SignalIcon,
  CpuChipIcon,
  EyeIcon,
  Cog6ToothIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';
import ThermometerIcon from '@/components/icons/ThermometerIcon';
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
} from '@/components/ui';
import Link from 'next/link';

interface SensorData {
  id: number;
  deviceId: string;
  deviceName: string;
  sensorType:
    | 'temperature'
    | 'weight'
    | 'fuel_level'
    | 'tire_pressure'
    | 'door_status'
    | 'speed'
    | 'location'
    | 'vibration';
  currentValue: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  threshold: {
    min?: number;
    max?: number;
    target?: number;
  };
  location?: string;
  assignedTo?: {
    type: 'vehicle' | 'trailer' | 'scale' | 'facility';
    name: string;
  };
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
  historicalData: HistoricalReading[];
  alerts: SensorAlert[];
}

interface HistoricalReading {
  timestamp: string;
  value: number;
}

interface SensorAlert {
  id: number;
  type: 'threshold_exceeded' | 'sensor_offline' | 'calibration_needed' | 'maintenance_required';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface MonitoringMetrics {
  totalSensors: number;
  activeSensors: number;
  alertingSensors: number;
  offlineSensors: number;
  avgResponseTime: number;
  dataPointsToday: number;
  systemUptime: number;
}

export default function SensorMonitoringPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [metrics, setMetrics] = useState<MonitoringMetrics>({
    totalSensors: 0,
    activeSensors: 0,
    alertingSensors: 0,
    offlineSensors: 0,
    avgResponseTime: 0,
    dataPointsToday: 0,
    systemUptime: 0,
  });
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5); // seconds
  const [sensorTypeFilter, setSensorTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadSensorData();

    if (autoRefresh) {
      const interval = setInterval(loadSensorData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadSensorData = async () => {
    try {
      setLoading(true);

      // Professional mock data for investor demonstration
      const mockSensorData: SensorData[] = [
        {
          id: 1,
          deviceId: 'THERMO-FL2847',
          deviceName: 'Carrier Transicold X4 7300',
          sensorType: 'temperature',
          currentValue: -8,
          unit: '°F',
          status: 'normal',
          threshold: {
            min: -15,
            max: 5,
            target: -10,
          },
          location: 'Reefer Trailer FL-2847',
          assignedTo: {
            type: 'trailer',
            name: 'Freightliner Cascadia FL-2847',
          },
          lastUpdated: '2025-01-20T10:30:00Z',
          trend: 'stable',
          historicalData: [
            { timestamp: '2025-01-20T10:00:00Z', value: -9 },
            { timestamp: '2025-01-20T10:15:00Z', value: -8.5 },
            { timestamp: '2025-01-20T10:30:00Z', value: -8 },
          ],
          alerts: [],
        },
        {
          id: 2,
          deviceId: 'SCALE-RL8500',
          deviceName: 'Rice Lake Weighing Systems RL8500',
          sensorType: 'weight',
          currentValue: 78450,
          unit: 'lbs',
          status: 'normal',
          threshold: {
            max: 80000,
          },
          location: 'Phoenix Distribution Center',
          assignedTo: {
            type: 'scale',
            name: 'Primary Truck Scale - Bay 3',
          },
          lastUpdated: '2025-01-20T10:29:45Z',
          trend: 'stable',
          historicalData: [
            { timestamp: '2025-01-20T10:00:00Z', value: 0 },
            { timestamp: '2025-01-20T10:15:00Z', value: 78450 },
            { timestamp: '2025-01-20T10:29:45Z', value: 78450 },
          ],
          alerts: [],
        },
        {
          id: 3,
          deviceId: 'FUEL-VDO3847',
          deviceName: 'VDO Fuel Management System',
          sensorType: 'fuel_level',
          currentValue: 25,
          unit: '%',
          status: 'warning',
          threshold: {
            min: 20,
            max: 100,
          },
          location: 'Peterbilt 579 - Unit PB-3847',
          assignedTo: {
            type: 'vehicle',
            name: 'Peterbilt 579 - Unit PB-3847',
          },
          lastUpdated: '2025-01-20T10:28:30Z',
          trend: 'down',
          historicalData: [
            { timestamp: '2025-01-20T09:00:00Z', value: 35 },
            { timestamp: '2025-01-20T10:00:00Z', value: 30 },
            { timestamp: '2025-01-20T10:28:30Z', value: 25 },
          ],
          alerts: [
            {
              id: 1,
              type: 'threshold_exceeded',
              severity: 'medium',
              message:
                'Fuel level approaching minimum threshold - recommend refueling at next stop',
              timestamp: '2025-01-20T10:25:00Z',
              acknowledged: false,
            },
          ],
        },
        {
          id: 4,
          deviceId: 'TIRE-003',
          deviceName: 'Tire Pressure Monitor',
          sensorType: 'tire_pressure',
          currentValue: 85,
          unit: 'PSI',
          status: 'critical',
          threshold: {
            min: 90,
            max: 120,
            target: 105,
          },
          location: 'Truck #003',
          assignedTo: {
            type: 'vehicle',
            name: 'Truck #003',
          },
          lastUpdated: '2025-01-20T10:27:15Z',
          trend: 'down',
          historicalData: [
            { timestamp: '2025-01-20T09:00:00Z', value: 105 },
            { timestamp: '2025-01-20T10:00:00Z', value: 95 },
            { timestamp: '2025-01-20T10:27:15Z', value: 85 },
          ],
          alerts: [
            {
              id: 2,
              type: 'threshold_exceeded',
              severity: 'critical',
              message: 'Tire pressure critically low - immediate attention required',
              timestamp: '2025-01-20T10:20:00Z',
              acknowledged: false,
            },
          ],
        },
        {
          id: 5,
          deviceId: 'GPS-004',
          deviceName: 'Vehicle GPS Tracker',
          sensorType: 'speed',
          currentValue: 65,
          unit: 'mph',
          status: 'normal',
          threshold: {
            max: 75,
          },
          location: 'I-90 East, Boston, MA',
          assignedTo: {
            type: 'vehicle',
            name: 'Truck #001',
          },
          lastUpdated: '2025-01-20T10:30:00Z',
          trend: 'stable',
          historicalData: [
            { timestamp: '2025-01-20T10:00:00Z', value: 70 },
            { timestamp: '2025-01-20T10:15:00Z', value: 68 },
            { timestamp: '2025-01-20T10:30:00Z', value: 65 },
          ],
          alerts: [],
        },
      ];

      const mockMetrics: MonitoringMetrics = {
        totalSensors: mockSensorData.length,
        activeSensors: mockSensorData.filter(s => s.status !== 'critical').length,
        alertingSensors: mockSensorData.filter(s => s.alerts.length > 0).length,
        offlineSensors: 0, // No offline sensors in mock data
        avgResponseTime: 1.2, // seconds
        dataPointsToday: 15847,
        systemUptime: 99.8, // percentage
      };

      setSensorData(mockSensorData);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading sensor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature':
        return <ThermometerIcon className="h-5 w-5" />; // Custom thermometer icon
      case 'weight':
        return <ScaleIcon className="h-5 w-5" />;
      case 'fuel_level':
        return <BoltIcon className="h-5 w-5" />;
      case 'tire_pressure':
        return <CpuChipIcon className="h-5 w-5" />;
      case 'speed':
      case 'location':
        return <MapPinIcon className="h-5 w-5" />;
      default:
        return <ChartBarIcon className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '→';
      default:
        return '→';
    }
  };

  const filteredSensors = sensorData.filter(sensor => {
    if (sensorTypeFilter !== 'all' && sensor.sensorType !== sensorTypeFilter) return false;
    if (statusFilter !== 'all' && sensor.status !== statusFilter) return false;
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Sensor Monitoring</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Real-time monitoring and analytics for all fleet sensors
          </p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-red-500'}`}
              ></div>
              <span className="text-sm text-gray-500">
                {autoRefresh ? 'Live' : 'Paused'} • Refresh every {refreshInterval}s
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Select
            value={refreshInterval.toString()}
            onValueChange={value => setRefreshInterval(parseInt(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 seconds</SelectItem>
              <SelectItem value="10">10 seconds</SelectItem>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">1 minute</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? (
              <PauseIcon className="h-5 w-5 mr-2" />
            ) : (
              <PlayIcon className="h-5 w-5 mr-2" />
            )}
            {autoRefresh ? 'Pause' : 'Resume'}
          </Button>
          <Link href="/sensor-monitoring/configure">
            <Button variant="outline">
              <Cog6ToothIcon className="h-5 w-5 mr-2" />
              Configure
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
                  Active Sensors
                </p>
                <h3 className="text-2xl font-bold mt-1 text-green-600">{metrics.activeSensors}</h3>
                <p className="text-xs text-gray-500">of {metrics.totalSensors} total</p>
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
                  Alerting Sensors
                </p>
                <h3 className="text-2xl font-bold mt-1 text-red-600">{metrics.alertingSensors}</h3>
                <p className="text-xs text-gray-500">require attention</p>
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
                  Response Time
                </p>
                <h3 className="text-2xl font-bold mt-1">{metrics.avgResponseTime}s</h3>
                <p className="text-xs text-gray-500">average</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  System Uptime
                </p>
                <h3 className="text-2xl font-bold mt-1">{metrics.systemUptime}%</h3>
                <p className="text-xs text-gray-500">last 30 days</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full flex-shrink-0">
                <SignalIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Live Dashboard</TabsTrigger>
          <TabsTrigger value="sensors">Sensor Details</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Thresholds</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Critical Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
                Critical Sensor Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sensorData
                  .filter(sensor => sensor.status === 'critical')
                  .map(sensor => (
                    <div
                      key={sensor.id}
                      className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          {getSensorIcon(sensor.sensorType)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{sensor.deviceName}</div>
                          <div className="text-sm text-gray-600">
                            {sensor.currentValue} {sensor.unit} • {sensor.location}
                          </div>
                          <div className="text-xs text-red-600">
                            {sensor.alerts.filter(a => !a.acknowledged)[0]?.message}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">
                          {sensor.currentValue} {sensor.unit}
                        </div>
                        <Button size="sm" className="mt-2">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                {sensorData.filter(sensor => sensor.status === 'critical').length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Critical Alerts
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      All sensors are operating within normal parameters.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sensor Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sensorData.map(sensor => (
              <Card
                key={sensor.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedSensor(sensor)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getSensorIcon(sensor.sensorType)}
                      {sensor.deviceName}
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(sensor.status)}
                      <span className="text-sm">{getTrendIcon(sensor.trend)}</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Current Value</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {sensor.currentValue} {sensor.unit}
                        </div>
                        <Badge className={getStatusColor(sensor.status)}>{sensor.status}</Badge>
                      </div>
                    </div>

                    {sensor.threshold && (
                      <div className="space-y-1">
                        {sensor.threshold.target && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Target:</span>
                            <span>
                              {sensor.threshold.target} {sensor.unit}
                            </span>
                          </div>
                        )}
                        {sensor.threshold.min && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Min:</span>
                            <span>
                              {sensor.threshold.min} {sensor.unit}
                            </span>
                          </div>
                        )}
                        {sensor.threshold.max && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Max:</span>
                            <span>
                              {sensor.threshold.max} {sensor.unit}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{sensor.assignedTo?.name}</span>
                        <span>{new Date(sensor.lastUpdated).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {sensor.alerts.length > 0 && (
                      <div className="pt-2">
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          {sensor.alerts.filter(a => !a.acknowledged).length} alerts
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sensors" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={sensorTypeFilter} onValueChange={setSensorTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sensor Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="temperature">Temperature</SelectItem>
                    <SelectItem value="weight">Weight</SelectItem>
                    <SelectItem value="fuel_level">Fuel Level</SelectItem>
                    <SelectItem value="tire_pressure">Tire Pressure</SelectItem>
                    <SelectItem value="speed">Speed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSensorTypeFilter('all');
                    setStatusFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sensor Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Sensor Details ({filteredSensors.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSensors.map(sensor => (
                  <div
                    key={sensor.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        {getSensorIcon(sensor.sensorType)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{sensor.deviceName}</div>
                        <div className="text-sm text-gray-500">
                          {sensor.deviceId} • {sensor.assignedTo?.name}
                        </div>
                        <div className="text-xs text-gray-400 capitalize">
                          {sensor.sensorType.replace('_', ' ')} sensor
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {sensor.currentValue} {sensor.unit}
                      </div>
                      <div className="flex items-center gap-2 justify-center mt-1">
                        {getStatusIcon(sensor.status)}
                        <Badge className={getStatusColor(sensor.status)}>{sensor.status}</Badge>
                        <span className="text-sm">{getTrendIcon(sensor.trend)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        Last: {new Date(sensor.lastUpdated).toLocaleTimeString()}
                      </div>
                      {sensor.alerts.length > 0 && (
                        <Badge className="bg-red-100 text-red-800 text-xs mt-1">
                          {sensor.alerts.filter(a => !a.acknowledged).length} alerts
                        </Badge>
                      )}
                      <div className="mt-2">
                        <Button size="sm" variant="outline">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sensor Alerts & Threshold Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sensorData
                  .flatMap(sensor =>
                    sensor.alerts.map(alert => ({
                      ...alert,
                      sensorName: sensor.deviceName,
                      sensorId: sensor.deviceId,
                      sensorType: sensor.sensorType,
                      currentValue: sensor.currentValue,
                      unit: sensor.unit,
                    }))
                  )
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map(alert => (
                    <div
                      key={`${alert.sensorId}-${alert.id}`}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          {getSensorIcon(alert.sensorType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{alert.sensorName}</span>
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
                          <div className="text-xs text-gray-400 mt-1">
                            Current: {alert.currentValue} {alert.unit} •{' '}
                            {new Date(alert.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {!alert.acknowledged && <Button size="sm">Acknowledge</Button>}
                      </div>
                    </div>
                  ))}
                {sensorData.every(sensor => sensor.alerts.length === 0) && (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Active Alerts
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      All sensors are operating within their configured thresholds.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Threshold Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Threshold Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sensorData.map(sensor => (
                  <div
                    key={sensor.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        {getSensorIcon(sensor.sensorType)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{sensor.deviceName}</div>
                        <div className="text-sm text-gray-500 capitalize">
                          {sensor.sensorType.replace('_', ' ')} • {sensor.assignedTo?.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Thresholds</div>
                      <div className="text-xs space-y-1">
                        {sensor.threshold?.min && (
                          <div>
                            Min: {sensor.threshold.min} {sensor.unit}
                          </div>
                        )}
                        {sensor.threshold?.max && (
                          <div>
                            Max: {sensor.threshold.max} {sensor.unit}
                          </div>
                        )}
                        {sensor.threshold?.target && (
                          <div>
                            Target: {sensor.threshold.target} {sensor.unit}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Button size="sm" variant="outline">
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sensor Analytics & Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Data Collection Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Data Points Today:</span>
                        <span className="font-medium">
                          {metrics.dataPointsToday.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Response Time:</span>
                        <span className="font-medium">{metrics.avgResponseTime}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>System Uptime:</span>
                        <span className="font-medium text-green-600">{metrics.systemUptime}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Sensors:</span>
                        <span className="font-medium">
                          {metrics.activeSensors}/{metrics.totalSensors}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Alert Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Critical Alerts:</span>
                        <span className="font-medium text-red-600">
                          {
                            sensorData.filter(s =>
                              s.alerts.some(a => a.severity === 'critical' && !a.acknowledged)
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Warning Alerts:</span>
                        <span className="font-medium text-yellow-600">
                          {
                            sensorData.filter(s =>
                              s.alerts.some(a => a.severity === 'medium' && !a.acknowledged)
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Alerts Today:</span>
                        <span className="font-medium">
                          {sensorData.reduce((sum, s) => sum + s.alerts.length, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Acknowledged:</span>
                        <span className="font-medium text-green-600">
                          {sensorData.reduce(
                            (sum, s) => sum + s.alerts.filter(a => a.acknowledged).length,
                            0
                          )}
                        </span>
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
