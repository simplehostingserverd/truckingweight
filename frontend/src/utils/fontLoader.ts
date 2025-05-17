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
 * Font loader utility to handle font loading with fallbacks
 * This helps ensure fonts are loaded properly even when Google Fonts is unavailable
 */

/**
 * Load a font with a specified timeout
 * @param fontFamily The font family to load
 * @param timeout Timeout in milliseconds
 * @returns Promise that resolves when the font is loaded or rejects on timeout
 */
export const loadFont = (fontFamily: string, timeout = 3000): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Use the document.fonts API if available
      if ('fonts' in document) {
        const font = new FontFace(fontFamily, `local(${fontFamily})`);

        // Set a timeout to prevent hanging
        const timeoutId = setTimeout(() => {
          console.warn(`Font loading timed out for ${fontFamily}`);
          resolve(); // Resolve anyway to continue with fallbacks
        }, timeout);

        // Try to load the font
        document.fonts.ready.then(() => {
          clearTimeout(timeoutId);
          if (document.fonts.check(`1em ${fontFamily}`)) {
            resolve();
          } else {
            console.warn(`Font ${fontFamily} not available, using fallbacks`);
            resolve(); // Continue with fallbacks
          }
        });
      } else {
        // Fallback for browsers without document.fonts API
        resolve();
      }
    } catch (error) {
      console.error('Error loading font:', error);
      resolve(); // Continue with fallbacks
    }
  });
};

/**
 * Preload Google Fonts with fallback
 * @param fontFamily The font family to preload
 * @param weights Array of font weights to preload
 */
export const preloadGoogleFont = (
  fontFamily: string,
  weights: number[] = [400, 500, 600, 700]
): void => {
  try {
    if (typeof window === 'undefined') return;

    // Create a link element for preloading
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@${weights.join(';')}&display=swap`;
    link.onload = () => {
      // Once preloaded, load the stylesheet
      link.rel = 'stylesheet';
    };
    link.onerror = () => {
      console.warn(`Failed to load Google Font: ${fontFamily}`);
      // Remove the failed link
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };

    // Add to document head
    document.head.appendChild(link);
  } catch (error) {
    console.error('Error preloading Google Font:', error);
  }
};
