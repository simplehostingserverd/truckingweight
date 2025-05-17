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

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import 'mapbox-gl/dist/mapbox-gl.css';

interface TruckTrackingVisualizationProps {
  routeData: any;
  vehicleId: number;
}

export default function TruckTrackingVisualization({
  routeData,
  vehicleId,
}: TruckTrackingVisualizationProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [truckPosition, setTruckPosition] = useState({ lng: -95.7129, lat: 37.0902 });

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [truckPosition.lng, truckPosition.lat],
      zoom: 5,
      pitch: 45,
      bearing: 0,
    });

    // Set up 3D truck visualization when map loads
    map.current.on('load', () => {
      setupTruckVisualization();
      setupRouteVisualization(routeData);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Set up the 3D truck visualization
  const setupTruckVisualization = () => {
    if (!map.current) return;

    // Create custom layer for Three.js
    const customLayer = {
      id: '3d-truck',
      type: 'custom',
      renderingMode: '3d',

      onAdd: function (map: mapboxgl.Map, gl: WebGLRenderingContext) {
        // Initialize Three.js scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();
        this.renderer = new THREE.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl,
          antialias: true,
        });

        // Load 3D truck model
        const loader = new GLTFLoader();
        loader.load('/models/truck.glb', gltf => {
          this.truck = gltf.scene;
          this.truck.scale.set(0.01, 0.01, 0.01);
          this.scene.add(this.truck);
        });

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 70, 100);
        this.scene.add(directionalLight);
      },

      render: function (gl: WebGLRenderingContext, matrix: number[]) {
        if (this.truck) {
          // Update truck position
          const position = mapboxgl.MercatorCoordinate.fromLngLat(
            [truckPosition.lng, truckPosition.lat],
            0
          );
          this.truck.position.set(position.x, position.y, position.z);

          // Update truck rotation based on route
          // Calculate heading based on next point in route
          const heading = calculateHeading(routeData, truckPosition);
          this.truck.rotation.z = heading;
        }

        this.renderer.render(this.scene, this.camera);
      },
    };

    map.current.addLayer(customLayer);
  };

  // Set up the route visualization
  const setupRouteVisualization = (routeData: any) => {
    if (!map.current || !routeData || !routeData.coordinates) return;

    // Add route line
    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeData.coordinates,
        },
      },
    });

    map.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#0D2B4B',
        'line-width': 6,
        'line-opacity': 0.8,
      },
    });
  };

  // Simulate truck movement along the route
  useEffect(() => {
    if (!routeData || !routeData.coordinates) return;

    let currentPointIndex = 0;
    const coordinates = routeData.coordinates;

    const interval = setInterval(() => {
      if (currentPointIndex >= coordinates.length) {
        clearInterval(interval);
        return;
      }

      const [lng, lat] = coordinates[currentPointIndex];
      setTruckPosition({ lng, lat });

      currentPointIndex++;
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [routeData]);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Overlay with truck info */}
      <div className="absolute top-4 left-4 bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg shadow-md backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Truck #{vehicleId} Live Tracking
        </h3>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          <p>
            Current Position: {truckPosition.lng.toFixed(4)}, {truckPosition.lat.toFixed(4)}
          </p>
          <p>Speed: 65 mph</p>
          <p>ETA: {new Date(Date.now() + 3600000).toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate heading based on current position and next point
function calculateHeading(routeData: any, currentPosition: { lng: number; lat: number }) {
  // Implementation depends on your route data structure
  // This is a simplified version
  return 0; // Default heading (north)
}
