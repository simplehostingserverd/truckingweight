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

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  /** Whether high contrast mode is enabled */
  highContrast: boolean;
  /** Toggle high contrast mode */
  toggleHighContrast: () => void;
  /** Whether reduced motion is enabled */
  reducedMotion: boolean;
  /** Toggle reduced motion */
  toggleReducedMotion: () => void;
  /** Current font size multiplier (1 is default) */
  fontSizeMultiplier: number;
  /** Increase font size */
  increaseFontSize: () => void;
  /** Decrease font size */
  decreaseFontSize: () => void;
  /** Reset font size to default */
  resetFontSize: () => void;
  /** Whether keyboard focus indicators are always visible */
  alwaysShowFocus: boolean;
  /** Toggle always show focus */
  toggleAlwaysShowFocus: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

/**
 * Provider component for accessibility features
 */
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage if available
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);
  const [alwaysShowFocus, setAlwaysShowFocus] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load high contrast setting
    const storedHighContrast = localStorage.getItem('accessibility-high-contrast');
    if (storedHighContrast) {
      setHighContrast(storedHighContrast === 'true');
    } else {
      // Check for system preference
      const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;
      setHighContrast(prefersHighContrast);
    }

    // Load reduced motion setting
    const storedReducedMotion = localStorage.getItem('accessibility-reduced-motion');
    if (storedReducedMotion) {
      setReducedMotion(storedReducedMotion === 'true');
    } else {
      // Check for system preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setReducedMotion(prefersReducedMotion);
    }

    // Load font size multiplier
    const storedFontSize = localStorage.getItem('accessibility-font-size');
    if (storedFontSize) {
      setFontSizeMultiplier(parseFloat(storedFontSize));
    }

    // Load focus indicator setting
    const storedAlwaysShowFocus = localStorage.getItem('accessibility-always-show-focus');
    if (storedAlwaysShowFocus) {
      setAlwaysShowFocus(storedAlwaysShowFocus === 'true');
    }
  }, []);

  // Apply high contrast mode
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    localStorage.setItem('accessibility-high-contrast', highContrast.toString());
  }, [highContrast]);

  // Apply reduced motion
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }

    localStorage.setItem('accessibility-reduced-motion', reducedMotion.toString());
  }, [reducedMotion]);

  // Apply font size multiplier
  useEffect(() => {
    if (typeof window === 'undefined') return;

    document.documentElement.style.setProperty(
      '--font-size-multiplier',
      fontSizeMultiplier.toString()
    );
    localStorage.setItem('accessibility-font-size', fontSizeMultiplier.toString());
  }, [fontSizeMultiplier]);

  // Apply focus indicator setting
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (alwaysShowFocus) {
      document.documentElement.classList.add('always-show-focus');
    } else {
      document.documentElement.classList.remove('always-show-focus');
    }

    localStorage.setItem('accessibility-always-show-focus', alwaysShowFocus.toString());
  }, [alwaysShowFocus]);

  // Toggle high contrast mode
  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  // Toggle reduced motion
  const toggleReducedMotion = () => {
    setReducedMotion(prev => !prev);
  };

  // Increase font size
  const increaseFontSize = () => {
    setFontSizeMultiplier(prev => Math.min(prev + 0.1, 1.5));
  };

  // Decrease font size
  const decreaseFontSize = () => {
    setFontSizeMultiplier(prev => Math.max(prev - 0.1, 0.8));
  };

  // Reset font size
  const resetFontSize = () => {
    setFontSizeMultiplier(1);
  };

  // Toggle always show focus
  const toggleAlwaysShowFocus = () => {
    setAlwaysShowFocus(prev => !prev);
  };

  const value = {
    highContrast,
    toggleHighContrast,
    reducedMotion,
    toggleReducedMotion,
    fontSizeMultiplier,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    alwaysShowFocus,
    toggleAlwaysShowFocus,
  };

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

/**
 * Hook to use accessibility features
 */
export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
