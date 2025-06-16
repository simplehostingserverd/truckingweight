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

/** @type {import('next').NextConfig} */

// Import required modules
import withPWA from '@ducanh2912/next-pwa';
import bundleAnalyzer from '@next/bundle-analyzer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add bundle analyzer in analyze mode
const withBundleAnalyzer =
  process.env.ANALYZE === 'true' ? bundleAnalyzer({ enabled: true }) : config => config;

// Check if SSL certificates exist
const sslCertPath = path.join(__dirname, '../ssl/localhost.crt');
const sslKeyPath = path.join(__dirname, '../ssl/localhost.key');
const sslEnabled = fs.existsSync(sslCertPath) && fs.existsSync(sslKeyPath);

const nextConfig = {
  // HTTPS configuration for development
  ...(process.env.NODE_ENV === 'development' && sslEnabled
    ? {
        server: {
          https: {
            key: fs.readFileSync(sslKeyPath),
            cert: fs.readFileSync(sslCertPath),
          },
        },
      }
    : {}),
  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // We're using Cesium from CDN, so we don't need to process it

    // Ensure config and config.optimization exist
    if (!config) {
      console.error('Webpack config is null or undefined');
      return {};
    }

    if (!config.optimization) {
      config.optimization = {};
    }

    // Only enable these optimizations in production
    if (!dev) {
      // Enable terser compression
      config.optimization.minimize = true;

      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 20000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: function (module) {
              // Completely rewritten to be maximally defensive
              if (!module) return 'npm.vendor';
              if (typeof module !== 'object') return 'npm.vendor';
              if (!module.context) return 'npm.vendor';
              if (typeof module.context !== 'string') return 'npm.vendor';

              try {
                // Safely extract package name from node_modules path
                const nodeModulesRegex = /[\\/]node_modules[\\/](.*?)([\\/]|$)/;
                const match = module.context.match(nodeModulesRegex);

                // Extensive validation of the match result
                if (!match) return 'npm.vendor';
                if (!Array.isArray(match)) return 'npm.vendor';
                if (match.length < 2) return 'npm.vendor';
                if (typeof match[1] !== 'string') return 'npm.vendor';
                if (match[1].trim() === '') return 'npm.vendor';

                // Get package name and sanitize it
                const packageName = match[1].trim();

                // Handle scoped packages (@org/pkg) by removing @ symbol
                return `npm.${packageName.replace('@', '')}`;
              } catch (error) {
                // Fallback for any unexpected errors
                console.error('Error in webpack chunk naming:', error);
                return 'npm.vendor';
              }
            },
          },
          // Separate React and related packages into their own chunk
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
            name: 'npm.react',
            priority: 20, // Higher priority than vendor
          },
          // Separate MUI components into their own chunk
          mui: {
            test: /[\\/]node_modules[\\/](@mui|@emotion)[\\/]/,
            name: 'npm.mui',
            priority: 15,
          },
          // Separate utility libraries into their own chunk
          utils: {
            test: /[\\/]node_modules[\\/](lodash|date-fns|axios|swr)[\\/]/,
            name: 'npm.utils',
            priority: 10,
          },
        },
      };

      // Add module concatenation for better tree shaking
      config.optimization.concatenateModules = true;
    }

    // Add cache groups for development to speed up rebuilds
    if (dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }

    return config;
  },
  // Core settings
  reactStrictMode: true,
  // swcMinify is now enabled by default in Next.js 13+
  poweredByHeader: false, // Security: remove X-Powered-By header

  // Security headers
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },
          // CSP is handled by middleware to avoid conflicts
          // {
          //   key: 'Content-Security-Policy',
          //   value: "...",
          // },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, X-File-Name',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pczfmxigimuluacspxse.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjemZteGlnaW11bHVhY3NweHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NjczNjUsImV4cCI6MjA2MjI0MzM2NX0.SyWZsCDWc5u5oXIR4IHBTcT63Le0HyjCZQJK0E6FO7w',
    NEXT_PUBLIC_MAPBOX_TOKEN:
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
      'pk.eyJ1Ijoic2ltcGxlaG9zdGluZ3NlcnZlcmQiLCJhIjoiY21haTl1dXhpMGJ2bzJ1cTVlY2p4ajhzZCJ9.AUS7RZCMk1vnR4yQR5RAEQ',
    NEXT_PUBLIC_CESIUM_TOKEN: process.env.NEXT_PUBLIC_CESIUM_TOKEN || '',
    NEXT_PUBLIC_MAPTILER_KEY: process.env.NEXT_PUBLIC_MAPTILER_KEY || 'WPXCcZzL6zr6JzGBzMUK',
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
    // Optimize image formats
    formats: ['image/avif', 'image/webp'],
    // Add sizes for fill images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // API rewrites to proxy requests to the backend server
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*',
      },
    ];
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console in production
  },

  // Experimental features for better performance
  experimental: {
    // Optimize CSS for production
    optimizeCss: process.env.NODE_ENV === 'production',

    // Better scroll handling
    scrollRestoration: true,

    // Enable webpack caching for CI/CD
    turbotrace: {
      logLevel: 'error',
      memoryLimit: 4000, // Increase memory limit for better performance
    },

    // Improved type checking
    typedRoutes: true,

    // Serverless improvements
    serverComponentsExternalPackages: ['sharp'],

    // Improved image optimization
    workerThreads: true,

    // Improved memory usage
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/joy',
      'lucide-react',
      'date-fns',
      'recharts',
    ],
  },

  // Memory cache size (renamed from isrMemoryCacheSize)
  cacheMaxMemorySize: 50,

  // Transpile UI libraries
  transpilePackages: ['@mui/material', '@mui/joy', '@mui/icons-material', 'lucide-react'],
};

// Apply bundle analyzer and PWA wrappers
export default withBundleAnalyzer(
  withPWA({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
  })(nextConfig)
);
