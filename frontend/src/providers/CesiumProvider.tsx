'use client';

import React, { useEffect } from 'react';

/**
 * CesiumProvider component
 * This component initializes Cesium when the app loads
 */
export function CesiumProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set Cesium base URL
    if (typeof window !== 'undefined') {
      window.CESIUM_BASE_URL = '/cesium';
    }

    // Add Cesium script to the document if it doesn't exist
    if (typeof window !== 'undefined' && !document.getElementById('cesium-script')) {
      const script = document.createElement('script');
      script.id = 'cesium-script';
      script.src = '/cesium/Cesium.js';
      script.async = true;
      document.head.appendChild(script);

      // Add Cesium CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/cesium/Widgets/widgets.css';
      document.head.appendChild(link);
    }
  }, []);

  return <>{children}</>;
}
