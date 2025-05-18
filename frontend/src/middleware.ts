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

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

// Paths that require authentication
const PROTECTED_PATHS = [
  '/dashboard',
  '/city/dashboard',
  '/trucking/dashboard',
];

// Paths that should redirect to dashboard if already authenticated
const AUTH_PATHS = [
  '/login',
  '/register',
  '/city/login',
  '/city/register',
  '/trucking/login',
  '/trucking/register',
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Create a Supabase client for the middleware
  const supabase = createMiddlewareClient<Database>({ req, res });
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get the pathname
  const { pathname } = req.nextUrl;
  
  // Check if the path is protected
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  
  // Check if the path is an auth path
  const isAuthPath = AUTH_PATHS.some(path => pathname === path);
  
  // If the path is protected and there's no session, redirect to login
  if (isProtectedPath && !session) {
    // Determine which login page to redirect to
    let redirectUrl = '/login';
    
    if (pathname.startsWith('/city/')) {
      redirectUrl = '/city/login';
    } else if (pathname.startsWith('/trucking/')) {
      redirectUrl = '/trucking/login';
    }
    
    const redirectTo = req.nextUrl.clone();
    redirectTo.pathname = redirectUrl;
    redirectTo.searchParams.set('redirectedFrom', pathname);
    
    return NextResponse.redirect(redirectTo);
  }
  
  // If the path is an auth path and there's a session, redirect to dashboard
  if (isAuthPath && session) {
    // Determine which dashboard to redirect to
    let redirectUrl = '/dashboard';
    
    if (pathname.startsWith('/city/')) {
      redirectUrl = '/city/dashboard';
    } else if (pathname.startsWith('/trucking/')) {
      redirectUrl = '/trucking/dashboard';
    }
    
    const redirectTo = req.nextUrl.clone();
    redirectTo.pathname = redirectUrl;
    
    return NextResponse.redirect(redirectTo);
  }
  
  return res;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
