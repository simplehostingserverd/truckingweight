import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';
import { getSupabaseConfig } from './config';

// This middleware refreshes the user's session and must be run
// for any Server Component route that uses a Supabase client
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Get Supabase configuration
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  // Create the client with explicit URL and key
  const supabase = createMiddlewareClient<Database>({
    req,
    res,
    supabaseUrl,
    supabaseKey,
  });

  try {
    // Refresh session if expired - required for Server Components
    const { data } = await supabase.auth.getSession();
    const session = data?.session;

    // Check auth condition
    const isAuthRoute = req.nextUrl.pathname.startsWith('/login') ||
                        req.nextUrl.pathname.startsWith('/register') ||
                        req.nextUrl.pathname.startsWith('/reset-password');

    // API routes that should be accessible without authentication
    const isPublicApiRoute = req.nextUrl.pathname.startsWith('/api/verify-supabase');

    // Static assets and public routes
    const isPublicAsset = req.nextUrl.pathname.startsWith('/_next') ||
                          req.nextUrl.pathname.startsWith('/favicon.ico') ||
                          req.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/);

    // If accessing auth routes while logged in, redirect to dashboard
    if (session && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // If accessing protected routes without session, redirect to login
    if (!session && !isAuthRoute && !isPublicAsset && !isPublicApiRoute &&
        !req.nextUrl.pathname.startsWith('/_next') &&
        !req.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  } catch (error) {
    // If there's an error getting the session, log it but don't block the request
    console.error('Error in middleware:', error);

    // For API routes, we can return an error response
    if (req.nextUrl.pathname.startsWith('/api') &&
        !req.nextUrl.pathname.startsWith('/api/verify-supabase')) {
      return NextResponse.json({
        error: 'Authentication error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 401 });
    }
  }

  return res;
}
