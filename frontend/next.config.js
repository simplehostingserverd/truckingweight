/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Development server configuration - only bind to localhost
  ...(process.env.NODE_ENV === 'development' && {
    serverExternalPackages: [],
  }),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
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
    unoptimized: process.env.NODE_ENV === 'production', // Required for Cloudflare Pages
  },
  // Enable hCaptcha on temporary subdomains
  env: {
    NEXT_PUBLIC_HCAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY,
    HCAPTCHA_SECRET_KEY: process.env.HCAPTCHA_SECRET_KEY,
  },
  // Add headers for hCaptcha, MapTiler, Cesium, and Supabase
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.hcaptcha.com https://cdn.maptiler.com https://cesium.com; style-src 'self' 'unsafe-inline' https://*.hcaptcha.com https://cdn.maptiler.com https://cesium.com; frame-src 'self' https://*.hcaptcha.com; connect-src 'self' https://*.hcaptcha.com https://hcaptcha.com https://*.supabase.co; img-src 'self' data: https://*.hcaptcha.com https://images.pexels.com https://via.placeholder.com https://placehold.co https://picsum.photos https://cdn.maptiler.com https://cesium.com",
          },
        ],
      },
    ];
  },
  // Optimize for Cloudflare Pages
  output: 'standalone',
};

module.exports = nextConfig;
