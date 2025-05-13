'use client';

import { useEffect } from 'react';

/**
 * FontLoader component that handles font loading with fallbacks
 * This component should be included in the app layout
 *
 * Note: This component is now simplified as we're using Next.js built-in
 * font optimization through next/font/google in the layout.tsx file
 */
export default function FontLoader() {
  useEffect(() => {
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
