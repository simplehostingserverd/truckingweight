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

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui';
import RouteMap3D from '@/components/driver-activity/RouteMap3D';

interface DriverActivity {
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
  stats: {
    totalMiles: number;
    drivingTime: string;
    restTime: string;
    fuelConsumption: string;
    averageSpeed: number;
    maxSpeed: number;
    hardBrakes: number;
    hardAccelerations: number;
    idleTime: string;
  };
  vehicle: {
    id: number;
    name: string;
    type: string;
    model: string;
  };
}

export default function DriverActivityPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverActivity, setDriverActivity] = useState<DriverActivity | null>(null);
  const [selectedDriver, setSelectedDriver] = useState('1');
  const [dateRange, setDateRange] = useState('week');

  useEffect(() => {
    const fetchDriverActivity = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/reports/driver-activity?driverId=${selectedDriver}&dateRange=${dateRange}`
        );

        if (!response.ok) {
          throw new Error(`Error fetching driver activity: ${response.status}`);
        }

        const data = await response.json();
        setDriverActivity(data);
      } catch (err) {
        console.error('Failed to fetch driver activity:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverActivity();
  }, [selectedDriver, dateRange]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Driver Activity Report</h1>

        <div className="flex space-x-4">
          <div>
            <select
              className="w-[180px] rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={selectedDriver}
              onChange={e => setSelectedDriver(e.target.value)}
            >
              <option value="1">John Driver</option>
              <option value="2">Sarah Smith</option>
            </select>
          </div>

          <div>
            <select
              className="w-[180px] rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading driver activity data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Route Map</CardTitle>
            </CardHeader>
            <CardContent>
              <RouteMap3D
                route={driverActivity?.route || []}
                currentPosition={driverActivity?.currentPosition}
              />
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {driverActivity?.date}
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Driver Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Miles
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {driverActivity?.stats.totalMiles} mi
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Driving Time
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {driverActivity?.stats.drivingTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rest Time</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {driverActivity?.stats.restTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Fuel Consumption
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {driverActivity?.stats.fuelConsumption}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Average Speed
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {driverActivity?.stats.averageSpeed} mph
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Max Speed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {driverActivity?.stats.maxSpeed} mph
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Hard Brakes
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {driverActivity?.stats.hardBrakes}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Hard Accelerations
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {driverActivity?.stats.hardAccelerations}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Idle Time</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {driverActivity?.stats.idleTime}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Driver: {driverActivity?.driverName}
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle ID</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {driverActivity?.vehicle.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Vehicle Name
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {driverActivity?.vehicle.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Vehicle Type
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {driverActivity?.vehicle.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Vehicle Model
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {driverActivity?.vehicle.model}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
