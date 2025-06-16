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
 * Token Service
 * Handles token storage, validation, and management using in-memory cache
 * Note: This service is being deprecated in favor of pasetoService.js
 * It is kept for backward compatibility with API keys only
 */

import cacheService from './cache/index.js';
import * as pasetoService from './pasetoService.js';

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
 * Generate token using Paseto
 * @param {Object} payload - Token payload
 * @param {string} type - Token type ('access' or 'refresh')
 * @returns {Promise<string>} - Paseto token
 * @deprecated Use pasetoService.generateToken directly
 */
const generateToken = async (payload, type = 'access') => {
  return await pasetoService.generateToken(payload, type);
};

/**
 * Store token in cache
 * @param {string} token - Paseto token
 * @param {Object} userData - User data to store with token
 * @param {string} type - Token type ('access' or 'refresh')
 * @returns {Promise<boolean>} - Success status
 * @deprecated Use pasetoService.storeToken directly
 */
const storeToken = async (token, userData, type = 'access') => {
  return await pasetoService.storeToken(token, userData, type);
};

/**
 * Validate token in cache
 * @param {string} token - Paseto token
 * @returns {Promise<Object|null>} - User data if valid, null otherwise
 * @deprecated Use pasetoService.validateToken directly
 */
const validateToken = async token => {
  return await pasetoService.validateToken(token);
};

/**
 * Invalidate token (add to blacklist)
 * @param {string} token - Paseto token
 * @returns {Promise<boolean>} - Success status
 * @deprecated Use pasetoService.invalidateToken directly
 */
const invalidateToken = async token => {
  return await pasetoService.invalidateToken(token);
};

/**
 * Store API key in cache
 * @param {string} apiKey - API key
 * @param {Object} apiKeyData - API key data
 * @returns {Promise<boolean>} - Success status
 */
const storeApiKey = async (apiKey, apiKeyData) => {
  try {
    const key = `${CACHE_KEYS.API_KEY}${apiKey}`;
    const expiresIn = apiKeyData.expiresAt
      ? Math.floor((new Date(apiKeyData.expiresAt).getTime() - Date.now()) / 1000)
      : TOKEN_EXPIRY.API_KEY;

    // Store API key data
    await cacheService.set(key, apiKeyData, expiresIn);

    return true;
  } catch (error) {
    console.error('Error storing API key in cache:', error);
    return false;
  }
};

/**
 * Validate API key in cache
 * @param {string} apiKey - API key
 * @returns {Promise<Object|null>} - API key data if valid, null otherwise
 */
const validateApiKey = async apiKey => {
  try {
    const key = `${CACHE_KEYS.API_KEY}${apiKey}`;
    const apiKeyData = await cacheService.get(key);

    if (!apiKeyData) {
      return null;
    }

    // Update last used timestamp
    apiKeyData.lastUsedAt = new Date().toISOString();

    // Update in cache
    const expiresIn = apiKeyData.expiresAt
      ? Math.floor((new Date(apiKeyData.expiresAt).getTime() - Date.now()) / 1000)
      : TOKEN_EXPIRY.API_KEY;

    await cacheService.set(key, apiKeyData, expiresIn);

    return apiKeyData;
  } catch (error) {
    console.error('Error validating API key in cache:', error);
    return null;
  }
};

export {
  generateToken,
  storeToken,
  validateToken,
  invalidateToken,
  storeApiKey,
  validateApiKey,
  TOKEN_EXPIRY,
  CACHE_KEYS,
};
