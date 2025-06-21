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

import React, { useEffect, useRef } from 'react';

// Declare Cesium as a global variable
declare global {
  interface Window {
    Cesium: unknown;
  }
}

interface CesiumMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  markers?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title?: string;
  }>;
  onMarkerClick?: (markerId: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CesiumMap: React.FC<CesiumMapProps> = ({
  latitude,
  longitude,
  zoom = 13,
  markers = [],
  onMarkerClick,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const markersRef = useRef<{ [key: string]: Cesium.Entity }>({});

  // Initialize Cesium viewer
  useEffect(() => {
    if (!mapRef.current) return;

    // Wait for Cesium to be loaded
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const initCesiumViewer = () => {
      if (typeof window.Cesium === 'undefined') {
        setTimeout(initCesiumViewer, 100);
        return;
      }

      // Set Cesium ion access token
      if (process.env.NEXT_PUBLIC_CESIUM_TOKEN) {
        window.Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN;
      }

      // Create viewer
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const viewer = new window.Cesium.Viewer(mapRef.current, {
        terrainProvider: window.Cesium.createWorldTerrain(),
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
      });

      // Save viewer reference
      viewerRef.current = viewer;

      // Set initial camera position
      viewer.camera.flyTo({
        destination: window.Cesium.Cartesian3.fromDegrees(longitude, latitude, 10000),
        orientation: {
          heading: window.Cesium.Math.toRadians(0),
          pitch: window.Cesium.Math.toRadians(-90),
          roll: 0.0,
        },
      });
    };

    // Initialize the Cesium viewer
    initCesiumViewer();

    // Cleanup on unmount
    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // Update markers when they change
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const viewer = viewerRef.current;
    if (!viewer || typeof window.Cesium === 'undefined') return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(entity => {
      viewer.entities.remove(entity);
    });
    markersRef.current = {};

    // Add new markers
    markers.forEach(marker => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const entity = viewer.entities.add({
        id: marker.id,
        position: window.Cesium.Cartesian3.fromDegrees(marker.longitude, marker.latitude),
        billboard: {
          image: '/images/marker.png',
          width: 32,
          height: 32,
          verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM,
        },
        label: marker.title
          ? {
              text: marker.title,
              font: '14px sans-serif',
              horizontalOrigin: window.Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: window.Cesium.VerticalOrigin.TOP,
              pixelOffset: new window.Cesium.Cartesian2(0, -36),
            }
          : undefined,
      });

      markersRef.current[marker.id] = entity;
    });

    // Set up click handler
    if (onMarkerClick) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const handler = new window.Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((click: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const pickedObject = viewer.scene.pick(click.position);
        if (window.Cesium.defined(pickedObject) && pickedObject.id) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const id = pickedObject.id.id;
          if (markers.some(m => m.id === id)) {
            onMarkerClick(id);
          }
        }
      }, window.Cesium.ScreenSpaceEventType.LEFT_CLICK);

      return () => {
        handler.destroy();
      };
    }
  }, [markers, onMarkerClick]);

  // Update camera position when lat/lng/zoom changes
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const viewer = viewerRef.current;
    if (!viewer || typeof window.Cesium === 'undefined') return;

    viewer.camera.flyTo({
      destination: window.Cesium.Cartesian3.fromDegrees(longitude, latitude, 10000 / zoom),
      orientation: {
        heading: window.Cesium.Math.toRadians(0),
        pitch: window.Cesium.Math.toRadians(-90),
        roll: 0.0,
      },
    });
  }, [latitude, longitude, zoom]);

  return <div ref={mapRef} className="w-full h-[500px]" />;
};

export default CesiumMap;
