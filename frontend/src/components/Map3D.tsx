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


import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Cesium components with no SSR
const CesiumMap = dynamic(() => import('./CesiumMap'), {
  ssr: false,
  loading: () => <MapLoadingPlaceholder />,
});

// Placeholder component while map is loading
function MapLoadingPlaceholder() {
  return (
    <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading 3D Map...</p>
      </div>
    </div>
  );
}

interface Map3DProps {
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

const Map3D: React.FC<Map3DProps> = ({
  latitude,
  longitude,
  zoom = 13,
  markers = [],
  onMarkerClick,
}) => {
  const [isClient, setIsClient] = useState(false);

  // Only render on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <MapLoadingPlaceholder />;
  }

  return (
    <CesiumMap
      latitude={latitude}
      longitude={longitude}
      zoom={zoom}
      markers={markers}
      onMarkerClick={onMarkerClick}
    />
  );
};

export default Map3D;
