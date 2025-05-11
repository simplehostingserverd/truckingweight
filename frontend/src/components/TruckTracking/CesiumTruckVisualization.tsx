'use client';

import { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

interface RoutePoint {
  lat: number;
  lng: number;
  name: string;
  timestamp: string;
  speed: number;
}

interface CesiumTruckVisualizationProps {
  route: RoutePoint[];
  currentPosition?: RoutePoint;
  cesiumToken: string;
}

export default function CesiumTruckVisualization({
  route,
  currentPosition,
  cesiumToken,
}: CesiumTruckVisualizationProps) {
  const cesiumContainer = useRef<HTMLDivElement>(null);
  const viewer = useRef<Cesium.Viewer | null>(null);
  const truckEntity = useRef<Cesium.Entity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Cesium viewer
  useEffect(() => {
    if (!cesiumContainer.current || !route || route.length < 2) return;

    try {
      // Set Cesium ion access token
      Cesium.Ion.defaultAccessToken = cesiumToken;

      // Create Cesium viewer with basic options first
      const cesiumViewer = new Cesium.Viewer(cesiumContainer.current, {
        timeline: false,
        animation: false,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        navigationHelpButton: false,
        sceneModePicker: false,
        selectionIndicator: false,
        infoBox: false,
        fullscreenButton: false,
        shouldAnimate: true,
      });

      // Set the terrain provider asynchronously
      (async () => {
        try {
          const worldTerrain = await Cesium.createWorldTerrainAsync();
          cesiumViewer.terrainProvider = worldTerrain;
        } catch (error) {
          console.error('Failed to load world terrain:', error);
        }
      })();

      viewer.current = cesiumViewer;

      // Enable lighting effects
      cesiumViewer.scene.globe.enableLighting = true;

      // Add route path
      addRoutePath(cesiumViewer);

      // Add truck entity
      addTruckEntity(cesiumViewer);

      // Set camera to look at the truck
      setCameraView(cesiumViewer);

      setLoading(false);

      // Cleanup
      return () => {
        if (viewer.current) {
          viewer.current.destroy();
          viewer.current = null;
        }
      };
    } catch (err) {
      console.error('Error initializing Cesium:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize 3D Earth visualization');
      setLoading(false);
    }
  }, [route, cesiumToken]);

  // Add route path to the viewer
  const addRoutePath = (cesiumViewer: Cesium.Viewer) => {
    // Create route path
    const routePositions = route.map(
      point => Cesium.Cartesian3.fromDegrees(point.lng, point.lat, 100) // Elevation in meters
    );

    // Add route path entity
    cesiumViewer.entities.add({
      name: 'Route Path',
      polyline: {
        positions: routePositions,
        width: 5,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.2,
          color: Cesium.Color.YELLOW,
        }),
        clampToGround: true,
      },
    });

    // Add start point
    cesiumViewer.entities.add({
      name: 'Start Point',
      position: Cesium.Cartesian3.fromDegrees(route[0].lng, route[0].lat, 100),
      point: {
        pixelSize: 15,
        color: Cesium.Color.GREEN,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      },
      label: {
        text: 'Start',
        font: '14pt sans-serif',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -10),
      },
    });

    // Add end point
    cesiumViewer.entities.add({
      name: 'End Point',
      position: Cesium.Cartesian3.fromDegrees(
        route[route.length - 1].lng,
        route[route.length - 1].lat,
        100
      ),
      point: {
        pixelSize: 15,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      },
      label: {
        text: 'Destination',
        font: '14pt sans-serif',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -10),
      },
    });
  };

  // Add truck entity to the viewer
  const addTruckEntity = (cesiumViewer: Cesium.Viewer) => {
    // Current truck position
    const truckPos = currentPosition || route[Math.floor(route.length * 0.7)];

    // Calculate heading based on route
    let heading = 0;
    const currentIndex = route.findIndex(p => p.lng === truckPos.lng && p.lat === truckPos.lat);

    if (currentIndex > 0 && currentIndex < route.length - 1) {
      const prevPoint = route[currentIndex - 1];
      const nextPoint = route[currentIndex + 1];

      // Calculate direction vector
      const dx = nextPoint.lng - prevPoint.lng;
      const dy = nextPoint.lat - prevPoint.lat;

      // Calculate angle in radians
      heading = Math.atan2(dy, dx);
    }

    // Create truck entity
    const truck = cesiumViewer.entities.add({
      name: 'Truck',
      position: Cesium.Cartesian3.fromDegrees(truckPos.lng, truckPos.lat, 100),
      orientation: Cesium.Transforms.headingPitchRollQuaternion(
        Cesium.Cartesian3.fromDegrees(truckPos.lng, truckPos.lat, 100),
        new Cesium.HeadingPitchRoll(heading, 0, 0)
      ),
      // Use a billboard with truck image
      billboard: {
        image: '/images/truck_PNG16270.png',
        width: 64,
        height: 64,
        scale: 0.5,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      },
      label: {
        text: 'Truck',
        font: '14pt sans-serif',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -30),
        showBackground: true,
        backgroundColor: new Cesium.Color(0, 0, 0, 0.7),
      },
    });

    truckEntity.current = truck;

    // Set up animation to move truck along the route
    setupTruckAnimation(cesiumViewer);
  };

  // Set up animation to move truck along the route
  const setupTruckAnimation = (cesiumViewer: Cesium.Viewer) => {
    if (!truckEntity.current) return;

    // If currentPosition is provided, just position the truck there
    if (currentPosition) {
      truckEntity.current.position = new Cesium.ConstantPositionProperty(
        Cesium.Cartesian3.fromDegrees(currentPosition.lng, currentPosition.lat, 100)
      );
      return;
    }

    // Otherwise, animate the truck along the route
    const startTime = Cesium.JulianDate.fromDate(new Date());
    const endTime = Cesium.JulianDate.addSeconds(
      startTime,
      route.length * 5, // 5 seconds per point
      new Cesium.JulianDate()
    );

    // Set the clock range
    cesiumViewer.clock.startTime = startTime.clone();
    cesiumViewer.clock.stopTime = endTime.clone();
    cesiumViewer.clock.currentTime = startTime.clone();
    cesiumViewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
    cesiumViewer.clock.multiplier = 1;

    // Create position property for animation
    const positionProperty = new Cesium.SampledPositionProperty();

    // Add positions along the route
    for (let i = 0; i < route.length; i++) {
      const time = Cesium.JulianDate.addSeconds(
        startTime,
        i * 5, // 5 seconds per point
        new Cesium.JulianDate()
      );

      const position = Cesium.Cartesian3.fromDegrees(route[i].lng, route[i].lat, 100);

      positionProperty.addSample(time, position);
    }

    // Update truck position
    truckEntity.current.position = positionProperty;

    // Add orientation interpolation
    const orientationProperty = new Cesium.SampledProperty(Cesium.Quaternion);

    for (let i = 0; i < route.length - 1; i++) {
      const time = Cesium.JulianDate.addSeconds(
        startTime,
        i * 5, // 5 seconds per point
        new Cesium.JulianDate()
      );

      const nextIndex = i + 1;

      // Calculate heading between current and next point
      const dx = route[nextIndex].lng - route[i].lng;
      const dy = route[nextIndex].lat - route[i].lat;
      const heading = Math.atan2(dy, dx);

      const orientation = Cesium.Transforms.headingPitchRollQuaternion(
        Cesium.Cartesian3.fromDegrees(route[i].lng, route[i].lat, 100),
        new Cesium.HeadingPitchRoll(heading, 0, 0)
      );

      orientationProperty.addSample(time, orientation);
    }

    // Add final orientation
    const finalTime = Cesium.JulianDate.addSeconds(
      startTime,
      (route.length - 1) * 5, // 5 seconds per point
      new Cesium.JulianDate()
    );

    const finalHeading = Math.atan2(
      route[route.length - 1].lat - route[route.length - 2].lat,
      route[route.length - 1].lng - route[route.length - 2].lng
    );

    const finalOrientation = Cesium.Transforms.headingPitchRollQuaternion(
      Cesium.Cartesian3.fromDegrees(route[route.length - 1].lng, route[route.length - 1].lat, 100),
      new Cesium.HeadingPitchRoll(finalHeading, 0, 0)
    );

    orientationProperty.addSample(finalTime, finalOrientation);

    // Update truck orientation
    truckEntity.current.orientation = orientationProperty;
  };

  // Set camera view to follow the truck
  const setCameraView = (cesiumViewer: Cesium.Viewer) => {
    if (!truckEntity.current) return;

    // Set initial view to look at the truck
    cesiumViewer.trackedEntity = truckEntity.current;

    // Adjust camera view
    cesiumViewer.scene.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        route[0].lng,
        route[0].lat,
        5000 // Height in meters
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0.0,
      },
    });
  };

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75 z-10">
          <div className="text-lg font-semibold">Loading 3D Earth visualization...</div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 dark:bg-red-900 bg-opacity-75 dark:bg-opacity-75 z-10">
          <div className="text-lg font-semibold text-red-700 dark:text-red-300">{error}</div>
        </div>
      )}

      <div ref={cesiumContainer} className="w-full h-full" />
    </div>
  );
}
