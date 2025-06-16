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

import React, { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Define marker types
export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  type: 'scale' | 'violation' | 'vehicle';
  status?: string;
  data?: unknown;
}

interface MapTilerMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  markers?: MapMarker[];
  onMarkerClick?: (markerId: string, markerType: string, markerData?: any) => void;
  showHeatmap?: boolean;
  className?: string;
  height?: string;
}

const MapTilerMap: React.FC<MapTilerMapProps> = ({
  latitude,
  longitude,
  zoom = 13,
  markers = [],
  onMarkerClick,
  showHeatmap = false,
  className = '',
  height = '600px',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Set a timeout to detect if MapTiler SDK fails to load
    const sdkLoadTimeout = setTimeout(() => {
      setError('MapTiler SDK failed to load. Please check your internet connection or API key.');
      setIsLoading(false);
    }, 10000); // 10 seconds timeout

    // Wait for MapTiler SDK to be loaded
    const initMap = () => {
      if (typeof window.maptilersdk === 'undefined') {
        // Check if we've been waiting too long (over 5 seconds)
        setTimeout(initMap, 100);
        return;
      }

      // Clear the timeout since SDK loaded
      clearTimeout(sdkLoadTimeout);

      try {
        // Check if API key is configured
        if (!window.maptilersdk.config.apiKey) {
          console.warn('MapTiler API key is not set. Using fallback map display.');
          setError('MapTiler API key is missing. Using fallback display.');
          setIsLoading(false);
          return;
        }

        // Create map instance with dark style and 3D terrain
        const mapInstance = new window.maptilersdk.Map({
          container: mapContainer.current,
          style: window.maptilersdk.MapStyle.DARK,
          center: [longitude, latitude],
          zoom: zoom,
          pitch: 45, // Tilted view for 3D effect
          bearing: 0,
          antialias: true, // Enable antialiasing for smoother rendering
          terrain: true, // Enable 3D terrain
          fog: true, // Enable atmospheric fog for depth perception
          hash: false,
          attributionControl: false,
        });

        // Add error handler for map
        mapInstance.on('error', (e: unknown) => {
          console.error('MapTiler map error:', e);
          setError('Error loading map: ' + (e.error?.message || 'Unknown error'));
        });

        // Add navigation controls
        mapInstance.addControl(new window.maptilersdk.NavigationControl());

        // Add scale control
        mapInstance.addControl(
          new window.maptilersdk.ScaleControl({
            maxWidth: 100,
            unit: 'imperial',
          })
        );

        // Add fullscreen control
        mapInstance.addControl(new window.maptilersdk.FullscreenControl());

        // Add 3D buildings layer when map loads
        mapInstance.on('load', () => {
          // Add 3D buildings
          mapInstance.addLayer({
            id: '3d-buildings',
            source: 'openmaptiles',
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 15,
            paint: {
              'fill-extrusion-color': '#4287f5',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.6,
            },
          });

          setIsLoading(false);

          // Add markers after map is loaded
          addMarkers(mapInstance);

          // Add heatmap if enabled
          if (showHeatmap && markers.length > 0) {
            addHeatmap(mapInstance);
          }
        });

        // Save map reference
        map.current = mapInstance;
      } catch (err) {
        console.error('Error initializing MapTiler map:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize map');
        setIsLoading(false);
      }
    };

    // Initialize the map
    initMap();

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [latitude, longitude, zoom]);

  // Add markers to the map
  const addMarkers = (mapInstance: unknown) => {
    // Clear existing markers
    Object.values(markersRef.current).forEach((marker: unknown) => {
      marker.remove();
    });
    markersRef.current = {};

    // Add new markers
    markers.forEach(marker => {
      // Create marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.backgroundSize = 'contain';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundPosition = 'center';

      // Set marker style based on type and status
      if (marker.type === 'scale') {
        if (marker.status === 'Active') {
          el.style.backgroundColor = 'rgba(59, 130, 246, 0.8)'; // Blue for active scales
          el.style.backgroundImage = "url('/images/scale-icon.svg')";
        } else if (marker.status === 'Maintenance') {
          el.style.backgroundColor = 'rgba(245, 158, 11, 0.8)'; // Yellow for maintenance
          el.style.backgroundImage = "url('/images/scale-icon.svg')";
        } else {
          el.style.backgroundColor = 'rgba(107, 114, 128, 0.8)'; // Gray for inactive
          el.style.backgroundImage = "url('/images/scale-icon.svg')";
        }
      } else if (marker.type === 'violation') {
        el.style.backgroundColor = 'rgba(239, 68, 68, 0.8)'; // Red for violations
        el.style.backgroundImage = "url('/images/violation-icon.svg')";
      } else if (marker.type === 'vehicle') {
        if (marker.status === 'In Transit') {
          el.style.backgroundColor = 'rgba(16, 185, 129, 0.8)'; // Green for moving vehicles
          el.style.backgroundImage = "url('/images/truck-icon.svg')";
        } else {
          el.style.backgroundColor = 'rgba(245, 158, 11, 0.8)'; // Yellow for stopped vehicles
          el.style.backgroundImage = "url('/images/truck-icon.svg')";
        }
      }

      // Create popup with marker information
      const popup = new window.maptilersdk.Popup({
        offset: 25,
        closeButton: false,
        className: 'custom-popup',
      }).setHTML(`
        <div class="p-2">
          <h3 class="font-bold text-sm">${marker.title || marker.id}</h3>
          ${marker.status ? `<p class="text-xs mt-1">Status: ${marker.status}</p>` : ''}
        </div>
      `);

      // Create marker instance
      const markerInstance = new window.maptilersdk.Marker({
        element: el,
        anchor: 'bottom',
      })
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(popup)
        .addTo(mapInstance);

      // Add click event
      markerInstance.getElement().addEventListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(marker.id, marker.type, marker.data);
        }
      });

      // Store marker reference
      markersRef.current[marker.id] = markerInstance;
    });
  };

  // Add heatmap layer
  const addHeatmap = (mapInstance: unknown) => {
    // Check if heatmap source already exists
    if (mapInstance.getSource('heatmap-data')) {
      mapInstance.removeLayer('heatmap-layer');
      mapInstance.removeSource('heatmap-data');
    }

    // Create heatmap data
    const heatmapData = {
      type: 'FeatureCollection',
      features: markers.map(marker => ({
        type: 'Feature',
        properties: {
          intensity: marker.type === 'violation' ? 1.0 : 0.5,
        },
        geometry: {
          type: 'Point',
          coordinates: [marker.longitude, marker.latitude],
        },
      })),
    };

    // Add heatmap source
    mapInstance.addSource('heatmap-data', {
      type: 'geojson',
      data: heatmapData,
    });

    // Add heatmap layer
    mapInstance.addLayer({
      id: 'heatmap-layer',
      type: 'heatmap',
      source: 'heatmap-data',
      paint: {
        'heatmap-weight': ['get', 'intensity'],
        'heatmap-intensity': 0.6,
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'rgba(33,102,172,0)',
          0.2,
          'rgb(103,169,207)',
          0.4,
          'rgb(209,229,240)',
          0.6,
          'rgb(253,219,199)',
          0.8,
          'rgb(239,138,98)',
          1,
          'rgb(178,24,43)',
        ],
        'heatmap-radius': 20,
        'heatmap-opacity': 0.7,
      },
    });
  };

  // Update markers when they change
  useEffect(() => {
    if (map.current && !isLoading) {
      addMarkers(map.current);

      if (showHeatmap && markers.length > 0) {
        addHeatmap(map.current);
      } else if (map.current.getSource('heatmap-data')) {
        map.current.removeLayer('heatmap-layer');
        map.current.removeSource('heatmap-data');
      }
    }
  }, [markers, showHeatmap, isLoading]);

  // Update map center and zoom when props change
  useEffect(() => {
    if (map.current && !isLoading) {
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: zoom,
        essential: true,
      });
    }
  }, [latitude, longitude, zoom, isLoading]);

  // Render a fallback map display when there's an error
  const renderFallbackMap = () => {
    return (
      <div
        className="relative w-full flex flex-col items-center justify-center bg-gray-800 border border-gray-700 rounded-md p-6"
        style={{ height }}
      >
        <div className="text-center max-w-md">
          <h3 className="text-xl font-semibold text-red-400 mb-2">Map Unavailable</h3>
          <p className="text-gray-300 mb-4">
            {error || 'Unable to load map. Please try again later.'}
          </p>

          {/* Fallback static map image */}
          <div className="relative w-full h-64 bg-gray-900 rounded-md overflow-hidden mb-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-4 grid-rows-4 gap-1 w-full h-full opacity-30">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="bg-gray-700 rounded-sm"></div>
                ))}
              </div>

              {/* Fake markers */}
              {markers &&
                markers.length > 0 &&
                markers.slice(0, 5).map((marker, i) => (
                  <div
                    key={i}
                    className={`absolute w-3 h-3 rounded-full ${
                      marker.type === 'scale'
                        ? 'bg-blue-500'
                        : marker.type === 'violation'
                          ? 'bg-red-500'
                          : 'bg-yellow-500'
                    }`}
                    style={{
                      left: `${30 + i * 15 + Math.random() * 30}%`,
                      top: `${30 + Math.random() * 40}%`,
                    }}
                  ></div>
                ))}
            </div>
          </div>

          <p className="text-sm text-gray-400">
            Map data would display {markers?.length || 0} locations including scales, violations,
            and vehicles.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading ? (
        <Skeleton className={`w-full bg-gray-700`} style={{ height }} />
      ) : error ? (
        renderFallbackMap()
      ) : (
        <div ref={mapContainer} className="w-full" style={{ height }} />
      )}
    </div>
  );
};

export default MapTilerMap;
