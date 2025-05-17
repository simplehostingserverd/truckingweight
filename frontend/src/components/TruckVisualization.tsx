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


import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Three.js component with no SSR
const TruckModel = dynamic(() => import('./TruckModel'), {
  ssr: false,
  loading: () => <ModelLoadingPlaceholder />,
});

// Placeholder component while model is loading
function ModelLoadingPlaceholder() {
  return (
    <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading 3D Model...</p>
      </div>
    </div>
  );
}

interface TruckVisualizationProps {
  vehicleType: 'semi' | 'dump' | 'tanker';
  axleCount: number;
  axleWeights?: number[];
  totalWeight?: number;
  width?: number;
  height?: number;
}

const TruckVisualization: React.FC<TruckVisualizationProps> = ({
  vehicleType,
  axleCount,
  axleWeights = [],
  totalWeight,
  width = 800,
  height = 400,
}) => {
  const [isClient, setIsClient] = useState(false);

  // Only render on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <ModelLoadingPlaceholder />;
  }

  return (
    <div style={{ width, height }}>
      <TruckModel
        vehicleType={vehicleType}
        axleCount={axleCount}
        axleWeights={axleWeights}
        totalWeight={totalWeight}
      />
    </div>
  );
};

export default TruckVisualization;
