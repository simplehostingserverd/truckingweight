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

/**
 * Security utilities for the application
 *
 * This file contains functions to help prevent common web security vulnerabilities
 * such as XSS, CSRF, and injection attacks.
 */

/**
 * Sanitizes a string to prevent XSS attacks
 *
 * @param input - The string to sanitize
 * @returns A sanitized version of the input string
 */
export function sanitizeString(input: string): string {
  if (!input) return '';

  // Replace potentially dangerous characters with HTML entities
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates that a URL is safe (not javascript: or data: etc.)
 *
 * @param url - The URL to validate
 * @returns True if the URL is safe, false otherwise
 */
export function isSafeUrl(url: string): boolean {
  if (!url) return false;

  try {
    const parsedUrl = new URL(url);
    const safeProtocols = ['http:', 'https:'];

    return safeProtocols.includes(parsedUrl.protocol);
  } catch (e) {
    // If URL parsing fails, check if it's a relative URL (which is safe)
    return url.startsWith('/') && !url.startsWith('//');
  }
}

/**
 * Generates a nonce for use in Content-Security-Policy
 *
 * @returns A random nonce string
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates user input to prevent SQL injection
 *
 * @param input - The user input to validate
 * @returns True if the input is safe, false otherwise
 */
export function isSafeInput(input: string): boolean {
  if (!input) return true;

  // Check for common SQL injection patterns
  const sqlInjectionPatterns = [
    /(\s|^)(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC|UNION|CREATE|WHERE)(\s|$)/i,
    /(\s|^)(OR|AND)(\s+)(['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/i,
    /--/,
    /;.*/,
    /\/\*.+\*\//,
  ];

  return !sqlInjectionPatterns.some(pattern => pattern.test(input));
}

/**
 * Creates a Content Security Policy string
 *
 * @param nonce - Optional nonce to include in the CSP
 * @returns A CSP string that can be used in a meta tag or header
 */
export function createCSP(nonce?: string): string {
  const nonceDirective = nonce ? ` 'nonce-${nonce}'` : '';

  return `
    default-src 'self';
    script-src 'self'${nonceDirective} 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.supabase.co;
    connect-src 'self' https://*.supabase.co;
    img-src 'self' data: https://images.pexels.com https://*.supabase.co;
    style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    font-src 'self' data: https://cdn.jsdelivr.net;
    frame-src 'self';
  `
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validates and sanitizes form data
 *
 * @param formData - The form data to validate
 * @returns Sanitized form data
 */
export function sanitizeFormData<T extends Record<string, string>>(formData: T): T {
  const sanitized = { ...formData };

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key]);
    }
  }

  return sanitized;
}
