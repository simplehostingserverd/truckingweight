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

import React, { memo, useMemo } from 'react';
// Remove unused import since Driver type is not used in this component
import { SignalIcon, Battery0Icon, ClockIcon, WifiIcon } from '@heroicons/react/24/outline';
import { SignalSlashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface DriverHeaderProps {
  driverName: string;
  driverLicense?: string;
  companyName?: string;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  batteryLevel: number;
  lastUpdate: string | Date;
}

const DriverHeaderComponent = function DriverHeader({
  driverName,
  driverLicense,
  companyName,
  connectionStatus,
  batteryLevel,
  lastUpdate,
}: DriverHeaderProps) {
  const formatTime = useMemo(() => (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }, []);

  const formatDate = useMemo(() => (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const getBatteryColor = (level?: number) => {
    if (!level) return 'text-gray-400';
    if (level > 50) return 'text-green-400';
    if (level > 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBatteryIcon = (level?: number) => {
    if (!level) return '🔋';
    if (level > 75) return '🔋';
    if (level > 50) return '🔋';
    if (level > 25) return '🪫';
    return '🪫';
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between">
        {/* Left: Driver Info & Company Logo */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {driverName
              .split(' ')
              .map(name => name[0])
              .join('')
              .slice(0, 2)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white mb-1">{driverName}</h1>
            <div className="text-sm text-gray-400 space-y-1">
              {driverLicense && <p>License: {driverLicense}</p>}
              {companyName && <p>{companyName}</p>}
            </div>
          </div>
        </div>

        {/* Center: Time & Date */}
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{formatTime(new Date())}</div>
          <div className="text-sm text-gray-400">{formatDate(new Date())}</div>
        </div>

        {/* Right: Status Indicators */}
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-1">
            {connectionStatus === 'connected' ? (
              <>
                <WifiIcon className="w-5 h-5 text-green-400" />
                <SignalIcon className="w-5 h-5 text-green-400" />
              </>
            ) : connectionStatus === 'connecting' ? (
              <>
                <WifiIcon className="w-5 h-5 text-yellow-400 animate-pulse" />
                <SignalIcon className="w-5 h-5 text-yellow-400" />
              </>
            ) : (
              <>
                <SignalSlashIcon className="w-5 h-5 text-red-400" />
                <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
              </>
            )}
            <span
              className={`text-xs font-medium ${
                connectionStatus === 'connected'
                  ? 'text-green-400'
                  : connectionStatus === 'connecting'
                    ? 'text-yellow-400'
                    : 'text-red-400'
              }`}
            >
              {connectionStatus === 'connected'
                ? 'ONLINE'
                : connectionStatus === 'connecting'
                  ? 'CONNECTING'
                  : 'OFFLINE'}
            </span>
          </div>

          {/* Battery Level */}
          {batteryLevel && (
            <div className="flex items-center space-x-1">
              <span className="text-lg">{getBatteryIcon(batteryLevel)}</span>
              <span className={`text-xs font-medium ${getBatteryColor(batteryLevel)}`}>
                {batteryLevel}%
              </span>
            </div>
          )}

          {/* Last Update */}
          <div className="flex items-center space-x-1">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">
              Updated {Math.floor((Date.now() - new Date(lastUpdate).getTime()) / 1000)}s ago
            </span>
          </div>
        </div>
      </div>

      {/* Company Logo/Name - Optional */}
      <div className="mt-2 text-center">
        <span className="text-sm text-gray-500 font-medium">CargoScalePro TMS</span>
      </div>
    </header>
  );
};

// Export memoized component to prevent unnecessary re-renders
export default memo(DriverHeaderComponent);
