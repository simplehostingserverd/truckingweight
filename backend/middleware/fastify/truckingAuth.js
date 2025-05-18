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

import { createClient } from '@supabase/supabase-js';
import { logger } from '../../utils/logger.js';

// Initialize Supabase client with JWT options
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
// JWT secret is used by Supabase internally for token verification

// Create Supabase client with JWT options if available
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/trucking-auth-middleware',
    },
  },
};

const supabase = createClient(supabaseUrl, supabaseKey, supabaseOptions);

/**
 * Authenticate trucking user middleware
 * Verifies JWT token and sets trucking user data in request
 */
const truckingAuthMiddleware = async (request, reply) => {
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
      // Verify with Supabase Auth
      const { data: sessionData, error: sessionError } = await supabase.auth.getUser(token);

      if (!sessionError && sessionData.user) {
        // Get user from database
        const { data: user, error } = await supabase
          .from('trucking_users')
          .select('*, trucking_companies(*)')
          .eq('id', sessionData.user.id)
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
          companyId: user.company_id,
          role: user.role,
          userType: 'trucking',
          company: user.trucking_companies,
        };

        // Continue
        return;
      } else {
        logger.error('JWT verification error:', sessionError);
        return reply.code(401).send({ msg: 'Token is not valid' });
      }
    } catch (err) {
      logger.error('Token verification error:', err);
      return reply.code(401).send({ msg: 'Token is not valid' });
    }
  } catch (err) {
    logger.error('Trucking auth middleware error:', err);
    return reply.code(500).send({ msg: 'Server error' });
  }
};

export default truckingAuthMiddleware;
