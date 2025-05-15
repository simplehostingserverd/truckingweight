'use client';

import React, { useEffect } from 'react';
import { initCesium } from '@/utils/cesium-config';

/**
 * CesiumProvider component
 * This component initializes Cesium when the app loads
 */
export function CesiumProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Cesium
    initCesium();
    
    // Add Cesium script to the document if it doesn't exist
    if (typeof window !== 'undefined' && !document.getElementById('cesium-script')) {
      const script = document.createElement('script');
      script.id = 'cesium-script';
      script.src = '/static/chunks/cesium/Cesium.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return <>{children}</>;
}
