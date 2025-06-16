// Global type declarations
declare const performance: Performance;

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
 * Font loader utility to check font loading status
 *
 * NOTE: This is a legacy utility. For font loading, we now use next/font/google
 * in the app/layout.tsx file which provides better optimization and performance.
 */

/**
 * Check if a font is loaded and available in the browser
 * @param fontFamily The font family to check
 * @returns Promise that resolves when the font check is complete
 */
export const checkFontLoaded = (fontFamily: string): Promise<boolean> => {
  return new Promise(resolve => {
    try {
      // Use the document.fonts API if available
      if (typeof document !== 'undefined' && 'fonts' in document) {
        document.fonts.ready.then(() => {
          const isLoaded = document.fonts.check(`1em ${fontFamily}`);
          if (!isLoaded) {
            console.warn(`Font ${fontFamily} not loaded, using fallbacks`);
          }
          resolve(isLoaded);
        });
      } else {
        // Fallback for browsers without document.fonts API or SSR
        resolve(false);
      }
    } catch (error) {
      console.error('Error checking font:', error);
      resolve(false);
    }
  });
};
