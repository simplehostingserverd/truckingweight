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

import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

/**
 * GET /api/license/offline
 *
 * Returns the offline license configuration from the local license file.
 * This endpoint allows the application to verify licenses without internet connectivity.
 */
export async function GET(request: NextRequest) {
  try {
    // Path to the offline license file (check both frontend and root directories)
    const rootLicenseFilePath = path.join(process.cwd(), '..', 'config', 'license.json');
    const frontendLicenseFilePath = path.join(process.cwd(), 'config', 'license.json');

    let licenseFilePath = rootLicenseFilePath;
    if (!fs.existsSync(rootLicenseFilePath) && fs.existsSync(frontendLicenseFilePath)) {
      licenseFilePath = frontendLicenseFilePath;
    }

    // Check if license file exists
    if (!fs.existsSync(licenseFilePath)) {
      console.warn('Offline license file not found:', licenseFilePath);
      return NextResponse.json(
        {
          error: 'Offline license file not found',
          message: 'Please configure an offline license using the license configuration tool',
        },
        { status: 404 }
      );
    }

    // Read and parse license file
    const licenseContent = fs.readFileSync(licenseFilePath, 'utf8');
    let license;

    try {
      license = JSON.parse(licenseContent);
    } catch (parseError) {
      console.error('Error parsing license file:', parseError);
      return NextResponse.json(
        {
          error: 'Invalid license file format',
          message: 'The license file contains invalid JSON',
        },
        { status: 400 }
      );
    }

    // Validate required license fields
    const requiredFields = ['licenseKey', 'expiresAt', 'status'];
    const missingFields = requiredFields.filter(field => !license[field]);

    if (missingFields.length > 0) {
      console.error('License file missing required fields:', missingFields);
      return NextResponse.json(
        {
          error: 'Invalid license configuration',
          message: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Check if license has expired
    const expirationDate = new Date(license.expiresAt);
    const now = new Date();

    if (expirationDate < now) {
      console.warn('Offline license has expired:', license.licenseKey);
      return NextResponse.json(
        {
          error: 'License expired',
          message: `License expired on ${expirationDate.toLocaleDateString()}`,
          expiresAt: license.expiresAt,
        },
        { status: 403 }
      );
    }

    // Check if license is active
    if (license.status !== 'active') {
      console.warn('Offline license is not active:', license.licenseKey, 'Status:', license.status);
      return NextResponse.json(
        {
          error: 'License not active',
          message: `License status is '${license.status}'. Only 'active' licenses are valid.`,
        },
        { status: 403 }
      );
    }

    // Get request domain for validation
    const requestUrl = new URL(request.url);
    const domain = requestUrl.hostname;

    // Validate domain authorization
    const allowedDomains = license.domains || ['localhost', '127.0.0.1'];
    const isDomainAllowed =
      allowedDomains.includes(domain) || domain === 'localhost' || domain === '127.0.0.1';

    if (!isDomainAllowed) {
      console.warn(`Domain ${domain} not authorized for license:`, license.licenseKey);
      return NextResponse.json(
        {
          error: 'Unauthorized domain',
          message: `Domain '${domain}' is not authorized for this license`,
        },
        { status: 403 }
      );
    }

    // Calculate days until expiration
    const daysUntilExpiry = Math.ceil(
      (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Log successful offline verification
    console.warn(
      `✅ Offline license verification successful for ${license.customer?.name || 'Unknown'}`
    );
    console.warn(`   License: ${license.licenseKey}`);
    console.warn(`   Plan: ${license.plan || 'basic'}`);
    console.warn(`   Days until expiry: ${daysUntilExpiry}`);

    // Return sanitized license data
    const response = {
      valid: true,
      licenseKey: license.licenseKey,
      customer: {
        name: license.customer?.name || 'Unknown',
        email: license.customer?.email || 'unknown@example.com',
        company: license.customer?.compunknown || 'Unknown Company',
      },
      plan: license.plan || 'basic',
      features: license.features || ['basic'],
      maxUsers: license.maxUsers || 1,
      maxTenants: license.maxTenants || 1,
      expiresAt: license.expiresAt,
      status: license.status,
      domains: license.domains || ['localhost', '127.0.0.1'],
      daysUntilExpiry,
      offline: true,
      verifiedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Offline license verification error:', error);
    return NextResponse.json(
      {
        error: 'License verification failed',
        message: 'An error occurred while verifying the offline license',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/license/offline
 *
 * Updates the offline license configuration.
 * This endpoint allows updating the license file programmatically.
 */
export async function POST(request: NextRequest) {
  try {
    const licenseData = await request.json();

    // Validate required fields
    const requiredFields = ['licenseKey', 'customer', 'plan', 'expiresAt'];
    const missingFields = requiredFields.filter(field => !licenseData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          message: `Required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Add default values
    const license = {
      ...licenseData,
      status: licenseData.status || 'active',
      features: licenseData.features || ['basic'],
      maxUsers: licenseData.maxUsers || 1,
      maxTenants: licenseData.maxTenants || 1,
      domains: licenseData.domains || ['localhost', '127.0.0.1'],
      createdAt: licenseData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Ensure config directory exists
    const configDir = path.join(process.cwd(), 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Write license file
    const licenseFilePath = path.join(configDir, 'license.json');
    fs.writeFileSync(licenseFilePath, JSON.stringify(license, null, 2));

    console.warn('✅ Offline license updated successfully:', license.licenseKey);

    return NextResponse.json({
      success: true,
      message: 'License updated successfully',
      licenseKey: license.licenseKey,
    });
  } catch (error) {
    console.error('Error updating offline license:', error);
    return NextResponse.json(
      {
        error: 'License update failed',
        message: 'An error occurred while updating the offline license',
      },
      { status: 500 }
    );
  }
}
