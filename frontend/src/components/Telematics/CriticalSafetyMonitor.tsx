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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui';
import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  FireIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  LightBulbIcon,
  PhoneIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

interface CriticalSafetyData {
  vehicleId: string;
  driverName: string;
  driverPhone: string;
  location: string;
  timestamp: string;
  
  // Top 5 Critical Safety Systems
  brakeSystem: {
    status: 'safe' | 'warning' | 'critical' | 'failure';
    airPressure: number; // psi
    padWearFront: number; // % remaining
    padWearRear: number; // % remaining
    temperature: number; // °F
    airLeaks: boolean;
    warningLights: boolean;
    lastInspection: string;
    issues: string[];
  };
  
  tireSystem: {
    status: 'safe' | 'warning' | 'critical' | 'failure';
    pressures: number[]; // psi for all tires
    temperatures: number[]; // °F for all tires
    treadDepths: number[]; // mm for all tires
    blowoutRisk: boolean;
    unevenWear: boolean;
    lastRotation: string;
    issues: string[];
  };
  
  engineCooling: {
    status: 'safe' | 'warning' | 'critical' | 'failure';
    coolantTemp: number; // °F
    coolantLevel: number; // %
    radiatorCondition: 'good' | 'fair' | 'poor';
    fanOperation: boolean;
    thermostatWorking: boolean;
    overheatingRisk: boolean;
    issues: string[];
  };
  
  electricalSystem: {
    status: 'safe' | 'warning' | 'critical' | 'failure';
    batteryVoltage: number; // V
    alternatorOutput: number; // V
    lightingSystem: {
      headlights: boolean;
      taillights: boolean;
      brakeLight: boolean;
      turnSignals: boolean;
      hazardLights: boolean;
      markerLights: boolean;
    };
    wiringCondition: 'good' | 'fair' | 'poor';
    issues: string[];
  };
  
  transmission: {
    status: 'safe' | 'warning' | 'critical' | 'failure';
    fluidLevel: number; // %
    fluidTemp: number; // °F
    pressure: number; // psi
    gearSlipping: boolean;
    shiftingIssues: boolean;
    clutchWear: number; // %
    issues: string[];
  };
  
  overallSafetyScore: number; // 0-100
  accidentRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendedActions: string[];
}

interface CriticalSafetyMonitorProps {
  data: CriticalSafetyData;
  onEmergencyAlert?: (vehicleId: string, issue: string) => void;
  onMaintenanceSchedule?: (vehicleId: string, system: string) => void;
}

export default function CriticalSafetyMonitor({ 
  data, 
  onEmergencyAlert,
  onMaintenanceSchedule 
}: CriticalSafetyMonitorProps) {
  const [alertsAcknowledged, setAlertsAcknowledged] = useState<string[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'failure':
        return 'bg-red-200 text-red-900 border-red-300 animate-pulse';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <ShieldCheckIcon className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'critical':
      case 'failure':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100 animate-pulse';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const criticalIssues = [
    ...(data.brakeSystem.status === 'critical' || data.brakeSystem.status === 'failure' ? ['Brake System'] : []),
    ...(data.electricalSystem.status === 'critical' || data.electricalSystem.status === 'failure' ? ['Electrical/Lighting'] : []),
    ...(data.tireSystem.status === 'critical' || data.tireSystem.status === 'failure' ? ['Tire System'] : []),
    ...(data.engineCooling.status === 'critical' || data.engineCooling.status === 'failure' ? ['Engine Cooling'] : []),
    ...(data.transmission.status === 'critical' || data.transmission.status === 'failure' ? ['Transmission'] : []),
  ];

  const handleEmergencyAlert = (system: string) => {
    onEmergencyAlert?.(data.vehicleId, system);
  };

  const handleScheduleMaintenance = (system: string) => {
    onMaintenanceSchedule?.(data.vehicleId, system);
  };

  return (
    <div className="space-y-6">
      {/* Critical Safety Alert Banner */}
      {criticalIssues.length > 0 && (
        <Alert variant="destructive" className="border-red-500 bg-red-50 dark:bg-red-900/20">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            <span>CRITICAL SAFETY ALERT - IMMEDIATE ACTION REQUIRED</span>
            <Badge variant="destructive" className="animate-pulse">
              ACCIDENT RISK: {data.accidentRiskLevel.toUpperCase()}
            </Badge>
          </AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              <div className="font-medium">Vehicle: {data.vehicleId} | Driver: {data.driverName}</div>
              <div className="text-sm">Location: {data.location}</div>
              <div className="font-medium text-red-700">Critical Systems: {criticalIssues.join(', ')}</div>
              <div className="flex space-x-2 mt-3">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleEmergencyAlert(criticalIssues.join(', '))}
                >
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  Alert Driver Now
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleScheduleMaintenance('emergency')}
                >
                  <WrenchScrewdriverIcon className="h-4 w-4 mr-1" />
                  Emergency Service
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Safety Score Overview */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <TruckIcon className="h-6 w-6 mr-2" />
              Vehicle Safety Score
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getRiskColor(data.accidentRiskLevel)}>
                Risk: {data.accidentRiskLevel.toUpperCase()}
              </Badge>
              <div className="text-3xl font-bold">
                <span className={data.overallSafetyScore >= 80 ? 'text-green-600' : 
                               data.overallSafetyScore >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                  {data.overallSafetyScore}
                </span>
                <span className="text-lg text-gray-500">/100</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div 
              className={`h-4 rounded-full transition-all duration-500 ${
                data.overallSafetyScore >= 80 ? 'bg-green-500' : 
                data.overallSafetyScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${data.overallSafetyScore}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Last updated: {new Date(data.timestamp).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Top 5 Critical Safety Systems */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Brake System - #1 Accident Cause */}
        <Card className={`border-2 ${data.brakeSystem.status === 'critical' || data.brakeSystem.status === 'failure' ? 'border-red-500' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Brake System
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(data.brakeSystem.status)}
                <Badge className={getStatusColor(data.brakeSystem.status)}>
                  {data.brakeSystem.status.toUpperCase()}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-between">
                  <span className="text-sm">Air Pressure</span>
                  <Badge variant={data.brakeSystem.airPressure >= 100 ? 'success' : 
                                data.brakeSystem.airPressure >= 90 ? 'warning' : 'destructive'}>
                    {data.brakeSystem.airPressure} psi
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Brake Temp</span>
                  <Badge variant={data.brakeSystem.temperature <= 300 ? 'success' : 
                                data.brakeSystem.temperature <= 400 ? 'warning' : 'destructive'}>
                    {data.brakeSystem.temperature}°F
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Front Pads</span>
                  <Badge variant={data.brakeSystem.padWearFront >= 30 ? 'success' : 
                                data.brakeSystem.padWearFront >= 15 ? 'warning' : 'destructive'}>
                    {data.brakeSystem.padWearFront}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Rear Pads</span>
                  <Badge variant={data.brakeSystem.padWearRear >= 30 ? 'success' : 
                                data.brakeSystem.padWearRear >= 15 ? 'warning' : 'destructive'}>
                    {data.brakeSystem.padWearRear}%
                  </Badge>
                </div>
              </div>
              
              {data.brakeSystem.airLeaks && (
                <Alert variant="destructive">
                  <AlertDescription>⚠️ Air leaks detected in brake lines</AlertDescription>
                </Alert>
              )}
              
              {data.brakeSystem.warningLights && (
                <Alert variant="destructive">
                  <AlertDescription>🚨 Brake warning lights active</AlertDescription>
                </Alert>
              )}
              
              {data.brakeSystem.issues.length > 0 && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <div className="text-xs font-medium text-red-600 dark:text-red-400">Issues:</div>
                  {data.brakeSystem.issues.map((issue, index) => (
                    <div key={index} className="text-xs text-red-600 dark:text-red-400">• {issue}</div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 2. Electrical/Lighting System - #2 Accident Cause */}
        <Card className={`border-2 ${data.electricalSystem.status === 'critical' || data.electricalSystem.status === 'failure' ? 'border-red-500' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <LightBulbIcon className="h-5 w-5 mr-2" />
                Electrical & Lighting
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(data.electricalSystem.status)}
                <Badge className={getStatusColor(data.electricalSystem.status)}>
                  {data.electricalSystem.status.toUpperCase()}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-between">
                  <span className="text-sm">Battery</span>
                  <Badge variant={data.electricalSystem.batteryVoltage >= 12.4 ? 'success' : 
                                data.electricalSystem.batteryVoltage >= 11.8 ? 'warning' : 'destructive'}>
                    {data.electricalSystem.batteryVoltage}V
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Alternator</span>
                  <Badge variant={data.electricalSystem.alternatorOutput >= 13.5 ? 'success' : 
                                data.electricalSystem.alternatorOutput >= 12.5 ? 'warning' : 'destructive'}>
                    {data.electricalSystem.alternatorOutput}V
                  </Badge>
                </div>
              </div>
              
              {/* Critical Lighting Status */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <h4 className="font-medium text-sm mb-2">Critical Lighting Systems:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span>Headlights</span>
                    <Badge variant={data.electricalSystem.lightingSystem.headlights ? 'success' : 'destructive'}>
                      {data.electricalSystem.lightingSystem.headlights ? 'OK' : 'FAULT'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Brake Lights</span>
                    <Badge variant={data.electricalSystem.lightingSystem.brakeLight ? 'success' : 'destructive'}>
                      {data.electricalSystem.lightingSystem.brakeLight ? 'OK' : 'FAULT'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Turn Signals</span>
                    <Badge variant={data.electricalSystem.lightingSystem.turnSignals ? 'success' : 'destructive'}>
                      {data.electricalSystem.lightingSystem.turnSignals ? 'OK' : 'FAULT'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Marker Lights</span>
                    <Badge variant={data.electricalSystem.lightingSystem.markerLights ? 'success' : 'destructive'}>
                      {data.electricalSystem.lightingSystem.markerLights ? 'OK' : 'FAULT'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {data.electricalSystem.issues.length > 0 && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <div className="text-xs font-medium text-red-600 dark:text-red-400">Issues:</div>
                  {data.electricalSystem.issues.map((issue, index) => (
                    <div key={index} className="text-xs text-red-600 dark:text-red-400">• {issue}</div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 3. Tire System */}
        <Card className={`border-2 ${data.tireSystem.status === 'critical' || data.tireSystem.status === 'failure' ? 'border-red-500' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <BoltIcon className="h-5 w-5 mr-2" />
                Tire System
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(data.tireSystem.status)}
                <Badge className={getStatusColor(data.tireSystem.status)}>
                  {data.tireSystem.status.toUpperCase()}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {data.tireSystem.pressures.map((pressure, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span>Tire {index + 1}</span>
                    <Badge variant={pressure >= 100 ? 'success' : pressure >= 90 ? 'warning' : 'destructive'}>
                      {pressure} psi
                    </Badge>
                  </div>
                ))}
              </div>
              
              {data.tireSystem.blowoutRisk && (
                <Alert variant="destructive">
                  <AlertDescription>⚠️ High blowout risk detected</AlertDescription>
                </Alert>
              )}
              
              {data.tireSystem.unevenWear && (
                <Alert variant="warning">
                  <AlertDescription>⚠️ Uneven tire wear detected</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 4. Engine Cooling */}
        <Card className={`border-2 ${data.engineCooling.status === 'critical' || data.engineCooling.status === 'failure' ? 'border-red-500' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FireIcon className="h-5 w-5 mr-2" />
                Engine Cooling
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(data.engineCooling.status)}
                <Badge className={getStatusColor(data.engineCooling.status)}>
                  {data.engineCooling.status.toUpperCase()}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-between">
                  <span className="text-sm">Coolant Temp</span>
                  <Badge variant={data.engineCooling.coolantTemp <= 210 ? 'success' : 
                                data.engineCooling.coolantTemp <= 230 ? 'warning' : 'destructive'}>
                    {data.engineCooling.coolantTemp}°F
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Coolant Level</span>
                  <Badge variant={data.engineCooling.coolantLevel >= 80 ? 'success' : 
                                data.engineCooling.coolantLevel >= 60 ? 'warning' : 'destructive'}>
                    {data.engineCooling.coolantLevel}%
                  </Badge>
                </div>
              </div>
              
              {data.engineCooling.overheatingRisk && (
                <Alert variant="destructive">
                  <AlertDescription>🔥 Engine overheating risk detected</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 5. Transmission */}
        <Card className={`border-2 ${data.transmission.status === 'critical' || data.transmission.status === 'failure' ? 'border-red-500' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
                Transmission
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(data.transmission.status)}
                <Badge className={getStatusColor(data.transmission.status)}>
                  {data.transmission.status.toUpperCase()}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-between">
                  <span className="text-sm">Fluid Level</span>
                  <Badge variant={data.transmission.fluidLevel >= 80 ? 'success' : 
                                data.transmission.fluidLevel >= 60 ? 'warning' : 'destructive'}>
                    {data.transmission.fluidLevel}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Fluid Temp</span>
                  <Badge variant={data.transmission.fluidTemp <= 200 ? 'success' : 
                                data.transmission.fluidTemp <= 220 ? 'warning' : 'destructive'}>
                    {data.transmission.fluidTemp}°F
                  </Badge>
                </div>
              </div>
              
              {data.transmission.gearSlipping && (
                <Alert variant="destructive">
                  <AlertDescription>⚠️ Gear slipping detected</AlertDescription>
                </Alert>
              )}
              
              {data.transmission.shiftingIssues && (
                <Alert variant="warning">
                  <AlertDescription>⚠️ Shifting difficulties detected</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Actions */}
      {data.recommendedActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recommendedActions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <span className="text-sm">{action}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleScheduleMaintenance(`action-${index}`)}
                  >
                    Schedule
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
