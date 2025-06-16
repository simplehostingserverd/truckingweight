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
import { Badge } from '@/components/ui';

interface SpeedometerGaugeProps {
  speed: number;
  maxSpeed?: number;
  speedLimit?: number;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  showDigital?: boolean;
  driverName?: string;
  vehicleId?: string;
}

export default function SpeedometerGauge({
  speed,
  maxSpeed = 100,
  speedLimit = 70,
  unit = 'mph',
  size = 'md',
  showDigital = true,
  driverName,
  vehicleId,
}: SpeedometerGaugeProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return { container: 'w-32 h-32', text: 'text-lg', label: 'text-xs' };
      case 'lg':
        return { container: 'w-64 h-64', text: 'text-4xl', label: 'text-base' };
      default:
        return { container: 'w-48 h-48', text: 'text-2xl', label: 'text-sm' };
    }
  };

  const sizeClasses = getSizeClasses();
  const speedPercentage = Math.min((speed / maxSpeed) * 100, 100);
  const speedLimitPercentage = (speedLimit / maxSpeed) * 100;
  const isOverSpeedLimit = speed > speedLimit;
  const isDangerous = speed > speedLimit * 1.15; // 15% over speed limit

  // Calculate needle rotation (180 degrees for half circle)
  const needleRotation = (speedPercentage / 100) * 180 - 90;

  const getSpeedColor = () => {
    if (isDangerous) return 'text-red-600';
    if (isOverSpeedLimit) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getGaugeColor = () => {
    if (isDangerous) return '#dc2626'; // red-600
    if (isOverSpeedLimit) return '#d97706'; // yellow-600
    return '#16a34a'; // green-600
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Vehicle/Driver Info */}
      {(vehicleId || driverName) && (
        <div className="text-center">
          {vehicleId && (
            <h3 className="font-semibold text-gray-800 dark:text-white">{vehicleId}</h3>
          )}
          {driverName && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{driverName}</p>
          )}
        </div>
      )}

      {/* Speedometer Gauge */}
      <div className={`relative ${sizeClasses.container}`}>
        {/* Gauge Background */}
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 200 200"
        >
          {/* Background Arc */}
          <path
            d="M 30 170 A 85 85 0 0 1 170 170"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* Speed Limit Indicator */}
          <path
            d="M 30 170 A 85 85 0 0 1 170 170"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${speedLimitPercentage * 4.4} 440`}
            opacity="0.6"
          />
          
          {/* Speed Arc */}
          <path
            d="M 30 170 A 85 85 0 0 1 170 170"
            fill="none"
            stroke={getGaugeColor()}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${speedPercentage * 4.4} 440`}
            className="transition-all duration-500"
          />
          
          {/* Speed Markers */}
          {[0, 20, 40, 60, 80, 100].map((marker) => {
            const angle = (marker / maxSpeed) * 180 - 90;
            const x1 = 100 + 75 * Math.cos((angle * Math.PI) / 180);
            const y1 = 100 + 75 * Math.sin((angle * Math.PI) / 180);
            const x2 = 100 + 85 * Math.cos((angle * Math.PI) / 180);
            const y2 = 100 + 85 * Math.sin((angle * Math.PI) / 180);
            
            return (
              <line
                key={marker}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#6b7280"
                strokeWidth="2"
              />
            );
          })}
          
          {/* Needle */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="25"
            stroke="#dc2626"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${needleRotation} 100 100)`}
            className="transition-transform duration-500"
          />
          
          {/* Center Dot */}
          <circle
            cx="100"
            cy="100"
            r="6"
            fill="#dc2626"
          />
        </svg>

        {/* Digital Speed Display */}
        {showDigital && (
          <div className="absolute inset-0 flex flex-col items-center justify-center mt-8">
            <div className={`font-bold ${sizeClasses.text} ${getSpeedColor()}`}>
              {Math.round(speed)}
            </div>
            <div className={`${sizeClasses.label} text-gray-500 dark:text-gray-400`}>
              {unit}
            </div>
          </div>
        )}

        {/* Speed Limit Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="text-xs text-center">
            <div className="text-gray-500 dark:text-gray-400">Limit</div>
            <div className="font-semibold">{speedLimit} {unit}</div>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex space-x-2">
        {isDangerous && (
          <Badge variant="destructive" className="animate-pulse">
            DANGEROUS SPEED
          </Badge>
        )}
        {isOverSpeedLimit && !isDangerous && (
          <Badge variant="warning">
            OVER LIMIT
          </Badge>
        )}
        {!isOverSpeedLimit && speed > 0 && (
          <Badge variant="success">
            SAFE SPEED
          </Badge>
        )}
        {speed === 0 && (
          <Badge variant="secondary">
            STOPPED
          </Badge>
        )}
      </div>

      {/* Speed Statistics */}
      <div className="text-center space-y-1">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Max Today: {Math.max(speed + Math.random() * 10, speedLimit + 5).toFixed(0)} {unit}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Avg Today: {(speed * 0.8).toFixed(0)} {unit}
        </div>
      </div>
    </div>
  );
}
