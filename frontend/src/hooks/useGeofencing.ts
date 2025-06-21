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
  geofencingService,
  GeofenceZone,
  GeofenceViolation,
  GeofenceAlert,
} from '@/services/geofencingService';

export interface UseGeofencingOptions {
  vehicleId?: string;
  driverId?: string;
  enableRealTimeChecking?: boolean;
}

export interface GeofencingData {
  zones: GeofenceZone[];
  violations: GeofenceViolation[];
  alerts: GeofenceAlert[];
  unreadAlertsCount: number;
  unacknowledgedViolationsCount: number;
  _isLoading: boolean;
  _error: string | null;
}

export function useGeofencing(_options: UseGeofencingOptions = {}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { vehicleId, driverId, enableRealTimeChecking = true } = options;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = useState<GeofencingData>({
    zones: [],
    violations: [],
    alerts: [],
    unreadAlertsCount: 0,
    unacknowledgedViolationsCount: 0,
    _isLoading: false,
    _error: null,
  });

  // Load initial data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadData = useCallback(() => {
    setData(prev => ({ ...prev, _isLoading: true, _error: null }));

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const zones = geofencingService.getAllZones();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const violationFilters = vehicleId ? { _vehicleId } : undefined;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const violations = geofencingService.getViolations(violationFilters);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const alerts = geofencingService.getAlerts();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const unreadAlertsCount = alerts.filter(alert => !alert.isRead).length;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const unacknowledgedViolationsCount = violations.filter(
        violation => !violation.acknowledged
      ).length;

      setData(prev => ({
        ...prev,
        zones,
        violations,
        alerts,
        unreadAlertsCount,
        unacknowledgedViolationsCount,
        _isLoading: false,
      }));
    } catch (error) {
      setData(prev => ({
        ...prev,
        _isLoading: false,
        _error: _error instanceof Error ? error.message : 'Failed to load geofencing data',
      }));
    }
  }, [_vehicleId]);

  // Handle real-time alerts
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAlert = useCallback((alert: GeofenceAlert) => {
    setData(prev => ({
      ...prev,
      alerts: [alert, ...prev.alerts],
      unreadAlertsCount: prev.unreadAlertsCount + 1,
    }));
  }, []);

  // Subscribe to real-time alerts
  useEffect(() => {
    if (!enableRealTimeChecking) return;

    geofencingService.subscribeToAlerts(handleAlert);

    return () => {
      geofencingService.unsubscribeFromAlerts(handleAlert);
    };
  }, [enableRealTimeChecking, handleAlert]);

  // Check vehicle position against geofences
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const checkVehiclePosition = useCallback(
    (latitude: number, longitude: number) => {
      if (!vehicleId || !driverId) return [];

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const violations = geofencingService.checkVehiclePosition(
        vehicleId,
        driverId,
        latitude,
        longitude
      );

      if (violations.length > 0) {
        setData(prev => ({
          ...prev,
          violations: [...violations, ...prev.violations],
          unacknowledgedViolationsCount: prev.unacknowledgedViolationsCount + violations.length,
        }));
      }

      return violations;
    },
    [vehicleId, driverId]
  );

  // Zone management functions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createZone = useCallback((zone: Omit<GeofenceZone, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const newZone = geofencingService.createZone(zone);
      setData(prev => ({
        ...prev,
        zones: [...prev.zones, newZone],
      }));
      return newZone;
    } catch (error) {
      setData(prev => ({
        ...prev,
        _error: _error instanceof Error ? error.message : 'Failed to create zone',
      }));
      return null;
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateZone = useCallback((_zoneId: string, updates: Partial<GeofenceZone>) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const updatedZone = geofencingService.updateZone(zoneId, updates);
      if (updatedZone) {
        setData(prev => ({
          ...prev,
          zones: prev.zones.map(zone => (zone.id === zoneId ? updatedZone : zone)),
        }));
      }
      return updatedZone;
    } catch (error) {
      setData(prev => ({
        ...prev,
        _error: _error instanceof Error ? error.message : 'Failed to update zone',
      }));
      return null;
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const deleteZone = useCallback((_zoneId: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _success = geofencingService.deleteZone(zoneId);
      if (success) {
        setData(prev => ({
          ...prev,
          zones: prev.zones.filter(zone => zone.id !== zoneId),
        }));
      }
      return success;
    } catch (error) {
      setData(prev => ({
        ...prev,
        _error: _error instanceof Error ? error.message : 'Failed to delete zone',
      }));
      return false;
    }
  }, []);

  // Violation management functions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const acknowledgeViolation = useCallback(
    (violationId: string, acknowledgedBy: string, notes?: string) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _success = geofencingService.acknowledgeViolation(violationId, acknowledgedBy, notes);
        if (success) {
          setData(prev => ({
            ...prev,
            violations: prev.violations.map(violation =>
              violation.id === violationId
                ? {
                    ...violation,
                    acknowledged: true,
                    acknowledgedBy,
                    acknowledgedAt: new Date().toISOString(),
                    notes,
                  }
                : violation
            ),
            unacknowledgedViolationsCount: Math.max(0, prev.unacknowledgedViolationsCount - 1),
          }));
        }
        return success;
      } catch (error) {
        setData(prev => ({
          ...prev,
          _error: _error instanceof Error ? error.message : 'Failed to acknowledge violation',
        }));
        return false;
      }
    },
    []
  );

  // Alert management functions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const markAlertAsRead = useCallback((alertId: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _success = geofencingService.markAlertAsRead(alertId);
      if (success) {
        setData(prev => ({
          ...prev,
          alerts: prev.alerts.map(alert =>
            alert.id === alertId ? { ...alert, isRead: true } : alert
          ),
          unreadAlertsCount: Math.max(0, prev.unreadAlertsCount - 1),
        }));
      }
      return success;
    } catch (error) {
      setData(prev => ({
        ...prev,
        _error: _error instanceof Error ? error.message : 'Failed to mark alert as read',
      }));
      return false;
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const clearAllAlerts = useCallback(() => {
    try {
      geofencingService.clearAllAlerts();
      setData(prev => ({
        ...prev,
        alerts: [],
        unreadAlertsCount: 0,
      }));
    } catch (error) {
      setData(prev => ({
        ...prev,
        _error: _error instanceof Error ? error.message : 'Failed to clear alerts',
      }));
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    ...data,
    loadData,
    checkVehiclePosition,
    createZone,
    updateZone,
    deleteZone,
    acknowledgeViolation,
    markAlertAsRead,
    clearAllAlerts,
    refresh: loadData,
  };
}

// Hook for monitoring a specific vehicle's geofence status
export function useVehicleGeofencing(_vehicleId: string, driverId: string) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const geofencing = useGeofencing({ vehicleId, driverId, enableRealTimeChecking: true });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentViolations, setCurrentViolations] = useState<GeofenceViolation[]>([]);

  // Monitor position changes and check for violations
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const monitorPosition = useCallback(
    (latitude: number, longitude: number) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const violations = geofencing.checkVehiclePosition(latitude, longitude);
      setCurrentViolations(violations);
      return violations;
    },
    [geofencing]
  );

  return {
    ...geofencing,
    currentViolations,
    monitorPosition,
  };
}

// Hook for geofence zone management
export function useGeofenceZones() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [zones, setZones] = useState<GeofenceZone[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadZones = useCallback(() => {
    setIsLoading(true);
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const allZones = geofencingService.getAllZones();
      setZones(allZones);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load zones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  return {
    zones,
    isLoading,
    error,
    loadZones,
    activeZones: zones.filter(zone => zone.isActive),
    inactiveZones: zones.filter(zone => !zone.isActive),
  };
}
