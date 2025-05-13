/**
 * Token Service
 * Handles token storage, validation, and management using Redis
 * Note: This service is being deprecated in favor of pasetoService.js
 * It is kept for backward compatibility with API keys only
 */

const { redisService } = require('./redis');
const pasetoService = require('./pasetoService');

// Token expiration times (in seconds)
const TOKEN_EXPIRY = {
  ACCESS: 24 * 60 * 60, // 24 hours
  REFRESH: 30 * 24 * 60 * 60, // 30 days
  API_KEY: 365 * 24 * 60 * 60, // 1 year
};

// Redis key prefixes
const REDIS_KEYS = {
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
 * Store token in Redis
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
 * Validate token in Redis
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
 * Store API key in Redis
 * @param {string} apiKey - API key
 * @param {Object} apiKeyData - API key data
 * @returns {Promise<boolean>} - Success status
 */
const storeApiKey = async (apiKey, apiKeyData) => {
  try {
    const key = `${REDIS_KEYS.API_KEY}${apiKey}`;
    const expiresIn = apiKeyData.expiresAt
      ? Math.floor((new Date(apiKeyData.expiresAt).getTime() - Date.now()) / 1000)
      : TOKEN_EXPIRY.API_KEY;

    // Store API key data
    await redisService.set(key, JSON.stringify(apiKeyData), 'EX', expiresIn);

    return true;
  } catch (error) {
    console.error('Error storing API key in Redis:', error);
    return false;
  }
};

/**
 * Validate API key in Redis
 * @param {string} apiKey - API key
 * @returns {Promise<Object|null>} - API key data if valid, null otherwise
 */
const validateApiKey = async apiKey => {
  try {
    const key = `${REDIS_KEYS.API_KEY}${apiKey}`;
    const apiKeyData = await redisService.get(key);

    if (!apiKeyData) {
      return null;
    }

    // Update last used timestamp
    const data = JSON.parse(apiKeyData);
    data.lastUsedAt = new Date().toISOString();

    // Update in Redis
    const expiresIn = data.expiresAt
      ? Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000)
      : TOKEN_EXPIRY.API_KEY;

    await redisService.set(key, JSON.stringify(data), 'EX', expiresIn);

    return data;
  } catch (error) {
    console.error('Error validating API key in Redis:', error);
    return null;
  }
};

module.exports = {
  generateToken,
  storeToken,
  validateToken,
  invalidateToken,
  storeApiKey,
  validateApiKey,
  TOKEN_EXPIRY,
  REDIS_KEYS,
};
