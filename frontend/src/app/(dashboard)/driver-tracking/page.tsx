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
import TruckVisualizationTabs from '@/components/TruckTracking/TruckVisualizationTabs';
import RouteHistoryPlayback from '@/components/TruckTracking/RouteHistoryPlayback';
import RouteHistorySelector from '@/components/TruckTracking/RouteHistorySelector';
import GeofencingPanel from '@/components/TruckTracking/GeofencingPanel';
import ETADisplay from '@/components/TruckTracking/ETADisplay';
import NotificationPanel from '@/components/TruckTracking/NotificationPanel';
import AnalyticsDashboard from '@/components/TruckTracking/AnalyticsDashboard';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useTelematics, useTelematicsHealth } from '@/hooks/useTelematics';
import { useVehicleGeofencing } from '@/hooks/useGeofencing';
import { useETA, useETAMonitoring } from '@/hooks/useETA';
import { useNotifications } from '@/hooks/useNotifications';
import { useAnalytics } from '@/hooks/useAnalytics';
import { RoutePoint } from '@/services/telematicsService';
import { GeofenceViolation } from '@/services/geofencingService';

interface DriverLocation {
  driverId: string;
  driverName: string;
  date: string;
  route: {
    lat: number;
    lng: number;
    name: string;
    timestamp: string;
    speed: number;
    fuelLevel: number;
    engineTemp: number;
  }[];
  currentPosition: {
    lat: number;
    lng: number;
    name: string;
    timestamp: string;
    speed: number;
  };
  vehicle: {
    id: number;
    name: string;
    type: string;
    model: string;
  };
  status: string;
  hoursOfService: {
    drivingHours: number;
    dutyHours: number;
    cycleHours: number;
  };
  lastUpdate: string;
  isOnline: boolean;
}

export default function DriverTrackingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverLocations, setDriverLocations] = useState<DriverLocation[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [activeDriverLocation, setActiveDriverLocation] = useState<DriverLocation | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // seconds
  const [isHistoryMode, setIsHistoryMode] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState<RoutePoint | null>(null);

  // Initialize Supabase client
  const supabase = createClient();

  // Telematics integration
  const selectedVehicleId = activeDriverLocation?.vehicle.id.toString();
  const telematicsData = useTelematics({
    vehicleId: selectedVehicleId,
    enableRealTime: true,
  });
  const { healthStatus } = useTelematicsHealth();

  // Geofencing integration
  const geofencingData = useVehicleGeofencing(
    selectedVehicleId || '',
    activeDriverLocation?.driverId || ''
  );

  // ETA integration
  const etaData = useETA({
    driverId: activeDriverLocation?.driverId || '',
    vehicleId: selectedVehicleId || '',
    autoUpdate: true,
  });

  // ETA monitoring for alerts
  const etaMonitoring = useETAMonitoring(etaData.currentETA);

  // Notification integration
  const notifications = useNotifications({
    vehicleId: selectedVehicleId,
    driverId: activeDriverLocation?.driverId,
    autoSubscribe: true,
  });

  // Analytics integration
  const analytics = useAnalytics({
    driverId: activeDriverLocation?.driverId,
    autoLoad: true,
  });

  // Fetch driver locations
  useEffect(() => {
    const fetchDriverLocations = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch real driver data from the database with vehicle assignments
        const { data: drivers, error: driversError } = await supabase
          .from('drivers')
          .select('id, name, company_id, status')
          .eq('status', 'active')
          .limit(10);

        if (driversError) {
          throw new Error(`Error fetching drivers: ${driversError.message}`);
        }

        // Fetch vehicles with current driver assignments and location data
        const { data: vehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .select(
            `
            id,
            name,
            type,
            model,
            current_driver_id,
            last_latitude,
            last_longitude,
            last_location,
            last_speed,
            fuel_level,
            engine_status,
            last_telematics_update
          `
          )
          .not('current_driver_id', 'is', null)
          .limit(10);

        if (vehiclesError) {
          throw new Error(`Error fetching vehicles: ${vehiclesError.message}`);
        }

        // Create driver locations with real driver and vehicle data
        const driverLocations = drivers
          .map((driver, index) => {
            // Find the vehicle assigned to this driver
            const assignedVehicle = vehicles.find(v => v.current_driver_id === driver.id);

            // If no vehicle assigned, skip this driver
            if (!assignedVehicle) {
              return null;
            }

            // Use real coordinates if available, otherwise use Dallas area as fallback
            const hasRealLocation = assignedVehicle.last_latitude && assignedVehicle.last_longitude;
            const baseLat = hasRealLocation
              ? Number(assignedVehicle.last_latitude)
              : 32.7767 + index * 0.05;
            const baseLng = hasRealLocation
              ? Number(assignedVehicle.last_longitude)
              : -96.797 - index * 0.03;

            // Generate a sample route with multiple points around the current/base location
            const routePoints = [];
            for (let i = 0; i < 5; i++) {
              routePoints.push({
                lat: baseLat + (i - 2) * 0.01, // Create route around current position
                lng: baseLng + (i - 2) * 0.01,
                name: i === 0 ? 'Origin' : i === 4 ? 'Destination' : `Waypoint ${i}`,
                timestamp: new Date(Date.now() - (4 - i) * 3600000).toISOString(),
                speed: assignedVehicle.last_speed || 55 + Math.random() * 10,
                fuelLevel: assignedVehicle.fuel_level || Math.floor(Math.random() * 100),
                engineTemp: 180 + Math.random() * 20, // Normal operating temp
              });
            }

            return {
              driverId: driver.id.toString(),
              driverName: driver.name,
              route: routePoints,
              currentPosition: {
                lat: baseLat,
                lng: baseLng,
                name: assignedVehicle.last_location || 'Current Location',
                timestamp: assignedVehicle.last_telematics_update || new Date().toISOString(),
                speed: assignedVehicle.last_speed || 58 + Math.random() * 7,
              },
              vehicle: {
                id: assignedVehicle.id,
                name: assignedVehicle.name,
                type: assignedVehicle.type || 'Semi-Truck',
                model: assignedVehicle.model || 'Unknown Model',
              },
              status: assignedVehicle.engine_status === 'running' ? 'Driving' : 'On Duty',
              hoursOfService: {
                drivingHours: Math.floor(Math.random() * 8),
                dutyHours: Math.floor(Math.random() * 14),
                cycleHours: Math.floor(Math.random() * 60),
              },
              lastUpdate: assignedVehicle.last_telematics_update || new Date().toISOString(),
              isOnline: assignedVehicle.last_telematics_update
                ? new Date().getTime() -
                    new Date(assignedVehicle.last_telematics_update).getTime() <
                  300000 // 5 minutes
                : false,
            };
          })
          .filter(Boolean); // Remove null entries (drivers without vehicles)

        setDriverLocations(driverLocations);

        // Set the first driver as selected if none is selected
        if (!selectedDriver && driverLocations.length > 0) {
          setSelectedDriver(driverLocations[0].driverId);
          setActiveDriverLocation(driverLocations[0]);
        } else if (selectedDriver) {
          const selected = driverLocations.find(d => d.driverId === selectedDriver);
          if (selected) {
            setActiveDriverLocation(selected);
          }
        }
      } catch (err) {
        console.error('Failed to fetch driver locations:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchDriverLocations();

    // Set up interval for periodic updates
    const intervalId = setInterval(fetchDriverLocations, refreshInterval * 1000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [selectedDriver, refreshInterval]);

  // Handle driver selection
  const handleDriverChange = (driverId: string) => {
    setSelectedDriver(driverId);
    const selected = driverLocations.find(d => d.driverId === driverId);
    if (selected) {
      setActiveDriverLocation(selected);
    }
  };

  // Handle refresh interval change
  const handleRefreshIntervalChange = (interval: number) => {
    setRefreshInterval(interval);
  };

  // Handle route history date selection
  const handleHistoryDateRange = async (startDate: string, endDate: string) => {
    if (!selectedVehicleId) return;

    const startTime = new Date(startDate).toISOString();
    const endTime = new Date(endDate + 'T23:59:59').toISOString();

    await telematicsData.getHistoricalRoute(startTime, endTime);
  };

  // Handle playback position changes
  const handlePlaybackPositionChange = (position: RoutePoint) => {
    setPlaybackPosition(position);
  };

  // Handle playback state changes
  const handlePlaybackStateChange = (isPlaying: boolean) => {
    setIsHistoryMode(isPlaying);
  };

  // Handle geofence violations
  const handleGeofenceViolation = (violation: GeofenceViolation) => {
    // Send notification for geofence violation
    notifications.notifyGeofenceViolation(
      violation.vehicleId,
      violation.driverId,
      violation.zoneName,
      violation.violationType,
      violation.location
    );
    console.log('Geofence violation detected:', violation);
  };

  // Monitor vehicle position for geofence violations and ETA updates
  useEffect(() => {
    if (telematicsData.currentPosition && selectedVehicleId && activeDriverLocation?.driverId) {
      // Monitor geofences
      geofencingData.monitorPosition(
        telematicsData.currentPosition.latitude,
        telematicsData.currentPosition.longitude
      );

      // Calculate ETA to destination if route exists
      if (activeDriverLocation.route && activeDriverLocation.route.length > 0) {
        const destination = activeDriverLocation.route[activeDriverLocation.route.length - 1];
        etaData.calculateETA(
          telematicsData.currentPosition.latitude,
          telematicsData.currentPosition.longitude,
          destination.lat,
          destination.lng,
          destination.name
        );
      }
    }
  }, [telematicsData.currentPosition, selectedVehicleId, activeDriverLocation?.driverId, activeDriverLocation?.route, geofencingData, etaData]);

  // Monitor ETA alerts and send notifications
  useEffect(() => {
    if (etaMonitoring.hasAlerts && selectedVehicleId && activeDriverLocation?.driverId) {
      const latestAlert = etaMonitoring.alerts[0];
      if (latestAlert && latestAlert.type === 'alert') {
        // Extract delay minutes from alert message
        const delayMatch = latestAlert.message.match(/(\d+) minutes/);
        const delayMinutes = delayMatch ? parseInt(delayMatch[1]) : 30;

        notifications.notifyETADelay(
          selectedVehicleId,
          activeDriverLocation.driverId,
          delayMinutes,
          etaData.currentETA?.adjustedETA || ''
        );
      }
    }
  }, [etaMonitoring.alerts, selectedVehicleId, activeDriverLocation?.driverId, notifications, etaData.currentETA]);

  // Monitor speed violations
  useEffect(() => {
    if (telematicsData.currentPosition && selectedVehicleId && activeDriverLocation?.driverId) {
      const currentSpeed = telematicsData.currentPosition.speed;
      const speedLimit = 65; // Mock speed limit - in production, this would come from map data

      if (currentSpeed > speedLimit + 10) { // 10 mph over limit
        notifications.notifySpeedViolation(
          selectedVehicleId,
          activeDriverLocation.driverId,
          currentSpeed,
          speedLimit,
          {
            lat: telematicsData.currentPosition.latitude,
            lng: telematicsData.currentPosition.longitude,
            address: activeDriverLocation.currentPosition.name,
          }
        );
      }
    }
  }, [telematicsData.currentPosition, selectedVehicleId, activeDriverLocation?.driverId, activeDriverLocation?.route, geofencingData, etaData]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Live Driver Tracking</h1>

        <div className="flex space-x-4">
          <div>
            <label htmlFor="driver-select" className="sr-only">
              Select driver to track
            </label>
            <select
              id="driver-select"
              aria-label="Select driver to track"
              title="Choose a driver to view their live tracking information"
              className="w-[180px] rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={selectedDriver || ''}
              onChange={e => handleDriverChange(e.target.value)}
            >
              <option value="" disabled>
                Select Driver
              </option>
              {driverLocations.map(driver => (
                <option key={driver.driverId} value={driver.driverId}>
                  {driver.driverName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="refresh-interval-select" className="sr-only">
              Select refresh interval
            </label>
            <select
              id="refresh-interval-select"
              aria-label="Select refresh interval"
              title="Choose how often to refresh the tracking data"
              className="w-[180px] rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={refreshInterval}
              onChange={e => handleRefreshIntervalChange(Number(e.target.value))}
            >
              <option value="10">Refresh: 10s</option>
              <option value="30">Refresh: 30s</option>
              <option value="60">Refresh: 1m</option>
              <option value="300">Refresh: 5m</option>
            </select>
          </div>
        </div>
      </div>

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md mb-4">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Debug Info</h3>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <p>Mapbox Token: {process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? 'Available' : 'Missing'}</p>
            <p>Cesium Token: {process.env.NEXT_PUBLIC_CESIUM_TOKEN ? 'Available' : 'Missing'}</p>
            <p>Selected Driver: {selectedDriver || 'None'}</p>
            <p>Active Driver Location: {activeDriverLocation ? 'Available' : 'None'}</p>
            <p>Route Points: {activeDriverLocation?.route?.length || 0}</p>
            <p>
              Cesium Loaded:{' '}
              {typeof window !== 'undefined' && typeof window.Cesium !== 'undefined' ? 'Yes' : 'No'}
            </p>
            <p>Telematics Online: {telematicsData.isOnline ? 'Yes' : 'No'}</p>
            <p>
              Last Telematics Update:{' '}
              {telematicsData.lastUpdate
                ? new Date(telematicsData.lastUpdate).toLocaleTimeString()
                : 'Never'}
            </p>
            <p>
              Telematics Providers:{' '}
              {Array.from(healthStatus.entries())
                .map(([name, status]) => `${name}: ${status ? 'OK' : 'DOWN'}`)
                .join(', ')}
            </p>
          </div>
        </div>
      )}

      {loading && !activeDriverLocation ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading driver location data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeDriverLocation ? (
            <Tabs defaultValue="live" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="live">Live Tracking</TabsTrigger>
                <TabsTrigger value="history">Route History</TabsTrigger>
                <TabsTrigger value="geofencing">Geofencing</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="live" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Live Location</CardTitle>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-block h-3 w-3 rounded-full ${
                          activeDriverLocation.isOnline ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      ></span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {activeDriverLocation.isOnline ? 'Online' : 'Offline'} - Last updated:{' '}
                        {new Date(activeDriverLocation.lastUpdate).toLocaleTimeString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <TruckVisualizationTabs
                      route={activeDriverLocation.route || []}
                      currentPosition={isHistoryMode && playbackPosition ? {
                        lat: playbackPosition.latitude,
                        lng: playbackPosition.longitude,
                        name: 'Playback Position',
                        timestamp: playbackPosition.timestamp,
                        speed: playbackPosition.speed,
                      } : activeDriverLocation.currentPosition}
                      mapboxToken={
                        process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
                        'pk.eyJ1Ijoic2ltcGxlaG9zdGluZ3NlcnZlcmQiLCJhIjoiY21haTl1dXhpMGJ2bzJ1cTVlY2p4ajhzZCJ9.AUS7RZCMk1vnR4yQR5RAEQ'
                      }
                      cesiumToken={
                        process.env.NEXT_PUBLIC_CESIUM_TOKEN ||
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0YzMxZTQ1My1lODMwLTRlZTAtYmQwMC0zNzFhMzVjZjFkYWQiLCJpZCI6MTg3MzI0LCJpYXQiOjE3MDI0OTg5NTl9.U_qVSBPVJvFG5vNu7j7jgOA9jBNjqP_ZwCNIl3Xjmtw'
                      }
                    />
                  </CardContent>
                <CardFooter>
                  <div className="flex justify-between items-center w-full">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Driver: {activeDriverLocation.driverName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Vehicle: {activeDriverLocation.vehicle.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Current Speed: {activeDriverLocation.currentPosition.speed} mph
                    </p>
                  </div>
                </CardFooter>
              </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <RouteHistorySelector
                      onDateRangeSelect={handleHistoryDateRange}
                      isLoading={telematicsData.isLoading}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <RouteHistoryPlayback
                      historicalRoute={telematicsData.historicalRoute}
                      onPositionChange={handlePlaybackPositionChange}
                      onPlaybackStateChange={handlePlaybackStateChange}
                    />
                  </div>
                </div>

                {/* Historical Route Visualization */}
                {telematicsData.historicalRoute && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Historical Route Visualization</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TruckVisualizationTabs
                        route={telematicsData.historicalRoute.points.map(point => ({
                          lat: point.latitude,
                          lng: point.longitude,
                          name: 'Route Point',
                          timestamp: point.timestamp,
                          speed: point.speed,
                          fuelLevel: 50, // Mock data
                          engineTemp: 180, // Mock data
                        }))}
                        currentPosition={playbackPosition ? {
                          lat: playbackPosition.latitude,
                          lng: playbackPosition.longitude,
                          name: 'Playback Position',
                          timestamp: playbackPosition.timestamp,
                          speed: playbackPosition.speed,
                        } : undefined}
                        mapboxToken={
                          process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
                          'pk.eyJ1Ijoic2ltcGxlaG9zdGluZ3NlcnZlcmQiLCJhIjoiY21haTl1dXhpMGJ2bzJ1cTVlY2p4ajhzZCJ9.AUS7RZCMk1vnR4yQR5RAEQ'
                        }
                        cesiumToken={
                          process.env.NEXT_PUBLIC_CESIUM_TOKEN ||
                          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0YzMxZTQ1My1lODMwLTRlZTAtYmQwMC0zNzFhMzVjZjFkYWQiLCJpZCI6MTg3MzI0LCJpYXQiOjE3MDI0OTg5NTl9.U_qVSBPVJvFG5vNu7j7jgOA9jBNjqP_ZwCNIl3Xjmtw'
                        }
                      />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="geofencing" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <GeofencingPanel
                    vehicleId={selectedVehicleId}
                    onViolationAlert={handleGeofenceViolation}
                  />

                  {/* Geofence Map Visualization */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Geofence Zones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TruckVisualizationTabs
                        route={activeDriverLocation.route || []}
                        currentPosition={activeDriverLocation.currentPosition}
                        mapboxToken={
                          process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
                          'pk.eyJ1Ijoic2ltcGxlaG9zdGluZ3NlcnZlcmQiLCJhIjoiY21haTl1dXhpMGJ2bzJ1cTVlY2p4ajhzZCJ9.AUS7RZCMk1vnR4yQR5RAEQ'
                        }
                        cesiumToken={
                          process.env.NEXT_PUBLIC_CESIUM_TOKEN ||
                          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0YzMxZTQ1My1lODMwLTRlZTAtYmQwMC0zNzFhMzVjZjFkYWQiLCJpZCI6MTg3MzI0LCJpYXQiOjE3MDI0OTg5NTl9.U_qVSBPVJvFG5vNu7j7jgOA9jBNjqP_ZwCNIl3Xjmtw'
                        }
                        geofenceZones={geofencingData.zones}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <NotificationPanel
                  vehicleId={selectedVehicleId}
                  driverId={activeDriverLocation?.driverId}
                  maxNotifications={20}
                />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <AnalyticsDashboard
                  driverId={activeDriverLocation?.driverId}
                  driverMetrics={analytics.driverMetrics}
                  fleetMetrics={analytics.fleetMetrics}
                  reports={analytics.reports}
                  onGenerateReport={analytics.generateReport}
                  isLoading={analytics.isLoading}
                />
              </TabsContent>
            </Tabs>

            {/* Driver and Vehicle Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Driver Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Driver Name
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {activeDriverLocation.driverName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Current Location
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {activeDriverLocation.currentPosition.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          activeDriverLocation.status === 'Driving'
                            ? 'text-blue-600 dark:text-blue-400'
                            : activeDriverLocation.status === 'On Duty'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-yellow-600 dark:text-yellow-400'
                        }`}
                      >
                        {activeDriverLocation.status}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Vehicle
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {activeDriverLocation.vehicle.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Model
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {activeDriverLocation.vehicle.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Current Speed
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {activeDriverLocation.currentPosition.speed} mph
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ETA Display */}
              <ETADisplay
                etaData={etaData.currentETA}
                isLoading={etaData.isLoading}
                onRefresh={etaData.refresh}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-lg text-gray-500 dark:text-gray-400">
                Select a driver to view their location
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
