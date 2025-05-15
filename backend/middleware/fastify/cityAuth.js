/**
 * City Authentication Middleware
 * Verifies Paseto tokens for city users and sets user data in request
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from '../../utils/logger.js';
import * as pasetoService from '../../services/pasetoService.js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

/**
 * Authenticate city user middleware
 * Verifies Paseto token and sets city user data in request
 */
const cityAuthMiddleware = async (request, reply) => {
  try {
    // Get token from header
    const authHeader = request.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return reply.code(401).send({ msg: 'No token, authorization denied' });
    }

    try {
      // Verify Paseto token
      const decoded = await pasetoService.decryptToken(token);

      // Check if user is a city user
      if (!decoded.user || decoded.user.userType !== 'city') {
        return reply.code(403).send({ msg: 'Not authorized as city user' });
      }

      // Get user from database
      const { data: user, error } = await supabase
        .from('city_users')
        .select('*')
        .eq('id', decoded.user.id)
        .single();

      if (error || !user) {
        return reply.code(401).send({ msg: 'User not found' });
      }

      // Check if user is active
      if (!user.is_active) {
        return reply.code(401).send({ msg: 'Account is inactive' });
      }

      // Set user data in request
      request.user = {
        id: user.id,
        cityId: user.city_id,
        role: user.role,
        userType: 'city',
      };

      // Continue
      return;
    } catch (err) {
      logger.error('Token verification error:', err);
      return reply.code(401).send({ msg: 'Token is not valid' });
    }
  } catch (err) {
    logger.error('City auth middleware error:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
};

/**
 * Check if user is a city admin
 * Must be used after cityAuthMiddleware
 */
const cityAdminMiddleware = async (request, reply) => {
  try {
    // Check if user exists and is a city user
    if (!request.user || request.user.userType !== 'city') {
      return reply.code(403).send({ msg: 'Not authorized as city user' });
    }

    // Check if user is a city admin
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ msg: 'Not authorized as city admin' });
    }

    // Continue
    return;
  } catch (err) {
    logger.error('City admin middleware error:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
};

/**
 * Check if user has required city role
 * Must be used after cityAuthMiddleware
 * @param {Array} roles - Array of allowed roles
 */
const cityRoleMiddleware = roles => {
  return async (request, reply) => {
    try {
      // Check if user exists and is a city user
      if (!request.user || request.user.userType !== 'city') {
        return reply.code(403).send({ msg: 'Not authorized as city user' });
      }

      // Check if user has required role
      if (!roles.includes(request.user.role)) {
        return reply.code(403).send({ msg: 'Not authorized for this action' });
      }

      // Continue
      return;
    } catch (err) {
      logger.error('City role middleware error:', err);
      return reply.code(500).send({ msg: 'Server error' });
    }
  };
};

export { cityAuthMiddleware, cityAdminMiddleware, cityRoleMiddleware };

export default {
  cityAuthMiddleware,
  cityAdminMiddleware,
  cityRoleMiddleware,
};
