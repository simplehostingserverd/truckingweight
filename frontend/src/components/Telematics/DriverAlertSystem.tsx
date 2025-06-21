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
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import {
  BellIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  FireIcon,
  LightBulbIcon,
  PhoneIcon,
  ShieldCheckIcon,
  SpeakerWaveIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface DriverAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  category: 'brake' | 'tire' | 'engine' | 'electrical' | 'transmission' | 'safety' | 'hos';
  title: string;
  message: string;
  actionRequired: string;
  timestamp: string;
  acknowledged: boolean;
  autoAcknowledge?: boolean; // For info alerts
  soundAlert?: boolean;
  vibrationAlert?: boolean;
  emergencyStop?: boolean; // Recommend immediate stop
}

interface DriverAlertSystemProps {
  driverName: string;
  vehicleId: string;
  alerts: DriverAlert[];
  onAcknowledgeAlert?: (alertId: string) => void;
  onEmergencyContact?: () => void;
  onRequestAssistance?: () => void;
}


const FireIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3.001 2.48Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" />
  </svg>
);


const LightBulbIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);

export default function DriverAlertSystem({
  driverName,
  vehicleId,
  alerts,
  onAcknowledgeAlert,
  onEmergencyContact,
  onRequestAssistance,
}: DriverAlertSystemProps) {
  const [activeAlerts, setActiveAlerts] = useState<DriverAlert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastAlertSound, setLastAlertSound] = useState<string>('');

  // Audio alerts hook
  const { useAudioAlerts } = require('@/hooks/useAudioAlerts');
  const { playEmergencyAlert, isPlaying, isSpeaking, cleanup } = useAudioAlerts();

  useEffect(() => {
    setActiveAlerts(alerts.filter(alert => !alert.acknowledged));
  }, [alerts]);

  useEffect(() => {
    // Play alert sounds for new critical alerts
    const criticalAlerts = activeAlerts.filter(
      alert =>
        (alert.severity === 'critical' || alert.severity === 'emergency') &&
        alert.soundAlert &&
        alert.id !== lastAlertSound
    );

    if (criticalAlerts.length > 0 && soundEnabled) {
      const alert = criticalAlerts[0];
      console.warn('🚨 PLAYING CRITICAL ALERT SOUND:', alert.title);

      // Play emergency alert with siren and speech
      let message = 'Driver, please check your safety issues and pull over if required.';

      // Customize message based on alert type
      if (alert.category === 'brake') {
        message =
          'Driver, brake system alert detected. Please check your brakes and pull over safely if required.';
      } else if (alert.category === 'electrical') {
        message =
          'Driver, electrical system alert detected. Please check your lights and pull over safely if required.';
      } else if (alert.category === 'tire') {
        message =
          'Driver, tire system alert detected. Please check your tires and pull over safely if required.';
      } else if (alert.category === 'engine') {
        message =
          'Driver, engine alert detected. Please check your engine and pull over safely if required.';
      }

      playEmergencyAlert(message);
      setLastAlertSound(alert.id);
    }
  }, [activeAlerts, soundEnabled, lastAlertSound, playEmergencyAlert]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'brake':
        return <ShieldCheckIcon className="h-5 w-5" />;
      case 'tire':
        return <BoltIcon className="h-5 w-5" />;
      case 'engine':
        return <FireIcon className="h-5 w-5" />;
      case 'electrical':
        return <LightBulbIcon className="h-5 w-5" />;
      case 'transmission':
        return <WrenchScrewdriverIcon className="h-5 w-5" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'info':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'emergency':
        return 'border-red-600 bg-red-100 dark:bg-red-900/30 animate-pulse';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Badge variant="secondary">INFO</Badge>;
      case 'warning':
        return <Badge variant="warning">WARNING</Badge>;
      case 'critical':
        return <Badge variant="destructive">CRITICAL</Badge>;
      case 'emergency':
        return (
          <Badge variant="destructive" className="animate-pulse">
            EMERGENCY
          </Badge>
        );
      default:
        return <Badge variant="secondary">ALERT</Badge>;
    }
  };

  const handleAcknowledge = (alertId: string) => {
    onAcknowledgeAlert?.(alertId);
    setActiveAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const emergencyAlerts = activeAlerts.filter(alert => alert.severity === 'emergency');
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');
  const warningAlerts = activeAlerts.filter(alert => alert.severity === 'warning');
  const infoAlerts = activeAlerts.filter(alert => alert.severity === 'info');

  return (
    <div className="space-y-4">
      {/* Driver Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <BellIcon className="h-6 w-6 mr-2" />
              Driver Alert System
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setSoundEnabled(!soundEnabled)}>
                <SpeakerWaveIcon
                  className={`h-4 w-4 mr-1 ${
                    isPlaying || isSpeaking
                      ? 'text-red-600 animate-pulse'
                      : soundEnabled
                        ? 'text-green-600'
                        : 'text-gray-400'
                  }`}
                />
                {isPlaying || isSpeaking
                  ? 'Playing Alert'
                  : soundEnabled
                    ? 'Sound On'
                    : 'Sound Off'}
              </Button>
              <Badge variant="outline">{vehicleId}</Badge>
            </div>
          </CardTitle>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Driver: {driverName} • Active Alerts: {activeAlerts.length}
          </div>
        </CardHeader>
      </Card>

      {/* Emergency Alerts - Highest Priority */}
      {emergencyAlerts.map(alert => (
        <Alert
          key={alert.id}
          variant="destructive"
          className={`${getAlertColor(alert.severity)} border-2`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {getAlertIcon(alert.category)}
              <div className="flex-1">
                <AlertTitle className="flex items-center space-x-2">
                  <span>🚨 EMERGENCY STOP REQUIRED</span>
                  {getSeverityBadge(alert.severity)}
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="font-medium text-red-800 dark:text-red-200">{alert.title}</div>
                  <div className="mt-1">{alert.message}</div>
                  <div className="mt-2 p-2 bg-red-200 dark:bg-red-800 rounded font-medium">
                    ACTION REQUIRED: {alert.actionRequired}
                  </div>
                  {alert.emergencyStop && (
                    <div className="mt-2 p-2 bg-red-300 dark:bg-red-700 rounded font-bold text-center">
                      ⚠️ PULL OVER SAFELY AND STOP IMMEDIATELY ⚠️
                    </div>
                  )}
                </AlertDescription>
                <div className="flex space-x-2 mt-4">
                  <Button variant="destructive" size="sm" onClick={onEmergencyContact}>
                    <PhoneIcon className="h-4 w-4 mr-1" />
                    Emergency Contact
                  </Button>
                  <Button variant="outline" size="sm" onClick={onRequestAssistance}>
                    Request Assistance
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleAcknowledge(alert.id)}>
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Acknowledge
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Alert>
      ))}

      {/* Critical Alerts */}
      {criticalAlerts.map(alert => (
        <Alert key={alert.id} variant="destructive" className={getAlertColor(alert.severity)}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {getAlertIcon(alert.category)}
              <div className="flex-1">
                <AlertTitle className="flex items-center space-x-2">
                  <span>{alert.title}</span>
                  {getSeverityBadge(alert.severity)}
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="mt-1">{alert.message}</div>
                  <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded">
                    <strong>Action Required:</strong> {alert.actionRequired}
                  </div>
                </AlertDescription>
                <div className="flex space-x-2 mt-3">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleAcknowledge(alert.id)}
                  >
                    Acknowledge & Take Action
                  </Button>
                  <Button variant="outline" size="sm" onClick={onRequestAssistance}>
                    Request Help
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Alert>
      ))}

      {/* Warning Alerts */}
      {warningAlerts.map(alert => (
        <Alert key={alert.id} className={getAlertColor(alert.severity)}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {getAlertIcon(alert.category)}
              <div className="flex-1">
                <AlertTitle className="flex items-center space-x-2">
                  <span>{alert.title}</span>
                  {getSeverityBadge(alert.severity)}
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="mt-1">{alert.message}</div>
                  <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                    <strong>Recommended Action:</strong> {alert.actionRequired}
                  </div>
                </AlertDescription>
                <div className="flex space-x-2 mt-3">
                  <Button variant="outline" size="sm" onClick={() => handleAcknowledge(alert.id)}>
                    Acknowledge
                  </Button>
                  <Button variant="outline" size="sm" onClick={onRequestAssistance}>
                    Schedule Maintenance
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Alert>
      ))}

      {/* Info Alerts */}
      {infoAlerts.map(alert => (
        <Alert key={alert.id} className={getAlertColor(alert.severity)}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {getAlertIcon(alert.category)}
              <div className="flex-1">
                <AlertTitle className="flex items-center space-x-2">
                  <span>{alert.title}</span>
                  {getSeverityBadge(alert.severity)}
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="mt-1">{alert.message}</div>
                  {alert.actionRequired && (
                    <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                      <strong>Note:</strong> {alert.actionRequired}
                    </div>
                  )}
                </AlertDescription>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => handleAcknowledge(alert.id)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </Alert>
      ))}

      {/* No Active Alerts */}
      {activeAlerts.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <ShieldCheckIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-600 dark:text-green-400">
                All Systems Normal
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                No active alerts. Drive safely!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Contact Info */}
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
        <CardHeader>
          <CardTitle className="text-red-700 dark:text-red-400 flex items-center">
            <PhoneIcon className="h-5 w-5 mr-2" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Dispatch:</span>
              <span className="font-medium">(555) 911-HELP</span>
            </div>
            <div className="flex justify-between">
              <span>Roadside Assistance:</span>
              <span className="font-medium">(555) ROADSIDE</span>
            </div>
            <div className="flex justify-between">
              <span>Emergency Services:</span>
              <span className="font-medium">911</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
