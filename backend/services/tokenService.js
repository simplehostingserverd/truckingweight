/**
 * Token Service
 * Handles token storage, validation, and management using Redis
 */

const jwt = require('jsonwebtoken');
const { redisService } = require('./redis');

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
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @param {string} type - Token type ('access' or 'refresh')
 * @returns {string} - JWT token
 */
const generateToken = (payload, type = 'access') => {
  const expiresIn = type === 'refresh' ? TOKEN_EXPIRY.REFRESH : TOKEN_EXPIRY.ACCESS;
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'supersecretkey',
    { expiresIn: `${expiresIn}s` }
  );
};

/**
 * Store token in Redis
 * @param {string} token - JWT token
 * @param {Object} userData - User data to store with token
 * @param {string} type - Token type ('access' or 'refresh')
 * @returns {Promise<boolean>} - Success status
 */
const storeToken = async (token, userData, type = 'access') => {
  try {
    const expiresIn = type === 'refresh' ? TOKEN_EXPIRY.REFRESH : TOKEN_EXPIRY.ACCESS;
    const key = `${REDIS_KEYS.SESSION}${token}`;
    
    // Store token with user data
    await redisService.set(key, JSON.stringify({
      ...userData,
      tokenType: type,
    }), 'EX', expiresIn);
    
    return true;
  } catch (error) {
    console.error('Error storing token in Redis:', error);
    return false;
  }
};

/**
 * Validate token in Redis
 * @param {string} token - JWT token
 * @returns {Promise<Object|null>} - User data if valid, null otherwise
 */
const validateToken = async (token) => {
  try {
    // Check if token is blacklisted
    const isBlacklisted = await redisService.get(`${REDIS_KEYS.BLACKLIST}${token}`);
    if (isBlacklisted) {
      return null;
    }
    
    // Get session data
    const sessionData = await redisService.get(`${REDIS_KEYS.SESSION}${token}`);
    if (!sessionData) {
      return null;
    }
    
    return JSON.parse(sessionData);
  } catch (error) {
    console.error('Error validating token in Redis:', error);
    return null;
  }
};

/**
 * Invalidate token (add to blacklist)
 * @param {string} token - JWT token
 * @returns {Promise<boolean>} - Success status
 */
const invalidateToken = async (token) => {
  try {
    // Decode token to get expiration time
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return false;
    }
    
    // Calculate remaining time until expiration
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    if (expiresIn <= 0) {
      return true; // Token already expired
    }
    
    // Add token to blacklist
    await redisService.set(`${REDIS_KEYS.BLACKLIST}${token}`, '1', 'EX', expiresIn);
    
    // Remove from active sessions
    await redisService.del(`${REDIS_KEYS.SESSION}${token}`);
    
    return true;
  } catch (error) {
    console.error('Error invalidating token:', error);
    return false;
  }
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
const validateApiKey = async (apiKey) => {
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
