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

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';

// Function to create a custom truck marker element
function createTruckMarkerElement() {
  const element = document.createElement('div');
  element.className = 'truck-marker';
  element.style.width = '40px';
  element.style.height = '40px';
  element.style.borderRadius = '50%';
  element.style.backgroundColor = '#0d2b4b';
  element.style.border = '3px solid #FFC107';
  element.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
  element.style.display = 'flex';
  element.style.alignItems = 'center';
  element.style.justifyContent = 'center';
  element.style.fontSize = '20px';
  element.style.transition = 'all 0.3s ease';
  element.innerHTML = '🚛';
  element.style.cursor = 'pointer';

  // Add hover effect
  element.addEventListener('mouseenter', () => {
    element.style.transform = 'scale(1.2)';
    element.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
  });

  element.addEventListener('mouseleave', () => {
    element.style.transform = 'scale(1)';
    element.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
  });

  return element;
}

interface RoutePoint {
  lat: number;
  lng: number;
  name: string;
  timestamp: string;
  speed: number;
}

interface MapboxTruckVisualizationProps {
  route: RoutePoint[];
  currentPosition?: RoutePoint;
  mapboxToken: string;
}

// Persistent storage keys
const TRUCK_POSITION_KEY = 'truck_animation_position';
const TRUCK_TIMESTAMP_KEY = 'truck_animation_timestamp';

// Get persistent truck position
const getPersistentTruckPosition = (): number => {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(TRUCK_POSITION_KEY);
  const timestamp = localStorage.getItem(TRUCK_TIMESTAMP_KEY);

  if (stored && timestamp) {
    const storedProgress = parseFloat(stored);
    const storedTime = parseInt(timestamp);
    const currentTime = Date.now();
    const timeDiff = currentTime - storedTime;

    // Calculate how much the truck should have moved based on time elapsed
    // Assuming truck moves at ~0.1% per second (completes route in ~1000 seconds)
    const progressPerSecond = 0.001;
    const additionalProgress = (timeDiff / 1000) * progressPerSecond;

    return Math.min(1, storedProgress + additionalProgress);
  }
  return 0;
};

// Save persistent truck position
const savePersistentTruckPosition = (progress: number) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRUCK_POSITION_KEY, progress.toString());
  localStorage.setItem(TRUCK_TIMESTAMP_KEY, Date.now().toString());
};

export default function MapboxTruckVisualization({
  route,
  currentPosition,
  mapboxToken,
}: MapboxTruckVisualizationProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const truckMarker = useRef<mapboxgl.Marker | null>(null);
  const animationRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animationProgress, setAnimationProgress] = useState(() => getPersistentTruckPosition());
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTruckPosition, setCurrentTruckPosition] = useState<{
    lng: number;
    lat: number;
    speed: number;
  } | null>(null);

  // Initialize the map and 3D visualization
  useEffect(() => {
    if (!mapContainer.current || !route || route.length < 2) return;

    try {
      // Set Mapbox token
      mapboxgl.accessToken = mapboxToken;

      // Create map instance
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12', // Satellite imagery with streets
        center: [currentPosition?.lng || route[0].lng, currentPosition?.lat || route[0].lat],
        zoom: 12,
        pitch: 60, // Tilted view
        bearing: 0,
        antialias: true,
      });

      map.current = mapInstance;

      // Add navigation controls
      mapInstance.addControl(new mapboxgl.NavigationControl());

      // Wait for map to load
      mapInstance.on('load', () => {
        // Add route line
        mapInstance.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route.map(point => [point.lng, point.lat]),
            },
          },
        });

        mapInstance.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#FFC107',
            'line-width': 6,
            'line-opacity': 0.8,
          },
        });

        // Add start and end points
        const startPoint = route[0];
        const endPoint = route[route.length - 1];

        // Start marker
        new mapboxgl.Marker({ color: '#00FF00' })
          .setLngLat([startPoint.lng, startPoint.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>Start: ${startPoint.name}</h3>`))
          .addTo(mapInstance);

        // End marker
        new mapboxgl.Marker({ color: '#FF0000' })
          .setLngLat([endPoint.lng, endPoint.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>Destination: ${endPoint.name}</h3>`))
          .addTo(mapInstance);

        // Add animated truck marker
        addAnimatedTruckMarker(mapInstance);

        setLoading(false);
      });

      // Cleanup
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        if (truckMarker.current) {
          truckMarker.current.remove();
        }
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (err) {
      console.error('Error initializing map:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize map');
      setLoading(false);
    }
  }, [route, currentPosition, mapboxToken]);

  // Add animated truck marker
  const addAnimatedTruckMarker = (mapInstance: mapboxgl.Map) => {
    // Calculate initial position based on stored progress
    const initialProgress = animationProgress;
    let initialPosition;

    if (currentPosition) {
      initialPosition = currentPosition;
    } else if (initialProgress > 0 && route.length > 1) {
      // Calculate position based on stored progress
      const routeIndex = Math.floor(initialProgress * (route.length - 1));
      const nextIndex = Math.min(routeIndex + 1, route.length - 1);
      const segmentProgress = initialProgress * (route.length - 1) - routeIndex;

      const currentPoint = route[routeIndex];
      const nextPoint = route[nextIndex];

      const lng = currentPoint.lng + (nextPoint.lng - currentPoint.lng) * segmentProgress;
      const lat = currentPoint.lat + (nextPoint.lat - currentPoint.lat) * segmentProgress;
      const speed = currentPoint.speed + (nextPoint.speed - currentPoint.speed) * segmentProgress;

      initialPosition = {
        lng,
        lat,
        speed,
        name: currentPoint.name,
        timestamp: new Date().toISOString(),
      };
    } else {
      initialPosition = route[0];
    }

    setCurrentTruckPosition({
      lng: initialPosition.lng,
      lat: initialPosition.lat,
      speed: initialPosition.speed,
    });

    // Create the truck marker
    const truckElement = createTruckMarkerElement();
    truckMarker.current = new mapboxgl.Marker({
      element: truckElement,
      anchor: 'center',
    })
      .setLngLat([initialPosition.lng, initialPosition.lat])
      .addTo(mapInstance);

    // Add popup to truck marker
    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: false,
      closeOnClick: false,
    }).setHTML(`
      <div class="truck-popup">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">🚛 Live Truck</h3>
        <p style="margin: 0; font-size: 12px;">Speed: ${Math.round(initialPosition.speed)} mph</p>
        <p style="margin: 0; font-size: 12px;">Progress: ${Math.round(initialProgress * 100)}%</p>
      </div>
    `);

    truckMarker.current.setPopup(popup);

    // Start continuous animation if no current position is provided (demo mode)
    if (!currentPosition && route.length > 1) {
      setIsAnimating(true);
      startContinuousTruckMovement(mapInstance);
    }
  };

  // Start continuous truck movement (updates every 10 seconds)
  const startContinuousTruckMovement = (mapInstance: mapboxgl.Map) => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const updateTruckPosition = () => {
      if (!isAnimating || !route || route.length < 2) return;

      // Get current progress and increment it
      let currentProgress = animationProgress;

      // Move truck forward by a small amount (adjust this value to control speed)
      // This represents moving ~1% of the route every 10 seconds
      const progressIncrement = 0.01;
      currentProgress += progressIncrement;

      // If we've completed the route, start over
      if (currentProgress >= 1) {
        currentProgress = 0;
      }

      // Calculate new position along the route
      const routeIndex = Math.floor(currentProgress * (route.length - 1));
      const nextIndex = Math.min(routeIndex + 1, route.length - 1);
      const segmentProgress = currentProgress * (route.length - 1) - routeIndex;

      // Interpolate between route points
      const currentPoint = route[routeIndex];
      const nextPoint = route[nextIndex];

      const newLng = currentPoint.lng + (nextPoint.lng - currentPoint.lng) * segmentProgress;
      const newLat = currentPoint.lat + (nextPoint.lat - currentPoint.lat) * segmentProgress;
      const newSpeed =
        currentPoint.speed + (nextPoint.speed - currentPoint.speed) * segmentProgress;

      // Update truck marker position
      if (truckMarker.current) {
        truckMarker.current.setLngLat([newLng, newLat]);

        // Update popup content
        const popup = truckMarker.current.getPopup();
        if (popup) {
          popup.setHTML(`
            <div class="truck-popup">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">🚛 Live Truck</h3>
              <p style="margin: 0; font-size: 12px;">Speed: ${Math.round(newSpeed)} mph</p>
              <p style="margin: 0; font-size: 12px;">Progress: ${Math.round(currentProgress * 100)}%</p>
              <p style="margin: 0; font-size: 12px;">Location: ${currentPoint.name}</p>
            </div>
          `);
        }

        // Smoothly follow the truck every few updates
        if (Math.round(currentProgress * 100) % 10 === 0) {
          mapInstance.easeTo({
            center: [newLng, newLat],
            duration: 2000,
          });
        }
      }

      // Update state and save to localStorage
      setAnimationProgress(currentProgress);
      setCurrentTruckPosition({ lng: newLng, lat: newLat, speed: newSpeed });
      savePersistentTruckPosition(currentProgress);
    };

    // Initial update
    updateTruckPosition();

    // Set up interval to update every 10 seconds
    intervalRef.current = setInterval(updateTruckPosition, 10000);
  };

  // Effect to handle current position updates
  useEffect(() => {
    if (currentPosition && truckMarker.current) {
      // Stop animation if we have a fixed current position
      setIsAnimating(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Update truck marker to current position
      truckMarker.current.setLngLat([currentPosition.lng, currentPosition.lat]);

      // Update popup
      const popup = truckMarker.current.getPopup();
      if (popup) {
        popup.setHTML(`
          <div class="truck-popup">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">Live Truck</h3>
            <p style="margin: 0; font-size: 12px;">Speed: ${currentPosition.speed} mph</p>
            <p style="margin: 0; font-size: 12px;">Location: ${currentPosition.name}</p>
          </div>
        `);
      }

      // Center map on current position
      if (map.current) {
        map.current.easeTo({
          center: [currentPosition.lng, currentPosition.lat],
          duration: 1000,
        });
      }
    }
  }, [currentPosition]);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75 z-10">
          <div className="text-lg font-semibold">Loading 3D map...</div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 dark:bg-red-900 bg-opacity-75 dark:bg-opacity-75 z-10">
          <div className="text-lg font-semibold text-red-700 dark:text-red-300">{error}</div>
        </div>
      )}

      <div ref={mapContainer} className="w-full h-full" />

      {/* Overlay with truck info */}
      {!loading && !error && (
        <div className="absolute top-4 right-4 bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg shadow-md backdrop-blur-sm max-w-xs">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🚛 Live Truck Tracking
          </h3>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1">
            {currentPosition ? (
              <>
                <p>
                  <span className="font-medium">Location:</span> {currentPosition.name}
                </p>
                <p>
                  <span className="font-medium">Speed:</span> {currentPosition.speed.toFixed(1)} mph
                </p>
                <p>
                  <span className="font-medium">Last Update:</span>{' '}
                  {new Date(currentPosition.timestamp).toLocaleTimeString()}
                </p>
              </>
            ) : (
              <>
                <p>
                  <span className="font-medium">Mode:</span> Demo Animation
                </p>
                <p>
                  <span className="font-medium">Progress:</span>{' '}
                  {Math.round(animationProgress * 100)}%
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, animationProgress * 100))}%` }}
                  ></div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Animation controls */}
      {!loading && !error && !currentPosition && (
        <div className="absolute bottom-4 left-4 bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg shadow-md backdrop-blur-sm">
          <button
            type="button"
            onClick={() => {
              if (isAnimating) {
                setIsAnimating(false);
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                }
              } else {
                setIsAnimating(true);
                if (map.current) {
                  startContinuousTruckMovement(map.current);
                }
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {isAnimating ? '⏸️ Pause' : '▶️ Play'} Animation
          </button>
        </div>
      )}
    </div>
  );
}
