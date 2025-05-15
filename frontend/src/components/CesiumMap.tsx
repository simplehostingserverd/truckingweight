import React, { useEffect, useRef } from 'react';

// Declare Cesium as any type
declare const Cesium: any;

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

const CesiumMap: React.FC<CesiumMapProps> = ({
  latitude,
  longitude,
  zoom = 13,
  markers = [],
  onMarkerClick,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const markersRef = useRef<{ [key: string]: Cesium.Entity }>({});

  // Initialize Cesium viewer
  useEffect(() => {
    if (!mapRef.current || typeof Cesium === 'undefined') return;

    // Set Cesium ion access token
    if (process.env.NEXT_PUBLIC_CESIUM_TOKEN) {
      Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN;
    }

    // Create viewer
    const viewer = new Cesium.Viewer(mapRef.current, {
      terrainProvider: Cesium.createWorldTerrain(),
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
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 10000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: 0.0,
      },
    });

    // Cleanup on unmount
    return () => {
      if (viewer && !viewer.isDestroyed()) {
        viewer.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // Update markers when they change
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(entity => {
      viewer.entities.remove(entity);
    });
    markersRef.current = {};

    // Add new markers
    markers.forEach(marker => {
      const entity = viewer.entities.add({
        id: marker.id,
        position: Cesium.Cartesian3.fromDegrees(marker.longitude, marker.latitude),
        billboard: {
          image: '/images/marker.png',
          width: 32,
          height: 32,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
        label: marker.title
          ? {
              text: marker.title,
              font: '14px sans-serif',
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.TOP,
              pixelOffset: new Cesium.Cartesian2(0, -36),
            }
          : undefined,
      });

      markersRef.current[marker.id] = entity;
    });

    // Set up click handler
    if (onMarkerClick) {
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((click: any) => {
        const pickedObject = viewer.scene.pick(click.position);
        if (Cesium.defined(pickedObject) && pickedObject.id) {
          const id = pickedObject.id.id;
          if (markers.some(m => m.id === id)) {
            onMarkerClick(id);
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      return () => {
        handler.destroy();
      };
    }
  }, [markers, onMarkerClick]);

  // Update camera position when lat/lng/zoom changes
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 10000 / zoom),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: 0.0,
      },
    });
  }, [latitude, longitude, zoom]);

  return <div ref={mapRef} className="w-full h-[500px]" />;
};

export default CesiumMap;
