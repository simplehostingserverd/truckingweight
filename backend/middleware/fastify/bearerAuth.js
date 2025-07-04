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
 */

/**
 * Bearer Authentication Middleware for Fastify
 * Validates bearer tokens from the Authorization header
 * Checks token validity in database
 * Uses Paseto tokens for enhanced security
 */

import { createClient } from '@supabase/supabase-js';
import * as pasetoService from '../../services/pasetoService.js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Supabase URL is required. Please set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable.'
  );
}

if (!supabaseKey) {
  throw new Error(
    'Supabase key is required. Please set SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Extract bearer token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} - Extracted token or null
 */
const extractBearerToken = authHeader => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

/**
 * Import token service for API key validation
 * Note: We're using pasetoService for token validation now
 */
import * as tokenService from '../../services/tokenService.js';

/**
 * Bearer authentication middleware
 * Validates Paseto tokens and checks for token validity
 */
const bearerAuthMiddleware = async (request, reply) => {
  try {
    // Skip authentication for public routes
    if (request.routeOptions.config && request.routeOptions.config.public) {
      return;
    }

    // Get token from header
    const authHeader = request.headers.authorization;
    const token = extractBearerToken(authHeader);

    // Check if token exists
    if (!token) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'No token provided',
      });
    }

    try {
      // Decrypt and verify Paseto token
      const decoded = await pasetoService.decryptToken(token);
      if (!decoded) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Token is invalid or expired',
        });
      }

      // Check if token is valid in cache
      const sessionData = await pasetoService.validateToken(token);
      if (!sessionData) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Token is invalid or has been revoked',
        });
      }

      // Get user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.user.id)
        .single();

      if (error || !user) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'User not found',
        });
      }

      // Set user data in request
      request.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        companyId: user.company_id,
        isAdmin: user.is_admin,
      };

      // Store token in request for potential use in other middleware
      request.token = token;
    } catch (err) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Token is invalid',
      });
    }
  } catch (error) {
    request.log.error('Bearer auth middleware error:', error);
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Authentication service error',
    });
  }
};

/**
 * API Key authentication middleware
 * Validates API keys from the x-api-key header
 */
const apiKeyAuthMiddleware = async (request, reply) => {
  try {
    // Skip authentication for public routes
    if (request.routeOptions.config && request.routeOptions.config.public) {
      return;
    }

    // Get API key from header
    const apiKey = request.headers['x-api-key'];

    // Check if API key exists
    if (!apiKey) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'No API key provided',
      });
    }

    // First check cache for API key
    let apiKeyData = await tokenService.validateApiKey(apiKey);

    // If not in cache, check database
    if (!apiKeyData) {
      const { data, error } = await supabase
        .from('api_keys')
        .select('id, name, permissions, company_id, is_active, expires_at')
        .eq('key', apiKey)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Invalid API key',
        });
      }

      // Check if the API key has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'API key has expired',
        });
      }

      // Store in cache for future requests
      apiKeyData = data;
      await tokenService.storeApiKey(apiKey, apiKeyData);
    }

    // Update last used timestamp in database
    await supabase
      .from('api_keys')
      .update({
        last_used_at: new Date().toISOString(),
      })
      .eq('id', apiKeyData.id);

    // Set API key data in request
    request.apiKey = {
      id: apiKeyData.id,
      name: apiKeyData.name,
      permissions: apiKeyData.permissions,
      companyId: apiKeyData.company_id,
    };
  } catch (error) {
    request.log.error('API key auth middleware error:', error);
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Authentication service error',
    });
  }
};

export { apiKeyAuthMiddleware, bearerAuthMiddleware, extractBearerToken };
