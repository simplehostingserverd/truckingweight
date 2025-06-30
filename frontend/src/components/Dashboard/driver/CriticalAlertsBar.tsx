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

import React, { useState, memo, useCallback, useMemo } from 'react';
import { AlertData } from '@/hooks/useDriverDashboardData';
import { ExclamationTriangleIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/solid';

interface CriticalAlertsBarProps {
  alerts: AlertData[];
}

const CriticalAlertsBarComponent = function CriticalAlertsBar({ alerts }: CriticalAlertsBarProps) {
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());

  const handleAcknowledge = useCallback((alertId: string) => {
    setAcknowledgedAlerts(prev => new Set([...prev, alertId]));
    // TODO: Send acknowledgment to backend
  }, []);

  const handleDismiss = useCallback((alertId: string) => {
    setAcknowledgedAlerts(prev => new Set([...prev, alertId]));
    // TODO: Send dismissal to backend
  }, []);

  const visibleAlerts = useMemo(() => 
    alerts.filter(alert => !acknowledgedAlerts.has(alert.id) && !alert.acknowledged),
    [alerts, acknowledgedAlerts]
  );

  if (visibleAlerts.length === 0) {
    return null;
  }

  const getAlertStyles = (alert: AlertData) => {
    switch (alert.type) {
      case 'critical':
        return 'bg-red-600 border-red-500 text-white';
      default:
        return 'bg-red-600 border-red-500 text-white';
    }
  };

  const getAlertIcon = (alert: AlertData) => {
    switch (alert.type) {
      case 'critical':
        return <ExclamationTriangleIcon className="w-6 h-6" />;
      default:
        return <ExclamationTriangleIcon className="w-6 h-6" />;
    }
  };

  return (
    <div className="critical-alerts-container">
      {visibleAlerts.map((alert, index) => (
        <div
          key={alert.id}
          className={`critical-alerts p-3 border-l-4 flex items-center justify-between animate-pulse ${getAlertStyles(
            alert
          )} ${index > 0 ? 'border-t border-red-500' : ''}`}
        >
          <div className="flex items-center space-x-3">
            {getAlertIcon(alert)}
            <div className="flex-1">
              <p className="font-bold text-lg">🚨 CRITICAL ALERT</p>
              <p className="font-medium">{alert.message}</p>
              <p className="text-sm opacity-90">{new Date(alert.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Acknowledge Button */}
            <button
              onClick={() => handleAcknowledge(alert.id)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200 flex items-center space-x-1"
              title="Acknowledge Alert"
            >
              <CheckIcon className="w-4 h-4" />
              <span className="text-sm font-medium">ACK</span>
            </button>

            {/* Dismiss Button */}
            <button
              onClick={() => handleDismiss(alert.id)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200"
              title="Dismiss Alert"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {/* Alert Sound/Vibration Indicator */}
      {visibleAlerts.length > 0 && (
        <div className="bg-red-700 text-center py-1">
          <span className="text-xs font-medium animate-bounce">
            🔊 AUDIO ALERT ACTIVE - ACKNOWLEDGE TO SILENCE
          </span>
        </div>
      )}
    </div>
  );
};

// Export memoized component to prevent unnecessary re-renders
export default memo(CriticalAlertsBarComponent);
