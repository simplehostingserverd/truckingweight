'use client';

/**
 * TEMPORARY IMPLEMENTATION
 *
 * This is a placeholder implementation to avoid React errors.
 * All hooks return false to prevent any rendering issues.
 * Components should implement their own responsive logic directly.
 */

// Predefined breakpoints based on Tailwind CSS defaults
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
};

// Placeholder implementation that always returns false
export function useMediaQuery(_query: string): boolean {
  return false;
}

// Hooks for common breakpoints - all return false to avoid React errors
export function useIsMobile(): boolean {
  return false;
}

export function useIsTablet(): boolean {
  return false;
}

export function useIsDesktop(): boolean {
  return false;
}

export default useMediaQuery;
