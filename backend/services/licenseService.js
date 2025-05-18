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
import { DateTime } from 'luxon';
import Stripe from 'stripe';
import { nanoid } from 'nanoid';
import logger from '../utils/logger.js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Hidden watermark for code verification
const WATERMARK = 'CEG-WMS-2025-MTJR';

// License verification cache (to reduce database load)
const licenseCache = new Map();
const LICENSE_CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Verify a license key
 * @param {string} licenseKey - The license key to verify
 * @param {string} domain - The domain requesting verification
 * @param {string} instanceId - Unique identifier for this instance
 * @returns {Promise<Object>} License verification result
 */
export async function verifyLicense(licenseKey, domain, instanceId) {
  try {
    // Check cache first
    const cacheKey = `${licenseKey}:${domain}`;
    const cachedResult = licenseCache.get(cacheKey);

    if (cachedResult && cachedResult.timestamp > Date.now() - LICENSE_CACHE_TTL) {
      logger.debug(`License verification cache hit for ${cacheKey}`);
      return cachedResult.result;
    }

    // Verify license in database
    const { data: license, error } = await supabase
      .from('licenses')
      .select('*, customers(*)')
      .eq('key', licenseKey)
      .single();

    if (error || !license) {
      logger.warn(`License not found: ${licenseKey}`);
      return { valid: false, error: 'Invalid license key' };
    }

    // Check if license is active
    if (license.status !== 'active') {
      logger.warn(`License not active: ${licenseKey}, status: ${license.status}`);
      return { valid: false, error: 'License is not active' };
    }

    // Check if license has expired
    const expirationDate = DateTime.fromISO(license.expires_at);
    if (expirationDate < DateTime.now()) {
      logger.warn(`License expired: ${licenseKey}, expired: ${license.expires_at}`);

      // Update license status to expired
      await supabase.from('licenses').update({ status: 'expired' }).eq('id', license.id);

      return { valid: false, error: 'License has expired' };
    }

    // Check if domain is authorized
    if (license.domains && license.domains.length > 0) {
      const isAuthorizedDomain = license.domains.some(authorizedDomain => {
        // Check for wildcard domains
        if (authorizedDomain.startsWith('*.')) {
          const baseDomain = authorizedDomain.substring(2);
          return domain === baseDomain || domain.endsWith('.' + baseDomain);
        }
        return domain === authorizedDomain;
      });

      if (!isAuthorizedDomain) {
        logger.warn(`Unauthorized domain: ${domain} for license: ${licenseKey}`);

        // Log unauthorized access attempt
        await supabase.from('license_access_logs').insert({
          license_id: license.id,
          domain,
          instance_id: instanceId,
          status: 'unauthorized_domain',
          ip_address: null, // We don't store IP addresses for privacy
          user_agent: null, // We don't store user agents for privacy
        });

        return { valid: false, error: 'Unauthorized domain' };
      }
    }

    // Check if instance is authorized (prevent multiple installations)
    if (license.instances && license.instances.length >= license.max_instances) {
      // Check if this instance is already registered
      const isRegisteredInstance = license.instances.includes(instanceId);

      if (!isRegisteredInstance) {
        logger.warn(`Maximum instances reached for license: ${licenseKey}`);

        // Log unauthorized access attempt
        await supabase.from('license_access_logs').insert({
          license_id: license.id,
          domain,
          instance_id: instanceId,
          status: 'max_instances_reached',
          ip_address: null,
          user_agent: null,
        });

        return { valid: false, error: 'Maximum instances reached' };
      }
    } else {
      // Register this instance
      if (instanceId && !license.instances?.includes(instanceId)) {
        const instances = license.instances || [];
        instances.push(instanceId);

        await supabase.from('licenses').update({ instances }).eq('id', license.id);
      }
    }

    // Check Stripe subscription status if available
    if (license.stripe_subscription_id && stripe) {
      try {
        const subscription = await stripe.subscriptions.retrieve(license.stripe_subscription_id);

        if (subscription.status !== 'active' && subscription.status !== 'trialing') {
          logger.warn(
            `Stripe subscription not active: ${license.stripe_subscription_id}, status: ${subscription.status}`
          );

          // Update license status
          await supabase.from('licenses').update({ status: 'inactive' }).eq('id', license.id);

          return { valid: false, error: 'Subscription is not active' };
        }
      } catch (stripeError) {
        logger.error('Error checking Stripe subscription:', stripeError);
        // Continue with validation even if Stripe check fails
      }
    }

    // Log successful verification
    await supabase.from('license_access_logs').insert({
      license_id: license.id,
      domain,
      instance_id: instanceId,
      status: 'success',
      ip_address: null,
      user_agent: null,
    });

    // Prepare license data to return
    const licenseData = {
      valid: true,
      key: license.key,
      customer: {
        name: license.customers?.name || 'Unknown',
        email: license.customers?.email || 'unknown@example.com',
      },
      plan: license.plan,
      features: license.features || ['basic'],
      expiresAt: license.expires_at,
      maxUsers: license.max_users,
      maxTenants: license.max_tenants,
    };

    // Cache the result
    licenseCache.set(cacheKey, {
      timestamp: Date.now(),
      result: licenseData,
    });

    return licenseData;
  } catch (error) {
    logger.error('License verification error:', error);
    return { valid: false, error: 'License verification failed' };
  }
}

/**
 * Create a new license
 * @param {Object} licenseData - License data
 * @returns {Promise<Object>} Created license
 */
export async function createLicense(licenseData) {
  try {
    // Generate a unique license key if not provided
    if (!licenseData.key) {
      const licenseId = nanoid(12).toUpperCase();
      licenseData.key = `CEG-${licenseId}-${nanoid(8).toUpperCase()}`;
    }

    // Set default values
    licenseData.status = licenseData.status || 'active';
    licenseData.created_at = new Date().toISOString();
    licenseData.features = licenseData.features || ['basic'];

    // Insert license into database
    const { data, error } = await supabase.from('licenses').insert([licenseData]).select().single();

    if (error) {
      logger.error('Error creating license:', error);
      throw new Error('Failed to create license');
    }

    return data;
  } catch (error) {
    logger.error('License creation error:', error);
    throw error;
  }
}

/**
 * Revoke a license
 * @param {string} licenseId - The license ID to revoke
 * @returns {Promise<Object>} Revoked license
 */
export async function revokeLicense(licenseId) {
  try {
    // Update license status
    const { data, error } = await supabase
      .from('licenses')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
      })
      .eq('id', licenseId)
      .select()
      .single();

    if (error) {
      logger.error('Error revoking license:', error);
      throw new Error('Failed to revoke license');
    }

    // Cancel Stripe subscription if available
    if (data.stripe_subscription_id && stripe) {
      try {
        await stripe.subscriptions.cancel(data.stripe_subscription_id);
      } catch (stripeError) {
        logger.error('Error cancelling Stripe subscription:', stripeError);
        // Continue even if Stripe cancellation fails
      }
    }

    // Clear cache for this license
    for (const [key] of licenseCache.entries()) {
      if (key.startsWith(data.key)) {
        licenseCache.delete(key);
      }
    }

    return data;
  } catch (error) {
    logger.error('License revocation error:', error);
    throw error;
  }
}

/**
 * Verify the integrity of the application code
 * @returns {boolean} True if code integrity is verified
 */
export function verifyCodeIntegrity() {
  try {
    // This function contains a hidden watermark that can be used to verify
    // the integrity of the application code in legal proceedings

    // The presence of this watermark in the compiled code can be used as evidence
    // that the code was created by Cosmo Exploit Group LLC
    return WATERMARK === 'CEG-WMS-2025-MTJR';
  } catch (error) {
    logger.error('Code integrity verification error:', error);
    return false;
  }
}

export default {
  verifyLicense,
  createLicense,
  revokeLicense,
  verifyCodeIntegrity,
};
