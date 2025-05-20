/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.pexels.com', 'via.placeholder.com', 'placehold.co', 'picsum.photos'],
    unoptimized: process.env.NODE_ENV === 'production', // Required for Cloudflare Pages
  },
  // Enable hCaptcha on temporary subdomains
  env: {
    NEXT_PUBLIC_HCAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY,
    HCAPTCHA_SECRET_KEY: process.env.HCAPTCHA_SECRET_KEY,
  },
  // Add headers for hCaptcha
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.hcaptcha.com; style-src 'self' 'unsafe-inline' https://*.hcaptcha.com; frame-src 'self' https://*.hcaptcha.com; connect-src 'self' https://*.hcaptcha.com https://hcaptcha.com; img-src 'self' data: https://*.hcaptcha.com https://images.pexels.com https://via.placeholder.com https://placehold.co https://picsum.photos",
          },
        ],
      },
    ];
  },
  // Optimize for Cloudflare Pages
  output: 'standalone',
};

module.exports = nextConfig;
