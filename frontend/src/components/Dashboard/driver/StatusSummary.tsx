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

import React from 'react';
import {
  ClockIcon,
  TruckIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

interface HOSStatus {
  driveTime: number;
  maxDriveTime: number;
  onDutyTime: number;
  maxOnDutyTime: number;
  restTime: number;
  requiredRestTime: number;
  status: 'compliant' | 'warning' | 'violation';
  nextBreakRequired?: string;
}

interface CargoStatus {
  currentWeight: number;
  maxWeight: number;
  loadStatus: 'empty' | 'partial' | 'full' | 'overweight';
  destination?: string;
  eta?: string;
  pickupTime?: string;
  deliveryTime?: string;
}

interface VehicleHealth {
  fuelLevel: number;
  engineStatus: 'good' | 'warning' | 'critical';
  maintenanceAlerts: string[];
  tirePressure: 'good' | 'low' | 'critical';
  brakeStatus: 'good' | 'warning' | 'critical';
  lastInspection?: string;
}

interface StatusSummaryProps {
  hos: HOSStatus;
  cargo: CargoStatus;
  vehicle: VehicleHealth;
}

export default function StatusSummary({ hos, cargo, vehicle }: StatusSummaryProps) {
  const getHOSStatusColor = () => {
    switch (hos.status) {
      case 'compliant':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'violation':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getHOSStatusIcon = () => {
    switch (hos.status) {
      case 'compliant':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'violation':
        return <ExclamationTriangleIcon className="w-5 h-5 animate-pulse" />;
      default:
        return <ClockIcon className="w-5 h-5" />;
    }
  };

  const getCargoStatusColor = () => {
    switch (cargo.loadStatus) {
      case 'empty':
        return 'text-gray-400';
      case 'partial':
        return 'text-blue-400';
      case 'full':
        return 'text-green-400';
      case 'overweight':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getVehicleStatusColor = () => {
    if (
      vehicle.engineStatus === 'critical' ||
      vehicle.brakeStatus === 'critical' ||
      vehicle.tirePressure === 'critical'
    ) {
      return 'text-red-400';
    }
    if (
      vehicle.engineStatus === 'warning' ||
      vehicle.brakeStatus === 'warning' ||
      vehicle.tirePressure === 'low'
    ) {
      return 'text-yellow-400';
    }
    return 'text-green-400';
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getProgressPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  return (
    <div className="status-summary">
      <h3 className="text-lg font-semibold text-white mb-3 text-center">Status Overview</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* HOS Status Card */}
        <div className="status-card bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-6 h-6 text-blue-400" />
              <h4 className="font-semibold text-white">Hours of Service</h4>
            </div>
            <div className={`flex items-center space-x-1 ${getHOSStatusColor()}`}>
              {getHOSStatusIcon()}
            </div>
          </div>

          {/* Drive Time Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">Drive Time</span>
              <span className={getHOSStatusColor()}>
                {formatTime(hos.driveTime)} / {formatTime(hos.maxDriveTime)}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  hos.status === 'violation'
                    ? 'bg-red-500'
                    : hos.status === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                }`}
                style={{ width: `${getProgressPercentage(hos.driveTime, hos.maxDriveTime)}%` }}
              ></div>
            </div>
          </div>

          {/* On Duty Time Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">On Duty</span>
              <span className={getHOSStatusColor()}>
                {formatTime(hos.onDutyTime)} / {formatTime(hos.maxOnDutyTime)}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  hos.status === 'violation'
                    ? 'bg-red-500'
                    : hos.status === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                }`}
                style={{ width: `${getProgressPercentage(hos.onDutyTime, hos.maxOnDutyTime)}%` }}
              ></div>
            </div>
          </div>

          {hos.nextBreakRequired && (
            <div className="text-xs text-yellow-400">⏰ Next break: {hos.nextBreakRequired}</div>
          )}

          <div className={`text-sm font-medium mt-2 ${getHOSStatusColor()}`}>
            Status: {hos.status.toUpperCase()}
          </div>
        </div>

        {/* Cargo Status Card */}
        <div className="status-card bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <CubeIcon className="w-6 h-6 text-green-400" />
              <h4 className="font-semibold text-white">Cargo Status</h4>
            </div>
            <div className={`text-sm font-medium ${getCargoStatusColor()}`}>
              {cargo.loadStatus.toUpperCase()}
            </div>
          </div>

          {/* Weight Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">Weight</span>
              <span className={getCargoStatusColor()}>
                {cargo.currentWeight.toLocaleString()} / {cargo.maxWeight.toLocaleString()} lbs
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  cargo.loadStatus === 'overweight'
                    ? 'bg-red-500'
                    : cargo.loadStatus === 'full'
                      ? 'bg-green-500'
                      : cargo.loadStatus === 'partial'
                        ? 'bg-blue-500'
                        : 'bg-gray-500'
                }`}
                style={{ width: `${getProgressPercentage(cargo.currentWeight, cargo.maxWeight)}%` }}
              ></div>
            </div>
          </div>

          {cargo.destination && (
            <div className="text-sm text-gray-300 mb-1">📍 To: {cargo.destination}</div>
          )}

          {cargo.eta && <div className="text-sm text-blue-400">🕒 ETA: {cargo.eta}</div>}

          {cargo.deliveryTime && (
            <div className="text-xs text-gray-400 mt-2">Delivery: {cargo.deliveryTime}</div>
          )}
        </div>

        {/* Vehicle Health Card */}
        <div className="status-card bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TruckIcon className="w-6 h-6 text-orange-400" />
              <h4 className="font-semibold text-white">Vehicle Health</h4>
            </div>
            <div className={`text-sm font-medium ${getVehicleStatusColor()}`}>
              {vehicle.engineStatus === 'good' &&
              vehicle.brakeStatus === 'good' &&
              vehicle.tirePressure === 'good'
                ? 'GOOD'
                : vehicle.engineStatus === 'critical' ||
                    vehicle.brakeStatus === 'critical' ||
                    vehicle.tirePressure === 'critical'
                  ? 'CRITICAL'
                  : 'WARNING'}
            </div>
          </div>

          {/* Fuel Level */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <div className="flex items-center space-x-1">
                <FunnelIcon className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Fuel</span>
              </div>
              <span
                className={
                  vehicle.fuelLevel < 25
                    ? 'text-red-400'
                    : vehicle.fuelLevel < 50
                      ? 'text-yellow-400'
                      : 'text-green-400'
                }
              >
                {vehicle.fuelLevel}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  vehicle.fuelLevel < 25
                    ? 'bg-red-500'
                    : vehicle.fuelLevel < 50
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                }`}
                style={{ width: `${vehicle.fuelLevel}%` }}
              ></div>
            </div>
          </div>

          {/* System Status */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Engine:</span>
              <span
                className={
                  vehicle.engineStatus === 'good'
                    ? 'text-green-400'
                    : vehicle.engineStatus === 'warning'
                      ? 'text-yellow-400'
                      : 'text-red-400'
                }
              >
                {vehicle.engineStatus.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Brakes:</span>
              <span
                className={
                  vehicle.brakeStatus === 'good'
                    ? 'text-green-400'
                    : vehicle.brakeStatus === 'warning'
                      ? 'text-yellow-400'
                      : 'text-red-400'
                }
              >
                {vehicle.brakeStatus.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tires:</span>
              <span
                className={
                  vehicle.tirePressure === 'good'
                    ? 'text-green-400'
                    : vehicle.tirePressure === 'low'
                      ? 'text-yellow-400'
                      : 'text-red-400'
                }
              >
                {vehicle.tirePressure.toUpperCase()}
              </span>
            </div>
          </div>

          {vehicle.maintenanceAlerts.length > 0 && (
            <div className="mt-2 text-xs text-yellow-400">
              ⚠️ {vehicle.maintenanceAlerts.length} maintenance alert(s)
            </div>
          )}

          {vehicle.lastInspection && (
            <div className="text-xs text-gray-400 mt-2">
              Last inspection: {vehicle.lastInspection}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
