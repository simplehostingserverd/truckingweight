/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 *
 * Designed and built by Michael Anthony Trevino Jr., Lead Full-Stack Developer
 */

const crypto = require('crypto');

/**
 * Netlify function to verify the application license
 * This provides a server-side verification mechanism as an additional security layer
 */
exports.handler = async function (event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { licenseKey, deploymentUrl, codeHash } = body;

    // Verify required fields
    if (!licenseKey || !deploymentUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Get environment variables
    const validLicenseKey = process.env.LICENSE_KEY;
    const validDomains = (process.env.AUTHORIZED_DOMAINS || '').split(',');
    const securityToken = process.env.SECURITY_TOKEN;

    // Verify security token from headers
    const authHeader = event.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (token !== securityToken) {
      console.log('Invalid security token');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    // Verify license key
    if (licenseKey !== validLicenseKey) {
      console.log('Invalid license key');
      return {
        statusCode: 403,
        body: JSON.stringify({
          valid: false,
          error: 'Invalid license key',
        }),
      };
    }

    // Verify deployment URL
    const deploymentDomain = new URL(deploymentUrl).hostname;
    const isValidDomain = validDomains.some(domain => {
      // Allow exact match or wildcard subdomains
      if (domain.startsWith('*.')) {
        const baseDomain = domain.substring(2);
        return deploymentDomain === baseDomain || deploymentDomain.endsWith('.' + baseDomain);
      }
      return deploymentDomain === domain;
    });

    if (!isValidDomain) {
      console.log(`Invalid deployment domain: ${deploymentDomain}`);
      return {
        statusCode: 403,
        body: JSON.stringify({
          valid: false,
          error: 'Unauthorized deployment domain',
        }),
      };
    }

    // Calculate license expiration (example: 1 year from now)
    const now = new Date();
    const expiresAt = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString();

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({
        valid: true,
        expiresAt,
        features: ['dashboard', 'reports', 'admin', 'api', 'maps'],
        message: 'License verified successfully',
      }),
    };
  } catch (error) {
    console.error('License verification error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
