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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { GlobeAltIcon, MapIcon, TruckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import CesiumTruckVisualization from './CesiumTruckVisualization';
import DeckGLTruckVisualization from './DeckGLTruckVisualization';
import MapboxTruckVisualization from './MapboxTruckVisualization';
import { logger } from '@/utils/logger';

interface RoutePoint {
  lat: number;
  lng: number;
  name: string;
  timestamp: string;
  speed: number;
}

interface TruckVisualizationTabsProps {
  route: RoutePoint[];
  currentPosition?: RoutePoint;
  mapboxToken: string;
  cesiumToken: string;
  geofenceZones?: unknown[]; // Will be properly typed when we implement geofence visualization
}

export default function TruckVisualizationTabs({
  route,
  currentPosition,
  mapboxToken,
  cesiumToken,
  geofenceZones = [],
}: TruckVisualizationTabsProps) {
  const [activeTab, setActiveTab] = useState('mapbox');

  // Debug information
  React.useEffect(() => {
    logger.info(
      'TruckVisualizationTabs Debug Info',
      {
        routeLength: route?.length,
        hasCurrentPosition: !!currentPosition,
        hasMapboxToken: !!mapboxToken,
        hasCesiumToken: !!cesiumToken,
        cesiumLoaded: typeof window !== 'undefined' ? typeof window.Cesium !== 'undefined' : false,
      },
      'TruckVisualizationTabs'
    );
  }, [route, currentPosition, mapboxToken, cesiumToken]);

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">3D Truck Tracking</h2>

          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="mapbox" className="flex items-center space-x-2">
              <TruckIcon className="h-4 w-4" />
              <span>Mapbox 3D</span>
            </TabsTrigger>
            <TabsTrigger value="cesium" className="flex items-center space-x-2">
              <GlobeAltIcon className="h-4 w-4" />
              <span>Earth View</span>
            </TabsTrigger>
            <TabsTrigger value="deckgl" className="flex items-center space-x-2">
              <MapIcon className="h-4 w-4" />
              <span>High Performance</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="mapbox" className="mt-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {route && route.length >= 2 ? (
              <MapboxTruckVisualization
                route={route}
                currentPosition={currentPosition}
                mapboxToken={mapboxToken}
              />
            ) : (
              <div className="flex items-center justify-center h-[600px] bg-gray-100 dark:bg-gray-800">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                    No route data available
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Please select a driver with active route data
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="cesium" className="mt-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {route && route.length >= 2 ? (
              <CesiumTruckVisualization
                route={route}
                currentPosition={currentPosition}
                cesiumToken={cesiumToken}
              />
            ) : (
              <div className="flex items-center justify-center h-[600px] bg-gray-100 dark:bg-gray-800">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                    No route data available
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Please select a driver with active route data
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="deckgl" className="mt-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {route && route.length >= 2 ? (
              <DeckGLTruckVisualization
                route={route}
                currentPosition={currentPosition}
                mapboxToken={mapboxToken}
              />
            ) : (
              <div className="flex items-center justify-center h-[600px] bg-gray-100 dark:bg-gray-800">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                    No route data available
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Please select a driver with active route data
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Truck Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Current Location
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {currentPosition?.name ||
                  (route.length > 0
                    ? route[Math.floor(route.length * 0.7)]?.name
                    : 'Unknown Location')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Speed</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {currentPosition?.speed?.toFixed(1) ||
                  (route.length > 0
                    ? route[Math.floor(route.length * 0.7)]?.speed?.toFixed(1)
                    : '0')}{' '}
                mph
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Update</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {new Date(
                  currentPosition?.timestamp ||
                    (route.length > 0
                      ? route[Math.floor(route.length * 0.7)]?.timestamp
                      : Date.now())
                ).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Route Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Origin</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {route.length > 0 ? route[0]?.name : 'No route data'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Destination</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {route.length > 0 ? route[route.length - 1]?.name : 'No route data'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Waypoints</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {route.length} points
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Estimated Arrival
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {new Date(Date.now() + 3600000).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Distance Remaining
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {Math.floor(Math.random() * 100) + 50} miles
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">On Time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
