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
 * Paseto Token Service
 * Handles secure token generation, validation, and management using Paseto
 * Paseto (Platform-Agnostic Security Tokens) is a more secure alternative to JWT
 */

import { V4 } from 'paseto';
import crypto from 'crypto';
import cacheService from './cache/index.js';

// Generate a secure key for Paseto tokens
let secretKey;
try {
  // Try to use the environment variable if available
  if (process.env.PASETO_SECRET_KEY) {
    secretKey = Buffer.from(process.env.PASETO_SECRET_KEY, 'base64');
    // Ensure the key is the correct length
    if (secretKey.length !== 32) {
      throw new Error('Invalid key length');
    }
  } else {
    // Generate a new key if not available
    secretKey = crypto.randomBytes(32);
    console.warn(
      'PASETO_SECRET_KEY not found in environment variables. Generated a random key for this session.'
    );
    console.warn(
      'For production, set PASETO_SECRET_KEY to this value:',
      secretKey.toString('base64')
    );
  }
} catch (error) {
  // Fallback to a new random key
  secretKey = crypto.randomBytes(32);
  console.error('Error loading PASETO_SECRET_KEY:', error.message);
  console.warn('Generated a random key for this session.');
}

// Token expiration times (in seconds)
const TOKEN_EXPIRY = {
  ACCESS: 24 * 60 * 60, // 24 hours
  REFRESH: 30 * 24 * 60 * 60, // 30 days
  API_KEY: 365 * 24 * 60 * 60, // 1 year
};

// Cache key prefixes
const CACHE_KEYS = {
  SESSION: 'session:',
  BLACKLIST: 'blacklist:',
  API_KEY: 'apikey:',
};

/**
 * Generate Paseto token
 * @param {Object} payload - Token payload
 * @param {string} type - Token type ('access' or 'refresh')
 * @returns {Promise<string>} - Paseto token
 */
const generateToken = async (payload, type = 'access') => {
  const expiresIn = type === 'refresh' ? TOKEN_EXPIRY.REFRESH : TOKEN_EXPIRY.ACCESS;

  // Create expiration date
  const expirationDate = new Date();
  expirationDate.setSeconds(expirationDate.getSeconds() + expiresIn);

  // Create token with Paseto
  return await V4.encrypt(
    {
      ...payload,
      type,
      exp: expirationDate.toISOString(),
    },
    secretKey
  );
};

/**
 * Decrypt and verify Paseto token
 * @param {string} token - Paseto token
 * @returns {Promise<Object|null>} - Decrypted payload or null if invalid
 */
const decryptToken = async token => {
  try {
    const payload = await V4.decrypt(token, secretKey);

    // Check if token has expired
    if (payload.exp && new Date(payload.exp) < new Date()) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Error decrypting Paseto token:', error);
    return null;
  }
};

/**
 * Store token in cache
 * @param {string} token - Paseto token
 * @param {Object} userData - User data to store with token
 * @param {string} type - Token type ('access' or 'refresh')
 * @returns {Promise<boolean>} - Success status
 */
const storeToken = async (token, userData, type = 'access') => {
  try {
    const expiresIn = type === 'refresh' ? TOKEN_EXPIRY.REFRESH : TOKEN_EXPIRY.ACCESS;
    const key = `${CACHE_KEYS.SESSION}${token}`;

    // Store token with user data
    await cacheService.set(
      key,
      {
        ...userData,
        tokenType: type,
      },
      expiresIn
    );

    return true;
  } catch (error) {
    console.error('Error storing token in cache:', error);
    return false;
  }
};

/**
 * Validate token in cache
 * @param {string} token - Paseto token
 * @returns {Promise<Object|null>} - User data if valid, null otherwise
 */
const validateToken = async token => {
  try {
    // Check if token is blacklisted
    const isBlacklisted = await cacheService.get(`${CACHE_KEYS.BLACKLIST}${token}`);
    if (isBlacklisted) {
      return null;
    }

    // Decrypt and verify the token
    const payload = await decryptToken(token);
    if (!payload) {
      return null;
    }

    // Get session data
    const sessionData = await cacheService.get(`${CACHE_KEYS.SESSION}${token}`);
    if (!sessionData) {
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error('Error validating token in cache:', error);
    return null;
  }
};

/**
 * Invalidate token (add to blacklist)
 * @param {string} token - Paseto token
 * @returns {Promise<boolean>} - Success status
 */
const invalidateToken = async token => {
  try {
    // Decrypt token to get expiration time
    const payload = await decryptToken(token);
    if (!payload || !payload.exp) {
      return false;
    }

    // Calculate remaining time until expiration
    const expiresIn = Math.floor((new Date(payload.exp).getTime() - Date.now()) / 1000);
    if (expiresIn <= 0) {
      return true; // Token already expired
    }

    // Add token to blacklist
    await cacheService.set(`${CACHE_KEYS.BLACKLIST}${token}`, true, expiresIn);

    // Remove from active sessions
    await cacheService.delete(`${CACHE_KEYS.SESSION}${token}`);

    return true;
  } catch (error) {
    console.error('Error invalidating token:', error);
    return false;
  }
};

export {
  generateToken,
  decryptToken,
  storeToken,
  validateToken,
  invalidateToken,
  TOKEN_EXPIRY,
  CACHE_KEYS,
};
