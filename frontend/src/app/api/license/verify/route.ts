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
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { licenseKey, domain, instanceId } = await request.json();

    // Validate input
    if (!licenseKey || !domain) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if license exists
    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .select('*, customers(*)')
      .eq('key', licenseKey)
      .single();

    if (licenseError || !license) {
      console.error('License not found:', licenseKey);
      return NextResponse.json({ valid: false, error: 'Invalid license key' }, { status: 404 });
    }

    // Check if license is active
    if (license.status !== 'active') {
      console.warn(`License not active: ${licenseKey}, status: ${license.status}`);
      return NextResponse.json({ valid: false, error: 'License is not active' }, { status: 403 });
    }

    // Check if license has expired
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      console.warn(`License expired: ${licenseKey}, expired: ${license.expires_at}`);

      // Update license status to expired
      await supabase.from('licenses').update({ status: 'expired' }).eq('id', license.id);

      return NextResponse.json({ valid: false, error: 'License has expired' }, { status: 403 });
    }

    // Check if domain is authorized
    if (license.domains && license.domains.length > 0) {
      const isAuthorizedDomain = license.domains.some((authorizedDomain: string) => {
        // Check for wildcard domains
        if (authorizedDomain.startsWith('*.')) {
          const baseDomain = authorizedDomain.substring(2);
          return domain === baseDomain || domain.endsWith('.' + baseDomain);
        }
        return domain === authorizedDomain;
      });

      if (!isAuthorizedDomain && domain !== 'localhost' && domain !== '127.0.0.1') {
        console.warn(`Unauthorized domain: ${domain} for license: ${licenseKey}`);

        // Log unauthorized access attempt
        await supabase.from('license_access_logs').insert({
          license_id: license.id,
          domain,
          instance_id: instanceId,
          status: 'unauthorized_domain',
        });

        return NextResponse.json({ valid: false, error: 'Unauthorized domain' }, { status: 403 });
      }
    }

    // Check if instance is authorized (prevent multiple installations)
    if (license.instances && license.instances.length >= license.max_instances) {
      // Check if this instance is already registered
      const isRegisteredInstance = license.instances.includes(instanceId);

      if (!isRegisteredInstance) {
        console.warn(`Maximum instances reached for license: ${licenseKey}`);

        // Log unauthorized access attempt
        await supabase.from('license_access_logs').insert({
          license_id: license.id,
          domain,
          instance_id: instanceId,
          status: 'max_instances_reached',
        });

        return NextResponse.json(
          { valid: false, error: 'Maximum instances reached' },
          { status: 403 }
        );
      }
    } else {
      // Register this instance
      if (instanceId && (!license.instances || !license.instances.includes(instanceId))) {
        const instances = license.instances || [];
        instances.push(instanceId);

        await supabase.from('licenses').update({ instances }).eq('id', license.id);
      }
    }

    // Log successful verification
    await supabase.from('license_access_logs').insert({
      license_id: license.id,
      domain,
      instance_id: instanceId,
      status: 'success',
    });

    // Return license data
    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('License verification error:', error);
    return NextResponse.json(
      { valid: false, error: 'License verification failed' },
      { status: 500 }
    );
  }
}
