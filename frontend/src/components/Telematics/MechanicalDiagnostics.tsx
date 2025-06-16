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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import {
  BeakerIcon,
  BoltIcon,
  CogIcon,
  ExclamationTriangleIcon,
  FireIcon,
  FuelIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

interface MechanicalData {
  vehicleId: string;
  engine: {
    rpm: number;
    coolantTemp: number; // °F
    oilPressure: number; // psi
    oilTemp: number; // °F
    fuelLevel: number; // %
    engineHours: number;
    diagnosticCodes: string[];
    batteryVoltage: number;
    airIntakeTemp: number; // °F
    exhaustTemp: number; // °F
  };
  transmission: {
    temp: number; // °F
    pressure: number; // psi
    gear: number;
    clutchWear: number; // %
  };
  brakes: {
    airPressure: number; // psi
    padWear: {
      front: number; // %
      rear: number; // %
    };
    temperature: {
      front: number; // °F
      rear: number; // °F
    };
  };
  tires: {
    pressure: {
      frontLeft: number; // psi
      frontRight: number; // psi
      rearLeft: number; // psi
      rearRight: number; // psi
    };
    temperature: {
      frontLeft: number; // °F
      frontRight: number; // °F
      rearLeft: number; // °F
      rearRight: number; // °F
    };
    treadDepth: {
      frontLeft: number; // mm
      frontRight: number; // mm
      rearLeft: number; // mm
      rearRight: number; // mm
    };
  };
  trailer?: {
    brakeTemp: number; // °F
    tirePressure: number[]; // psi array for multiple axles
    lightStatus: {
      brake: boolean;
      turn: boolean;
      running: boolean;
    };
    doorStatus: 'open' | 'closed' | 'unknown';
    refrigeration?: {
      setTemp: number; // °F
      actualTemp: number; // °F
      defrostCycle: boolean;
      alarms: string[];
      fuelLevel: number; // %
    };
  };
  alerts: Array<{
    id: string;
    severity: 'critical' | 'warning' | 'info';
    category: string;
    message: string;
    timestamp: string;
    acknowledged: boolean;
  }>;
  lastUpdate: string;
}

interface MechanicalDiagnosticsProps {
  data: MechanicalData;
  onAcknowledgeAlert?: (alertId: string) => void;
}

export default function MechanicalDiagnostics({
  data,
  onAcknowledgeAlert,
}: MechanicalDiagnosticsProps) {
  const getStatusColor = (value: number, normal: [number, number], warning: [number, number]) => {
    if (value >= normal[0] && value <= normal[1]) return 'text-green-600 bg-green-100';
    if (value >= warning[0] && value <= warning[1]) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAlertIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'engine':
        return <CogIcon className="h-4 w-4" />;
      case 'temperature':
        return <FireIcon className="h-4 w-4" />;
      case 'pressure':
        return <BeakerIcon className="h-4 w-4" />;
      case 'electrical':
        return <BoltIcon className="h-4 w-4" />;
      case 'fuel':
        return <FuelIcon className="h-4 w-4" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
  };

  const criticalAlerts = data.alerts.filter(
    alert => alert.severity === 'critical' && !alert.acknowledged
  );
  const warningAlerts = data.alerts.filter(
    alert => alert.severity === 'warning' && !alert.acknowledged
  );

  return (
    <div className="space-y-6">
      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Alert variant="destructive" className="border-red-500 bg-red-50 dark:bg-red-900/20">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Critical Mechanical Issues Detected</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              {criticalAlerts.map(alert => (
                <div key={alert.id} className="flex justify-between items-center">
                  <span className="text-sm">{alert.message}</span>
                  <button
                    onClick={() => onAcknowledgeAlert?.(alert.id)}
                    className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Acknowledge
                  </button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engine Diagnostics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CogIcon className="h-5 w-5 mr-2" />
              Engine Diagnostics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">RPM</span>
                  <Badge className={getStatusColor(data.engine.rpm, [800, 2000], [600, 2500])}>
                    {data.engine.rpm}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Coolant Temp</span>
                  <Badge
                    className={getStatusColor(data.engine.coolantTemp, [180, 210], [160, 230])}
                  >
                    {data.engine.coolantTemp}°F
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Oil Pressure</span>
                  <Badge className={getStatusColor(data.engine.oilPressure, [30, 80], [20, 90])}>
                    {data.engine.oilPressure} psi
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Oil Temp</span>
                  <Badge className={getStatusColor(data.engine.oilTemp, [180, 220], [160, 250])}>
                    {data.engine.oilTemp}°F
                  </Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Fuel Level</span>
                  <Badge className={getStatusColor(data.engine.fuelLevel, [25, 100], [15, 100])}>
                    {data.engine.fuelLevel}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Battery</span>
                  <Badge
                    className={getStatusColor(
                      data.engine.batteryVoltage,
                      [12.4, 14.4],
                      [11.8, 15.0]
                    )}
                  >
                    {data.engine.batteryVoltage}V
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Air Intake</span>
                  <Badge
                    className={getStatusColor(data.engine.airIntakeTemp, [70, 120], [50, 140])}
                  >
                    {data.engine.airIntakeTemp}°F
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Exhaust</span>
                  <Badge
                    className={getStatusColor(data.engine.exhaustTemp, [300, 800], [250, 1000])}
                  >
                    {data.engine.exhaustTemp}°F
                  </Badge>
                </div>
              </div>
            </div>

            {data.engine.diagnosticCodes.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Diagnostic Codes:</h4>
                <div className="space-y-1">
                  {data.engine.diagnosticCodes.map((code, index) => (
                    <Badge key={index} variant="warning" className="mr-2">
                      {code}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Brake System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              Brake System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Air Pressure</span>
                <Badge className={getStatusColor(data.brakes.airPressure, [100, 125], [90, 130])}>
                  {data.brakes.airPressure} psi
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Front Brakes</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs">Pad Wear</span>
                      <Badge
                        className={getStatusColor(
                          100 - data.brakes.padWear.front,
                          [70, 100],
                          [50, 70]
                        )}
                      >
                        {100 - data.brakes.padWear.front}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs">Temperature</span>
                      <Badge
                        className={getStatusColor(
                          data.brakes.temperature.front,
                          [100, 300],
                          [80, 400]
                        )}
                      >
                        {data.brakes.temperature.front}°F
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Rear Brakes</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs">Pad Wear</span>
                      <Badge
                        className={getStatusColor(
                          100 - data.brakes.padWear.rear,
                          [70, 100],
                          [50, 70]
                        )}
                      >
                        {100 - data.brakes.padWear.rear}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs">Temperature</span>
                      <Badge
                        className={getStatusColor(
                          data.brakes.temperature.rear,
                          [100, 300],
                          [80, 400]
                        )}
                      >
                        {data.brakes.temperature.rear}°F
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transmission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
              Transmission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Current Gear</span>
                <Badge variant="outline">
                  {data.transmission.gear === 0 ? 'N' : data.transmission.gear}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Temperature</span>
                <Badge className={getStatusColor(data.transmission.temp, [160, 200], [140, 220])}>
                  {data.transmission.temp}°F
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pressure</span>
                <Badge
                  className={getStatusColor(data.transmission.pressure, [150, 300], [120, 350])}
                >
                  {data.transmission.pressure} psi
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Clutch Wear</span>
                <Badge
                  className={getStatusColor(
                    100 - data.transmission.clutchWear,
                    [70, 100],
                    [50, 70]
                  )}
                >
                  {100 - data.transmission.clutchWear}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tire Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BeakerIcon className="h-5 w-5 mr-2" />
              Tire Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Front Tires</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Left Pressure</span>
                    <Badge
                      className={getStatusColor(
                        data.tires.pressure.frontLeft,
                        [100, 110],
                        [90, 120]
                      )}
                    >
                      {data.tires.pressure.frontLeft} psi
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Right Pressure</span>
                    <Badge
                      className={getStatusColor(
                        data.tires.pressure.frontRight,
                        [100, 110],
                        [90, 120]
                      )}
                    >
                      {data.tires.pressure.frontRight} psi
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Rear Tires</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Left Pressure</span>
                    <Badge
                      className={getStatusColor(
                        data.tires.pressure.rearLeft,
                        [100, 110],
                        [90, 120]
                      )}
                    >
                      {data.tires.pressure.rearLeft} psi
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Right Pressure</span>
                    <Badge
                      className={getStatusColor(
                        data.tires.pressure.rearRight,
                        [100, 110],
                        [90, 120]
                      )}
                    >
                      {data.tires.pressure.rearRight} psi
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trailer Diagnostics */}
        {data.trailer && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
                Trailer Diagnostics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Trailer Brakes */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Brake System</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Brake Temperature</span>
                    <Badge
                      className={getStatusColor(data.trailer.brakeTemp, [100, 300], [80, 400])}
                    >
                      {data.trailer.brakeTemp}°F
                    </Badge>
                  </div>
                </div>

                {/* Trailer Tires */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Tire Pressure (Multi-Axle)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {data.trailer.tirePressure.map((pressure, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs text-gray-500">
                          Axle {Math.floor(index / 2) + 1}
                        </div>
                        <Badge
                          className={getStatusColor(pressure, [100, 110], [90, 120])}
                          variant="outline"
                        >
                          {pressure} psi
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trailer Lights */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Light Status</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Brake Lights</div>
                      <Badge variant={data.trailer.lightStatus.brake ? 'success' : 'destructive'}>
                        {data.trailer.lightStatus.brake ? 'OK' : 'FAULT'}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Turn Signals</div>
                      <Badge variant={data.trailer.lightStatus.turn ? 'success' : 'destructive'}>
                        {data.trailer.lightStatus.turn ? 'OK' : 'FAULT'}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Running Lights</div>
                      <Badge variant={data.trailer.lightStatus.running ? 'success' : 'destructive'}>
                        {data.trailer.lightStatus.running ? 'OK' : 'FAULT'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Door Status */}
                <div className="flex justify-between items-center">
                  <span className="text-sm">Door Status</span>
                  <Badge variant={data.trailer.doorStatus === 'closed' ? 'success' : 'warning'}>
                    {data.trailer.doorStatus.toUpperCase()}
                  </Badge>
                </div>

                {/* Refrigeration Unit */}
                {data.trailer.refrigeration && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <FireIcon className="h-4 w-4 mr-1" />
                      Refrigeration Unit
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex justify-between">
                        <span className="text-xs">Set Temp</span>
                        <Badge variant="outline">{data.trailer.refrigeration.setTemp}°F</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs">Actual Temp</span>
                        <Badge
                          className={getStatusColor(
                            data.trailer.refrigeration.actualTemp,
                            [
                              data.trailer.refrigeration.setTemp - 2,
                              data.trailer.refrigeration.setTemp + 2,
                            ],
                            [
                              data.trailer.refrigeration.setTemp - 5,
                              data.trailer.refrigeration.setTemp + 5,
                            ]
                          )}
                        >
                          {data.trailer.refrigeration.actualTemp}°F
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs">Fuel Level</span>
                        <Badge
                          className={getStatusColor(
                            data.trailer.refrigeration.fuelLevel,
                            [25, 100],
                            [15, 100]
                          )}
                        >
                          {data.trailer.refrigeration.fuelLevel}%
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs">Defrost Cycle</span>
                        <Badge
                          variant={data.trailer.refrigeration.defrostCycle ? 'warning' : 'success'}
                        >
                          {data.trailer.refrigeration.defrostCycle ? 'ACTIVE' : 'OFF'}
                        </Badge>
                      </div>
                    </div>
                    {data.trailer.refrigeration.alarms.length > 0 && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        <div className="text-xs font-medium text-red-600 dark:text-red-400">
                          Alarms:
                        </div>
                        {data.trailer.refrigeration.alarms.map((alarm, index) => (
                          <div key={index} className="text-xs text-red-600 dark:text-red-400">
                            • {alarm}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Warning Alerts */}
      {warningAlerts.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-700 dark:text-yellow-400">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              Maintenance Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {warningAlerts.map(alert => (
                <div
                  key={alert.id}
                  className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded"
                >
                  <div className="flex items-center">
                    {getAlertIcon(alert.category)}
                    <span className="ml-2 text-sm">{alert.message}</span>
                  </div>
                  <button
                    onClick={() => onAcknowledgeAlert?.(alert.id)}
                    className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
                  >
                    Acknowledge
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
