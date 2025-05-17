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
 * Environment Variable Validator
 * Utility to validate required environment variables and provide helpful error messages
 */

import logger from './logger.js';

/**
 * Validate required environment variables
 * @param {Array<string>} requiredVars - Array of required environment variable names
 * @returns {boolean} - True if all required variables are present, false otherwise
 */
export function validateEnvVars(requiredVars = []) {
  const missing = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    logger.error('Please check your .env file and ensure all required variables are set');
    return false;
  }

  return true;
}

/**
 * Validate Supabase configuration
 * @returns {boolean} - True if Supabase configuration is valid, false otherwise
 */
export function validateSupabaseConfig() {
  // Check for Supabase URL
  if (!process.env.SUPABASE_URL) {
    logger.error('Missing SUPABASE_URL environment variable');
    logger.error('Please add SUPABASE_URL to your .env file');
    return false;
  }

  // Check for at least one Supabase key
  if (
    !process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_KEY &&
    !process.env.SUPABASE_ANON_KEY
  ) {
    logger.error('Missing Supabase authentication key');
    logger.error(
      'Please add at least one of SUPABASE_SERVICE_ROLE_KEY, SUPABASE_KEY, or SUPABASE_ANON_KEY to your .env file'
    );
    return false;
  }
  
  // Check for Supabase JWT secret
  if (!process.env.SUPABASE_JWT_SECRET) {
    logger.warn('Missing SUPABASE_JWT_SECRET environment variable');
    logger.warn('JWT authentication may not work properly without this secret');
    logger.warn('Please add SUPABASE_JWT_SECRET to your .env file');
    // Don't fail validation, just warn
  }

  return true;
}

/**
 * Validate security configuration
 * @returns {boolean} - True if security configuration is valid, false otherwise
 */
export function validateSecurityConfig() {
  // Check for Paseto secret key
  if (!process.env.PASETO_SECRET_KEY) {
    logger.error('Missing PASETO_SECRET_KEY environment variable');
    logger.error('Please add PASETO_SECRET_KEY to your .env file');
    logger.error(
      'Generate with: node -e "console.log(Buffer.from(crypto.randomBytes(32)).toString(\'base64\'));"'
    );
    return false;
  }

  return true;
}

/**
 * Validate all required configuration
 * @returns {boolean} - True if all configuration is valid, false otherwise
 */
export function validateAllConfig() {
  const supabaseValid = validateSupabaseConfig();
  const securityValid = validateSecurityConfig();

  return supabaseValid && securityValid;
}

export default {
  validateEnvVars,
  validateSupabaseConfig,
  validateSecurityConfig,
  validateAllConfig,
};
