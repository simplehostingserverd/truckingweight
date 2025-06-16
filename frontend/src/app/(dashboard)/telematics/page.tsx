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

import CesiumMap from '@/components/Map/CesiumMap';
import MechanicalDiagnostics from '@/components/Telematics/MechanicalDiagnostics';
import SpeedometerGauge from '@/components/Telematics/SpeedometerGauge';
import TelematicsIntegration from '@/components/Telematics/TelematicsIntegration';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import {
  BoltIcon,
  ClockIcon,
  Cog6ToothIcon,
  DevicePhoneMobileIcon,
  ExclamationTriangleIcon,
  FireIcon,
  FuelIcon,
  SignalIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

// Mock comprehensive telematics data
const mockFleetData = {
  totalAssets: 12,
  activeAssets: 8,
  totalMiles: 15420,
  avgSpeed: 62,
  fuelEfficiency: 6.8,
  onTimeDeliveries: 94.2,
  hosViolations: 2,
  maintenanceAlerts: 3,
  criticalAlerts: 1,
  connectedDevices: 8,
};

const mockVehicleData = [
  {
    vehicleId: 'Truck #1247',
    driver: {
      name: 'John Smith',
      id: 'driver-001',
      phone: '(555) 123-4567',
      status: 'driving',
      hoursRemaining: 2.8,
    },
    location: {
      address: 'I-10 E, Desert Center, CA',
      coordinates: [-115.1398, 33.7456],
      speed: 68,
    },
    mechanicalData: {
      vehicleId: 'Truck #1247',
      engine: {
        rpm: 1450,
        coolantTemp: 185,
        oilPressure: 45,
        oilTemp: 195,
        fuelLevel: 78,
        engineHours: 12456.7,
        diagnosticCodes: [],
        batteryVoltage: 13.8,
        airIntakeTemp: 95,
        exhaustTemp: 650,
      },
      transmission: {
        temp: 180,
        pressure: 220,
        gear: 8,
        clutchWear: 15,
      },
      brakes: {
        airPressure: 115,
        padWear: { front: 25, rear: 30 },
        temperature: { front: 180, rear: 175 },
      },
      tires: {
        pressure: { frontLeft: 105, frontRight: 107, rearLeft: 108, rearRight: 106 },
        temperature: { frontLeft: 85, frontRight: 87, rearLeft: 89, rearRight: 88 },
        treadDepth: { frontLeft: 8.5, frontRight: 8.2, rearLeft: 7.8, rearRight: 7.9 },
      },
      trailer: {
        brakeTemp: 165,
        tirePressure: [102, 104, 103, 105, 101, 106],
        lightStatus: { brake: true, turn: true, running: true },
        doorStatus: 'closed' as const,
      },
      alerts: [
        {
          id: 'alert-001',
          severity: 'warning' as const,
          category: 'hos',
          message: 'Driver approaching HOS limit in 1.5 hours',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          acknowledged: false,
        },
      ],
      lastUpdate: new Date().toISOString(),
    },
  },
  {
    vehicleId: 'Truck #1856',
    driver: {
      name: 'Sarah Johnson',
      id: 'driver-002',
      phone: '(555) 987-6543',
      status: 'on_duty_not_driving',
      hoursRemaining: 8.0,
    },
    location: {
      address: 'Distribution Center, Dallas, TX',
      coordinates: [-96.797, 32.7767],
      speed: 0,
    },
    mechanicalData: {
      vehicleId: 'Truck #1856',
      engine: {
        rpm: 0,
        coolantTemp: 72,
        oilPressure: 0,
        oilTemp: 75,
        fuelLevel: 95,
        engineHours: 8934.2,
        diagnosticCodes: [],
        batteryVoltage: 12.6,
        airIntakeTemp: 78,
        exhaustTemp: 85,
      },
      transmission: {
        temp: 85,
        pressure: 0,
        gear: 0,
        clutchWear: 8,
      },
      brakes: {
        airPressure: 125,
        padWear: { front: 15, rear: 18 },
        temperature: { front: 85, rear: 82 },
      },
      tires: {
        pressure: { frontLeft: 108, frontRight: 109, rearLeft: 107, rearRight: 108 },
        temperature: { frontLeft: 78, frontRight: 79, rearLeft: 80, rearRight: 78 },
        treadDepth: { frontLeft: 9.2, frontRight: 9.1, rearLeft: 8.8, rearRight: 8.9 },
      },
      trailer: {
        brakeTemp: 78,
        tirePressure: [108, 109, 107, 108, 109, 107],
        lightStatus: { brake: true, turn: true, running: true },
        doorStatus: 'closed' as const,
        refrigeration: {
          setTemp: -10,
          actualTemp: -8,
          defrostCycle: false,
          alarms: [],
          fuelLevel: 85,
        },
      },
      alerts: [
        {
          id: 'alert-002',
          severity: 'critical' as const,
          category: 'temperature',
          message: 'Reefer unit temperature variance detected',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          acknowledged: false,
        },
      ],
      lastUpdate: new Date().toISOString(),
    },
  },
];

// Mock critical safety data for the top 5 mechanical issues
const mockCriticalSafetyData = {
  vehicleId: 'Truck #1247',
  driverName: 'John Smith',
  driverPhone: '(555) 123-4567',
  location: 'I-10 E, Desert Center, CA',
  timestamp: new Date().toISOString(),

  brakeSystem: {
    status: 'warning' as const,
    airPressure: 95, // Below optimal
    padWearFront: 25, // Getting low
    padWearRear: 30,
    temperature: 320, // Getting hot
    airLeaks: false,
    warningLights: true, // Warning light on
    lastInspection: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    issues: ['Brake warning light active', 'Air pressure below optimal'],
  },

  tireSystem: {
    status: 'critical' as const,
    pressures: [88, 105, 107, 92], // Two tires low
    temperatures: [95, 87, 89, 98],
    treadDepths: [6.2, 8.1, 7.9, 5.8], // Two tires worn
    blowoutRisk: true,
    unevenWear: true,
    lastRotation: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    issues: ['Two tires below minimum pressure', 'Uneven wear detected', 'High blowout risk'],
  },

  engineCooling: {
    status: 'safe' as const,
    coolantTemp: 195,
    coolantLevel: 85,
    radiatorCondition: 'good' as const,
    fanOperation: true,
    thermostatWorking: true,
    overheatingRisk: false,
    issues: [],
  },

  electricalSystem: {
    status: 'critical' as const,
    batteryVoltage: 11.9, // Low battery
    alternatorOutput: 12.8, // Low output
    lightingSystem: {
      headlights: true,
      taillights: true,
      brakeLight: false, // CRITICAL - brake light failure
      turnSignals: false, // CRITICAL - turn signal failure
      hazardLights: true,
      markerLights: false, // Marker light failure
    },
    wiringCondition: 'fair' as const,
    issues: [
      'Brake light failure - ACCIDENT RISK',
      'Turn signal failure - ACCIDENT RISK',
      'Marker lights out',
      'Low battery voltage',
    ],
  },

  transmission: {
    status: 'warning' as const,
    fluidLevel: 65, // Low
    fluidTemp: 210, // Getting hot
    pressure: 180, // Low pressure
    gearSlipping: true,
    shiftingIssues: false,
    clutchWear: 25,
    issues: ['Low transmission fluid', 'Gear slipping detected'],
  },

  overallSafetyScore: 45, // Poor score due to critical issues
  accidentRiskLevel: 'critical' as const,
  recommendedActions: [
    'IMMEDIATE: Fix brake lights and turn signals',
    'IMMEDIATE: Check tire pressure and replace worn tires',
    'URGENT: Service brake system',
    'URGENT: Check electrical system and battery',
    'Schedule transmission service',
  ],
};

// Mock driver alerts
const mockDriverAlerts = [
  {
    id: 'alert-brake-light',
    severity: 'emergency' as const,
    category: 'electrical' as const,
    title: 'BRAKE LIGHT FAILURE',
    message:
      'Your brake lights are not working. This is a critical safety issue that significantly increases accident risk.',
    actionRequired: 'Pull over safely and contact dispatch immediately. Do not continue driving.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    acknowledged: false,
    soundAlert: true,
    vibrationAlert: true,
    emergencyStop: true,
  },
  {
    id: 'alert-turn-signals',
    severity: 'critical' as const,
    category: 'electrical' as const,
    title: 'Turn Signal Failure',
    message: 'Turn signals are not functioning properly. Other drivers cannot see your intentions.',
    actionRequired: 'Use hand signals and contact maintenance. Schedule immediate repair.',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    acknowledged: false,
    soundAlert: true,
  },
  {
    id: 'alert-tire-pressure',
    severity: 'critical' as const,
    category: 'tire' as const,
    title: 'Low Tire Pressure',
    message: 'Two tires have dangerously low pressure. Risk of blowout is high.',
    actionRequired: 'Check tire pressure immediately. Add air or replace if damaged.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    acknowledged: false,
    soundAlert: true,
  },
  {
    id: 'alert-brake-warning',
    severity: 'warning' as const,
    category: 'brake' as const,
    title: 'Brake System Warning',
    message: 'Brake warning light is active and air pressure is below optimal.',
    actionRequired: 'Have brake system inspected at next stop. Monitor brake performance.',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    acknowledged: false,
  },
];

export default function TelematicsPage() {
  const [selectedVehicle, setSelectedVehicle] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Simulate speed changes
      mockVehicleData[0].location.speed = Math.max(
        0,
        mockVehicleData[0].location.speed + (Math.random() - 0.5) * 10
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const currentVehicle = mockVehicleData[selectedVehicle];
  const criticalAlerts = mockVehicleData.flatMap(v =>
    v.mechanicalData.alerts.filter(a => a.severity === 'critical' && !a.acknowledged)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Live Telematics & Fleet Monitoring
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Real-time vehicle tracking, mechanical diagnostics, and driver monitoring
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()} •
            <span className={autoRefresh ? 'text-green-500' : 'text-red-500'}>
              {autoRefresh ? ' LIVE' : ' PAUSED'}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <SignalIcon className="h-5 w-5 mr-2" />
            {autoRefresh ? 'Live' : 'Paused'}
          </Button>
          <Button variant="outline">
            <Cog6ToothIcon className="h-5 w-5 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <Alert variant="destructive" className="mb-6 border-red-500 bg-red-50 dark:bg-red-900/20">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>CRITICAL MECHANICAL ALERTS</AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              {criticalAlerts.map(alert => (
                <div key={alert.id} className="flex justify-between items-center mb-1">
                  <span className="font-medium">{alert.message}</span>
                  <Badge variant="destructive" className="animate-pulse">
                    IMMEDIATE ACTION REQUIRED
                  </Badge>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Fleet Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Assets</p>
                <h3 className="text-2xl font-bold mt-1">{mockFleetData.totalAssets}</h3>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <TruckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Live Tracking
                </p>
                <h3 className="text-2xl font-bold mt-1">{mockFleetData.activeAssets}</h3>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <BoltIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Connected</p>
                <h3 className="text-2xl font-bold mt-1">{mockFleetData.connectedDevices}</h3>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                <DevicePhoneMobileIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Speed</p>
                <h3 className="text-2xl font-bold mt-1">{mockFleetData.avgSpeed} mph</h3>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
                <SignalIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fuel MPG</p>
                <h3 className="text-2xl font-bold mt-1">{mockFleetData.fuelEfficiency}</h3>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                <FuelIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">On-Time %</p>
                <h3 className="text-2xl font-bold mt-1">{mockFleetData.onTimeDeliveries}%</h3>
              </div>
              <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-full">
                <ClockIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">HOS Alerts</p>
                <h3 className="text-2xl font-bold mt-1">{mockFleetData.hosViolations}</h3>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Critical</p>
                <h3 className="text-2xl font-bold mt-1">{mockFleetData.criticalAlerts}</h3>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                <FireIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Live Overview</TabsTrigger>
          <TabsTrigger value="safety">Safety Monitor</TabsTrigger>
          <TabsTrigger value="alerts">Driver Alerts</TabsTrigger>
          <TabsTrigger value="speedometer">Speed Monitor</TabsTrigger>
          <TabsTrigger value="diagnostics">Mechanical</TabsTrigger>
          <TabsTrigger value="map">3D Tracking</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Vehicle Selection */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TruckIcon className="h-5 w-5 mr-2" />
                  Live Vehicle Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockVehicleData.map((vehicle, index) => (
                    <div
                      key={vehicle.vehicleId}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedVehicle === index
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedVehicle(index)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-2 ${
                              vehicle.location.speed > 0
                                ? 'bg-green-500 animate-pulse'
                                : 'bg-gray-500'
                            }`}
                          ></div>
                          <span className="font-medium text-sm">{vehicle.vehicleId}</span>
                        </div>
                        <Badge
                          variant={vehicle.location.speed > 0 ? 'primary' : 'secondary'}
                          className="text-xs"
                        >
                          {vehicle.location.speed > 0 ? 'Moving' : 'Stopped'}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <div>Driver: {vehicle.driver.name}</div>
                        <div>Speed: {Math.round(vehicle.location.speed)} mph</div>
                        <div>Location: {vehicle.location.address}</div>
                        <div>HOS: {vehicle.driver.hoursRemaining}h remaining</div>
                      </div>
                      {vehicle.mechanicalData.alerts.length > 0 && (
                        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                          <span className="text-yellow-600 dark:text-yellow-400">
                            ⚠️ {vehicle.mechanicalData.alerts.length} alert(s)
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Live Speedometer */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <SignalIcon className="h-5 w-5 mr-2" />
                    Live Speed Monitor
                  </div>
                  <Badge variant="outline" className="animate-pulse">
                    LIVE
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <SpeedometerGauge
                  speed={currentVehicle.location.speed}
                  speedLimit={70}
                  size="lg"
                  driverName={currentVehicle.driver.name}
                  vehicleId={currentVehicle.vehicleId}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="safety" className="space-y-6">
          <CriticalSafetyMonitor
            data={mockCriticalSafetyData}
            onEmergencyAlert={(vehicleId, issue) => {
              console.log('Emergency alert for:', vehicleId, issue);
              // In real app: trigger emergency protocols
            }}
            onMaintenanceSchedule={(vehicleId, system) => {
              console.log('Schedule maintenance for:', vehicleId, system);
              // In real app: schedule maintenance
            }}
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <DriverAlertSystem
            driverName={currentVehicle.driver.name}
            vehicleId={currentVehicle.vehicleId}
            alerts={mockDriverAlerts}
            onAcknowledgeAlert={alertId => {
              console.log('Acknowledging alert:', alertId);
              // In real app: update alert status
            }}
            onEmergencyContact={() => {
              console.log('Emergency contact initiated');
              // In real app: initiate emergency call
            }}
            onRequestAssistance={() => {
              console.log('Assistance requested');
              // In real app: request roadside assistance
            }}
          />
        </TabsContent>

        <TabsContent value="speedometer" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockVehicleData.map((vehicle, index) => (
              <Card key={vehicle.vehicleId}>
                <CardContent className="pt-6">
                  <SpeedometerGauge
                    speed={vehicle.location.speed}
                    speedLimit={70}
                    size="md"
                    driverName={vehicle.driver.name}
                    vehicleId={vehicle.vehicleId}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-6">
          <MechanicalDiagnostics
            data={currentVehicle.mechanicalData}
            onAcknowledgeAlert={alertId => {
              console.log('Acknowledging alert:', alertId);
            }}
          />
        </TabsContent>

        <TabsContent value="map" className="space-y-6">
          <CesiumMap height="800px" selectedRoute="asset-1247" onRouteSelect={() => {}} />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <TelematicsIntegration />
        </TabsContent>
      </Tabs>
    </div>
  );
}
