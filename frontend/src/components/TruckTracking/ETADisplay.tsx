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

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ClockIcon,
  MapPinIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  CloudIcon,
  UserIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { ETACalculation } from '@/services/etaService';

interface ETADisplayProps {
  etaData: ETACalculation | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  onSelectAlternativeRoute?: (routeId: string) => void;
}

export default function ETADisplay({
  etaData,
  isLoading = false,
  onRefresh,
  onSelectAlternativeRoute,
}: ETADisplayProps) {
  const [timeToDestination, setTimeToDestination] = useState<string>('');
  const [isDelayed, setIsDelayed] = useState(false);

  // Update countdown timer
  useEffect(() => {
    if (!etaData) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const eta = new Date(etaData.adjustedETA).getTime();
      const baseEta = new Date(etaData.baseETA).getTime();

      const timeDiff = eta - now;
      setIsDelayed(eta > baseEta);

      if (timeDiff <= 0) {
        setTimeToDestination('Arrived');
        return;
      }

      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeToDestination(`${hours}h ${minutes}m`);
      } else {
        setTimeToDestination(`${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [etaData]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400';
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High';
    if (confidence >= 60) return 'Medium';
    return 'Low';
  };

  if (!etaData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5" />
            <span>Estimated Arrival</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            <p>No destination selected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5" />
            <span>Estimated Arrival</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={isDelayed ? 'destructive' : 'default'} className="text-xs">
              {isDelayed ? 'Delayed' : 'On Time'}
            </Badge>
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main ETA Display */}
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {timeToDestination}
          </div>
          <div className="text-lg text-gray-600 dark:text-gray-400">
            Arriving at {formatTime(etaData.adjustedETA)}
          </div>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <MapPinIcon className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {etaData.destinationName}
            </span>
          </div>
        </div>

        {/* Confidence Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Confidence</span>
            <span className={`text-sm font-medium ${getConfidenceColor(etaData.confidence)}`}>
              {getConfidenceLabel(etaData.confidence)} ({etaData.confidence}%)
            </span>
          </div>
          <Progress value={etaData.confidence} className="h-2" />
        </div>

        {/* Delay Factors */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Factors Affecting ETA
          </h4>

          {/* Traffic */}
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <TruckIcon className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Traffic</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                {etaData.factors.traffic.delayMinutes > 0 ? '+' : ''}
                {Math.round(etaData.factors.traffic.delayMinutes)}m
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {etaData.factors.traffic.severity}
              </div>
            </div>
          </div>

          {/* Weather */}
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <CloudIcon className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Weather</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                {etaData.factors.weather.delayMinutes > 0 ? '+' : ''}
                {Math.round(etaData.factors.weather.delayMinutes)}m
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {etaData.factors.weather.conditions}
              </div>
            </div>
          </div>

          {/* Driver Behavior */}
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4 text-green-500" />
              <span className="text-sm">Driver Pattern</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                {etaData.factors.driverBehavior.adjustmentMinutes > 0 ? '+' : ''}
                {Math.round(etaData.factors.driverBehavior.adjustmentMinutes)}m
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Historical data</div>
            </div>
          </div>

          {/* Rest Stops */}
          {etaData.factors.restStops.requiredStops > 0 && (
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Rest Stops</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  +{Math.round(etaData.factors.restStops.totalRestTime)}m
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {etaData.factors.restStops.requiredStops} stops
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Route Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-gray-900 dark:text-white">
              {etaData.totalDistance.toFixed(1)} mi
            </div>
            <div className="text-gray-500 dark:text-gray-400">Distance</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900 dark:text-white">
              {formatTime(etaData.baseETA)}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Base ETA</div>
          </div>
        </div>

        {/* Alternative Routes */}
        {etaData.alternativeRoutes.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Alternative Routes
            </h4>
            {etaData.alternativeRoutes.map(route => (
              <div
                key={route.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <div className="text-sm font-medium">{route.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {route.distance.toFixed(1)} mi • {formatTime(route.eta)}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {route.timeSavings > 0 ? (
                    <Badge variant="default" className="text-xs">
                      -{Math.round(route.timeSavings)}m
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      +{Math.round(Math.abs(route.timeSavings))}m
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectAlternativeRoute?.(route.id)}
                    className="text-xs"
                  >
                    Select
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Last updated: {new Date(etaData.lastUpdated).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}
