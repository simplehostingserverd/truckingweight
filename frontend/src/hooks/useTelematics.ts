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

import { useCallback, useEffect, useState } from 'react';
import {
  telematicsService,
  VehiclePosition,
  TelematicsEvent,
  HistoricalRoute,
} from '@/services/telematicsService';

export interface UseTelematicsOptions {
  vehicleId?: string;
  enableRealTime?: boolean;
  updateInterval?: number;
}

export interface TelematicsData {
  currentPosition: VehiclePosition | null;
  historicalRoute: HistoricalRoute | null;
  events: TelematicsEvent[];
  _isLoading: boolean;
  _error: string | null;
  isOnline: boolean;
  lastUpdate: string | null;
}

export function useTelematics(_options: UseTelematicsOptions = {}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { vehicleId, enableRealTime = true, updateInterval = 10000 } = options;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = useState<TelematicsData>({
    currentPosition: null,
    historicalRoute: null,
    events: [],
    _isLoading: false,
    _error: null,
    isOnline: false,
    lastUpdate: null,
  });

  // Real-time position updates
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePositionUpdate = useCallback((position: VehiclePosition) => {
    setData(prev => ({
      ...prev,
      currentPosition: position,
      isOnline: true,
      lastUpdate: position.timestamp,
      _error: null,
    }));
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!vehicleId || !enableRealTime) return;

    telematicsService.subscribeToVehicleUpdates(vehicleId, handlePositionUpdate);

    return () => {
      telematicsService.unsubscribeFromVehicleUpdates(vehicleId, handlePositionUpdate);
    };
  }, [vehicleId, enableRealTime, handlePositionUpdate]);

  // Get current position
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getCurrentPosition = useCallback(async () => {
    if (!vehicleId) return;

    setData(prev => ({ ...prev, _isLoading: true, _error: null }));

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const position = await telematicsService.getCurrentPosition(vehicleId);
      if (position) {
        setData(prev => ({
          ...prev,
          currentPosition: position,
          isOnline: true,
          lastUpdate: position.timestamp,
          _isLoading: false,
        }));
      } else {
        setData(prev => ({
          ...prev,
          isOnline: false,
          _isLoading: false,
          error: 'Failed to get current position',
        }));
      }
    } catch (error) {
      setData(prev => ({
        ...prev,
        _isLoading: false,
        _error: _error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    }
  }, [_vehicleId]);

  // Get historical route
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getHistoricalRoute = useCallback(
    async (_startTime: string, _endTime: string) => {
      if (!vehicleId) return;

      setData(prev => ({ ...prev, _isLoading: true, _error: null }));

      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const route = await telematicsService.getHistoricalRoute(vehicleId, startTime, endTime);
        setData(prev => ({
          ...prev,
          historicalRoute: route,
          _isLoading: false,
        }));
      } catch (error) {
        setData(prev => ({
          ...prev,
          _isLoading: false,
          _error: _error instanceof Error ? error.message : 'Failed to get historical route',
        }));
      }
    },
    [_vehicleId]
  );

  // Get telematics events
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getTelematicsEvents = useCallback(
    async (_startTime: string, _endTime: string) => {
      if (!vehicleId) return;

      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const events = await telematicsService.getTelematicsEvents(vehicleId, startTime, endTime);
        setData(prev => ({
          ...prev,
          events,
        }));
      } catch (error) {
        console.error('Failed to get telematics events:', error);
      }
    },
    [_vehicleId]
  );

  // Check connection status
  useEffect(() => {
    if (!vehicleId) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const checkConnection = () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const now = new Date().getTime();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const lastUpdateTime = data.lastUpdate ? new Date(data.lastUpdate).getTime() : 0;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const timeDiff = now - lastUpdateTime;

      // Consider offline if no update in the last 5 minutes
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const isOnline = timeDiff < 300000;

      setData(prev => ({
        ...prev,
        isOnline,
      }));
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [vehicleId, data.lastUpdate]);

  // Initial data fetch
  useEffect(() => {
    if (vehicleId) {
      getCurrentPosition();
    }
  }, [vehicleId, getCurrentPosition]);

  return {
    ...data,
    getCurrentPosition,
    getHistoricalRoute,
    getTelematicsEvents,
    refresh: getCurrentPosition,
  };
}

// Hook for multiple vehicles
export function useMultipleVehicleTelematics(vehicleIds: string[]) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [vehiclesData, setVehiclesData] = useState<Map<string, TelematicsData>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateVehicleData = useCallback((_vehicleId: string, _data: Partial<TelematicsData>) => {
    setVehiclesData(prev => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const newMap = new Map(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const existingData = newMap.get(vehicleId) || {
        currentPosition: null,
        historicalRoute: null,
        events: [],
        _isLoading: false,
        _error: null,
        isOnline: false,
        lastUpdate: null,
      };
      newMap.set(vehicleId, { ...existingData, ...data });
      return newMap;
    });
  }, []);

  // Subscribe to updates for all vehicles
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const unsubscribeFunctions: (() => void)[] = [];

    vehicleIds.forEach(vehicleId => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const handleUpdate = (position: VehiclePosition) => {
        updateVehicleData(vehicleId, {
          currentPosition: position,
          isOnline: true,
          lastUpdate: position.timestamp,
        });
      };

      telematicsService.subscribeToVehicleUpdates(vehicleId, handleUpdate);
      unsubscribeFunctions.push(() => {
        telematicsService.unsubscribeFromVehicleUpdates(vehicleId, handleUpdate);
      });
    });

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [vehicleIds, updateVehicleData]);

  // Get current positions for all vehicles
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const refreshAllVehicles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const promises = vehicleIds.map(async vehicleId => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const position = await telematicsService.getCurrentPosition(vehicleId);
        updateVehicleData(vehicleId, {
          currentPosition: position,
          isOnline: !!position,
          lastUpdate: position?.timestamp || null,
        });
      });

      await Promise.all(promises);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh vehicle data');
    } finally {
      setIsLoading(false);
    }
  }, [vehicleIds, updateVehicleData]);

  // Initial fetch
  useEffect(() => {
    if (vehicleIds.length > 0) {
      refreshAllVehicles();
    }
  }, [vehicleIds, refreshAllVehicles]);

  return {
    vehiclesData,
    isLoading,
    error,
    refreshAllVehicles,
  };
}

// Hook for telematics provider health
export function useTelematicsHealth() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [healthStatus, setHealthStatus] = useState<Map<string, boolean>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const checkHealth = useCallback(async () => {
    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _status = await telematicsService.checkProviderHealth();
      setHealthStatus(status);
      setLastCheck(new Date().toISOString());
    } catch (error) {
      console.error('Failed to check telematics health:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check health every 5 minutes
  useEffect(() => {
    checkHealth();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const interval = setInterval(checkHealth, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    healthStatus,
    isLoading,
    lastCheck,
    checkHealth,
  };
}
