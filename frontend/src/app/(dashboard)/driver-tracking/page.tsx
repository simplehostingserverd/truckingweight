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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

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
}

export default function DriverTrackingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverLocations, setDriverLocations] = useState<DriverLocation[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [activeDriverLocation, setActiveDriverLocation] = useState<DriverLocation | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // seconds

  // Initialize Supabase client
  const supabase = createClient();

  // Fetch driver locations
  useEffect(() => {
    const fetchDriverLocations = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch real driver data from the database
        const { data: drivers, error: driversError } = await supabase
          .from('drivers')
          .select('id, name, company_id')
          .limit(5);

        if (driversError) {
          throw new Error(`Error fetching drivers: ${driversError.message}`);
        }

        // Fetch vehicles for these drivers
        const { data: vehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('id, name')
          .limit(5);

        if (vehiclesError) {
          throw new Error(`Error fetching vehicles: ${vehiclesError.message}`);
        }

        // Create driver locations with real driver and vehicle data
        const driverLocations = drivers.map((driver, index) => {
          // Get a vehicle for this driver
          const vehicle = vehicles[index % vehicles.length];

          // Base coordinates (Dallas, TX)
          const baseLat = 32.7767;
          const baseLng = -96.797;

          // Generate a sample route with multiple points
          const routePoints = [];
          for (let i = 0; i < 5; i++) {
            routePoints.push({
              lat: baseLat + index * 0.05 + i * 0.01,
              lng: baseLng - index * 0.03 - i * 0.01,
              name: i === 0 ? 'Origin' : i === 4 ? 'Destination' : `Waypoint ${i}`,
              timestamp: new Date(Date.now() - (4 - i) * 3600000).toISOString(),
              speed: 55 + Math.random() * 10,
            });
          }

          return {
            driverId: driver.id.toString(),
            driverName: driver.name,
            route: routePoints,
            currentPosition: {
              lat: baseLat + index * 0.05,
              lng: baseLng - index * 0.03,
              name: 'On Route - Highway 35',
              timestamp: new Date().toISOString(),
              speed: 58 + Math.random() * 7,
            },
            vehicle: {
              id: vehicle.id,
              name: vehicle.name,
              type: 'Semi-Truck',
              model: 'Freightliner Cascadia',
            },
            status: index % 3 === 0 ? 'On Duty' : index % 3 === 1 ? 'Driving' : 'Rest',
            hoursOfService: {
              drivingHours: Math.floor(Math.random() * 8),
              dutyHours: Math.floor(Math.random() * 14),
              cycleHours: Math.floor(Math.random() * 60),
            },
          };
        });

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Live Driver Tracking</h1>

        <div className="flex space-x-4">
          <div>
            <select
              aria-label="Select driver to track"
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
            <select
              aria-label="Select refresh interval"
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
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Live Location</CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className="inline-block h-3 w-3 rounded-full bg-green-500"></span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Last updated: {new Date().toLocaleTimeString()}
                    </span>
                  </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          Active
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
              </div>
            </>
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
