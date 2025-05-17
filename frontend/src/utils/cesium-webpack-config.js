/**
 * Cesium Webpack Configuration
 * This file provides utility functions for configuring webpack to work with Cesium
 */

import path from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import webpack from 'webpack';

/**
 * Configure webpack for Cesium
 * @param {Object} config - Webpack configuration object
 * @param {boolean} isServer - Whether this is a server-side build
 * @returns {Object} - Modified webpack configuration
 */
function configureCesiumWebpack(config, isServer) {
  if (isServer) {
    // Skip Cesium configuration for server builds
    return config;
  }

  // Add copy plugin to copy Cesium assets
  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(
            path.dirname(new URL('cesium', import.meta.url).pathname),
            'Build/Cesium/Workers'
          ),
          to: 'static/chunks/cesium/Workers',
        },
        {
          from: path.join(
            path.dirname(new URL('cesium', import.meta.url).pathname),
            'Build/Cesium/ThirdParty'
          ),
          to: 'static/chunks/cesium/ThirdParty',
        },
        {
          from: path.join(
            path.dirname(new URL('cesium', import.meta.url).pathname),
            'Build/Cesium/Assets'
          ),
          to: 'static/chunks/cesium/Assets',
        },
        {
          from: path.join(
            path.dirname(new URL('cesium', import.meta.url).pathname),
            'Build/Cesium/Widgets'
          ),
          to: 'static/chunks/cesium/Widgets',
        },
      ],
    })
  );

  // Add Cesium to the list of externals to prevent Terser from processing it
  config.externals = config.externals || {};
  config.externals['cesium'] = 'Cesium';

  // Add resolve aliases for Cesium
  config.resolve.alias = {
    ...config.resolve.alias,
    cesium: path.resolve(process.cwd(), 'node_modules/cesium/Build/Cesium'),
  };

  // Add a plugin to define the Cesium base URL
  config.plugins.push(
    new webpack.DefinePlugin({
      CESIUM_BASE_URL: JSON.stringify('/static/chunks/cesium'),
    })
  );

  return config;
}

export { configureCesiumWebpack };
