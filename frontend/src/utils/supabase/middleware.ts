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

import type { Database } from '@/types/supabase';
import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSupabaseConfig } from './config';

// This middleware refreshes the user's session and must be run
// for any Server Component route that uses a Supabase client
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Apply security headers

  // Content-Security-Policy - Helps prevent XSS attacks
  // Use a balanced approach that works for both development and production
  // but is still secure
  const cspValue = [
    // Default fallback - restrict to same origin
    "default-src 'self'",
    // Scripts - allow inline and eval for development tools and libraries
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.supabase.co",
    // Connect - allow Supabase and API connections
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://events.mapbox.com",
    // Images - allow various sources including data URIs
    "img-src 'self' data: blob: https://images.pexels.com https://*.supabase.co https://upload.wikimedia.org https://*.mapbox.com",
    // Styles - allow inline for component libraries
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    // Fonts - allow data URIs and CDNs
    "font-src 'self' data: https://cdn.jsdelivr.net",
    // Frames - restrict to same origin
    "frame-src 'self'",
    // Media - restrict to same origin and data URIs
    "media-src 'self' data:",
    // Object - restrict completely
    "object-src 'none'",
  ].join('; ');

  res.headers.set('Content-Security-Policy', cspValue);

  // Add CORS headers to allow Supabase requests
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, X-File-Name'
  );
  res.headers.set('Access-Control-Allow-Credentials', 'true');

  // X-XSS-Protection - Stops pages from loading when they detect reflected XSS attacks
  res.headers.set('X-XSS-Protection', '1; mode=block');

  // X-Frame-Options - Prevents clickjacking by not allowing the page to be embedded in iframes
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');

  // X-Content-Type-Options - Prevents MIME type sniffing
  res.headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer-Policy - Controls how much referrer information is included with requests
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Strict-Transport-Security - Ensures the browser only uses HTTPS (prevents MITM attacks)
  if (process.env.NODE_ENV === 'production') {
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Permissions-Policy - Limits which features and APIs can be used in the browser
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Get Supabase configuration with JWT secret for server-side
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  // Create the client with explicit URL and key
  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    // Get authenticated user - more secure than getSession()
    const { data, error } = await supabase.auth.getUser();
    const user = data?.user;

    // Check auth condition
    const isAuthRoute =
      req.nextUrl.pathname.startsWith('/login') ||
      req.nextUrl.pathname.startsWith('/register') ||
      req.nextUrl.pathname.startsWith('/reset-password');

    // API routes that should be accessible without authentication
    const isPublicApiRoute = req.nextUrl.pathname.startsWith('/api/verify-supabase');

    // Static assets and public routes
    const isPublicAsset =
      req.nextUrl.pathname.startsWith('/_next') ||
      req.nextUrl.pathname.startsWith('/favicon.ico') ||
      req.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/);

    // If accessing auth routes while logged in, redirect to dashboard
    if (user && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // If accessing protected routes without authenticated user, redirect to login
    if (
      !user &&
      !isAuthRoute &&
      !isPublicAsset &&
      !isPublicApiRoute &&
      !req.nextUrl.pathname.startsWith('/_next') &&
      !req.nextUrl.pathname.startsWith('/api')
    ) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  } catch (error) {
    // If there's an error getting the session, log it but don't block the request
    console.error('Error in middleware:', error);

    // For API routes, we can return an error response
    if (
      req.nextUrl.pathname.startsWith('/api') &&
      !req.nextUrl.pathname.startsWith('/api/verify-supabase')
    ) {
      return NextResponse.json(
        {
          error: 'Authentication error',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 401 }
      );
    }
  }

  return res;
}
