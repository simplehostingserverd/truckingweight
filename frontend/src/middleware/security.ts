import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security middleware that adds various HTTP security headers to prevent common web vulnerabilities
 *
 * This middleware implements similar protections to the Helmet package but is optimized for Next.js
 * It sets headers to protect against:
 * - XSS (Cross-Site Scripting)
 * - Clickjacking
 * - MIME type sniffing
 * - MITM (Man-in-the-Middle) attacks via HSTS
 * - Other common web vulnerabilities
 */
export function securityMiddleware(req: NextRequest) {
  const response = NextResponse.next();

  // Set security headers

  // Content-Security-Policy - Helps prevent XSS attacks
  // Customize this policy based on your application's needs
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://www.googletagmanager.com; connect-src 'self' https://*.supabase.co https://www.google-analytics.com; img-src 'self' data: https://images.pexels.com https://*.supabase.co; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; font-src 'self' data: https://cdn.jsdelivr.net; frame-src 'self';"
  );

  // X-XSS-Protection - Stops pages from loading when they detect reflected XSS attacks
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // X-Frame-Options - Prevents clickjacking by not allowing the page to be embedded in iframes
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  // X-Content-Type-Options - Prevents MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer-Policy - Controls how much referrer information is included with requests
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Strict-Transport-Security - Ensures the browser only uses HTTPS (prevents MITM attacks)
  // Only enable in production and when you're sure HTTPS is properly configured
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Permissions-Policy - Limits which features and APIs can be used in the browser
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  return response;
}
