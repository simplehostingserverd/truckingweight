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
import {
  ShieldExclamationIcon,
  MapPinIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  geofencingService,
  GeofenceZone,
  GeofenceViolation,
  GeofenceAlert,
} from '@/services/geofencingService';
import styles from './GeofencingPanel.module.css';

interface GeofencingPanelProps {
  vehicleId?: string;
  onViolationAlert?: (violation: GeofenceViolation) => void;
}

export default function GeofencingPanel({ vehicleId, onViolationAlert }: GeofencingPanelProps) {
  const [zones, setZones] = useState<GeofenceZone[]>([]);
  const [violations, setViolations] = useState<GeofenceViolation[]>([]);
  const [alerts, setAlerts] = useState<GeofenceAlert[]>([]);
  const [activeTab, setActiveTab] = useState<'zones' | 'violations' | 'alerts'>('zones');

  // Load data on component mount
  useEffect(() => {
    loadZones();
    loadViolations();
    loadAlerts();

    // Subscribe to real-time alerts
    const handleAlert = (alert: GeofenceAlert) => {
      setAlerts(prev => [alert, ...prev]);

      // Find the related violation
      const violation = geofencingService.getViolations().find(v => v.id === alert.violationId);
      if (violation && onViolationAlert) {
        onViolationAlert(violation);
      }
    };

    geofencingService.subscribeToAlerts(handleAlert);

    return () => {
      geofencingService.unsubscribeFromAlerts(handleAlert);
    };
  }, [onViolationAlert]);

  const loadZones = () => {
    const allZones = geofencingService.getAllZones();
    setZones(allZones);
  };

  const loadViolations = () => {
    const filters = vehicleId ? { vehicleId } : undefined;
    const allViolations = geofencingService.getViolations(filters);
    setViolations(allViolations.slice(0, 10)); // Show last 10 violations
  };

  const loadAlerts = () => {
    const allAlerts = geofencingService.getAlerts();
    setAlerts(allAlerts.slice(0, 10)); // Show last 10 alerts
  };

  const handleAcknowledgeViolation = (violationId: string) => {
    const success = geofencingService.acknowledgeViolation(
      violationId,
      'current-user',
      'Acknowledged via dashboard'
    );
    if (success) {
      loadViolations();
    }
  };

  const handleMarkAlertAsRead = (alertId: string) => {
    const success = geofencingService.markAlertAsRead(alertId);
    if (success) {
      loadAlerts();
    }
  };

  const toggleZoneStatus = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (zone) {
      geofencingService.updateZone(zoneId, { isActive: !zone.isActive });
      loadZones();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'high':
        return <ShieldExclamationIcon className="h-4 w-4" />;
      case 'medium':
        return <BellIcon className="h-4 w-4" />;
      case 'low':
        return <MapPinIcon className="h-4 w-4" />;
      default:
        return <MapPinIcon className="h-4 w-4" />;
    }
  };

  const getZoneColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      '#ef4444': styles.zoneColorRed,
      '#f97316': styles.zoneColorOrange,
      '#eab308': styles.zoneColorYellow,
      '#22c55e': styles.zoneColorGreen,
      '#3b82f6': styles.zoneColorBlue,
      '#a855f7': styles.zoneColorPurple,
      '#ec4899': styles.zoneColorPink,
      '#6b7280': styles.zoneColorGray,
      red: styles.zoneColorRed,
      orange: styles.zoneColorOrange,
      yellow: styles.zoneColorYellow,
      green: styles.zoneColorGreen,
      blue: styles.zoneColorBlue,
      purple: styles.zoneColorPurple,
      pink: styles.zoneColorPink,
      gray: styles.zoneColorGray,
    };
    return colorMap[color] || styles.zoneColorDefault;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const unreadAlertsCount = alerts.filter(alert => !alert.isRead).length;
  const unacknowledgedViolationsCount = violations.filter(
    violation => !violation.acknowledged
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldExclamationIcon className="h-5 w-5" />
            <span>Geofencing</span>
          </div>
          <div className="flex space-x-2">
            {unreadAlertsCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadAlertsCount} alerts
              </Badge>
            )}
            {unacknowledgedViolationsCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unacknowledgedViolationsCount} violations
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { key: 'zones', label: 'Zones', count: zones.filter(z => z.isActive).length },
            { key: 'violations', label: 'Violations', count: unacknowledgedViolationsCount },
            { key: 'alerts', label: 'Alerts', count: unreadAlertsCount },
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Zones Tab */}
        {activeTab === 'zones' && (
          <div className="space-y-3">
            {zones.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MapPinIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No geofence zones configured</p>
              </div>
            ) : (
              zones.map(zone => (
                <div
                  key={zone.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`${styles.zoneColorIndicator} ${getZoneColorClass(zone.metadata.color)}`}
                    />
                    <div>
                      <div className="font-medium text-sm">{zone.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {zone.type} • {zone.alertType} alerts
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={zone.metadata.priority === 'critical' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {zone.metadata.priority}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleZoneStatus(zone.id)}
                      className="text-xs"
                    >
                      {zone.isActive ? (
                        <CheckCircleIcon className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-3 w-3 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Violations Tab */}
        {activeTab === 'violations' && (
          <div className="space-y-3">
            {violations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CheckCircleIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No geofence violations</p>
              </div>
            ) : (
              violations.map(violation => (
                <div
                  key={violation.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    violation.acknowledged
                      ? 'bg-gray-50 dark:bg-gray-800 border-gray-300'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-1 rounded-full ${getSeverityColor(violation.severity)} text-white`}
                      >
                        {getSeverityIcon(violation.severity)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {violation.violationType === 'entry' ? 'Entered' : 'Exited'}{' '}
                          {violation.zoneName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Vehicle {violation.vehicleId} • {formatTimestamp(violation.timestamp)}
                        </div>
                        {violation.acknowledged && (
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                            ✓ Acknowledged by {violation.acknowledgedBy}
                          </div>
                        )}
                      </div>
                    </div>
                    {!violation.acknowledged && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAcknowledgeViolation(violation.id)}
                        className="text-xs"
                      >
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BellIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No alerts</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg ${
                    alert.isRead
                      ? 'bg-gray-50 dark:bg-gray-800'
                      : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <BellIcon
                        className={`h-4 w-4 mt-0.5 ${alert.isRead ? 'text-gray-400' : 'text-blue-500'}`}
                      />
                      <div>
                        <div className="font-medium text-sm">{alert.message}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                          <ClockIcon className="h-3 w-3" />
                          <span>{formatTimestamp(alert.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    {!alert.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAlertAsRead(alert.id)}
                        className="text-xs"
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
