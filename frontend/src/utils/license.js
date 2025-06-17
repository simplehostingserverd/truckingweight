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

import { createClient } from '@supabase/supabase-js';
import { generateSessionId, getAppVersion } from './watermark';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// License verification cache
let licenseCache = null;
let lastVerification = 0;
const VERIFICATION_INTERVAL = 3600000; // 1 hour in milliseconds

// Instance ID for this installation
let instanceId = null;

/**
 * Initialize the license verification system
 */
export async function initializeLicense() {
  // Generate or retrieve instance ID
  instanceId = localStorage.getItem('instance_id');
  if (!instanceId) {
    instanceId = generateSessionId();
    localStorage.setItem('instance_id', instanceId);
  }

  // Verify license
  await verifyLicense();

  // Set up periodic verification
  setInterval(verifyLicense, VERIFICATION_INTERVAL);

  // Set up visibility change listener to verify when tab becomes visible
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const now = Date.now();
      if (now - lastVerification > VERIFICATION_INTERVAL) {
        verifyLicense();
      }
    }
  });
}

/**
 * Verify the license with offline fallback
 */
export async function verifyLicense() {
  try {
    // Get license key from environment
    const licenseKey = process.env.NEXT_PUBLIC_LICENSE_KEY;
    if (!licenseKey) {
      console.error('License key not found');
      return await verifyOfflineLicense();
    }

    // Get domain
    const domain = window.location.hostname;

    // Check if we have a cached verification
    if (licenseCache && Date.now() - lastVerification < VERIFICATION_INTERVAL) {
      return licenseCache.valid;
    }

    // Try online verification first
    try {
      const onlineResult = await verifyOnlineLicense(licenseKey, domain);
      if (onlineResult !== null) {
        return onlineResult;
      }
    } catch (error) {
      console.warn('Online license verification failed, falling back to offline:', error.message);
    }

    // Fallback to offline verification
    return await verifyOfflineLicense();
  } catch (error) {
    console.error('License verification error:', error);
    return await verifyOfflineLicense();
  }
}

/**
 * Verify license online via Supabase and API
 */
async function verifyOnlineLicense(licenseKey, domain) {
  try {
    // Verify with Supabase
    const { data, error } = await supabase
      .from('license_verifications')
      .select('*')
      .eq('key', licenseKey)
      .eq('domain', domain)
      .single();

    if (error) {
      // If no verification record exists, create one
      if (error.code === 'PGRST116') {
        await createVerificationRecord(licenseKey, domain);
      } else {
        throw new Error(`Supabase error: ${error.message}`);
      }
    }

    // If we have a verification record, check if it's valid
    if (data) {
      if (data.status === 'revoked') {
        activateKillSwitch('License has been revoked');
        return false;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        activateKillSwitch('License has expired');
        return false;
      }

      // Update cache
      licenseCache = {
        valid: true,
        key: licenseKey,
        expiresAt: data.expires_at,
        features: data.features || ['basic'],
        plan: data.plan || 'basic',
      };

      lastVerification = Date.now();
      return true;
    }

    // If we don't have a verification record, verify with API
    const response = await fetch('/api/license/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        licenseKey,
        domain,
        instanceId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error}`);
    }

    const result = await response.json();

    // Update cache
    licenseCache = {
      valid: result.valid,
      key: licenseKey,
      expiresAt: result.expiresAt,
      features: result.features || ['basic'],
      plan: result.plan || 'basic',
    };

    lastVerification = Date.now();
    return result.valid;
  } catch (error) {
    console.error('License verification failed:', error);
    return false;
  }
}

/**
 * Verify license offline using local license file
 */
async function verifyOfflineLicense() {
  try {
    console.warn('🔒 Using offline license verification');

    // Try to fetch the offline license file
    const response = await fetch('/api/license/offline');
    if (!response.ok) {
      console.error('Offline license file not found');
      return false;
    }

    const offlineLicense = await response.json();

    // Validate license structure
    if (!offlineLicense.licenseKey || !offlineLicense.expiresAt) {
      console.error('Invalid offline license format');
      return false;
    }

    // Check if license has expired
    if (new Date(offlineLicense.expiresAt) < new Date()) {
      console.error('Offline license has expired');
      activateKillSwitch('License has expired');
      return false;
    }

    // Check if license is active
    if (offlineLicense.status !== 'active') {
      console.error('Offline license is not active');
      activateKillSwitch('License is not active');
      return false;
    }

    // Validate domain (allow localhost and 127.0.0.1 for development)
    const currentDomain = window.location.hostname;
    const allowedDomains = offlineLicense.domains || ['localhost', '127.0.0.1'];

    if (
      !allowedDomains.includes(currentDomain) &&
      currentDomain !== 'localhost' &&
      currentDomain !== '127.0.0.1'
    ) {
      console.error(`Domain ${currentDomain} not authorized for this license`);
      activateKillSwitch('Unauthorized domain');
      return false;
    }

    // Update cache with offline license data
    licenseCache = {
      valid: true,
      key: offlineLicense.licenseKey,
      expiresAt: offlineLicense.expiresAt,
      features: offlineLicense.features || ['basic'],
      plan: offlineLicense.plan || 'basic',
      offline: true,
    };

    lastVerification = Date.now();
    console.warn('✅ Offline license verification successful');
    return true;
  } catch (error) {
    console.error('Offline license verification failed:', error);
    return false;
  }
}

/**
 * Create a license verification record
 */
async function createVerificationRecord(licenseKey, domain) {
  try {
    const { data, error } = await supabase.from('license_verifications').insert([
      {
        key: licenseKey,
        domain,
        instance_id: instanceId,
        app_version: getAppVersion().toString(),
        status: 'pending',
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Error creating verification record:', error);
    }

    return data;
  } catch (error) {
    console.error('Error creating verification record:', error);
    return null;
  }
}

/**
 * Activate the kill switch
 */
export function activateKillSwitch(reason = 'License verification failed') {
  console.error(`Kill switch activated: ${reason}`);

  // Store the kill switch status in localStorage
  localStorage.setItem('kill_switch_activated', 'true');
  localStorage.setItem('kill_switch_reason', reason);
  localStorage.setItem('kill_switch_timestamp', Date.now().toString());

  // Clear sensitive data
  localStorage.removeItem('supabase.auth.token');
  sessionStorage.clear();

  // Disable the application
  window.__appDisabled = true;

  // Redirect to error page
  window.location.href = '/license-error';
}

/**
 * Check if the kill switch is activated
 */
export function isKillSwitchActivated() {
  return localStorage.getItem('kill_switch_activated') === 'true' || window.__appDisabled === true;
}

/**
 * Get the license information
 */
export function getLicenseInfo() {
  if (!licenseCache) {
    return null;
  }

  return {
    valid: licenseCache.valid,
    expiresAt: licenseCache.expiresAt,
    features: licenseCache.features,
    plan: licenseCache.plan,
  };
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature) {
  if (!licenseCache || !licenseCache.valid) {
    return false;
  }

  return licenseCache.features.includes(feature);
}

export default {
  initializeLicense,
  verifyLicense,
  activateKillSwitch,
  isKillSwitchActivated,
  getLicenseInfo,
  isFeatureEnabled,
};
