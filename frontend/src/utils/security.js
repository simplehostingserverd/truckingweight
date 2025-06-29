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
 * Security utilities for the Cosmo Exploit Group LLC Weight Management System
 * This module provides security features including the kill switch mechanism
 * and unauthorized use reporting.
 */

// Security status key in localStorage
const SECURITY_STATUS_KEY = 'csp_security_status';

// Security server endpoint
const SECURITY_SERVER_URL = 'https://security.cargoscalepro.com';

/**
 * Activate the kill switch to disable the application
 * This function is called when unauthorized use is detected
 */
export function activateKillSwitch() {
  console.warn('Kill switch activated - unauthorized use detected');

  try {
    // Mark application as disabled
    window.__appDisabled = true;

    // Store disabled status in localStorage
    localStorage.setItem(
      SECURITY_STATUS_KEY,
      JSON.stringify({
        disabled: true,
        timestamp: Date.now(),
        reason: 'unauthorized_use',
      })
    );

    // Clear sensitive data
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();

    // Remove cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    // Disable API functionality by overriding fetch
    const originalFetch = window.fetch;
    window.fetch = function (url, options) {
      // Allow security reporting to continue
      if (url.includes(SECURITY_SERVER_URL)) {
        return originalFetch(url, options);
      }

      // Block other API calls
      return Promise.reject(new Error('Application disabled due to security violation'));
    };

    // Redirect to error page
    window.location.href = '/license-error';
  } catch (error) {
    console.error('Error activating kill switch:', error);

    // Fallback: redirect to error page
    window.location.href = '/license-error';
  }
}

/**
 * Report unauthorized use to the security server
 * @param {Object} details Details about the unauthorized use
 */
export async function reportUnauthorizedUse(details = {}) {
  try {
    // Get security token
    const securityToken = process.env.NEXT_PUBLIC_SECURITY_TOKEN;

    if (!securityToken) {
      console.error('Security token not found');
      return;
    }

    // Prepare report data
    const reportData = {
      timestamp: Date.now(),
      deploymentUrl: window.location.origin,
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      referrer: document.referrer,
      ...details,
    };

    // Send report to security server
    await fetch(`${SECURITY_SERVER_URL}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${securityToken}`,
      },
      body: JSON.stringify(reportData),
      // Use keepalive to ensure the request completes even if the page is unloaded
      keepalive: true,
    });
  } catch (error) {
    console.error('Error reporting unauthorized use:', error);
  }
}

/**
 * Check if the application is disabled due to security violations
 * @returns {boolean} True if the application is disabled
 */
export function isApplicationDisabled() {
  // Check global flag
  if (window.__appDisabled) {
    return true;
  }

  // Check localStorage
  try {
    const securityStatus = localStorage.getItem(SECURITY_STATUS_KEY);
    if (securityStatus) {
      const status = JSON.parse(securityStatus);
      return status.disabled === true;
    }
  } catch (error) {
    console.error('Error checking security status:', error);
  }

  return false;
}

/**
 * Initialize security measures
 */
export function initializeSecurity() {
  // Check if application is already disabled
  if (isApplicationDisabled()) {
    activateKillSwitch();
    return;
  }

  // Set up tampering detection
  detectTampering();

  // Set up API request signing
  setupApiRequestSigning();
}

/**
 * Detect tampering with the application
 */
function detectTampering() {
  // Monitor for devtools
  detectDevTools();

  // Protect against code injection
  preventCodeInjection();

  // Monitor for suspicious browser extensions
  detectSuspiciousExtensions();
}

/**
 * Detect if developer tools are open
 */
function detectDevTools() {
  // Method 1: Check window size
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;

  if (widthThreshold || heightThreshold) {
    reportUnauthorizedUse({ reason: 'devtools_detected', method: 'size_difference' });
  }

  // Method 2: Debug mode detection
  try {
    const devToolsDetected = /./.constructor.constructor('debugger')();
    if (devToolsDetected) {
      reportUnauthorizedUse({ reason: 'devtools_detected', method: 'debugger_constructor' });
    }
  } catch {
    // Ignore errors in debug detection
  }

  // Method 3: Console timing
  const startTime = performance.now();
  console.warn('Security check');
  console.warn('Console cleared for security check');
  const endTime = performance.now();

  if (endTime - startTime > 100) {
    reportUnauthorizedUse({ reason: 'devtools_detected', method: 'console_timing' });
  }
}

/**
 * Prevent code injection
 */
function preventCodeInjection() {
  // Override eval and Function constructor
  const originalEval = window.eval;
  const originalFunction = window.Function;

  window.eval = function (...args) {
    reportUnauthorizedUse({ reason: 'code_injection', method: 'eval', args: String(args) });
    return originalEval.apply(this, args);
  };

  window.Function = function (...args) {
    reportUnauthorizedUse({
      reason: 'code_injection',
      method: 'function_constructor',
      args: String(args),
    });
    return originalFunction.apply(this, args);
  };
}

/**
 * Detect suspicious browser extensions
 */
function detectSuspiciousExtensions() {
  // Check for known extension artifacts
  const suspiciousElements = [
    '__REACT_DEVTOOLS_GLOBAL_HOOK__',
    '__REDUX_DEVTOOLS_EXTENSION__',
    'firebug',
    'FirebugLite',
    '__GREASEMONKEY__',
  ];

  for (const element of suspiciousElements) {
    if (element in window) {
      reportUnauthorizedUse({ reason: 'suspicious_extension', extension: element });
    }
  }
}

/**
 * Set up API request signing
 */
function setupApiRequestSigning() {
  const originalFetch = window.fetch;

  window.fetch = async function (url, options = {}) {
    // Skip signing for external URLs
    if (!url.includes(window.location.origin) && !url.startsWith('/')) {
      return originalFetch(url, options);
    }

    // Get security token
    const securityToken = process.env.NEXT_PUBLIC_SECURITY_TOKEN;

    if (!securityToken) {
      return originalFetch(url, options);
    }

    // Create headers if they don't exist
    options.headers = options.headers || {};

    // Add timestamp
    const timestamp = Date.now().toString();
    options.headers['X-Request-Timestamp'] = timestamp;

    // Generate signature
    const signature = await generateRequestSignature(url, options, timestamp, securityToken);
    options.headers['X-Request-Signature'] = signature;

    // Make the request
    return originalFetch(url, options);
  };
}

/**
 * Generate a signature for an API request
 * @param {string} url Request URL
 * @param {Object} options Request options
 * @param {string} timestamp Request timestamp
 * @param {string} secret Secret key
 * @returns {Promise<string>} Request signature
 */
async function generateRequestSignature(url, options, timestamp, secret) {
  try {
    const encoder = new TextEncoder();

    // Create string to sign
    const method = options.method || 'GET';
    const body = options.body || '';
    const stringToSign = `${method}:${url}:${timestamp}:${body}`;

    // Create key from secret
    const keyData = encoder.encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Sign data
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(stringToSign));

    // Convert to hex
    const signatureArray = Array.from(new Uint8Array(signature));
    const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return signatureHex;
  } catch (error) {
    console.error('Error generating request signature:', error);
    return '';
  }
}

// Export default object
const securityUtils = {
  activateKillSwitch,
  reportUnauthorizedUse,
  isApplicationDisabled,
  initializeSecurity,
};

export default securityUtils;
