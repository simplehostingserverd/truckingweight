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

// Middleware for Cloudflare Pages
export async function onRequest(context) {
  // Get the request and environment
  const { request, env, next } = context;
  
  // Get the URL from the request
  const url = new URL(request.url);
  
  // Add security headers to all responses
  const response = await next();
  const newResponse = new Response(response.body, response);
  
  // Add security headers
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newResponse.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Add CORS headers for API routes
  if (url.pathname.startsWith('/api/')) {
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: newResponse.headers,
      });
    }
  }
  
  return newResponse;
}
