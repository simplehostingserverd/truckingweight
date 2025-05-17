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


import { extendTheme } from '@mui/joy/styles';

// City portal theme with dark mode and neon accents
const cityTheme = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        // Primary color - neon blue
        primary: {
          50: '#E6F7FF',
          100: '#BAE7FF',
          200: '#91D5FF',
          300: '#69C0FF',
          400: '#40A9FF',
          500: '#1890FF',
          600: '#096DD9',
          700: '#0050B3',
          800: '#003A8C',
          900: '#002766',
        },
        // Secondary color - neon purple
        secondary: {
          50: '#F5E8FF',
          100: '#E4C5FF',
          200: '#D3A4FF',
          300: '#B76EFF',
          400: '#9E47FF',
          500: '#8520FF',
          600: '#6B00E6',
          700: '#5200B3',
          800: '#3A0080',
          900: '#21004D',
        },
        // Success color - neon green
        success: {
          50: '#E6FFF0',
          100: '#B3FFD6',
          200: '#80FFBD',
          300: '#4DFFA3',
          400: '#1AFF8A',
          500: '#00E673',
          600: '#00B359',
          700: '#008040',
          800: '#004D26',
          900: '#001A0D',
        },
        // Warning color - neon yellow
        warning: {
          50: '#FFFFCC',
          100: '#FFFF99',
          200: '#FFFF66',
          300: '#FFFF33',
          400: '#FFFF00',
          500: '#E6E600',
          600: '#CCCC00',
          700: '#999900',
          800: '#666600',
          900: '#333300',
        },
        // Danger color - neon red
        danger: {
          50: '#FFE6E6',
          100: '#FFCCCC',
          200: '#FF9999',
          300: '#FF6666',
          400: '#FF3333',
          500: '#FF0000',
          600: '#CC0000',
          700: '#990000',
          800: '#660000',
          900: '#330000',
        },
        // Neutral colors for backgrounds and text
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          outlinedBorder: 'rgba(255, 255, 255, 0.23)',
        },
        // Background colors
        background: {
          body: '#121212',
          surface: '#1E1E1E',
          popup: '#252525',
          level1: '#2A2A2A',
          level2: '#333333',
          level3: '#383838',
          tooltip: '#242424',
          backdrop: 'rgba(0, 0, 0, 0.8)',
        },
        // Common colors
        common: {
          white: '#FFFFFF',
          black: '#000000',
        },
        text: {
          primary: '#FFFFFF',
          secondary: 'rgba(255, 255, 255, 0.7)',
          tertiary: 'rgba(255, 255, 255, 0.5)',
          disabled: 'rgba(255, 255, 255, 0.38)',
        },
      },
    },
  },
  fontFamily: {
    body: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    display:
      '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    code: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  typography: {
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body3: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
  },
  components: {
    JoyButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
          textTransform: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
          },
        },
      },
    },
    JoyInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    JoyCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        },
      },
    },
  },
});

export default cityTheme;
