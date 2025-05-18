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
      'X-Client-Info': 'supabase-js/trucking-auth',
    },
  },
};

const supabase = createClient(supabaseUrl, supabaseKey, supabaseOptions);

/**
 * Trucking auth routes
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 * @param {Object} _options - Plugin options (unused)
 */
export default async function (fastify, _options) {
  // Login route
  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password } = request.body;

      // Validate input
      if (!email || !password) {
        return reply.code(400).send({ msg: 'Please provide email and password' });
      }

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        logger.error('Trucking login error:', authError);
        return reply.code(401).send({ msg: 'Invalid credentials' });
      }

      // Get user data from database
      const { data: userData, error: userError } = await supabase
        .from('trucking_users')
        .select('*, trucking_companies(*)')
        .eq('id', authData.user.id)
        .single();

      if (userError || !userData) {
        logger.error('Error getting trucking user data:', userError);
        return reply.code(401).send({ msg: 'User not found' });
      }

      // Check if user is active
      if (!userData.is_active) {
        return reply.code(401).send({ msg: 'Account is inactive' });
      }

      // Return user data and token
      return reply.code(200).send({
        token: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          companyId: userData.company_id,
          role: userData.role,
          company: userData.trucking_companies,
        },
      });
    } catch (err) {
      logger.error('Trucking login error:', err);
      return reply.code(500).send({ msg: 'Server error' });
    }
  });

  // Register route
  fastify.post('/register', async (request, reply) => {
    try {
      const { name, email, password, companyName, companyDot, licenseKey } = request.body;

      // Validate input
      if (!name || !email || !password || !companyName) {
        return reply.code(400).send({ msg: 'Please provide all required fields' });
      }

      // Check if email is already registered
      const { data: existingUser } = await supabase
        .from('trucking_users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return reply.code(400).send({ msg: 'Email already registered' });
      }

      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            user_type: 'trucking',
          },
        },
      });

      if (authError) {
        logger.error('Trucking registration error:', authError);
        return reply.code(400).send({ msg: authError.message || 'Registration failed' });
      }

      // Create company
      const { data: companyData, error: companyError } = await supabase
        .from('trucking_companies')
        .insert([
          {
            name: companyName,
            dot_number: companyDot || null,
            license_key: licenseKey || null,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (companyError) {
        logger.error('Error creating trucking company:', companyError);
        return reply.code(500).send({ msg: 'Error creating company' });
      }

      // Create user in database
      const { data: userData, error: userError } = await supabase
        .from('trucking_users')
        .insert([
          {
            id: authData.user.id,
            name,
            email,
            company_id: companyData.id,
            role: 'admin', // First user is admin
            is_active: true,
          },
        ])
        .select()
        .single();

      if (userError) {
        logger.error('Error creating trucking user:', userError);
        return reply.code(500).send({ msg: 'Error creating user' });
      }

      // Return user data and token
      return reply.code(200).send({
        token: authData.session?.access_token,
        refreshToken: authData.session?.refresh_token,
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          companyId: userData.company_id,
          role: userData.role,
          company: companyData,
        },
      });
    } catch (err) {
      logger.error('Trucking registration error:', err);
      return reply.code(500).send({ msg: 'Server error' });
    }
  });

  // Get current user
  fastify.get('/me', async (request, reply) => {
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

      // Verify token with Supabase Auth
      const { data: userData, error: userError } = await supabase.auth.getUser(token);

      if (userError || !userData.user) {
        return reply.code(401).send({ msg: 'Token is not valid' });
      }

      // Get user data from database
      const { data: truckingUser, error: truckingUserError } = await supabase
        .from('trucking_users')
        .select('*, trucking_companies(*)')
        .eq('id', userData.user.id)
        .single();

      if (truckingUserError || !truckingUser) {
        return reply.code(401).send({ msg: 'User not found' });
      }

      // Check if user is active
      if (!truckingUser.is_active) {
        return reply.code(401).send({ msg: 'Account is inactive' });
      }

      // Return user data
      return reply.code(200).send({
        user: {
          id: truckingUser.id,
          name: truckingUser.name,
          email: truckingUser.email,
          companyId: truckingUser.company_id,
          role: truckingUser.role,
          company: truckingUser.trucking_companies,
        },
      });
    } catch (err) {
      logger.error('Error getting current trucking user:', err);
      return reply.code(500).send({ msg: 'Server error' });
    }
  });

  // Forgot password
  fastify.post('/forgot-password', async (request, reply) => {
    try {
      const { email } = request.body;

      // Validate input
      if (!email) {
        return reply.code(400).send({ msg: 'Please provide email' });
      }

      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/trucking/reset-password`,
      });

      if (error) {
        logger.error('Error sending password reset email:', error);
        return reply
          .code(400)
          .send({ msg: error.message || 'Failed to send password reset email' });
      }

      return reply.code(200).send({ msg: 'Password reset email sent' });
    } catch (err) {
      logger.error('Error sending password reset email:', err);
      return reply.code(500).send({ msg: 'Server error' });
    }
  });

  // Reset password
  fastify.post('/reset-password', async (request, reply) => {
    try {
      const { password } = request.body;

      // Validate input
      if (!password) {
        return reply.code(400).send({ msg: 'Please provide new password' });
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        logger.error('Error resetting password:', error);
        return reply.code(400).send({ msg: error.message || 'Failed to reset password' });
      }

      return reply.code(200).send({ msg: 'Password reset successful' });
    } catch (err) {
      logger.error('Error resetting password:', err);
      return reply.code(500).send({ msg: 'Server error' });
    }
  });
}
