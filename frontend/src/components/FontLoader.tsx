'use client';

import { useEffect } from 'react';
import { preloadGoogleFont } from '@/utils/fontLoader';

/**
 * FontLoader component that handles font loading with fallbacks
 * This component should be included in the app layout
 */
export default function FontLoader() {
  useEffect(() => {
    // Preload Inter font with fallback
    preloadGoogleFont('Inter', [400, 500, 600, 700]);
    
    // Add more fonts as needed
    // preloadGoogleFont('Roboto', [400, 500, 700]);
    
    // Log font loading status
    if (typeof window !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        console.log('All fonts loaded successfully');
      });
    }
    
    // Add a class to the body when fonts are loaded
    document.documentElement.classList.add('fonts-loaded');
  }, []);

  // This component doesn't render anything
  return null;
}
