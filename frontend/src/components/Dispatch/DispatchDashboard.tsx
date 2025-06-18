'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';
import { LoadBoard as _LoadBoard } from './LoadBoard';
import { DriverAssignment } from './DriverAssignment';
import { RouteOptimization } from './RouteOptimization';
import { DispatchMap } from './DispatchMap';

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
  status: 'available' | 'assigned' | 'in_transit' | 'delivered';
  priority: number;
  equipmentType: string;
  distance: number;
  assignedDriver?: string;
  assignedVehicle?: string;
  estimatedRevenue: number;
}

interface DispatchMetrics {
  totalLoads: number;
  availableLoads: number;
  assignedLoads: number;
  inTransitLoads: number;
  availableDrivers: number;
  utilizationRate: number;
  avgRevenuePerMile: number;
  onTimeDeliveryRate: number;
}

export default function DispatchDashboard() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [metrics, setMetrics] = useState<DispatchMetrics>({
    totalLoads: 0,
    availableLoads: 0,
    assignedLoads: 0,
    inTransitLoads: 0,
    availableDrivers: 0,
    utilizationRate: 0,
    avgRevenuePerMile: 0,
    onTimeDeliveryRate: 0,
  });
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [autoDispatchEnabled, setAutoDispatchEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDispatchData();
    const interval = setInterval(fetchDispatchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDispatchData = async () => {
    try {
      // Fetch loads and metrics from API
      const [loadsResponse, metricsResponse] = await Promise.all([
        fetch('/api/dispatch/loads'),
        fetch('/api/dispatch/metrics'),
      ]);

      const loadsData = await loadsResponse.json();
      const metricsData = await metricsResponse.json();

      setLoads(loadsData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error fetching dispatch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAssign = async (loadId: number) => {
    try {
      const response = await fetch(`/api/dispatch/auto-assign/${loadId}`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          fetchDispatchData(); // Refresh data
        }
      }
    } catch (error) {
      console.error('Error auto-assigning load:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'bg-red-100 text-red-800';
    if (priority >= 6) return 'bg-orange-100 text-orange-800';
    if (priority >= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
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
          <h1 className="text-3xl font-bold text-white">Dispatch Center</h1>
          <p className="text-gray-400">Intelligent load assignment and route optimization</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Auto-Dispatch</span>
            <Button
              variant={autoDispatchEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoDispatchEnabled(!autoDispatchEnabled)}
              className="flex items-center space-x-1"
            >
              {autoDispatchEnabled ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
              <span>{autoDispatchEnabled ? 'Enabled' : 'Disabled'}</span>
            </Button>
          </div>
          <Button onClick={fetchDispatchData} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Loads</CardTitle>
            <TruckIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.totalLoads}</div>
            <div className="text-xs text-gray-400">
              {metrics.availableLoads} available, {metrics.assignedLoads} assigned
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Available Drivers</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.availableDrivers}</div>
            <div className="text-xs text-gray-400">
              {metrics.utilizationRate.toFixed(1)}% utilization
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Avg Revenue/Mile</CardTitle>
            <CurrencyDollarIcon className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${metrics.avgRevenuePerMile.toFixed(2)}</div>
            <div className="text-xs text-gray-400">
              +5.2% from last week
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">On-Time Delivery</CardTitle>
            <ClockIcon className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.onTimeDeliveryRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-400">
              Target: 95%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="loads" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="loads" className="text-white">Load Board</TabsTrigger>
          <TabsTrigger value="assignment" className="text-white">Driver Assignment</TabsTrigger>
          <TabsTrigger value="routes" className="text-white">Route Optimization</TabsTrigger>
          <TabsTrigger value="map" className="text-white">Live Map</TabsTrigger>
        </TabsList>

        <TabsContent value="loads" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Load List */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Available Loads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loads.filter(load => load.status === 'available').map((load) => (
                      <div
                        key={load.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedLoad?.id === load.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                        }`}
                        onClick={() => setSelectedLoad(load)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-white">{load.loadNumber}</h3>
                            <p className="text-sm text-gray-400">{load.customer}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Badge className={getPriorityColor(load.priority)}>
                              Priority {load.priority}
                            </Badge>
                            <Badge className={getStatusColor(load.status)}>
                              {load.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="flex items-center text-gray-400">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              Pickup
                            </div>
                            <p className="text-white">{load.pickupLocation}</p>
                            <p className="text-gray-400">{new Date(load.pickupDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <div className="flex items-center text-gray-400">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              Delivery
                            </div>
                            <p className="text-white">{load.deliveryLocation}</p>
                            <p className="text-gray-400">{new Date(load.deliveryDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-600">
                          <div className="flex space-x-4 text-sm">
                            <span className="text-gray-400">
                              {load.distance} mi • {load.weight.toLocaleString()} lbs
                            </span>
                            <span className="text-green-400 font-semibold">
                              ${load.rate.toLocaleString()}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAutoAssign(load.id);
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Auto Assign
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Load Details */}
            <div>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Load Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedLoad ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-white mb-2">{selectedLoad.loadNumber}</h3>
                        <p className="text-gray-400">{selectedLoad.customer}</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-gray-400">Equipment Type</label>
                          <p className="text-white">{selectedLoad.equipmentType}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-400">Weight</label>
                          <p className="text-white">{selectedLoad.weight.toLocaleString()} lbs</p>
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-400">Distance</label>
                          <p className="text-white">{selectedLoad.distance} miles</p>
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-400">Rate</label>
                          <p className="text-white">${selectedLoad.rate.toLocaleString()}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-400">Rate per Mile</label>
                          <p className="text-white">${(selectedLoad.rate / selectedLoad.distance).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-600">
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleAutoAssign(selectedLoad.id)}
                        >
                          Assign Load
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400">Select a load to view details</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assignment">
          <DriverAssignment loads={loads} onAssignmentChange={fetchDispatchData} />
        </TabsContent>

        <TabsContent value="routes">
          <RouteOptimization loads={loads.filter(l => l.status === 'assigned')} />
        </TabsContent>

        <TabsContent value="map">
          <DispatchMap loads={loads} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
