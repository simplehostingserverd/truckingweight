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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ClockIcon,
  GlobeAltIcon,
  MapPinIcon,
  ScaleIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';

// Professional mock telematics data for investor demonstration
const mockTelematicsData = [
  {
    id: 'asset-FL2847',
    name: 'Chicago to Denver Express',
    driver: {
      id: 'CDL-IL-847291',
      name: 'Michael Rodriguez',
      license: 'CDL-IL-847291',
      phone: '(312) 555-8472',
      status: 'driving',
      hoursOfService: {
        driving: 8.5,
        onDuty: 10.2,
        remaining: 2.8,
        nextBreakRequired: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(),
      },
    },
    vehicle: {
      id: 'FL-2847',
      make: 'Freightliner',
      model: 'Cascadia Evolution',
      year: 2022,
      vin: '1FUJGHDV8NLAA2847',
      licensePlate: 'IL PFS-2847',
      mileage: 287456,
    },
    telematics: {
      gps: {
        latitude: 33.7456,
        longitude: -115.1398,
        altitude: 1250,
        speed: 68, // mph
        heading: 95, // degrees
        accuracy: 3.2, // meters
        lastUpdate: new Date(Date.now() - 30 * 1000).toISOString(),
      },
      engine: {
        rpm: 1450,
        coolantTemp: 185, // °F
        oilPressure: 45, // psi
        fuelLevel: 78, // %
        engineHours: 12456.7,
        diagnosticCodes: [],
      },
      vehicle: {
        odometer: 145678.3,
        fuelConsumption: 6.8, // mpg
        idleTime: 0.5, // hours today
        hardBraking: 0,
        hardAcceleration: 1,
        speeding: 0,
      },
      environmental: {
        outsideTemp: 95, // °F
        humidity: 35, // %
        airPressure: 29.92, // inHg
      },
    },
    status: 'in_transit',
    progress: 65,
    startLocation: {
      name: 'Los Angeles, CA',
      coordinates: [-118.2437, 34.0522],
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    endLocation: {
      name: 'Phoenix, AZ',
      coordinates: [-112.074, 33.4484],
    },
    currentLocation: {
      coordinates: [-115.1398, 33.7456],
      address: 'I-10 E, Desert Center, CA',
      timestamp: new Date(Date.now() - 30 * 1000).toISOString(),
    },
    route: {
      plannedWaypoints: [
        { name: 'Riverside, CA', coordinates: [-117.3961, 33.9533] },
        { name: 'Palm Springs, CA', coordinates: [-116.5453, 33.8303] },
        { name: 'Blythe, CA', coordinates: [-114.5961, 33.6103] },
      ],
      actualPath: [
        {
          coordinates: [-118.2437, 34.0522],
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        },
        {
          coordinates: [-117.3961, 33.9533],
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
          coordinates: [-116.5453, 33.8303],
          timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
        },
        {
          coordinates: [-115.1398, 33.7456],
          timestamp: new Date(Date.now() - 30 * 1000).toISOString(),
        },
      ],
    },
    load: {
      weight: 45000,
      type: 'Dry Van',
      cargo: 'Electronics',
      temperature: null, // Not refrigerated
    },
    alerts: [
      {
        id: 'alert-001',
        type: 'warning',
        severity: 'medium',
        message: 'Driver approaching HOS limit',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        acknowledged: false,
      },
    ],
    eta: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    distance: 372,
    distanceRemaining: 130,
    estimatedFuelCost: 145.5,
  },
  {
    id: 'route-2',
    name: 'Dallas to Atlanta',
    driver: {
      id: 'driver-002',
      name: 'Sarah Johnson',
      license: 'CDL-TX-789012',
      phone: '(555) 987-6543',
      status: 'off_duty',
      hoursOfService: {
        driving: 0,
        onDuty: 0,
        remaining: 11,
        nextBreakRequired: new Date(Date.now() + 11 * 60 * 60 * 1000).toISOString(),
      },
    },
    vehicle: {
      id: 'truck-1856',
      make: 'Peterbilt',
      model: '579',
      year: 2021,
      vin: '1XPWD40X1ED123456',
      licensePlate: 'TX-TRK1856',
      mileage: 98432,
    },
    telematics: {
      gps: {
        latitude: 32.7767,
        longitude: -96.797,
        altitude: 430,
        speed: 0, // mph
        heading: 0, // degrees
        accuracy: 2.1, // meters
        lastUpdate: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      },
      engine: {
        rpm: 0,
        coolantTemp: 72, // °F
        oilPressure: 0, // psi
        fuelLevel: 95, // %
        engineHours: 8934.2,
        diagnosticCodes: [],
      },
      vehicle: {
        odometer: 98432.1,
        fuelConsumption: 7.2, // mpg
        idleTime: 0, // hours today
        hardBraking: 0,
        hardAcceleration: 0,
        speeding: 0,
      },
      environmental: {
        outsideTemp: 78, // °F
        humidity: 45, // %
        airPressure: 30.15, // inHg
      },
    },
    status: 'scheduled',
    progress: 0,
    startLocation: {
      name: 'Dallas, TX',
      coordinates: [-96.797, 32.7767],
      timestamp: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    },
    endLocation: {
      name: 'Atlanta, GA',
      coordinates: [-84.388, 33.749],
    },
    currentLocation: {
      coordinates: [-96.797, 32.7767], // At start location
      address: 'Distribution Center, Dallas, TX',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    },
    route: {
      plannedWaypoints: [
        { name: 'Shreveport, LA', coordinates: [-93.7502, 32.5252] },
        { name: 'Jackson, MS', coordinates: [-90.1848, 32.2988] },
        { name: 'Birmingham, AL', coordinates: [-86.8025, 33.5186] },
      ],
      actualPath: [
        {
          coordinates: [-96.797, 32.7767],
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        },
      ],
    },
    load: {
      weight: 38000,
      type: 'Reefer',
      cargo: 'Frozen Foods',
      temperature: -10, // °F for frozen
    },
    alerts: [],
    eta: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    distance: 781,
    distanceRemaining: 781,
    estimatedFuelCost: 198.5,
  },
  {
    id: 'route-3',
    name: 'Chicago to Denver',
    driver: {
      id: 'driver-003',
      name: 'Mike Rodriguez',
      license: 'CDL-IL-345678',
      phone: '(555) 456-7890',
      status: 'off_duty',
      hoursOfService: {
        driving: 10,
        onDuty: 12,
        remaining: 0,
        nextBreakRequired: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
      },
    },
    vehicle: {
      id: 'truck-2134',
      make: 'Kenworth',
      model: 'T680',
      year: 2020,
      vin: '1XKWD40X0KJ654321',
      licensePlate: 'IL-TRK2134',
      mileage: 187654,
    },
    telematics: {
      gps: {
        latitude: 39.7392,
        longitude: -104.9903,
        altitude: 5280,
        speed: 0, // mph
        heading: 270, // degrees
        accuracy: 1.8, // meters
        lastUpdate: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      engine: {
        rpm: 0,
        coolantTemp: 68, // °F
        oilPressure: 0, // psi
        fuelLevel: 45, // %
        engineHours: 15678.9,
        diagnosticCodes: [],
      },
      vehicle: {
        odometer: 187654.8,
        fuelConsumption: 6.5, // mpg
        idleTime: 0.2, // hours today
        hardBraking: 0,
        hardAcceleration: 0,
        speeding: 0,
      },
      environmental: {
        outsideTemp: 65, // °F
        humidity: 25, // %
        airPressure: 24.89, // inHg (high altitude)
      },
    },
    status: 'completed',
    progress: 100,
    startLocation: {
      name: 'Chicago, IL',
      coordinates: [-87.6298, 41.8781],
      timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    },
    endLocation: {
      name: 'Denver, CO',
      coordinates: [-104.9903, 39.7392],
    },
    currentLocation: {
      coordinates: [-104.9903, 39.7392], // At end location
      address: 'Delivery Terminal, Denver, CO',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    route: {
      plannedWaypoints: [
        { name: 'Des Moines, IA', coordinates: [-93.6091, 41.5868] },
        { name: 'Omaha, NE', coordinates: [-95.9345, 41.2524] },
        { name: 'North Platte, NE', coordinates: [-100.7654, 41.1239] },
      ],
      actualPath: [
        {
          coordinates: [-87.6298, 41.8781],
          timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        },
        {
          coordinates: [-93.6091, 41.5868],
          timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
        },
        {
          coordinates: [-95.9345, 41.2524],
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
        {
          coordinates: [-100.7654, 41.1239],
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        },
        {
          coordinates: [-104.9903, 39.7392],
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
    load: {
      weight: 42000,
      type: 'Flatbed',
      cargo: 'Steel Beams',
      temperature: null, // Not temperature controlled
    },
    alerts: [],
    eta: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    distance: 920,
    distanceRemaining: 0,
    estimatedFuelCost: 285.2,
  },
];

interface CesiumMapProps {
  height?: string;
  selectedRoute?: string;
  onRouteSelect?: (routeId: string) => void;
}

export default function CesiumMap({
  height = '600px',
  selectedRoute,
  onRouteSelect,
}: CesiumMapProps) {
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRouteData, setSelectedRouteData] = useState(mockTelematicsData[0]);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        setIsLoading(true);

        // Check if Cesium is available
        if (typeof window === 'undefined') {
          setError('Window object not available');
          setIsLoading(false);
          return;
        }

        // Wait for Cesium to load if not already available
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait

        while (typeof window.Cesium === 'undefined' && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (typeof window.Cesium === 'undefined') {
          // Fallback to placeholder if Cesium doesn't load
          if (cesiumContainerRef.current) {
            cesiumContainerRef.current.innerHTML = `
              <div style="
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
              ">
                <div style="
                  text-align: center;
                  color: white;
                  z-index: 1;
                ">
                  <div style="font-size: 48px; margin-bottom: 16px;">🌍</div>
                  <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">3D Route Visualization</h3>
                  <p style="font-size: 16px; opacity: 0.9;">Cesium loading...</p>
                  <div style="
                    margin-top: 20px;
                    padding: 10px 20px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                  ">
                    Route: ${selectedRouteData.name}
                  </div>
                </div>
              </div>
            `;
          }
          setIsLoading(false);
          return;
        }

        // Set Cesium Ion access token
        const cesiumToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN;
        if (cesiumToken) {
          window.Cesium.Ion.defaultAccessToken = cesiumToken;
        }

        // Create Cesium viewer
        if (cesiumContainerRef.current && !viewerRef.current) {
          const viewer = new window.Cesium.Viewer(cesiumContainerRef.current, {
            terrainProvider: window.Cesium.createWorldTerrain(),
            baseLayerPicker: false,
            geocoder: false,
            homeButton: false,
            sceneModePicker: false,
            navigationHelpButton: false,
            animation: false,
            timeline: false,
            fullscreenButton: false,
            vrButton: false,
            infoBox: false,
            selectionIndicator: false,
          });

          viewerRef.current = viewer;

          // Set initial view to show the selected route
          const startCoords = selectedRouteData.startLocation.coordinates;
          const endCoords = selectedRouteData.endLocation.coordinates;

          viewer.camera.flyTo({
            destination: window.Cesium.Cartesian3.fromDegrees(
              (startCoords[0] + endCoords[0]) / 2,
              (startCoords[1] + endCoords[1]) / 2,
              1000000
            ),
            orientation: {
              heading: window.Cesium.Math.toRadians(0),
              pitch: window.Cesium.Math.toRadians(-45),
              roll: 0.0,
            },
          });

          // Add route visualization
          if (selectedRouteData.route?.actualPath) {
            const positions = selectedRouteData.route.actualPath.map(point =>
              window.Cesium.Cartesian3.fromDegrees(point.coordinates[0], point.coordinates[1])
            );

            viewer.entities.add({
              polyline: {
                positions: positions,
                width: 5,
                material: window.Cesium.Color.CYAN,
                clampToGround: true,
              },
            });
          }

          // Add vehicle marker at current location
          if (selectedRouteData.currentLocation?.coordinates) {
            viewer.entities.add({
              position: window.Cesium.Cartesian3.fromDegrees(
                selectedRouteData.currentLocation.coordinates[0],
                selectedRouteData.currentLocation.coordinates[1]
              ),
              billboard: {
                image: '🚛',
                scale: 2.0,
                verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM,
              },
              label: {
                text: selectedRouteData.vehicle.id,
                font: '12pt sans-serif',
                fillColor: window.Cesium.Color.WHITE,
                outlineColor: window.Cesium.Color.BLACK,
                outlineWidth: 2,
                style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new window.Cesium.Cartesian2(0, -50),
              },
            });
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing Cesium map:', err);
        setError('Failed to initialize 3D map');
        setIsLoading(false);
      }
    };

    initializeMap();

    // Cleanup on unmount
    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [selectedRouteData]);

  useEffect(() => {
    if (selectedRoute) {
      const route = mockTelematicsData.find(r => r.id === selectedRoute);
      if (route) {
        setSelectedRouteData(route);
      }
    }
  }, [selectedRoute]);

  const _getStatusColor = (status: string) => {
    switch (status) {
      case 'in_transit':
        return 'bg-blue-500';
      case 'scheduled':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_transit':
        return 'In Transit';
      case 'scheduled':
        return 'Scheduled';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div
            className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg"
            style={{ height }}
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading 3D Map...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div
            className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg"
            style={{ height }}
          >
            <div className="text-center">
              <div className="text-red-600 dark:text-red-400 mb-2">⚠️</div>
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Route Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GlobeAltIcon className="h-6 w-6 mr-2" />
            Active Routes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockTelematicsData.map(asset => (
              <div
                key={asset.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedRouteData.id === asset.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
                onClick={() => {
                  setSelectedRouteData(asset);
                  onRouteSelect?.(asset.id);
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">{asset.name}</h4>
                  <Badge
                    variant={
                      asset.status === 'completed'
                        ? 'success'
                        : asset.status === 'in_transit'
                          ? 'primary'
                          : 'secondary'
                    }
                    className="text-xs"
                  >
                    {getStatusText(asset.status)}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <TruckIcon className="h-3 w-3 mr-1" />
                    {asset.driver.name} • {asset.vehicle.id}
                  </div>
                  <div className="flex items-center">
                    <ScaleIcon className="h-3 w-3 mr-1" />
                    {asset.load.weight.toLocaleString()} lbs • {asset.load.type}
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-3 w-3 mr-1" />
                    {asset.distance} miles • {asset.distanceRemaining} remaining
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    Speed: {asset.telematics.gps.speed} mph
                  </div>
                </div>
                {asset.status === 'in_transit' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${asset.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{asset.progress}% complete</p>
                  </div>
                )}
                {asset.alerts.length > 0 && (
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                    <span className="text-yellow-600 dark:text-yellow-400">
                      ⚠️ {asset.alerts[0].message}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 3D Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <GlobeAltIcon className="h-6 w-6 mr-2" />
              3D Route Visualization
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <ClockIcon className="h-4 w-4" />
              ETA: {new Date(selectedRouteData.eta).toLocaleString()}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={cesiumContainerRef}
            className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
            style={{ height }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
