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
import { useEffect, useRef, useState } from 'react';
import { Deck, MapView } from 'deck.gl';
import { PathLayer, PolygonLayer } from 'deck.gl';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface RoutePoint {
  lat: number;
  lng: number;
  name: string;
  timestamp: string;
  speed: number;
}

interface DeckGLTruckVisualizationProps {
  route: RoutePoint[];
  currentPosition?: RoutePoint;
  mapboxToken: string;
}

export default function DeckGLTruckVisualization({
  route,
  currentPosition,
  mapboxToken,
}: DeckGLTruckVisualizationProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const deckRef = useRef<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canvasId] = useState(() => `deck-canvas-${Math.random().toString(36).substr(2, 9)}`);

  // Initialize Mapbox and Deck.gl
  useEffect(() => {
    if (!mapContainer.current || !route || route.length < 2) {
      setError('Invalid route data or missing container');
      setLoading(false);
      return;
    }

    console.log('DeckGL: Initializing with route points:', route.length);

    try {
      // Current truck position
      const truckPosition = currentPosition || route[Math.floor(route.length * 0.7)];

      // Validate Mapbox token
      if (!mapboxToken) {
        setError('Mapbox token is required for high-performance visualization');
        setLoading(false);
        return;
      }

      console.log('DeckGL: Using truck position:', truckPosition);

      // Set Mapbox token
      mapboxgl.accessToken = mapboxToken;

      // Create Mapbox instance
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [truckPosition.lng, truckPosition.lat],
        zoom: 12,
        pitch: 45,
        bearing: 0,
      });

      mapRef.current = map;

      // Handle map errors
      map.on('error', e => {
        console.error('Mapbox error:', e);
        setError('Failed to load map. Please check your internet connection.');
        setLoading(false);
      });

      // Wait for map to load before adding deck.gl layers
      map.on('load', () => {
        console.log('DeckGL: Mapbox loaded, initializing Deck.gl');

        try {
          // Ensure canvas is available
          if (!canvasRef.current) {
            console.error('DeckGL: Canvas ref not available');
            setError('Canvas element not available for 3D visualization');
            setLoading(false);
            return;
          }

          // Create Deck.gl instance with simplified configuration
          const deck = new Deck({
            canvas: canvasRef.current,
            width: '100%',
            height: '100%',
            controller: false, // Let Mapbox handle the controller
            views: [new MapView({ id: 'map' })],
            initialViewState: {
              longitude: truckPosition.lng,
              latitude: truckPosition.lat,
              zoom: 12,
              pitch: 45,
              bearing: 0,
            },
            layers: [
              // Route path layer
              new PathLayer({
                id: 'route-path',
                data: [
                  {
                    path: route.map(point => [point.lng, point.lat]),
                    name: 'Truck Route',
                  },
                ],
                getPath: d => d.path,
                getColor: [255, 193, 7, 200], // Yellow with alpha
                getWidth: 8,
                widthMinPixels: 4,
                widthMaxPixels: 12,
                rounded: true,
                pickable: true,
              }),

              // Start point using simple circle
              new PolygonLayer({
                id: 'start-point',
                data: [
                  {
                    position: [route[0].lng, route[0].lat],
                    name: 'Start: ' + route[0].name,
                  },
                ],
                getPolygon: d => [
                  [d.position[0] - 0.001, d.position[1] - 0.001],
                  [d.position[0] + 0.001, d.position[1] - 0.001],
                  [d.position[0] + 0.001, d.position[1] + 0.001],
                  [d.position[0] - 0.001, d.position[1] + 0.001],
                ],
                getFillColor: [0, 255, 0, 200], // Green
                getLineColor: [255, 255, 255, 255], // White border
                getLineWidth: 2,
                extruded: true,
                getElevation: 50,
                pickable: true,
              }),

              // End point using simple circle
              new PolygonLayer({
                id: 'end-point',
                data: [
                  {
                    position: [route[route.length - 1].lng, route[route.length - 1].lat],
                    name: 'Destination: ' + route[route.length - 1].name,
                  },
                ],
                getPolygon: d => [
                  [d.position[0] - 0.001, d.position[1] - 0.001],
                  [d.position[0] + 0.001, d.position[1] - 0.001],
                  [d.position[0] + 0.001, d.position[1] + 0.001],
                  [d.position[0] - 0.001, d.position[1] + 0.001],
                ],
                getFillColor: [255, 0, 0, 200], // Red
                getLineColor: [255, 255, 255, 255], // White border
                getLineWidth: 2,
                extruded: true,
                getElevation: 50,
                pickable: true,
              }),

              // Truck using simple 3D polygon
              createFallbackTruckLayer(
                [truckPosition.lng, truckPosition.lat],
                calculateTruckOrientation(truckPosition, route)
              ),
            ],
            onLoad: () => {
              console.log('DeckGL: Successfully loaded');
              setLoading(false);
            },
            onError: (err: Error) => {
              console.error('Deck.gl error:', err);
              setError(err.message || 'Failed to initialize 3D visualization');
              setLoading(false);
            },
          });

          deckRef.current = deck;
          console.log('DeckGL: Deck instance created successfully');
        } catch (deckError) {
          console.error('Error creating Deck.gl instance:', deckError);
          setError(
            'Failed to initialize high-performance 3D visualization. Please try refreshing the page.'
          );
          setLoading(false);
        }
      });

      // Cleanup
      return () => {
        if (deckRef.current) {
          deckRef.current.finalize();
        }
        if (mapRef.current) {
          mapRef.current.remove();
        }
      };
    } catch (err) {
      console.error('Error initializing visualization:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize 3D visualization');
      setLoading(false);
    }
  }, [route, mapboxToken]);

  // Calculate truck orientation based on route
  const calculateTruckOrientation = (
    position: RoutePoint,
    routePoints: RoutePoint[]
  ): [number, number, number] => {
    // Find position in route
    const index = routePoints.findIndex(p => p.lng === position.lng && p.lat === position.lat);

    if (index > 0 && index < routePoints.length - 1) {
      const prevPoint = routePoints[index - 1];
      const nextPoint = routePoints[index + 1];

      // Calculate direction vector
      const dx = nextPoint.lng - prevPoint.lng;
      const dy = nextPoint.lat - prevPoint.lat;

      // Calculate angle in radians
      const angle = Math.atan2(dy, dx);

      // Return orientation as [roll, pitch, yaw]
      return [0, 0, angle];
    }

    // Default orientation (facing north)
    return [0, 0, 0];
  };

  // Create a fallback truck layer using simple shapes
  const createFallbackTruckLayer = (
    position: [number, number],
    orientation: [number, number, number]
  ) => {
    // Create a truck-like shape using a polygon layer
    const angle = orientation[2]; // yaw angle
    const length = 0.0008; // Truck length
    const width = 0.0004; // Truck width

    // Calculate truck corners based on orientation
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Truck body points (rectangle oriented in direction of travel)
    const frontLeft = [
      position[0] + (length * cos - width * sin) / 2,
      position[1] + (length * sin + width * cos) / 2,
    ];
    const frontRight = [
      position[0] + (length * cos + width * sin) / 2,
      position[1] + (length * sin - width * cos) / 2,
    ];
    const backRight = [
      position[0] + (-length * cos + width * sin) / 2,
      position[1] + (-length * sin - width * cos) / 2,
    ];
    const backLeft = [
      position[0] + (-length * cos - width * sin) / 2,
      position[1] + (-length * sin + width * cos) / 2,
    ];

    return new PolygonLayer({
      id: 'truck-layer',
      data: [
        {
          contour: [frontLeft, frontRight, backRight, backLeft],
          position: position,
          name: 'Truck',
        },
      ],
      getPolygon: d => d.contour,
      getFillColor: [0, 100, 255, 220], // Blue truck
      getLineColor: [255, 255, 255, 255], // White outline
      getLineWidth: 2,
      extruded: true,
      getElevation: 80,
      pickable: true,
    });
  };

  // Update truck position when currentPosition changes
  useEffect(() => {
    if (!deckRef.current || !currentPosition || !mapRef.current) return;

    try {
      // Create updated truck layer
      const updatedTruckLayer = createFallbackTruckLayer(
        [currentPosition.lng, currentPosition.lat],
        calculateTruckOrientation(currentPosition, route)
      );

      // Get current layers and update truck layer
      const currentLayers = deckRef.current.props.layers || [];
      const newLayers = currentLayers.map(layer => {
        if (layer && typeof layer === 'object' && 'id' in layer && layer.id === 'truck-layer') {
          return updatedTruckLayer;
        }
        return layer;
      });

      // Update the deck.gl layers
      deckRef.current.setProps({
        layers: newLayers,
      });

      // Update the map view to focus on the truck (smoothly)
      mapRef.current.easeTo({
        center: [currentPosition.lng, currentPosition.lat],
        duration: 1000,
      });
    } catch (err) {
      console.error('Error updating truck position:', err);
    }
  }, [currentPosition, route]);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75 z-10">
          <div className="text-lg font-semibold">Loading high-performance 3D visualization...</div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 dark:bg-red-900 bg-opacity-75 dark:bg-opacity-75 z-10">
          <div className="text-lg font-semibold text-red-700 dark:text-red-300">{error}</div>
        </div>
      )}

      <div ref={mapContainer} className="w-full h-full" />
      <canvas
        ref={canvasRef}
        id={canvasId}
        className="absolute inset-0 pointer-events-none w-full h-full"
      />
    </div>
  );
}
