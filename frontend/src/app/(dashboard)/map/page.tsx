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
import CesiumMap from '@/components/Map/CesiumMap';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import {
  ClockIcon,
  Cog6ToothIcon,
  EyeIcon,
  GlobeAltIcon,
  MapPinIcon,
  ScaleIcon,
  SignalIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

// Mock real-time data
const mockRealTimeData = {
  totalTrucks: 12,
  activeTrucks: 8,
  totalMiles: 15420,
  avgSpeed: 62,
  fuelEfficiency: 6.8,
  onTimeDeliveries: 94.2,
};

const mockAlerts = [
  {
    id: 'alert-1',
    type: 'warning',
    message: 'Truck #1247 is 15 minutes behind schedule',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    route: 'Los Angeles to Phoenix',
  },
  {
    id: 'alert-2',
    type: 'info',
    message: 'Truck #1856 has departed Dallas on schedule',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    route: 'Dallas to Atlanta',
  },
  {
    id: 'alert-3',
    type: 'success',
    message: 'Truck #2134 has completed delivery in Denver',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    route: 'Chicago to Denver',
  },
];

export default function MapPage() {
  const [selectedRoute, setSelectedRoute] = useState<string>('route-1');
  const [mapHeight, setMapHeight] = useState('700px');
  const [showRealTimeData, setShowRealTimeData] = useState(true);

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'info':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'success':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">3D Route Tracking</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Real-time truck tracking and route visualization powered by Cesium
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowRealTimeData(!showRealTimeData)}>
            <EyeIcon className="h-5 w-5 mr-2" />
            {showRealTimeData ? 'Hide' : 'Show'} Data
          </Button>
          <Button variant="outline">
            <Cog6ToothIcon className="h-5 w-5 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      {showRealTimeData && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Trucks
                  </p>
                  <h3 className="text-2xl font-bold mt-1">{mockRealTimeData.totalTrucks}</h3>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                  <TruckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Active Routes
                  </p>
                  <h3 className="text-2xl font-bold mt-1">{mockRealTimeData.activeTrucks}</h3>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                  <MapPinIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Miles
                  </p>
                  <h3 className="text-2xl font-bold mt-1">
                    {mockRealTimeData.totalMiles.toLocaleString()}
                  </h3>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                  <GlobeAltIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Speed</p>
                  <h3 className="text-2xl font-bold mt-1">{mockRealTimeData.avgSpeed} mph</h3>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
                  <SignalIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fuel MPG</p>
                  <h3 className="text-2xl font-bold mt-1">{mockRealTimeData.fuelEfficiency}</h3>
                </div>
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                  <ScaleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">On-Time %</p>
                  <h3 className="text-2xl font-bold mt-1">{mockRealTimeData.onTimeDeliveries}%</h3>
                </div>
                <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-full">
                  <ClockIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Map */}
        <div className="lg:col-span-3">
          <CesiumMap
            height={mapHeight}
            selectedRoute={selectedRoute}
            onRouteSelect={setSelectedRoute}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Map Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Map Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="map-height-select" className="text-sm font-medium mb-2 block">
                  Map Height
                </label>
                <select
                  id="map-height-select"
                  value={mapHeight}
                  onChange={e => setMapHeight(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800"
                  aria-label="Select map height"
                >
                  <option value="500px">Small (500px)</option>
                  <option value="700px">Medium (700px)</option>
                  <option value="900px">Large (900px)</option>
                  <option value="100vh">Full Screen</option>
                </select>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <GlobeAltIcon className="h-4 w-4 mr-2" />
                  Reset View
                </Button>
                <Button variant="outline" className="w-full">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  Center on Fleet
                </Button>
                <Button variant="outline" className="w-full">
                  <TruckIcon className="h-4 w-4 mr-2" />
                  Follow Selected
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAlerts.map(alert => (
                  <div key={alert.id} className={`p-3 rounded-lg ${getAlertColor(alert.type)}`}>
                    <div className="flex justify-between items-start mb-1">
                      <Badge variant="outline" className="text-xs">
                        {alert.type.toUpperCase()}
                      </Badge>
                      <span className="text-xs opacity-75">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1">{alert.message}</p>
                    <p className="text-xs opacity-75">{alert.route}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span>In Transit</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span>Scheduled</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>Completed</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span>Delayed</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                  <span>Offline</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
