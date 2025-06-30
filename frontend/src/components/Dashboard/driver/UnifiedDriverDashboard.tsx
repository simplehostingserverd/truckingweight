/*
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

import React, { useEffect, useState } from 'react';
import { useDriverDashboardData } from '@/hooks/useDriverDashboardData';
import { 
  ExclamationTriangleIcon, 
  HeartIcon, 
  TruckIcon, 
  MapIcon,
  ChartBarIcon,
  MicrophoneIcon,
  CameraIcon,
  ExclamationCircleIcon,
  EnvelopeIcon,
  MapPinIcon,
  Bars3Icon,
  WifiIcon,
  BatteryIcon
} from '@heroicons/react/24/outline';
import { 
  ExclamationTriangleIcon as ExclamationTriangleSolid,
  HeartIcon as HeartSolid
} from '@heroicons/react/24/solid';

interface UnifiedDriverDashboardProps {
  driverId: string;
  driverName: string;
  driverLicense?: string;
  driverPhone?: string;
  companyName?: string;
  companyId?: string;
}

export default function UnifiedDriverDashboard({ 
  driverId, 
  driverName, 
  driverLicense, 
  driverPhone, 
  companyName, 
  companyId 
}: UnifiedDriverDashboardProps) {
  const {
    cargoData,
    telematicsData,
    alertsData,
    hosData,
    loadData,
    vehicleData,
    recentActivity,
    isLoading,
    error,
    refreshData,
    acknowledgeAlert,
    updateDriverStatus,
    reportIncident,
    logBreak
  } = useDriverDashboardData(driverId);

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-refresh for non-critical data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Real-time updates for critical data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const handleVoiceCommand = (command: string, transcript: string) => {
    console.log('Voice command received:', command, transcript);
  };

  const handleEmergencyActivated = (location?: { lat: number; lng: number }) => {
    console.log('Emergency activated at:', location);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-lg text-cyan-400">Loading TMS Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <p className="text-lg text-red-400 mb-4">Error loading dashboard</p>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => refreshData(true)}
            className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 text-sm">
        <div className="text-cyan-400 font-semibold">
          {currentTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: false 
          })}
        </div>
        <div className="flex items-center space-x-1">
          <WifiIcon className="h-4 w-4 text-cyan-400" />
          <BatteryIcon className="h-4 w-4 text-cyan-400" />
        </div>
      </div>

      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-cyan-400 tracking-wider">TMS DASHBOARD</h1>
          <div className="text-cyan-400">••</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Top Row - Safety Alerts & Health */}
        <div className="grid grid-cols-2 gap-4">
          {/* Real-time Safety Alerts */}
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <div className="flex items-center space-x-2 mb-3">
              <ExclamationTriangleSolid className="h-5 w-5 text-orange-400" />
              <span className="text-orange-400 text-xs font-semibold uppercase tracking-wide">Real-time</span>
            </div>
            <div className="text-orange-400 text-xs font-semibold uppercase mb-1">Safety Alerts</div>
            <div className="text-white text-sm font-medium">Lane departure warning</div>
          </div>

          {/* Health Status */}
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <div className="flex items-center justify-center mb-2">
              <HeartSolid className="h-8 w-8 text-cyan-400" />
            </div>
            <div className="text-center">
              <div className="text-white text-lg font-bold">Fatigued</div>
            </div>
          </div>
        </div>

        {/* Middle Row - Cargo & Route */}
        <div className="grid grid-cols-2 gap-4">
          {/* Cargo */}
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <div className="text-cyan-400 text-xs font-semibold uppercase mb-3">Cargo</div>
            
            {/* 3D Truck Visualization */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                {/* Truck outline */}
                <div className="w-16 h-10 border-2 border-cyan-400 rounded-sm relative">
                  {/* Cargo boxes */}
                  <div className="absolute inset-1 flex items-center justify-center">
                    <div className="w-4 h-4 bg-orange-400 rounded-sm mr-1"></div>
                    <div className="w-4 h-4 bg-orange-400 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <div className="text-white text-xs">Weight</div>
                <div className="text-cyan-400 text-lg font-bold">35,220 <span className="text-sm">kg</span></div>
              </div>
              <div>
                <div className="text-white text-xs">Temperature</div>
                <div className="text-cyan-400 text-lg font-bold">2.6°C</div>
              </div>
            </div>
          </div>

          {/* Route Optimization */}
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <div className="text-cyan-400 text-xs font-semibold uppercase mb-3">Route</div>
            <div className="text-cyan-400 text-xs font-semibold uppercase mb-2">Optimization</div>
            
            {/* Route visualization */}
            <div className="relative h-16 mb-3">
              <svg className="w-full h-full" viewBox="0 0 100 60">
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1f2937" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100" height="60" fill="url(#grid)" />
                
                {/* Route line */}
                <path 
                  d="M 10 45 Q 30 20 50 30 Q 70 40 90 15" 
                  fill="none" 
                  stroke="#f59e0b" 
                  strokeWidth="2"
                  className="animate-pulse"
                />
                
                {/* Route points */}
                <circle cx="10" cy="45" r="2" fill="#06b6d4" />
                <circle cx="90" cy="15" r="2" fill="#f59e0b" />
              </svg>
            </div>
            
            <div className="text-cyan-400 text-lg font-bold">2.6°C</div>
          </div>
        </div>

        {/* Bottom Row - Performance & Incident */}
        <div className="grid grid-cols-2 gap-4">
          {/* Performance Analytics */}
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <div className="text-cyan-400 text-xs font-semibold uppercase mb-2">Performance</div>
            <div className="text-cyan-400 text-xs font-semibold uppercase mb-3">Analytics</div>
            
            {/* Performance chart */}
            <div className="h-12 flex items-end space-x-1 mb-2">
              <svg className="w-full h-full" viewBox="0 0 60 40">
                <path 
                  d="M 5 35 Q 15 25 25 30 Q 35 20 45 15 Q 55 10 60 5" 
                  fill="none" 
                  stroke="#06b6d4" 
                  strokeWidth="2"
                  className="animate-pulse"
                />
              </svg>
            </div>
          </div>

          {/* Incident Reporting */}
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <div className="text-orange-400 text-xs font-semibold uppercase mb-3">Incident Reporting</div>
            
            <div className="flex justify-center space-x-4">
              <button className="bg-gray-800 p-3 rounded-full border border-gray-700 hover:border-orange-400 transition-colors">
                <MicrophoneIcon className="h-6 w-6 text-orange-400" />
              </button>
              <button className="bg-gray-800 p-3 rounded-full border border-gray-700 hover:border-orange-400 transition-colors">
                <CameraIcon className="h-6 w-6 text-orange-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-gray-900 border-t border-gray-800">
        <div className="grid grid-cols-4 py-3">
          <button className="flex flex-col items-center space-y-1 text-cyan-400">
            <ExclamationCircleIcon className="h-6 w-6" />
            <span className="text-xs font-medium">VIOLATIONS</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-cyan-400">
            <EnvelopeIcon className="h-6 w-6" />
            <span className="text-xs font-medium">MESSAGES</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-cyan-400">
            <MapPinIcon className="h-6 w-6" />
            <span className="text-xs font-medium">NAVIGATION</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-cyan-400">
            <Bars3Icon className="h-6 w-6" />
            <span className="text-xs font-medium">MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
}