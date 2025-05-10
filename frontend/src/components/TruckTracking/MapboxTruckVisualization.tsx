'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import 'mapbox-gl/dist/mapbox-gl.css';

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

export default function MapboxTruckVisualization({ 
  route, 
  currentPosition,
  mapboxToken
}: MapboxTruckVisualizationProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
        antialias: true
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
              coordinates: route.map(point => [point.lng, point.lat])
            }
          }
        });
        
        mapInstance.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#FFC107',
            'line-width': 6,
            'line-opacity': 0.8
          }
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
        
        // Add custom 3D truck layer
        addTruckLayer(mapInstance);
        
        setLoading(false);
      });
      
      // Cleanup
      return () => {
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
  
  // Add 3D truck layer using Three.js
  const addTruckLayer = (mapInstance: mapboxgl.Map) => {
    // Current truck position
    const truckPosition = currentPosition || 
      route[Math.floor(route.length * 0.7)]; // Default to 70% along the route
    
    // Create a custom layer for the 3D truck
    const truckLayer = {
      id: '3d-truck',
      type: 'custom',
      renderingMode: '3d',
      
      onAdd: function(map: mapboxgl.Map, gl: WebGLRenderingContext) {
        // Create Three.js scene
        this.scene = new THREE.Scene();
        
        // Create camera (will be automatically updated by Mapbox)
        this.camera = new THREE.Camera();
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl,
          antialias: true
        });
        
        this.renderer.autoClear = false;
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
        directionalLight.position.set(0, 70, 100);
        this.scene.add(directionalLight);
        
        // Load 3D truck model
        const loader = new GLTFLoader();
        
        try {
          loader.load(
            '/models/truck.glb',
            (gltf) => {
              this.truck = gltf.scene;
              
              // Scale and adjust the truck model
              this.truck.scale.set(0.05, 0.05, 0.05);
              this.truck.rotation.x = Math.PI / 2; // Rotate to align with the ground
              
              // Add truck to scene
              this.scene.add(this.truck);
              
              // Calculate initial position
              this.updateTruckPosition(truckPosition.lng, truckPosition.lat);
            },
            undefined,
            (error) => {
              console.error('Error loading truck model:', error);
              this.createFallbackTruck();
            }
          );
        } catch (err) {
          console.error('Failed to load truck model:', err);
          this.createFallbackTruck();
        }
      },
      
      createFallbackTruck: function() {
        // Create a simple truck shape if the model fails to load
        const truckGeometry = new THREE.BoxGeometry(1, 0.5, 2);
        const cabinGeometry = new THREE.BoxGeometry(1, 0.7, 0.8);
        
        const truckMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        
        const truckBody = new THREE.Mesh(truckGeometry, truckMaterial);
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        
        cabin.position.z = -0.6;
        cabin.position.y = 0.1;
        
        this.truck = new THREE.Group();
        this.truck.add(truckBody);
        this.truck.add(cabin);
        
        this.scene.add(this.truck);
        
        // Calculate initial position
        this.updateTruckPosition(truckPosition.lng, truckPosition.lat);
      },
      
      updateTruckPosition: function(lng: number, lat: number) {
        if (!this.truck) return;
        
        // Convert geographic coordinates to Mercator coordinates
        const position = mapboxgl.MercatorCoordinate.fromLngLat(
          [lng, lat],
          0 // Elevation
        );
        
        // Scale the model to a consistent size regardless of zoom level
        const modelScale = position.meterInMercatorCoordinateUnits();
        
        // Set the position
        this.truck.position.x = position.x;
        this.truck.position.y = position.y;
        this.truck.position.z = position.z;
        
        // Calculate truck heading based on route
        const currentIndex = route.findIndex(p => p.lng === lng && p.lat === lat);
        if (currentIndex > 0 && currentIndex < route.length - 1) {
          const prevPoint = route[currentIndex - 1];
          const nextPoint = route[currentIndex + 1];
          
          // Calculate direction vector
          const direction = [nextPoint.lng - prevPoint.lng, nextPoint.lat - prevPoint.lat];
          
          // Calculate angle
          const angle = Math.atan2(direction[1], direction[0]);
          
          // Apply rotation to truck
          this.truck.rotation.z = angle;
        }
      },
      
      render: function(gl: WebGLRenderingContext, matrix: number[]) {
        if (!this.truck) return;
        
        // Update truck position if current position changes
        if (currentPosition) {
          this.updateTruckPosition(currentPosition.lng, currentPosition.lat);
        }
        
        // Render the Three.js scene
        this.renderer.resetState();
        this.renderer.render(this.scene, this.camera);
      }
    } as any;
    
    // Add the custom layer to the map
    mapInstance.addLayer(truckLayer);
  };
  
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
      {!loading && !error && currentPosition && (
        <div className="absolute top-4 right-4 bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg shadow-md backdrop-blur-sm max-w-xs">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Live Truck Tracking
          </h3>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <p><span className="font-medium">Location:</span> {currentPosition.name}</p>
            <p><span className="font-medium">Speed:</span> {currentPosition.speed.toFixed(1)} mph</p>
            <p><span className="font-medium">Last Update:</span> {new Date(currentPosition.timestamp).toLocaleTimeString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
