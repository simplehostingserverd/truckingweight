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
 * 
 * Designed and built by Michael Anthony Trevino Jr., Lead Full-Stack Developer
 */

/**
 * Netlify Edge Function to add security headers and perform additional checks
 */
export default async (request, context) => {
  // Get the original response
  const response = await context.next();
  
  // Clone the response so we can modify headers
  const newResponse = new Response(response.body, response);
  
  // Add security headers
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  newResponse.headers.set('X-XSS-Protection', '1; mode=block');
  newResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Add Content Security Policy
  newResponse.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://pczfmxigimuluacspxse.supabase.co;"
  );
  
  // Add custom headers
  newResponse.headers.set('X-Powered-By', 'Cosmo Exploit Group LLC');
  newResponse.headers.set('X-Developer', 'Michael Anthony Trevino Jr.');
  newResponse.headers.set('X-Protected-By', 'Cosmo Exploit Security System');
  
  // Add a unique response ID for tracking
  const responseId = crypto.randomUUID();
  newResponse.headers.set('X-Response-ID', responseId);
  
  return newResponse;
};

// Export config for the edge function
export const config = {
  path: "/*",
};
