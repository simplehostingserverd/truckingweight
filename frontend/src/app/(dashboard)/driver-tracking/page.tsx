/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  BellIcon,
  ChartBarIcon,
  EyeIcon,
  TruckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

// Import our new comprehensive components
import LiveTrackingMap from '@/components/DriverTracking/LiveTrackingMap';
import RouteHistory from '@/components/DriverTracking/RouteHistory';
import EnhancedGeofencing from '@/components/DriverTracking/EnhancedGeofencing';
import NotificationCenter from '@/components/DriverTracking/NotificationCenter';
import DriverAnalyticsDashboard from '@/components/DriverTracking/DriverAnalyticsDashboard';

export default function DriverTrackingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');

  const handleNotificationAction = (notificationId: string, actionId: string) => {
    console.log(`Notification ${notificationId} action: ${actionId}`);
    // Handle notification actions here
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Driver Tracking System</h1>
          <p className="text-muted-foreground">
            Comprehensive real-time monitoring, analytics, and management for your fleet
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <TruckIcon className="mr-2 h-4 w-4" />
            Fleet Overview
          </Button>
          <Button>
            <EyeIcon className="mr-2 h-4 w-4" />
            Live View
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">
              +5 from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Schedule</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">
              87.5% on-time rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Safety Score</CardTitle>
            <ShieldCheckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              +3.1% from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">2</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="live-tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="route-history">Route History</TabsTrigger>
          <TabsTrigger value="geofencing">Geofencing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <DriverAnalyticsDashboard 
            timeRange={timeRange as any}
            onTimeRangeChange={handleTimeRangeChange}
          />
        </TabsContent>

        {/* Live Tracking Tab */}
        <TabsContent value="live-tracking" className="space-y-6">
          <LiveTrackingMap />
        </TabsContent>

        {/* Route History Tab */}
        <TabsContent value="route-history" className="space-y-6">
          <RouteHistory />
        </TabsContent>

        {/* Geofencing Tab */}
        <TabsContent value="geofencing" className="space-y-6">
          <EnhancedGeofencing />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <NotificationCenter onNotificationAction={handleNotificationAction} />
        </TabsContent>
      </Tabs>

      {/* Quick Access Cards for Overview */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('live-tracking')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPinIcon className="h-5 w-5 text-blue-500" />
                Live Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Real-time GPS tracking with route optimization and ETA monitoring
              </p>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>32 drivers active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('geofencing')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                Geofencing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Advanced zone management with real-time violation alerts
              </p>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>3 active violations</span>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('notifications')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellIcon className="h-5 w-5 text-orange-500" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Intelligent alert system with escalation and response tracking
              </p>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>2 critical alerts</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
