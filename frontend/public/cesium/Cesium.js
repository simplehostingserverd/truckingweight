
/**
 * Cesium - https://github.com/CesiumGS/cesium
 * 
 * This is a simplified stub for Cesium that avoids build issues with ES modules.
 * It dynamically loads the real Cesium.js from a CDN.
 */

// Set up the Cesium object
window.Cesium = window.Cesium || {};

// Set the base URL for Cesium assets
window.CESIUM_BASE_URL = '/cesium';

// Load the real Cesium.js from CDN
(function() {
  // Create a script element to load the real Cesium.js
  const script = document.createElement('script');
  script.src = 'https://cesium.com/downloads/cesiumjs/releases/1.104/Build/Cesium/Cesium.js';
  script.async = true;
  script.defer = true;
  
  // Add the script to the document
  document.head.appendChild(script);
  
  // Also load the CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cesium.com/downloads/cesiumjs/releases/1.104/Build/Cesium/Widgets/widgets.css';
  document.head.appendChild(link);
})();
