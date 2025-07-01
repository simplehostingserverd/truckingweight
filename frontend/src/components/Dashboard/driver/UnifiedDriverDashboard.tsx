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

import React, { useEffect, useState, memo, useMemo } from 'react';
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
  SignalIcon,
} from '@heroicons/react/24/outline';
import {
  ExclamationTriangleIcon as ExclamationTriangleSolid,
  HeartIcon as HeartSolid,
  MapPinIcon as MapPinSolid,
} from '@heroicons/react/24/solid';

interface UnifiedDriverDashboardProps {
  driverId: string;
  driverName: string;
  driverLicense?: string;
  driverPhone?: string;
  companyName?: string;
  companyId?: string;
}

const UnifiedDriverDashboardComponent = function UnifiedDriverDashboard({
  driverId,
  driverName,
  driverLicense,
  driverPhone,
  companyName,
  companyId,
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
    refetch,
    acknowledgeAlert,
    updateDriverStatus,
    reportIncident,
    logBreak,
  } = useDriverDashboardData(driverId);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Optimized data refresh strategy
  useEffect(() => {
    let criticalInterval: NodeJS.Timeout;
    let nonCriticalInterval: NodeJS.Timeout;

    // Critical data (alerts, telematics) - every 10 seconds
    criticalInterval = setInterval(() => {
      refetch(['alerts', 'telematics']);
      setLastRefresh(Date.now());
    }, 10000);

    // Non-critical data (cargo, load, activity) - every 60 seconds
    nonCriticalInterval = setInterval(() => {
      refetch(['cargo', 'load', 'activity', 'vehicle']);
    }, 60000);

    return () => {
      clearInterval(criticalInterval);
      clearInterval(nonCriticalInterval);
    };
  }, [refetch]);

  const handleVoiceCommand = (command: string, transcript: string) => {
    console.log('Voice command received:', command, transcript);
    // TODO: Implement voice command processing
  };

  const handleEmergencyActivated = (location?: { lat: number; lng: number }) => {
    console.log('Emergency activated at:', location);
    reportIncident({
      type: 'emergency',
      description: 'Emergency button activated',
      location: location ? `${location.lat}, ${location.lng}` : 'Unknown location',
      timestamp: new Date().toISOString()
    });
  };

  const handleRecordVoice = () => {
    console.log('Recording voice for incident report');
    // TODO: Implement voice recording functionality
    alert('Voice recording feature will be implemented');
  };

  const handleTakePhoto = () => {
    console.log('Taking photo for incident report');
    // TODO: Implement camera functionality
    alert('Camera feature will be implemented');
  };

  const handleViolationsClick = () => {
    console.log('Violations button clicked');
    // TODO: Navigate to violations page
    alert('Violations page will be implemented');
  };

  const handleMessagesClick = () => {
    console.log('Messages button clicked');
    // TODO: Navigate to messages page
    alert('Messages page will be implemented');
  };

  const handleNavigationClick = () => {
    console.log('Navigation button clicked');
    // TODO: Open navigation/GPS functionality
    alert('Navigation feature will be implemented');
  };

  const handleMenuClick = () => {
    console.log('Menu button clicked');
    // TODO: Open main menu
    alert('Menu will be implemented');
  };

  const handleAcknowledgeAlert = () => {
    if (alertsData && alertsData.length > 0) {
      const firstAlert = alertsData[0];
      acknowledgeAlert(firstAlert.id);
    }
  };

  // Memoize loading and error states to prevent unnecessary re-renders
  const loadingState = useMemo(() => {
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
    return null;
  }, [isLoading]);

  const errorState = useMemo(() => {
    if (error) {
      return (
        <div className="h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <p className="text-lg text-red-400 mb-4">Error loading dashboard</p>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => refetch()}
              className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return null;
  }, [error, refetch]);

  if (loadingState) return loadingState;
  if (errorState) return errorState;

  return (
    <div className="h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 text-sm">
        <div className="text-cyan-400 font-semibold">
          {currentTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: false,
          })}
        </div>
        <div className="flex items-center space-x-1">
          <WifiIcon className="h-4 w-4 text-cyan-400" />
          <SignalIcon className="h-4 w-4 text-cyan-400" />
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
          <button 
            onClick={handleAcknowledgeAlert}
            className="bg-gray-900 rounded-2xl p-4 border border-gray-800 hover:border-orange-400 transition-colors w-full text-left"
          >
            <div className="flex items-center space-x-2 mb-3">
              <ExclamationTriangleSolid className={`h-5 w-5 ${
                alertsData && alertsData.length > 0 ? 'text-red-400' : 'text-orange-400'
              }`} />
              <span className={`text-xs font-semibold uppercase tracking-wide ${
                alertsData && alertsData.length > 0 ? 'text-red-400' : 'text-orange-400'
              }`}>
                Real-time
              </span>
            </div>
            <div className={`text-xs font-semibold uppercase mb-1 ${
              alertsData && alertsData.length > 0 ? 'text-red-400' : 'text-orange-400'
            }`}>
              Safety Alerts
            </div>
            <div className="text-white text-sm font-medium">
              {alertsData && alertsData.length > 0 
                ? alertsData[0].message 
                : 'All systems normal'
              }
            </div>
            {alertsData && alertsData.length > 1 && (
              <div className="text-gray-400 text-xs mt-1">
                +{alertsData.length - 1} more alert{alertsData.length > 2 ? 's' : ''}
              </div>
            )}
            {alertsData && alertsData.length > 0 && (
              <div className="text-xs text-orange-400 mt-2 font-semibold">
                Tap to acknowledge
              </div>
            )}
          </button>

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
                <div className="text-cyan-400 text-lg font-bold">
                  {cargoData?.currentWeight?.toLocaleString() || '0'} <span className="text-sm">kg</span>
                </div>
                {cargoData?.isOverweight && (
                  <div className="text-red-400 text-xs font-semibold">OVERWEIGHT</div>
                )}
              </div>
              <div>
                <div className="text-white text-xs">Temperature</div>
                <div className="text-cyan-400 text-lg font-bold">
                  {telematicsData?.location ? '2.6°C' : '--'}
                </div>
              </div>
            </div>
          </div>

          {/* Route Optimization */}
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <MapPinSolid className="h-5 w-5 text-blue-400" />
                <span className="text-blue-400 text-xs font-semibold uppercase tracking-wide">
                  Route
                </span>
              </div>
              <div className={`text-xs font-semibold ${
                loadData?.status === 'in_transit' ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {loadData?.status === 'in_transit' ? 'OPTIMIZED' : 'PLANNING'}
              </div>
            </div>
            <div className="text-blue-400 text-xs font-semibold uppercase mb-2">
              Next Destination
            </div>
            <div className="text-white text-sm font-medium mb-3">
              {loadData?.destination || 'Calgary Distribution Center'}
            </div>
            
            {/* Route visualization */}
            <div className="relative h-20 bg-gray-800 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-1 bg-gray-700 relative">
                  <div className="absolute left-0 w-3 h-3 bg-green-400 rounded-full -top-1"></div>
                  <div className="absolute left-1/3 w-2 h-2 bg-blue-400 rounded-full -top-0.5"></div>
                  <div className="absolute right-0 w-3 h-3 bg-red-400 rounded-full -top-1"></div>
                  <div className="absolute left-0 w-1/3 h-1 bg-green-400"></div>
                </div>
              </div>
              <div className="absolute bottom-1 left-0 text-xs text-green-400">
                {loadData?.origin || 'Start'}
              </div>
              <div className="absolute bottom-1 left-1/3 text-xs text-blue-400">Current</div>
              <div className="absolute bottom-1 right-0 text-xs text-red-400">
                {loadData?.destination || 'End'}
              </div>
            </div>
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
            <div className="text-orange-400 text-xs font-semibold uppercase mb-3">
              Incident Reporting
            </div>

            <div className="flex justify-center space-x-4">
              <button
                className="bg-gray-800 p-3 rounded-full border border-gray-700 hover:border-orange-400 transition-colors"
                title="Record Voice"
                aria-label="Record voice for incident reporting"
              >
                <MicrophoneIcon className="h-6 w-6 text-orange-400" />
              </button>
              <button
                className="bg-gray-800 p-3 rounded-full border border-gray-700 hover:border-orange-400 transition-colors"
                title="Take Photo"
                aria-label="Take photo for incident reporting"
              >
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
};

// Export memoized component to prevent unnecessary re-renders
export default memo(UnifiedDriverDashboardComponent);
