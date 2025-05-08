'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design
 * @param query - CSS media query string (e.g., '(min-width: 768px)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Always return false during SSR to avoid hydration mismatches
  const [matches, setMatches] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Only run in the browser
    if (typeof window !== 'undefined') {
      // Initial check
      const media = window.matchMedia(query);
      setMatches(media.matches);

      // Setup listener using the more compatible approach
      const listener = () => setMatches(media.matches);

      // Use the appropriate method based on browser support
      if (media.addEventListener) {
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
      } else {
        // Fallback for older browsers
        media.addListener(listener);
        return () => media.removeListener(listener);
      }
    }
  }, [query]);

  // Don't use media queries until component is mounted
  return mounted ? matches : false;
}

// Predefined breakpoints based on Tailwind CSS defaults
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
};

// Hooks for common breakpoints
export function useIsMobile(): boolean {
  return !useMediaQuery(breakpoints.md);
}

export function useIsTablet(): boolean {
  return useMediaQuery(breakpoints.md) && !useMediaQuery(breakpoints.lg);
}

export function useIsDesktop(): boolean {
  return useMediaQuery(breakpoints.lg);
}

export default useMediaQuery;
