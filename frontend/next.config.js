/** @type {import('next').NextConfig} */

// Add bundle analyzer in analyze mode
const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? require('@next/bundle-analyzer')({ enabled: true })
    : config => config;

// Temporarily disable PWA support until next-pwa is installed
const withPWA = config => config;

// Import required modules
const path = require('path');
const fs = require('fs');

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
            name(module) {
              // Get the name of the npm package
              // Add comprehensive null checks to prevent errors
              if (!module || !module.context) return 'npm.vendor';

              try {
                const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                // Ensure match and match[1] exist before accessing
                const packageName =
                  match && Array.isArray(match) && match.length > 1 && match[1]
                    ? match[1]
                    : 'vendor';

                // Return a nice name for the chunk
                return `npm.${packageName.replace('@', '')}`;
              } catch (error) {
                // Fallback in case of any errors
                return 'npm.vendor';
              }
            },
          },
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
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.supabase.co https://*.maptiler.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.maptiler.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.supabase.co https://images.pexels.com https://upload.wikimedia.org https://*.maptiler.com; connect-src 'self' https://*.supabase.co https://api.truckingsemis.com wss://*.supabase.co https://*.maptiler.com; frame-ancestors 'none';",
          },
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
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_CESIUM_TOKEN: process.env.NEXT_PUBLIC_CESIUM_TOKEN,
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
        destination: 'http://localhost:5000/api/:path*',
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
    },
  },

  // Memory cache size (renamed from isrMemoryCacheSize)
  cacheMaxMemorySize: 50,

  // Transpile UI libraries
  transpilePackages: ['@mui/material', '@mui/joy', '@mui/icons-material', 'lucide-react'],
};

// Apply bundle analyzer and PWA wrappers
module.exports = withBundleAnalyzer(withPWA(nextConfig));
