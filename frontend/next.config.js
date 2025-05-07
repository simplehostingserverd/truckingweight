/** @type {import('next').NextConfig} */

// Add bundle analyzer in analyze mode
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config) => config;

const nextConfig = {
  // Core settings
  reactStrictMode: true,
  swcMinify: true, // Use SWC for minification (faster than Terser)
  poweredByHeader: false, // Security: remove X-Powered-By header

  // Environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
    ],
    // Optimize image formats
    formats: ['image/avif', 'image/webp'],
  },

  // API rewrites
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
  },
};

// Apply bundle analyzer wrapper
module.exports = withBundleAnalyzer(nextConfig);
