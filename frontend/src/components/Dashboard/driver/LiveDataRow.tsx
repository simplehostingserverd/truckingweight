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
import { ScaleIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface LiveDataRowProps {
  weight?: number;
  weightLimit?: number;
  speed?: number;
  speedLimit?: number;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  isOverweight?: boolean;
  isOverSpeed?: boolean;
}

export default function LiveDataRow({
  weight = 0,
  weightLimit = 80000,
  speed = 0,
  speedLimit = 70,
  location,
  isOverweight = false,
  isOverSpeed = false,
}: LiveDataRowProps) {
  const formatWeight = (weight: number) => {
    return weight.toLocaleString() + ' lbs';
  };

  const formatSpeed = (speed: number) => {
    return Math.round(speed) + ' mph';
  };

  const getWeightPercentage = () => {
    return Math.min((weight / weightLimit) * 100, 100);
  };

  const getSpeedPercentage = () => {
    return Math.min((speed / speedLimit) * 100, 100);
  };

  const getWeightColor = () => {
    if (isOverweight) return 'text-red-400';
    if (weight > weightLimit * 0.9) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getSpeedColor = () => {
    if (isOverSpeed) return 'text-red-400';
    if (speed > speedLimit * 0.9) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getWeightBarColor = () => {
    if (isOverweight) return 'bg-red-500';
    if (weight > weightLimit * 0.9) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getSpeedBarColor = () => {
    if (isOverSpeed) return 'bg-red-500';
    if (speed > speedLimit * 0.9) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="live-data-row grid grid-cols-3 gap-4 bg-gray-800 rounded-lg p-4">
      {/* Weight Section */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <ScaleIcon className={`w-6 h-6 ${getWeightColor()}`} />
          {isOverweight && (
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 animate-pulse" />
          )}
        </div>

        <div className={`text-2xl font-bold ${getWeightColor()}`}>{formatWeight(weight)}</div>

        <div className="text-sm text-gray-400 mb-2">Limit: {formatWeight(weightLimit)}</div>

        {/* Weight Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getWeightBarColor()}`}
            style={{ width: `${getWeightPercentage()}%` }}
          ></div>
        </div>

        <div className="text-xs text-gray-500 mt-1">
          {Math.round(getWeightPercentage())}% of limit
        </div>

        {isOverweight && (
          <div className="text-xs text-red-400 font-medium mt-1 animate-pulse">⚠️ OVERWEIGHT</div>
        )}
      </div>

      {/* Speed Section */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className={`text-2xl ${getSpeedColor()}`}>🚛</div>
          {isOverSpeed && (
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 animate-pulse" />
          )}
        </div>

        <div className={`text-2xl font-bold ${getSpeedColor()}`}>{formatSpeed(speed)}</div>

        <div className="text-sm text-gray-400 mb-2">Limit: {speedLimit} mph</div>

        {/* Speed Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getSpeedBarColor()}`}
            style={{ width: `${getSpeedPercentage()}%` }}
          ></div>
        </div>

        <div className="text-xs text-gray-500 mt-1">
          {Math.round(getSpeedPercentage())}% of limit
        </div>

        {isOverSpeed && (
          <div className="text-xs text-red-400 font-medium mt-1 animate-pulse">⚠️ SPEEDING</div>
        )}
      </div>

      {/* Location Section */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <MapPinIcon className="w-6 h-6 text-blue-400" />
          <ClockIcon className="w-5 h-5 text-gray-400" />
        </div>

        <div className="text-lg font-semibold text-white">📍 Current Location</div>

        <div className="text-sm text-gray-300 mb-2">{location?.address || 'Updating...'}</div>

        {location && (
          <div className="text-xs text-gray-500">
            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </div>
        )}

        <div className="text-xs text-green-400 mt-2">🛰️ GPS Active</div>

        {/* Location Update Indicator */}
        <div className="flex items-center justify-center mt-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400 ml-1">Live</span>
        </div>
      </div>
    </div>
  );
}
