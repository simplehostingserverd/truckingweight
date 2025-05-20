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

import { checkFontLoaded } from '@/utils/fontLoader';
import { useEffect, useState } from 'react';

/**
 * FontLoader component that handles font loading status and accessibility features
 *
 * This component:
 * 1. Adds a 'fonts-loaded' class to the document when fonts are ready
 * 2. Monitors font loading status for accessibility purposes
 * 3. Provides fallback handling for low-memory devices
 *
 * Note: The actual font loading is handled by next/font/google in layout.tsx
 */
export default function FontLoader() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Check if fonts are loaded
    if (typeof window !== 'undefined' && 'fonts' in document) {
      document.fonts.ready
        .then(() => {
          setFontsLoaded(true);
          // Add a class to the document when fonts are loaded
          document.documentElement.classList.add('fonts-loaded');

          // Check if our primary font loaded correctly
          checkFontLoaded('Inter').then(loaded => {
            if (!loaded) {
              // If primary font failed to load, add a class to use system fonts
              document.documentElement.classList.add('use-system-fonts');
            }
          });
        })
        .catch(() => {
          // If font loading fails, ensure we still have readable text
          document.documentElement.classList.add('use-system-fonts');
        });
    } else {
      // For SSR or browsers without font API
      document.documentElement.classList.add('fonts-loaded');
    }

    // Cleanup function
    return () => {
      // This is just for completeness, in practice this component should never unmount
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}
