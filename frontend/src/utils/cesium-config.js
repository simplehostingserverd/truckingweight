/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

/**
 * Cesium configuration utility
 * This file configures Cesium to work properly with Next.js
 */

// Define the global Cesium object if it doesn't exist
if (typeof window !== 'undefined') {
  window.CESIUM_BASE_URL = '/static/chunks/cesium';
}

// Export a function to initialize Cesium
export function initCesium() {
  if (typeof window !== 'undefined') {
    // Set the base URL for Cesium assets
    window.CESIUM_BASE_URL = '/static/chunks/cesium';

    // Set the Cesium Ion token
    const cesiumToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN;
    if (cesiumToken) {
      // Import Cesium dynamically to avoid SSR issues
      import('cesium').then(Cesium => {
        Cesium.Ion.defaultAccessToken = cesiumToken;
      });
    }
  }
}
