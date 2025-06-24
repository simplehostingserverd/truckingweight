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

import React, { useEffect } from 'react';

/**
 * CesiumProvider component
 * This component initializes Cesium when the app loads
 */
export function CesiumProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Add Cesium script to the document if it doesn't exist
    if (typeof window !== 'undefined' && !document.getElementById('cesium-script')) {
      // Set Cesium base URL for assets (using latest stable version)
      window.CESIUM_BASE_URL = 'https://cesium.com/downloads/cesiumjs/releases/1.113/Build/Cesium';

      // Add Cesium script
      const script = document.createElement('script');
      script.id = 'cesium-script';
      script.src = 'https://cesium.com/downloads/cesiumjs/releases/1.113/Build/Cesium/Cesium.js';
      script.async = true;
      document.head.appendChild(script);

      // Add Cesium CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href =
        'https://cesium.com/downloads/cesiumjs/releases/1.113/Build/Cesium/Widgets/widgets.css';
      document.head.appendChild(link);

      // Set up Cesium Ion token when script is loaded
      script.onload = () => {
        try {
          if (window.Cesium && process.env.NEXT_PUBLIC_CESIUM_TOKEN) {
            window.Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN;
            console.warn('Cesium loaded successfully with Ion token');
          } else if (window.Cesium) {
            console.warn('Cesium loaded but no Ion token found');
          }
        } catch (error) {
          console.error('Error setting up Cesium Ion token:', error);
        }
      };

      // Handle script loading errors
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      script.onerror = error => {
        console.error('Failed to load Cesium script:', error);
      };
    }
  }, []);

  return <>{children}</>;
}
