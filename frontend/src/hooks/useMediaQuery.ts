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

import { useEffect, useState } from 'react';

// Predefined breakpoints based on Tailwind CSS defaults
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
};

/**
 * Hook to check if a media query matches
 * @param query Media query string to check
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with null to avoid hydration mismatch
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    // Set initial value after component mounts to avoid hydration mismatch
    setMatches(window.matchMedia(query).matches);

    // Create media query list
    const mediaQueryList = window.matchMedia(query);

    // Define callback for media query change
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener for media query changes
    mediaQueryList.addEventListener('change', handleChange);

    // Cleanup function
    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query]);

  // Return false during SSR to avoid hydration mismatch
  return matches === null ? false : matches;
}

/**
 * Hook to check if the viewport is mobile size (< 768px)
 * @returns Boolean indicating if the viewport is mobile size
 */
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: 767px)`);
}

/**
 * Hook to check if the viewport is tablet size (768px - 1023px)
 * @returns Boolean indicating if the viewport is tablet size
 */
export function useIsTablet(): boolean {
  return useMediaQuery(`(min-width: 768px) and (max-width: 1023px)`);
}

/**
 * Hook to check if the viewport is desktop size (>= 1024px)
 * @returns Boolean indicating if the viewport is desktop size
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: 1024px)`);
}

export default useMediaQuery;
