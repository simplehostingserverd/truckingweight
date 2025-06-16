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

/**
 * Script to copy Cesium files to the public directory
 * This script is used to copy Cesium files to the public directory
 * so they can be served directly without being processed by webpack
 */

const fs = require('fs-extra');
const path = require('path');

// Paths
const cesiumPath = path.resolve(__dirname, '../node_modules/cesium/Build/Cesium');
const publicCesiumPath = path.resolve(__dirname, '../public/cesium');

// Copy Cesium files to public directory
async function copyCesiumToPublic() {
  try {
    console.log('Copying Cesium files to public directory...');

    // Ensure the public/cesium directory exists
    await fs.ensureDir(publicCesiumPath);

    // Create essential directories
    await fs.ensureDir(path.join(publicCesiumPath, 'Workers'));
    await fs.ensureDir(path.join(publicCesiumPath, 'Assets'));
    await fs.ensureDir(path.join(publicCesiumPath, 'Widgets'));

    // Copy only essential files
    const essentialFiles = [
      'Cesium.js',
      'Widgets/widgets.css',
      'Widgets/Images/info-loading.gif',
      'Assets/Textures/pin.svg',
      'Assets/Textures/maki/marker.png',
    ];

    for (const file of essentialFiles) {
      const src = path.join(cesiumPath, file);
      const dest = path.join(publicCesiumPath, file);

      if (await fs.pathExists(src)) {
        await fs.copy(src, dest, { overwrite: true });
      } else {
        console.warn(`Warning: Essential file not found: ${src}`);
      }
    }

    // Copy all Workers files (needed for terrain and other features)
    const workersDir = path.join(cesiumPath, 'Workers');
    const destWorkersDir = path.join(publicCesiumPath, 'Workers');

    if (await fs.pathExists(workersDir)) {
      const workerFiles = await fs.readdir(workersDir);
      for (const file of workerFiles) {
        // Skip source maps in production
        if (process.env.NODE_ENV === 'production' && file.endsWith('.map')) {
          continue;
        }

        const src = path.join(workersDir, file);
        const dest = path.join(destWorkersDir, file);

        if ((await fs.stat(src)).isFile()) {
          await fs.copy(src, dest, { overwrite: true });
        }
      }
    }

    console.log('Cesium files copied successfully!');
  } catch (error) {
    console.error('Error copying Cesium files:', error);
    process.exit(1);
  }
}

// Run the script
copyCesiumToPublic();
