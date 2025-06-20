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

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon, 
  ForwardIcon, 
  BackwardIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { HistoricalRoute, RoutePoint } from '@/services/telematicsService';

interface RouteHistoryPlaybackProps {
  historicalRoute: HistoricalRoute | null;
  onPositionChange?: (position: RoutePoint) => void;
  onPlaybackStateChange?: (isPlaying: boolean) => void;
}

export default function RouteHistoryPlayback({
  historicalRoute,
  onPositionChange,
  onPlaybackStateChange,
}: RouteHistoryPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 2x, 4x, 8x
  const [selectedTimeRange, setSelectedTimeRange] = useState<[number, number]>([0, 100]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalPoints = historicalRoute?.points.length || 0;

  // Calculate time range for the route
  const startTime = historicalRoute?.startTime ? new Date(historicalRoute.startTime) : null;
  const endTime = historicalRoute?.endTime ? new Date(historicalRoute.endTime) : null;
  const totalDuration = startTime && endTime ? endTime.getTime() - startTime.getTime() : 0;

  // Get current position
  const currentPosition = historicalRoute?.points[currentIndex] || null;

  // Playback control
  const startPlayback = useCallback(() => {
    if (!historicalRoute || totalPoints === 0) return;

    setIsPlaying(true);
    onPlaybackStateChange?.(true);

    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= totalPoints) {
          setIsPlaying(false);
          onPlaybackStateChange?.(false);
          return prevIndex; // Stay at last position
        }
        return nextIndex;
      });
    }, 1000 / playbackSpeed); // Adjust interval based on speed
  }, [historicalRoute, totalPoints, playbackSpeed, onPlaybackStateChange]);

  const pausePlayback = useCallback(() => {
    setIsPlaying(false);
    onPlaybackStateChange?.(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [onPlaybackStateChange]);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    onPlaybackStateChange?.(false);
    setCurrentIndex(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [onPlaybackStateChange]);

  const skipForward = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 10, totalPoints - 1));
  }, [totalPoints]);

  const skipBackward = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 10, 0));
  }, []);

  // Handle position changes
  useEffect(() => {
    if (currentPosition) {
      onPositionChange?.(currentPosition);
    }
  }, [currentPosition, onPositionChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle slider change
  const handleSliderChange = useCallback((value: number[]) => {
    const newIndex = Math.floor((value[0] / 100) * (totalPoints - 1));
    setCurrentIndex(newIndex);
  }, [totalPoints]);

  // Format time display
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!historicalRoute) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5" />
            <span>Route History Playback</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            <p>No historical route data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = totalPoints > 0 ? (currentIndex / (totalPoints - 1)) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5" />
            <span>Route History Playback</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {formatDuration(historicalRoute.totalDuration)} • {historicalRoute.totalDistance.toFixed(1)} miles
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timeline Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{startTime ? formatTime(startTime.toISOString()) : 'Start'}</span>
            <span>{endTime ? formatTime(endTime.toISOString()) : 'End'}</span>
          </div>
          <Slider
            value={[progressPercentage]}
            onValueChange={handleSliderChange}
            max={100}
            step={0.1}
            className="w-full"
            disabled={totalPoints === 0}
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Point {currentIndex + 1} of {totalPoints}</span>
            <span>{currentPosition ? formatTime(currentPosition.timestamp) : ''}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={skipBackward}
            disabled={currentIndex === 0}
          >
            <BackwardIcon className="h-4 w-4" />
          </Button>
          
          {isPlaying ? (
            <Button
              variant="outline"
              size="sm"
              onClick={pausePlayback}
            >
              <PauseIcon className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={startPlayback}
              disabled={currentIndex >= totalPoints - 1}
            >
              <PlayIcon className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={stopPlayback}
          >
            <StopIcon className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={skipForward}
            disabled={currentIndex >= totalPoints - 1}
          >
            <ForwardIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Speed Control */}
        <div className="flex items-center justify-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Speed:</span>
          {[0.5, 1, 2, 4, 8].map(speed => (
            <Button
              key={speed}
              variant={playbackSpeed === speed ? "default" : "outline"}
              size="sm"
              onClick={() => setPlaybackSpeed(speed)}
              className="px-2 py-1 text-xs"
            >
              {speed}x
            </Button>
          ))}
        </div>

        {/* Current Position Info */}
        {currentPosition && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Current Position</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Time:</span>
                <span className="ml-2">{formatTime(currentPosition.timestamp)}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Speed:</span>
                <span className="ml-2">{currentPosition.speed.toFixed(1)} mph</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Latitude:</span>
                <span className="ml-2">{currentPosition.latitude.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Longitude:</span>
                <span className="ml-2">{currentPosition.longitude.toFixed(6)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Route Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-gray-900 dark:text-white">
              {historicalRoute.averageSpeed.toFixed(1)} mph
            </div>
            <div className="text-gray-500 dark:text-gray-400">Avg Speed</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900 dark:text-white">
              {historicalRoute.maxSpeed.toFixed(1)} mph
            </div>
            <div className="text-gray-500 dark:text-gray-400">Max Speed</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900 dark:text-white">
              {historicalRoute.fuelConsumed.toFixed(1)} gal
            </div>
            <div className="text-gray-500 dark:text-gray-400">Fuel Used</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900 dark:text-white">
              {historicalRoute.events.length}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Events</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
