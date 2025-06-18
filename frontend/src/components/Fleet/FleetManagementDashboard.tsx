'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  TruckIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  MapPinIcon,
  BoltIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { VehicleList } from './VehicleList';
import { MaintenanceSchedule } from './MaintenanceSchedule';
import { FleetAnalytics } from './FleetAnalytics';
import { LiveTracking } from './LiveTracking';

interface Vehicle {
  id: number;
  name: string;
  type: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  status: 'active' | 'maintenance' | 'out_of_service';
  currentLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  odometer: number;
  fuelLevel: number;
  engineHours: number;
  lastMaintenance: string;
  nextMaintenanceDue: string;
  maintenanceScore: number;
  safetyScore: number;
  utilizationRate: number;
  assignedDriver?: string;
  currentLoad?: string;
  alerts: Alert[];
}

interface Alert {
  id: number;
  type: 'maintenance' | 'safety' | 'compliance' | 'fuel' | 'breakdown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface FleetMetrics {
  totalVehicles: number;
  activeVehicles: number;
  maintenanceVehicles: number;
  outOfServiceVehicles: number;
  avgUtilization: number;
  avgFuelEfficiency: number;
  totalMaintenanceCost: number;
  avgSafetyScore: number;
  criticalAlerts: number;
  upcomingMaintenance: number;
}

export default function FleetManagementDashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [metrics, setMetrics] = useState<FleetMetrics>({
    totalVehicles: 0,
    activeVehicles: 0,
    maintenanceVehicles: 0,
    outOfServiceVehicles: 0,
    avgUtilization: 0,
    avgFuelEfficiency: 0,
    totalMaintenanceCost: 0,
    avgSafetyScore: 0,
    criticalAlerts: 0,
    upcomingMaintenance: 0,
  });
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFleetData();
    const interval = setInterval(fetchFleetData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchFleetData = async () => {
    try {
      const [vehiclesResponse, metricsResponse] = await Promise.all([
        fetch('/api/fleet/vehicles'),
        fetch('/api/fleet/metrics'),
      ]);

      const vehiclesData = await vehiclesResponse.json();
      const metricsData = await metricsResponse.json();

      setVehicles(vehiclesData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error fetching fleet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_service': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-yellow-500';
    if (score >= 70) return 'text-orange-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Fleet Management</h1>
          <p className="text-gray-400">Monitor and manage your entire fleet in real-time</p>
        </div>
        <div className="flex space-x-4">
          <Button onClick={fetchFleetData} variant="outline">
            Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Vehicles</CardTitle>
            <TruckIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.totalVehicles}</div>
            <div className="text-xs text-gray-400">
              {metrics.activeVehicles} active
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Utilization</CardTitle>
            <ChartBarIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.avgUtilization.toFixed(1)}%</div>
            <Progress value={metrics.avgUtilization} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Fuel Efficiency</CardTitle>
            <FireIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.avgFuelEfficiency.toFixed(1)} MPG</div>
            <div className="text-xs text-gray-400">
              Fleet average
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Safety Score</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(metrics.avgSafetyScore)}`}>
              {metrics.avgSafetyScore.toFixed(0)}
            </div>
            <div className="text-xs text-gray-400">
              Out of 100
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Critical Alerts</CardTitle>
            <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{metrics.criticalAlerts}</div>
            <div className="text-xs text-gray-400">
              Require attention
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800">
          <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
          <TabsTrigger value="vehicles" className="text-white">Vehicles</TabsTrigger>
          <TabsTrigger value="maintenance" className="text-white">Maintenance</TabsTrigger>
          <TabsTrigger value="tracking" className="text-white">Live Tracking</TabsTrigger>
          <TabsTrigger value="analytics" className="text-white">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Vehicle Status Overview */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Vehicle Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vehicles.slice(0, 8).map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-700 hover:bg-gray-600 cursor-pointer"
                        onClick={() => setSelectedVehicle(vehicle)}
                      >
                        <div className="flex items-center space-x-3">
                          <TruckIcon className="h-8 w-8 text-blue-400" />
                          <div>
                            <h3 className="font-semibold text-white">{vehicle.name}</h3>
                            <p className="text-sm text-gray-400">
                              {vehicle.make} {vehicle.model} • {vehicle.licensePlate}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${getScoreColor(vehicle.safetyScore)}`}>
                                {vehicle.safetyScore}
                              </span>
                              <span className="text-xs text-gray-400">Safety</span>
                            </div>
                            <div className="text-xs text-gray-400">
                              {vehicle.odometer.toLocaleString()} mi
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-1">
                            <Badge className={getStatusColor(vehicle.status)}>
                              {vehicle.status}
                            </Badge>
                            {vehicle.alerts.length > 0 && (
                              <Badge className={getAlertColor(vehicle.alerts[0].severity)}>
                                {vehicle.alerts.length} alert{vehicle.alerts.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Critical Alerts */}
            <div>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                    Critical Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {vehicles
                      .flatMap(v => v.alerts.filter(a => a.severity === 'critical' || a.severity === 'high'))
                      .slice(0, 5)
                      .map((alert) => (
                        <div key={alert.id} className="p-3 rounded-lg bg-red-900/20 border border-red-800">
                          <div className="flex items-start justify-between">
                            <div>
                              <Badge className={getAlertColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <p className="text-sm text-white mt-1">{alert.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(alert.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Button size="sm" variant="outline" className="text-xs">
                              Resolve
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Maintenance */}
              <Card className="bg-gray-800 border-gray-700 mt-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <WrenchScrewdriverIcon className="h-5 w-5 text-yellow-400 mr-2" />
                    Upcoming Maintenance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {vehicles
                      .filter(v => new Date(v.nextMaintenanceDue) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
                      .slice(0, 4)
                      .map((vehicle) => (
                        <div key={vehicle.id} className="flex items-center justify-between p-2 rounded bg-gray-700">
                          <div>
                            <p className="text-sm font-medium text-white">{vehicle.name}</p>
                            <p className="text-xs text-gray-400">
                              Due: {new Date(vehicle.nextMaintenanceDue).toLocaleDateString()}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" className="text-xs">
                            Schedule
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vehicles">
          <VehicleList vehicles={vehicles} onVehicleSelect={setSelectedVehicle} />
        </TabsContent>

        <TabsContent value="maintenance">
          <MaintenanceSchedule vehicles={vehicles} />
        </TabsContent>

        <TabsContent value="tracking">
          <LiveTracking vehicles={vehicles} />
        </TabsContent>

        <TabsContent value="analytics">
          <FleetAnalytics vehicles={vehicles} metrics={metrics} />
        </TabsContent>
      </Tabs>

      {/* Vehicle Details Modal/Sidebar would go here */}
      {selectedVehicle && (
        <div className="fixed inset-y-0 right-0 w-96 bg-gray-800 border-l border-gray-700 p-6 overflow-y-auto z-50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">{selectedVehicle.name}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedVehicle(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <Badge className={getStatusColor(selectedVehicle.status)}>
                {selectedVehicle.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-gray-400">Make/Model</label>
                <p className="text-white">{selectedVehicle.make} {selectedVehicle.model}</p>
              </div>
              <div>
                <label className="text-gray-400">Year</label>
                <p className="text-white">{selectedVehicle.year}</p>
              </div>
              <div>
                <label className="text-gray-400">License Plate</label>
                <p className="text-white">{selectedVehicle.licensePlate}</p>
              </div>
              <div>
                <label className="text-gray-400">VIN</label>
                <p className="text-white text-xs">{selectedVehicle.vin}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-gray-400">Odometer</label>
                <p className="text-white">{selectedVehicle.odometer.toLocaleString()} miles</p>
              </div>
              <div>
                <label className="text-gray-400">Fuel Level</label>
                <div className="flex items-center space-x-2">
                  <Progress value={selectedVehicle.fuelLevel} className="flex-1" />
                  <span className="text-white text-sm">{selectedVehicle.fuelLevel}%</span>
                </div>
              </div>
              <div>
                <label className="text-gray-400">Safety Score</label>
                <p className={`text-lg font-semibold ${getScoreColor(selectedVehicle.safetyScore)}`}>
                  {selectedVehicle.safetyScore}/100
                </p>
              </div>
            </div>

            {selectedVehicle.alerts.length > 0 && (
              <div>
                <label className="text-gray-400">Active Alerts</label>
                <div className="space-y-2 mt-2">
                  {selectedVehicle.alerts.map((alert) => (
                    <div key={alert.id} className="p-2 rounded bg-gray-700">
                      <Badge className={getAlertColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <p className="text-sm text-white mt-1">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
