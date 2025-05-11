'use client';

import { useState } from 'react';
import MapboxTruckVisualization from './MapboxTruckVisualization';
import CesiumTruckVisualization from './CesiumTruckVisualization';
import DeckGLTruckVisualization from './DeckGLTruckVisualization';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { GlobeAltIcon, TruckIcon, MapIcon } from '@heroicons/react/24/outline';

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
}

export default function TruckVisualizationTabs({
  route,
  currentPosition,
  mapboxToken,
  cesiumToken,
}: TruckVisualizationTabsProps) {
  const [activeTab, setActiveTab] = useState('mapbox');

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
            <MapboxTruckVisualization
              route={route}
              currentPosition={currentPosition}
              mapboxToken={mapboxToken}
            />
          </div>
        </TabsContent>

        <TabsContent value="cesium" className="mt-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <CesiumTruckVisualization
              route={route}
              currentPosition={currentPosition}
              cesiumToken={cesiumToken}
            />
          </div>
        </TabsContent>

        <TabsContent value="deckgl" className="mt-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <DeckGLTruckVisualization
              route={route}
              currentPosition={currentPosition}
              mapboxToken={mapboxToken}
            />
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
                {currentPosition?.name || route[Math.floor(route.length * 0.7)].name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Speed</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {currentPosition?.speed.toFixed(1) ||
                  route[Math.floor(route.length * 0.7)].speed.toFixed(1)}{' '}
                mph
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Update</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {new Date(
                  currentPosition?.timestamp || route[Math.floor(route.length * 0.7)].timestamp
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
              <p className="text-lg font-bold text-gray-900 dark:text-white">{route[0].name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Destination</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {route[route.length - 1].name}
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
