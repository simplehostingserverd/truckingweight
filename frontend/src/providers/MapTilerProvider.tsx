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
 * MapTilerProvider component
 * This component initializes MapTiler SDK when the app loads
 */
export function MapTilerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Add MapTiler SDK script to the document if it doesn't exist
    if (typeof window !== 'undefined' && !document.getElementById('maptiler-sdk-script')) {
      // Add MapTiler SDK script
      const script = document.createElement('script');
      script.id = 'maptiler-sdk-script';
      script.src = 'https://cdn.maptiler.com/maptiler-sdk-js/latest/maptiler-sdk.umd.min.js';
      script.async = true;
      document.head.appendChild(script);

      // Add MapTiler SDK CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.maptiler.com/maptiler-sdk-js/latest/maptiler-sdk.css';
      document.head.appendChild(link);

      // Set up MapTiler API key when script is loaded
      script.onload = () => {
        if (window.maptilersdk && process.env.NEXT_PUBLIC_MAPTILER_KEY) {
          window.maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
        }
      };
    }
  }, []);

  return <>{children}</>;
}

// Add global type definition for MapTiler SDK
declare global {
  interface Window {
    maptilersdk: any;
  }
}

export default MapTilerProvider;
