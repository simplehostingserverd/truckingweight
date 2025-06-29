/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

/**
 * TruckingWeight Design System Tokens
 *
 * This file contains all the design tokens used throughout the application.
 * It serves as a single source of truth for colors, typography, spacing, etc.
 */

// Color Palette - Modern 2024 Design System
const colors = {
  // Primary Colors
  deepBlue: {
    DEFAULT: '#2563EB', // Modern blue
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    950: '#172554',
  },
  highwayYellow: {
    DEFAULT: '#FBBF24', // Modern amber
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    950: '#451A03',
  },
  steelGray: {
    DEFAULT: '#64748B', // Modern slate
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },

  // Secondary Colors
  forestGreen: {
    DEFAULT: '#10B981', // Modern emerald
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
    950: '#022C22',
  },
  brickRed: {
    DEFAULT: '#EF4444', // Modern red
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    950: '#450A0A',
  },
  slate: {
    DEFAULT: '#475569', // Modern slate
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },
  skyBlue: {
    DEFAULT: '#0EA5E9', // Modern sky
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
    950: '#082F49',
  },

  // New Modern Colors
  indigo: {
    DEFAULT: '#6366F1',
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
    950: '#1E1B4B',
  },
  violet: {
    DEFAULT: '#8B5CF6',
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
    950: '#2E1065',
  },
  fuchsia: {
    DEFAULT: '#D946EF',
    50: '#FDF4FF',
    100: '#FAE8FF',
    200: '#F5D0FE',
    300: '#F0ABFC',
    400: '#E879F9',
    500: '#D946EF',
    600: '#C026D3',
    700: '#A21CAF',
    800: '#86198F',
    900: '#701A75',
    950: '#4A044E',
  },
  rose: {
    DEFAULT: '#F43F5E',
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E',
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
    950: '#4C0519',
  },
  teal: {
    DEFAULT: '#14B8A6',
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
    950: '#042F2E',
  },

  // System Colors
  alertRed: {
    DEFAULT: '#EF4444',
    light: '#FEE2E2',
    dark: '#B91C1C',
  },
  successGreen: {
    DEFAULT: '#10B981',
    light: '#D1FAE5',
    dark: '#047857',
  },
  warningOrange: {
    DEFAULT: '#F59E0B',
    light: '#FEF3C7',
    dark: '#B45309',
  },

  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },
};

// Typography - Modern 2024 Design System
// Note: Primary font (Inter) is loaded via next/font/google in layout.tsx
// This ensures optimal font loading and performance, especially for low-memory devices
const typography = {
  fontFamily: {
    // Primary font stack - uses CSS variable from next/font
    sans: [
      'var(--font-inter)',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'sans-serif',
    ],
    // Brand font stack - also uses the primary font as fallback
    brand: ['var(--font-inter)', 'system-ui', 'sans-serif'],
    // Monospace font stack for code and technical content
    mono: [
      'JetBrains Mono',
      'Menlo',
      'Monaco',
      'Consolas',
      'Liberation Mono',
      'Courier New',
      'monospace',
    ],
  },
  fontSize: {
    display1: '3.5rem', // 56px
    display2: '3rem', // 48px
    display3: '2.25rem', // 36px
    h1: '2rem', // 32px
    h2: '1.75rem', // 28px
    h3: '1.5rem', // 24px
    h4: '1.25rem', // 20px
    h5: '1.125rem', // 18px
    bodyLarge: '1.125rem', // 18px
    body: '1rem', // 16px
    bodySmall: '0.875rem', // 14px
    caption: '0.75rem', // 12px
    small: '0.625rem', // 10px
  },
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeight: {
    none: 1,
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tightest: '-0.075em',
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
    tracking: '0.15em',
  },
};

// Spacing
const spacing = {
  // Base unit: 4px
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  32: '8rem', // 128px
  40: '10rem', // 160px
  48: '12rem', // 192px
  56: '14rem', // 224px
  64: '16rem', // 256px
};

// Border Radius - Modern 2024 Design System
const borderRadius = {
  none: '0',
  xs: '0.125rem', // 2px
  sm: '0.25rem', // 4px
  DEFAULT: '0.375rem', // 6px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem', // 32px
  full: '9999px',
  // Special cases
  pill: '999px',
  circle: '50%',
};

// Shadows - Modern 2024 Design System
const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(16, 24, 40, 0.05)',
  sm: '0 1px 3px rgba(16, 24, 40, 0.1), 0 1px 2px rgba(16, 24, 40, 0.06)',
  DEFAULT: '0 4px 8px -2px rgba(16, 24, 40, 0.1), 0 2px 4px -2px rgba(16, 24, 40, 0.06)',
  md: '0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03)',
  lg: '0 20px 24px -4px rgba(16, 24, 40, 0.08), 0 8px 8px -4px rgba(16, 24, 40, 0.03)',
  xl: '0 24px 48px -12px rgba(16, 24, 40, 0.18)',
  '2xl': '0 32px 64px -12px rgba(16, 24, 40, 0.14)',
  '3xl': '0 48px 100px -12px rgba(16, 24, 40, 0.25)',
  inner: 'inset 0 2px 4px rgba(16, 24, 40, 0.06)',
  // Modern colored shadows
  blue: '0 8px 16px rgba(37, 99, 235, 0.12)',
  green: '0 8px 16px rgba(16, 185, 129, 0.12)',
  red: '0 8px 16px rgba(239, 68, 68, 0.12)',
  amber: '0 8px 16px rgba(245, 158, 11, 0.12)',
  // Floating elements
  floating:
    '0 8px 16px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.03), 0 0 1px rgba(0, 0, 0, 0.3)',
  'floating-lg':
    '0 24px 48px rgba(0, 0, 0, 0.08), 0 12px 24px rgba(0, 0, 0, 0.03), 0 0 1px rgba(0, 0, 0, 0.3)',
};

// Z-index
const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
};

// Transitions
const transitions = {
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },
  timing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Export all tokens
module.exports = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  transitions,
};
