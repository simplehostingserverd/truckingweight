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
  HistoricalRoute 
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
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;
  lastUpdate: string | null;
}

export function useTelematics(options: UseTelematicsOptions = {}) {
  const { vehicleId, enableRealTime = true, updateInterval = 10000 } = options;

  const [data, setData] = useState<TelematicsData>({
    currentPosition: null,
    historicalRoute: null,
    events: [],
    isLoading: false,
    error: null,
    isOnline: false,
    lastUpdate: null,
  });

  // Real-time position updates
  const handlePositionUpdate = useCallback((position: VehiclePosition) => {
    setData(prev => ({
      ...prev,
      currentPosition: position,
      isOnline: true,
      lastUpdate: position.timestamp,
      error: null,
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
  const getCurrentPosition = useCallback(async () => {
    if (!vehicleId) return;

    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const position = await telematicsService.getCurrentPosition(vehicleId);
      if (position) {
        setData(prev => ({
          ...prev,
          currentPosition: position,
          isOnline: true,
          lastUpdate: position.timestamp,
          isLoading: false,
        }));
      } else {
        setData(prev => ({
          ...prev,
          isOnline: false,
          isLoading: false,
          error: 'Failed to get current position',
        }));
      }
    } catch (error) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    }
  }, [vehicleId]);

  // Get historical route
  const getHistoricalRoute = useCallback(async (startTime: string, endTime: string) => {
    if (!vehicleId) return;

    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const route = await telematicsService.getHistoricalRoute(vehicleId, startTime, endTime);
      setData(prev => ({
        ...prev,
        historicalRoute: route,
        isLoading: false,
      }));
    } catch (error) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to get historical route',
      }));
    }
  }, [vehicleId]);

  // Get telematics events
  const getTelematicsEvents = useCallback(async (startTime: string, endTime: string) => {
    if (!vehicleId) return;

    try {
      const events = await telematicsService.getTelematicsEvents(vehicleId, startTime, endTime);
      setData(prev => ({
        ...prev,
        events,
      }));
    } catch (error) {
      console.error('Failed to get telematics events:', error);
    }
  }, [vehicleId]);

  // Check connection status
  useEffect(() => {
    if (!vehicleId) return;

    const checkConnection = () => {
      const now = new Date().getTime();
      const lastUpdateTime = data.lastUpdate ? new Date(data.lastUpdate).getTime() : 0;
      const timeDiff = now - lastUpdateTime;
      
      // Consider offline if no update in the last 5 minutes
      const isOnline = timeDiff < 300000;
      
      setData(prev => ({
        ...prev,
        isOnline,
      }));
    };

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
  const [vehiclesData, setVehiclesData] = useState<Map<string, TelematicsData>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateVehicleData = useCallback((vehicleId: string, data: Partial<TelematicsData>) => {
    setVehiclesData(prev => {
      const newMap = new Map(prev);
      const existingData = newMap.get(vehicleId) || {
        currentPosition: null,
        historicalRoute: null,
        events: [],
        isLoading: false,
        error: null,
        isOnline: false,
        lastUpdate: null,
      };
      newMap.set(vehicleId, { ...existingData, ...data });
      return newMap;
    });
  }, []);

  // Subscribe to updates for all vehicles
  useEffect(() => {
    const unsubscribeFunctions: (() => void)[] = [];

    vehicleIds.forEach(vehicleId => {
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
  const refreshAllVehicles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const promises = vehicleIds.map(async vehicleId => {
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
  const [healthStatus, setHealthStatus] = useState<Map<string, boolean>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = await telematicsService.checkProviderHealth();
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
