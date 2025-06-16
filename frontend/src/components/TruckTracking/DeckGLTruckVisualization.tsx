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
import { Deck } from '@deck.gl/core';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { PathLayer, IconLayer, PolygonLayer } from '@deck.gl/layers';
import { MapView } from '@deck.gl/core';
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
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const deckRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Mapbox and Deck.gl
  useEffect(() => {
    if (!mapContainer.current || !route || route.length < 2) return;

    try {
      // Current truck position
      const truckPosition = currentPosition || route[Math.floor(route.length * 0.7)];

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

      // Wait for map to load before adding deck.gl layers
      map.on('load', () => {
        // Create Deck.gl instance
        const deck = new Deck({
          canvas: 'deck-canvas',
          width: '100%',
          height: '100%',
          controller: false, // Let Mapbox handle the controller
          onViewStateChange: ({ viewState }) => {
            // Keep the map in sync with deck.gl view state
            map.jumpTo({
              center: [viewState.longitude, viewState.latitude],
              zoom: viewState.zoom,
              bearing: viewState.bearing,
              pitch: viewState.pitch,
            });
          },
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
              getColor: [255, 193, 7], // Yellow
              getWidth: 6,
              widthMinPixels: 4,
              widthMaxPixels: 10,
              rounded: true,
              pickable: true,
            }),

            // Start and end point layers
            new IconLayer({
              id: 'start-point',
              data: [
                {
                  position: [route[0].lng, route[0].lat],
                  name: 'Start: ' + route[0].name,
                },
              ],
              getPosition: d => d.position,
              getIcon: d => ({
                url: '/icons/start-marker.svg',
                width: 128,
                height: 128,
                anchorY: 128,
              }),
              getSize: 48,
              pickable: true,
            }),

            new IconLayer({
              id: 'end-point',
              data: [
                {
                  position: [route[route.length - 1].lng, route[route.length - 1].lat],
                  name: 'Destination: ' + route[route.length - 1].name,
                },
              ],
              getPosition: d => d.position,
              getIcon: d => ({
                url: '/icons/end-marker.svg',
                width: 128,
                height: 128,
                anchorY: 128,
              }),
              getSize: 48,
              pickable: true,
            }),

            // 3D truck layer - with fallback
            (() => {
              try {
                return new ScenegraphLayer({
                  id: 'truck-layer',
                  data: [
                    {
                      position: [truckPosition.lng, truckPosition.lat],
                      orientation: calculateTruckOrientation(truckPosition, route),
                      name: 'Truck',
                    },
                  ],
                  scenegraph: '/models/simple-truck.json',
                  sizeScale: 30,
                  getPosition: d => d.position,
                  getOrientation: d => d.orientation,
                  getTranslation: [0, 0, 0],
                  getScale: [1, 1, 1],
                  pickable: true,
                });
              } catch (modelError) {
                console.error('Failed to load 3D truck model, using fallback:', modelError);
                return createFallbackTruckLayer(
                  [truckPosition.lng, truckPosition.lat],
                  calculateTruckOrientation(truckPosition, route)
                );
              }
            })(),
          ],
          onLoad: () => {
            setLoading(false);
          },
          onError: (err: Error) => {
            console.error('Deck.gl error:', err);
            setError(err.message || 'Failed to initialize 3D visualization');
            setLoading(false);
          },
        });

        deckRef.current = deck;
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
    _orientation: [number, number, number]
  ) => {
    // Create a simple truck shape using a polygon layer
    return new PolygonLayer({
      id: 'fallback-truck-layer',
      data: [
        {
          // Truck body
          contour: [
            [position[0] - 0.0005, position[1] - 0.0005],
            [position[0] + 0.0005, position[1] - 0.0005],
            [position[0] + 0.0005, position[1] + 0.0005],
            [position[0] - 0.0005, position[1] + 0.0005],
          ],
          position: position,
          name: 'Truck',
        },
      ],
      getPolygon: d => d.contour,
      getFillColor: [255, 0, 0, 200],
      getLineColor: [0, 0, 0],
      getLineWidth: 1,
      extruded: true,
      getElevation: 100,
      pickable: true,
    });
  };

  // Update truck position when currentPosition changes
  useEffect(() => {
    if (!deckRef.current || !currentPosition || !mapRef.current) return;

    try {
      // Try to create a 3D truck layer, but fall back to a simple shape if it fails
      let truckLayer;

      try {
        truckLayer = new ScenegraphLayer({
          id: 'truck-layer',
          data: [
            {
              position: [currentPosition.lng, currentPosition.lat],
              orientation: calculateTruckOrientation(currentPosition, route),
              name: 'Truck',
            },
          ],
          scenegraph: '/models/simple-truck.json',
          sizeScale: 30,
          getPosition: d => d.position,
          getOrientation: d => d.orientation,
          getTranslation: [0, 0, 0],
          getScale: [1, 1, 1],
          pickable: true,
        });
      } catch (modelError) {
        console.error('Failed to load 3D truck model, using fallback:', modelError);
        truckLayer = createFallbackTruckLayer(
          [currentPosition.lng, currentPosition.lat],
          calculateTruckOrientation(currentPosition, route)
        );
      }

      // Get current layers
      const currentLayers = deckRef.current.props.layers;

      // Create new layers array with updated truck layer
      const newLayers = Array.isArray(currentLayers)
        ? currentLayers.map(layer => {
            if (layer && typeof layer === 'object' && 'id' in layer && layer.id === 'truck-layer') {
              return truckLayer;
            }
            return layer;
          })
        : [truckLayer];

      // Update the deck.gl layers
      deckRef.current.setProps({
        layers: newLayers,
      });

      // Update the map view to focus on the truck
      mapRef.current.flyTo({
        center: [currentPosition.lng, currentPosition.lat],
        essential: true,
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
      <canvas id="deck-canvas" className="absolute inset-0 pointer-events-none" />
    </div>
  );
}
