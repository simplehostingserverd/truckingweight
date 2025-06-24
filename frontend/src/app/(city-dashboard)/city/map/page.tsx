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

import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  MapPinIcon,
  ArrowPathIcon,
  ScaleIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  AdjustmentsHorizontalIcon,
  // LayersIcon is not available, using a different icon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
// import { Checkbox } from '@/components/ui/checkbox'; // Unused
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

// Import MapTiler components
import MapTilerProvider from '@/providers/MapTilerProvider';
// Dynamically import the MapTilerMap component to avoid SSR issues
const MapTilerMap = dynamic(() => import('@/components/MapTiler/MapTilerMap'), {
  ssr: false,
  loading: () => <Skeleton className="h-[600px] w-full bg-gray-700" />,
});

// Create a client-side only component to avoid hydration issues
const CityMapPageClient = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('scales');
  const [mapData, setMapData] = useState({
    scales: [],
    violations: [],
    activeVehicles: [],
  });

  // Map filter states
  const [showActiveScales, setShowActiveScales] = useState(true);
  const [showInactiveScales, setShowInactiveScales] = useState(false);
  const [showViolations, setShowViolations] = useState(true);
  const [showActiveVehicles, setShowActiveVehicles] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Fetch map data
  const fetchMapData = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Safely access localStorage only on the client side
      if (typeof window === 'undefined') return;

      const cityToken = localStorage.getItem('cityToken');

      if (!cityToken) {
        throw new Error('No authentication token found');
      }

      // In a real implementation, we would fetch data from the API
      // For now, we'll use mock data
      generateMockData();
    } catch (err: unknown) {
      console.error('Error fetching map data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load map data');
      // Generate dummy data for testing
      generateMockData();
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock data for testing
  const generateMockData = () => {
    const mockScales = [
      {
        id: 1,
        name: 'Main Street Scale',
        location: '123 Main St',
        coordinates: { lat: 29.7604, lng: -95.3698 }, // Houston
        status: 'Active',
        lastCalibration: '2023-10-15',
        type: 'fixed',
      },
      {
        id: 2,
        name: 'Highway 10 Scale',
        location: '456 Highway 10',
        coordinates: { lat: 29.7707, lng: -95.3855 }, // Near Houston
        status: 'Maintenance',
        lastCalibration: '2023-09-01',
        type: 'fixed',
      },
      {
        id: 3,
        name: 'Downtown Scale',
        location: '789 Center Ave',
        coordinates: { lat: 29.753, lng: -95.3591 }, // Downtown Houston
        status: 'Active',
        lastCalibration: '2023-11-10',
        type: 'fixed',
      },
      {
        id: 4,
        name: 'Industrial Park Scale',
        location: '789 Industry Blvd',
        coordinates: { lat: 29.7765, lng: -95.345 }, // East Houston
        status: 'Active',
        lastCalibration: '2023-07-05',
        type: 'fixed',
      },
      {
        id: 5,
        name: 'Mobile Unit 1',
        location: 'Variable',
        coordinates: { lat: 29.734, lng: -95.39 }, // South Houston
        status: 'Active',
        lastCalibration: '2023-08-01',
        type: 'portable',
      },
    ];

    const mockViolations = [
      {
        id: 1,
        violationNumber: 'V-2023-001',
        location: '123 Main St',
        coordinates: { lat: 29.7604, lng: -95.3698 }, // Houston
        date: '2023-11-05',
        type: 'overweight',
        status: 'Closed',
      },
      {
        id: 2,
        violationNumber: 'V-2023-002',
        location: '456 Highway 10',
        coordinates: { lat: 29.7707, lng: -95.3855 }, // Near Houston
        date: '2023-11-08',
        type: 'oversize',
        status: 'Open',
      },
      {
        id: 3,
        violationNumber: 'V-2023-003',
        location: '789 Center Ave',
        coordinates: { lat: 29.753, lng: -95.3591 }, // Downtown Houston
        date: '2023-11-10',
        type: 'no_permit',
        status: 'Open',
      },
    ];

    const mockActiveVehicles = [
      {
        id: 1,
        vehicleId: 'TX12345',
        coordinates: { lat: 29.764, lng: -95.371 }, // Near Houston
        status: 'In Transit',
        lastUpdate: '2023-11-21T10:30:00Z',
        heading: 45, // Northeast
        speed: 35,
      },
      {
        id: 2,
        vehicleId: 'TX54321',
        coordinates: { lat: 29.752, lng: -95.365 }, // Downtown Houston
        status: 'Stopped',
        lastUpdate: '2023-11-21T10:28:00Z',
        heading: 0,
        speed: 0,
      },
      {
        id: 3,
        vehicleId: 'TX98765',
        coordinates: { lat: 29.775, lng: -95.348 }, // East Houston
        status: 'In Transit',
        lastUpdate: '2023-11-21T10:25:00Z',
        heading: 270, // West
        speed: 25,
      },
    ];

    setMapData({
      scales: mockScales,
      violations: mockViolations,
      activeVehicles: mockActiveVehicles,
    });
  };

  // Load map data on component mount
  useEffect(() => {
    fetchMapData();
  }, []);

  // Filter map data based on active filters
  const filteredScales = mapData.scales.filter(scale => {
    if (scale.status === 'Active' && showActiveScales) return true;
    if (scale.status !== 'Active' && showInactiveScales) return true;
    return false;
  });

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">City Map</h1>
            <p className="text-gray-400">View scales, violations, and vehicle activity</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchMapData} disabled={isLoading}>
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Filters and Legend */}
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                  Map Layers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ScaleIcon className="h-5 w-5 text-blue-500" />
                    <Label htmlFor="active-scales">Active Scales</Label>
                  </div>
                  <Switch
                    id="active-scales"
                    checked={showActiveScales}
                    onCheckedChange={setShowActiveScales}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ScaleIcon className="h-5 w-5 text-gray-500" />
                    <Label htmlFor="inactive-scales">Inactive Scales</Label>
                  </div>
                  <Switch
                    id="inactive-scales"
                    checked={showInactiveScales}
                    onCheckedChange={setShowInactiveScales}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                    <Label htmlFor="violations">Violations</Label>
                  </div>
                  <Switch
                    id="violations"
                    checked={showViolations}
                    onCheckedChange={setShowViolations}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TruckIcon className="h-5 w-5 text-green-500" />
                    <Label htmlFor="active-vehicles">Active Vehicles</Label>
                  </div>
                  <Switch
                    id="active-vehicles"
                    checked={showActiveVehicles}
                    onCheckedChange={setShowActiveVehicles}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AdjustmentsHorizontalIcon className="h-5 w-5 text-purple-500" />
                    <Label htmlFor="heatmap">Activity Heatmap</Label>
                  </div>
                  <Switch id="heatmap" checked={showHeatmap} onCheckedChange={setShowHeatmap} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="text-gray-300">Active Scale</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-300">Scale in Maintenance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                  <span className="text-gray-300">Inactive Scale</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-gray-300">Violation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-gray-300">Active Vehicle</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Scales:</span>
                  <span className="text-white font-medium">{mapData.scales.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Scales:</span>
                  <span className="text-white font-medium">
                    {mapData.scales.filter(s => s.status === 'Active').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Recent Violations:</span>
                  <span className="text-white font-medium">{mapData.violations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Vehicles:</span>
                  <span className="text-white font-medium">{mapData.activeVehicles.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Map and Tabs */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-0">
                <div className="relative">
                  <MapTilerProvider>
                    <MapTilerMap
                      latitude={29.7604}
                      longitude={-95.3698}
                      zoom={11}
                      markers={[
                        ...filteredScales.map(scale => ({
                          id: scale.id.toString(),
                          latitude: scale.coordinates.lat,
                          longitude: scale.coordinates.lng,
                          title: scale.name,
                          type: 'scale' as const,
                          status: scale.status,
                          data: scale,
                        })),
                        ...(showViolations
                          ? mapData.violations.map(violation => ({
                              id: `violation-${violation.id}`,
                              latitude: violation.coordinates.lat,
                              longitude: violation.coordinates.lng,
                              title: violation.violationNumber,
                              type: 'violation' as const,
                              status: violation.status,
                              data: violation,
                            }))
                          : []),
                        ...(showActiveVehicles
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          ? mapData.activeVehicles.map(vehicle => ({
                              id: `vehicle-${vehicle.id}`,
                              latitude: vehicle.coordinates.lat,
                              longitude: vehicle.coordinates.lng,
                              title: vehicle.vehicleId,
                              type: 'vehicle' as const,
                              status: vehicle.status,
                              data: vehicle,
                            }))
                          : []),
                      ]}
                      showHeatmap={showHeatmap}
                      onMarkerClick={(
                        id,
                        type,
                        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */ data
                      ) => {
                        // Set the active tab based on the marker type
                        if (type === 'scale') setActiveTab('scales');
                        else if (type === 'violation') setActiveTab('violations');
                        else if (type === 'vehicle') setActiveTab('vehicles');
                      }}
                      height="600px"
                    />
                  </MapTilerProvider>
                  <div className="absolute top-4 right-4 bg-gray-900/80 p-2 rounded-md">
                    <p className="text-xs text-gray-300">
                      Showing {filteredScales.length} scales,
                      {showViolations ? ` ${mapData.violations.length} violations,` : ''}
                      {showActiveVehicles ? ` ${mapData.activeVehicles.length} vehicles` : ''}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
                <TabsTrigger value="scales">Scales</TabsTrigger>
                <TabsTrigger value="violations">Violations</TabsTrigger>
                <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
              </TabsList>

              <TabsContent value="scales" className="mt-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Scale Locations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full bg-gray-700" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {mapData.scales.map(scale => (
                          <div
                            key={scale.id}
                            className="flex items-center p-3 rounded-lg border border-gray-700 hover:bg-gray-700/50"
                          >
                            <div
                              className={`p-2 rounded-full mr-3 ${
                                scale.status === 'Active'
                                  ? 'bg-blue-500/20'
                                  : scale.status === 'Maintenance'
                                    ? 'bg-yellow-500/20'
                                    : 'bg-gray-500/20'
                              }`}
                            >
                              <ScaleIcon
                                className={`h-5 w-5 ${
                                  scale.status === 'Active'
                                    ? 'text-blue-500'
                                    : scale.status === 'Maintenance'
                                      ? 'text-yellow-500'
                                      : 'text-gray-500'
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-white">{scale.name}</h4>
                              <div className="flex items-center mt-1">
                                <MapPinIcon className="h-3.5 w-3.5 text-gray-400 mr-1" />
                                <p className="text-xs text-gray-400">{scale.location}</p>
                              </div>
                            </div>
                            <Badge
                              className={`${
                                scale.status === 'Active'
                                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                  : scale.status === 'Maintenance'
                                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                              }`}
                            >
                              {scale.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="violations" className="mt-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Recent Violations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full bg-gray-700" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {mapData.violations.map(violation => (
                          <div
                            key={violation.id}
                            className="flex items-center p-3 rounded-lg border border-gray-700 hover:bg-gray-700/50"
                          >
                            <div className="bg-red-500/20 p-2 rounded-full mr-3">
                              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-white">
                                {violation.violationNumber}
                              </h4>
                              <div className="flex items-center mt-1">
                                <MapPinIcon className="h-3.5 w-3.5 text-gray-400 mr-1" />
                                <p className="text-xs text-gray-400">{violation.location}</p>
                                <p className="text-xs text-gray-400 ml-2">
                                  {new Date(violation.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={`${
                                violation.status === 'Open'
                                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                  : 'bg-green-500/20 text-green-400 border-green-500/30'
                              }`}
                            >
                              {violation.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vehicles" className="mt-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Active Vehicles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full bg-gray-700" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        {mapData.activeVehicles.map(vehicle => (
                          <div
                            key={vehicle.id}
                            className="flex items-center p-3 rounded-lg border border-gray-700 hover:bg-gray-700/50"
                          >
                            <div className="bg-green-500/20 p-2 rounded-full mr-3">
                              <TruckIcon className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-white">
                                {vehicle.vehicleId}
                              </h4>
                              <div className="flex items-center mt-1">
                                <p className="text-xs text-gray-400">Speed: {vehicle.speed} mph</p>
                                <p className="text-xs text-gray-400 ml-2">
                                  Last update: {new Date(vehicle.lastUpdate).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={`${
                                vehicle.status === 'In Transit'
                                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                  : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                              }`}
                            >
                              {vehicle.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

// Use dynamic import with SSR disabled to avoid hydration issues
const CityMapPage = dynamic(() => Promise.resolve(CityMapPageClient), {
  ssr: false,
});

export default function Page() {
  return <CityMapPage />;
}
