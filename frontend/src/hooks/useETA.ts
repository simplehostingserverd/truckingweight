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
import { etaService, ETACalculation, DriverBehaviorProfile } from '@/services/etaService';

export interface UseETAOptions {
  driverId: string;
  vehicleId: string;
  autoUpdate?: boolean;
  updateInterval?: number; // in milliseconds
}

export interface ETAData {
  currentETA: ETACalculation | null;
  driverProfile: DriverBehaviorProfile | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export function useETA(options: UseETAOptions) {
  const { driverId, vehicleId, autoUpdate = true, updateInterval = 300000 } = options; // 5 minutes default

  const [data, setData] = useState<ETAData>({
    currentETA: null,
    driverProfile: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  // Calculate ETA to destination
  const calculateETA = useCallback(
    async (
      currentLat: number,
      currentLng: number,
      destinationLat: number,
      destinationLng: number,
      destinationName?: string
    ) => {
      if (!driverId || !vehicleId) {
        setData(prev => ({ ...prev, error: 'Driver ID and Vehicle ID are required' }));
        return null;
      }

      setData(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const eta = await etaService.calculateETA(
          currentLat,
          currentLng,
          destinationLat,
          destinationLng,
          driverId,
          vehicleId,
          destinationName
        );

        setData(prev => ({
          ...prev,
          currentETA: eta,
          isLoading: false,
          lastUpdated: new Date().toISOString(),
        }));

        return eta;
      } catch (error) {
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to calculate ETA',
        }));
        return null;
      }
    },
    [driverId, vehicleId]
  );

  // Update existing ETA with new position
  const updateETA = useCallback(
    async (currentLat: number, currentLng: number) => {
      if (!data.currentETA || !driverId) return null;

      setData(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const updatedETA = await etaService.updateETA(data.currentETA, currentLat, currentLng, driverId);

        setData(prev => ({
          ...prev,
          currentETA: updatedETA,
          isLoading: false,
          lastUpdated: new Date().toISOString(),
        }));

        return updatedETA;
      } catch (error) {
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to update ETA',
        }));
        return null;
      }
    },
    [data.currentETA, driverId]
  );

  // Load driver profile
  const loadDriverProfile = useCallback(() => {
    if (!driverId) return;

    const profile = etaService.getDriverProfile(driverId);
    setData(prev => ({ ...prev, driverProfile: profile }));
  }, [driverId]);

  // Update driver profile
  const updateDriverProfile = useCallback(
    (updates: Partial<DriverBehaviorProfile>) => {
      if (!driverId) return;

      etaService.updateDriverProfile(driverId, updates);
      loadDriverProfile();
    },
    [driverId, loadDriverProfile]
  );

  // Auto-update ETA based on position changes
  useEffect(() => {
    if (!autoUpdate || !data.currentETA) return;

    const interval = setInterval(() => {
      // In a real implementation, you would get the current position from GPS/telematics
      // For now, we'll just refresh the ETA calculation
      if (data.currentETA) {
        const { destinationCoords, destinationName } = data.currentETA;
        // Mock current position - in production, this would come from telematics
        const mockCurrentLat = destinationCoords.lat - 0.1;
        const mockCurrentLng = destinationCoords.lng - 0.1;
        
        updateETA(mockCurrentLat, mockCurrentLng);
      }
    }, updateInterval);

    return () => clearInterval(interval);
  }, [autoUpdate, updateInterval, data.currentETA, updateETA]);

  // Load driver profile on mount
  useEffect(() => {
    loadDriverProfile();
  }, [loadDriverProfile]);

  return {
    ...data,
    calculateETA,
    updateETA,
    loadDriverProfile,
    updateDriverProfile,
    refresh: () => {
      if (data.currentETA) {
        const { destinationCoords, destinationName } = data.currentETA;
        // Mock current position for refresh
        const mockCurrentLat = destinationCoords.lat - 0.1;
        const mockCurrentLng = destinationCoords.lng - 0.1;
        calculateETA(mockCurrentLat, mockCurrentLng, destinationCoords.lat, destinationCoords.lng, destinationName);
      }
    },
  };
}

// Hook for multiple destinations
export function useMultipleETAs(destinations: Array<{ lat: number; lng: number; name: string }>, options: UseETAOptions) {
  const [etaCalculations, setETACalculations] = useState<Map<string, ETACalculation>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateAllETAs = useCallback(
    async (currentLat: number, currentLng: number) => {
      if (!options.driverId || !options.vehicleId) return;

      setIsLoading(true);
      setError(null);

      try {
        const calculations = new Map<string, ETACalculation>();

        for (const destination of destinations) {
          const eta = await etaService.calculateETA(
            currentLat,
            currentLng,
            destination.lat,
            destination.lng,
            options.driverId,
            options.vehicleId,
            destination.name
          );
          calculations.set(destination.name, eta);
        }

        setETACalculations(calculations);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to calculate ETAs');
      } finally {
        setIsLoading(false);
      }
    },
    [destinations, options.driverId, options.vehicleId]
  );

  return {
    etaCalculations,
    isLoading,
    error,
    calculateAllETAs,
  };
}

// Hook for ETA monitoring and alerts
export function useETAMonitoring(
  eta: ETACalculation | null,
  thresholds: {
    delayWarning: number; // minutes
    delayAlert: number; // minutes
  } = { delayWarning: 15, delayAlert: 30 }
) {
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'warning' | 'alert' | 'info';
    message: string;
    timestamp: string;
  }>>([]);

  useEffect(() => {
    if (!eta) return;

    const baseETA = new Date(eta.baseETA).getTime();
    const adjustedETA = new Date(eta.adjustedETA).getTime();
    const delayMinutes = (adjustedETA - baseETA) / (1000 * 60);

    const newAlerts: typeof alerts = [];

    if (delayMinutes >= thresholds.delayAlert) {
      newAlerts.push({
        id: `alert-${Date.now()}`,
        type: 'alert',
        message: `Significant delay detected: ${Math.round(delayMinutes)} minutes behind schedule`,
        timestamp: new Date().toISOString(),
      });
    } else if (delayMinutes >= thresholds.delayWarning) {
      newAlerts.push({
        id: `warning-${Date.now()}`,
        type: 'warning',
        message: `Potential delay: ${Math.round(delayMinutes)} minutes behind schedule`,
        timestamp: new Date().toISOString(),
      });
    }

    // Check confidence level
    if (eta.confidence < 60) {
      newAlerts.push({
        id: `confidence-${Date.now()}`,
        type: 'warning',
        message: `Low ETA confidence (${eta.confidence}%) due to traffic and weather conditions`,
        timestamp: new Date().toISOString(),
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev.slice(0, 9)]); // Keep last 10 alerts
    }
  }, [eta, thresholds]);

  const clearAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    alerts,
    hasWarnings: alerts.some(alert => alert.type === 'warning'),
    hasAlerts: alerts.some(alert => alert.type === 'alert'),
    clearAlert,
    clearAllAlerts,
  };
}
