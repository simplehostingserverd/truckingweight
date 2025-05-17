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

import { activateKillSwitch, reportUnauthorizedUse } from './security';

/**
 * License verification system
 * This module verifies that the application is running with a valid license
 * and has not been tampered with or deployed without authorization.
 */

// License check interval in milliseconds (24 hours)
const LICENSE_CHECK_INTERVAL = 24 * 60 * 60 * 1000;

// Last verification timestamp key in localStorage
const LAST_VERIFICATION_KEY = 'ceg_license_last_verified';

// License status key in localStorage
const LICENSE_STATUS_KEY = 'ceg_license_status';

/**
 * Calculate a hash of the application code to detect tampering
 * @returns {Promise<string>} Hash of critical application files
 */
async function calculateCodeHash() {
  try {
    // This is a simplified version - in production, this would use a more
    // sophisticated method to calculate a hash of critical application files
    const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
    const buildId = window.__NEXT_DATA__?.buildId || 'development';
    const baseString = `${appVersion}-${buildId}-${window.location.hostname}`;
    
    // Use SubtleCrypto API to create a hash
    const encoder = new TextEncoder();
    const data = encoder.encode(baseString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Convert hash to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('Error calculating code hash:', error);
    return '';
  }
}

/**
 * Verify the license with the license server
 * @returns {Promise<boolean>} True if license is valid, false otherwise
 */
export async function verifyLicense() {
  try {
    // Get license key and security token from environment variables
    const licenseKey = process.env.NEXT_PUBLIC_LICENSE_KEY;
    const securityToken = process.env.NEXT_PUBLIC_SECURITY_TOKEN;
    
    if (!licenseKey || !securityToken) {
      console.error('License key or security token not found');
      return false;
    }
    
    // Calculate code hash to detect tampering
    const codeHash = await calculateCodeHash();
    
    // Get deployment URL
    const deploymentUrl = window.location.origin;
    
    // Prepare verification data
    const verificationData = {
      licenseKey,
      deploymentUrl,
      codeHash,
      timestamp: Date.now()
    };
    
    // Sign the verification data
    const signature = await signVerificationData(verificationData, securityToken);
    
    // Send verification request to license server
    const response = await fetch('https://license.cosmoexploitgroup.com/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${securityToken}`,
        'X-Signature': signature
      },
      body: JSON.stringify(verificationData)
    });
    
    if (!response.ok) {
      console.error('License verification failed:', await response.text());
      
      // Activate kill switch if license is invalid
      activateKillSwitch();
      
      // Report unauthorized use
      reportUnauthorizedUse({
        reason: 'License verification failed',
        status: response.status,
        deploymentUrl
      });
      
      return false;
    }
    
    // Parse response
    const result = await response.json();
    
    // Store verification result
    localStorage.setItem(LAST_VERIFICATION_KEY, Date.now().toString());
    localStorage.setItem(LICENSE_STATUS_KEY, JSON.stringify({
      valid: result.valid,
      expiresAt: result.expiresAt,
      features: result.features
    }));
    
    return result.valid;
  } catch (error) {
    console.error('Error verifying license:', error);
    
    // If there's a network error, we'll allow the application to continue
    // but we'll schedule another verification attempt soon
    scheduleVerification(1000 * 60 * 5); // Try again in 5 minutes
    
    // Check if we have a cached verification result
    const cachedStatus = localStorage.getItem(LICENSE_STATUS_KEY);
    if (cachedStatus) {
      try {
        const parsed = JSON.parse(cachedStatus);
        return parsed.valid;
      } catch (e) {
        return false;
      }
    }
    
    return false;
  }
}

/**
 * Sign verification data using HMAC
 * @param {Object} data Data to sign
 * @param {string} secret Secret key
 * @returns {Promise<string>} Signature
 */
async function signVerificationData(data, secret) {
  try {
    const encoder = new TextEncoder();
    const dataString = JSON.stringify(data);
    
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
    const signature = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      encoder.encode(dataString)
    );
    
    // Convert to hex
    const signatureArray = Array.from(new Uint8Array(signature));
    const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return signatureHex;
  } catch (error) {
    console.error('Error signing verification data:', error);
    return '';
  }
}

/**
 * Schedule a license verification
 * @param {number} delay Delay in milliseconds
 */
export function scheduleVerification(delay = LICENSE_CHECK_INTERVAL) {
  setTimeout(() => {
    verifyLicense().catch(console.error);
  }, delay);
}

/**
 * Initialize license verification system
 */
export function initializeLicenseVerification() {
  // Verify license immediately
  verifyLicense().catch(console.error);
  
  // Schedule periodic verification
  scheduleVerification();
  
  // Add event listener for visibility change to verify when tab becomes visible
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const lastVerification = parseInt(localStorage.getItem(LAST_VERIFICATION_KEY) || '0', 10);
      const now = Date.now();
      
      // Verify if last verification was more than 1 hour ago
      if (now - lastVerification > 60 * 60 * 1000) {
        verifyLicense().catch(console.error);
      }
    }
  });
}

/**
 * Check if the application has a valid license
 * @returns {boolean} True if license is valid
 */
export function hasValidLicense() {
  try {
    const cachedStatus = localStorage.getItem(LICENSE_STATUS_KEY);
    if (!cachedStatus) {
      return false;
    }
    
    const status = JSON.parse(cachedStatus);
    
    // Check if license is expired
    if (status.expiresAt && new Date(status.expiresAt) < new Date()) {
      return false;
    }
    
    return status.valid;
  } catch (error) {
    console.error('Error checking license status:', error);
    return false;
  }
}

/**
 * Get available features based on license
 * @returns {string[]} Array of feature codes
 */
export function getLicensedFeatures() {
  try {
    const cachedStatus = localStorage.getItem(LICENSE_STATUS_KEY);
    if (!cachedStatus) {
      return [];
    }
    
    const status = JSON.parse(cachedStatus);
    return status.features || [];
  } catch (error) {
    console.error('Error getting licensed features:', error);
    return [];
  }
}

// Export default object
export default {
  verifyLicense,
  initializeLicenseVerification,
  hasValidLicense,
  getLicensedFeatures,
  scheduleVerification
};
