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
 * City Authentication Routes
 * Handles city user registration, login, and authentication
 */

import { createClient } from '@supabase/supabase-js';
import * as pasetoService from '../../services/pasetoService.js';

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
      'X-Client-Info': 'supabase-js/city-auth',
    },
  },
};

const supabase = createClient(supabaseUrl, supabaseKey, supabaseOptions);

// City auth route schemas
const registerCitySchema = {
  body: {
    type: 'object',
    required: ['name', 'state'],
    properties: {
      name: { type: 'string', minLength: 1 },
      state: { type: 'string', minLength: 1 },
      country: { type: 'string' },
      address: { type: 'string' },
      zip_code: { type: 'string' },
      contact_email: { type: 'string', format: 'email' },
      contact_phone: { type: 'string' },
      website: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        city: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            state: { type: 'string' },
          },
        },
      },
    },
    400: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

const registerCityUserSchema = {
  body: {
    type: 'object',
    required: ['name', 'email', 'password', 'cityId', 'role'],
    properties: {
      name: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 },
      cityId: { type: 'number' },
      role: { type: 'string', enum: ['admin', 'operator', 'inspector', 'viewer'] },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            cityId: { type: 'number' },
            role: { type: 'string' },
          },
        },
      },
    },
    400: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

const loginCityUserSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            cityId: { type: 'number' },
            role: { type: 'string' },
          },
        },
      },
    },
    400: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

const forgotPasswordSchema = {
  body: {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
    400: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

const resetPasswordSchema = {
  body: {
    type: 'object',
    required: ['token', 'password'],
    properties: {
      token: { type: 'string' },
      password: { type: 'string', minLength: 6 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
    400: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

/**
 * City Auth Routes
 */
async function routes(fastify, _options) {
  /**
   * @route   POST /api/city-auth/register-city
   * @desc    Register a new city
   * @access  Public
   */
  fastify.post(
    '/register-city',
    {
      schema: registerCitySchema,
      config: { public: true }, // Mark this route as public to bypass authentication middleware
    },
    async (request, reply) => {
      const {
        name,
        state,
        country = 'USA',
        address,
        zip_code,
        contact_email,
        contact_phone,
        website,
      } = request.body;

      try {
        // Validate contact email domain if provided - only .gov domains are allowed
        if (contact_email && !contact_email.toLowerCase().endsWith('.gov')) {
          return reply
            .code(400)
            .send({ msg: 'Only .gov email domains are allowed for city contact email' });
        }

        // Check if city already exists
        const { data: existingCity, error: checkError } = await supabase
          .from('cities')
          .select('*')
          .eq('name', name)
          .eq('state', state)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          request.log.error('Error checking for existing city:', checkError);
          return reply.code(500).send({ msg: 'Server error' });
        }

        if (existingCity) {
          return reply.code(400).send({ msg: 'City already exists' });
        }

        // Create city record
        const { data: newCity, error: createError } = await supabase
          .from('cities')
          .insert([
            {
              name,
              state,
              country,
              address,
              zip_code,
              contact_email,
              contact_phone,
              website,
              status: 'Active',
            },
          ])
          .select()
          .single();

        if (createError) {
          request.log.error('Error creating city record:', createError);
          return reply.code(500).send({ msg: 'Error creating city' });
        }

        return reply.code(200).send({
          city: {
            id: newCity.id,
            name: newCity.name,
            state: newCity.state,
          },
        });
      } catch (err) {
        request.log.error('Server error in city registration:', err);
        return reply.code(500).send({ msg: 'Server error' });
      }
    }
  );

  /**
   * @route   POST /api/city-auth/register
   * @desc    Register a city user
   * @access  Public
   */
  fastify.post(
    '/register',
    {
      schema: registerCityUserSchema,
      config: { public: true }, // Mark this route as public to bypass authentication middleware
    },
    async (request, reply) => {
      const { name, email, password, cityId, role } = request.body;

      try {
        // Validate email domain - only .gov domains are allowed
        if (!email.toLowerCase().endsWith('.gov')) {
          return reply
            .code(400)
            .send({ msg: 'Only .gov email domains are allowed for city registration' });
        }

        // Check if user already exists
        const { data: existingUser, error: checkError } = await supabase
          .from('city_users')
          .select('*')
          .eq('email', email)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          request.log.error('Error checking for existing city user:', checkError);
          return reply.code(500).send({ msg: 'Server error' });
        }

        if (existingUser) {
          return reply.code(400).send({ msg: 'User already exists' });
        }

        // Check if city exists
        const { data: city, error: cityError } = await supabase
          .from('cities')
          .select('*')
          .eq('id', cityId)
          .single();

        if (cityError || !city) {
          return reply.code(400).send({ msg: 'City not found' });
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              city_id: cityId,
              role,
              user_type: 'city',
            },
          },
        });

        if (authError) {
          request.log.error('Error creating city user in auth:', authError);
          return reply.code(500).send({ msg: 'Error creating user' });
        }

        // Create city user record
        const userId = authData.user.id;
        const { data: newUser, error: createError } = await supabase
          .from('city_users')
          .insert([
            {
              id: userId,
              name,
              email,
              city_id: cityId,
              role,
            },
          ])
          .select()
          .single();

        if (createError) {
          request.log.error('Error creating city user record:', createError);
          return reply.code(500).send({ msg: 'Error creating user record' });
        }

        // Create Paseto token for backward compatibility
        const payload = {
          user: {
            id: newUser.id,
            cityId: newUser.city_id,
            role: newUser.role,
            userType: 'city',
          },
        };

        const pasetoToken = await pasetoService.generateToken(payload);

        // Get Supabase session tokens
        const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (sessionError) {
          request.log.error('Error getting session tokens:', sessionError);
          // Continue with just the Paseto token if there's an error
          return reply.code(200).send({
            token: pasetoToken,
            user: {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              cityId: newUser.city_id,
              role: newUser.role,
            },
          });
        }

        // Return both tokens - Supabase JWT token and Paseto token for backward compatibility
        return reply.code(200).send({
          token: pasetoToken, // For backward compatibility
          supabaseToken: sessionData.session.access_token, // Supabase JWT token
          refreshToken: sessionData.session.refresh_token, // Supabase refresh token
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            cityId: newUser.city_id,
            role: newUser.role,
          },
        });
      } catch (err) {
        request.log.error('Server error in city user registration:', err);
        return reply.code(500).send({ msg: 'Server error' });
      }
    }
  );

  /**
   * @route   POST /api/city-auth/login
   * @desc    Authenticate city user & get token
   * @access  Public
   */
  fastify.post(
    '/login',
    {
      schema: loginCityUserSchema,
      config: { public: true }, // Mark this route as public to bypass authentication middleware
    },
    async (request, reply) => {
      const { email, password } = request.body;

      try {
        // Sign in with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          return reply.code(400).send({ msg: 'Invalid credentials' });
        }

        // Get city user data
        const { data: userData, error: userError } = await supabase
          .from('city_users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (userError || !userData) {
          return reply.code(400).send({ msg: 'User not found' });
        }

        // Check if user is active
        if (!userData.is_active) {
          return reply.code(400).send({ msg: 'Account is inactive' });
        }

        // Create Paseto token for backward compatibility
        const payload = {
          user: {
            id: userData.id,
            cityId: userData.city_id,
            role: userData.role,
            userType: 'city',
          },
        };

        const pasetoToken = await pasetoService.generateToken(payload);

        // Return both tokens - Supabase JWT token and Paseto token for backward compatibility
        return reply.code(200).send({
          token: pasetoToken, // For backward compatibility
          supabaseToken: authData.session.access_token, // Supabase JWT token
          refreshToken: authData.session.refresh_token, // Supabase refresh token
          user: {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            cityId: userData.city_id,
            role: userData.role,
          },
        });
      } catch (err) {
        request.log.error('Server error in city user login:', err);
        return reply.code(500).send({ msg: 'Server error' });
      }
    }
  );

  /**
   * @route   GET /api/city-auth/me
   * @desc    Get current city user
   * @access  Private
   */
  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      // Check if user is a city user
      if (request.user.userType !== 'city') {
        return reply.code(403).send({ msg: 'Not authorized as city user' });
      }

      const { data: user, error } = await supabase
        .from('city_users')
        .select('*, cities(*)')
        .eq('id', request.user.id)
        .single();

      if (error) {
        request.log.error('Error fetching city user:', error);
        return reply.code(500).send({ msg: 'Server error' });
      }

      if (!user) {
        return reply.code(404).send({ msg: 'User not found' });
      }

      return reply.code(200).send({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          cityId: user.city_id,
          role: user.role,
          city: user.cities,
        },
      });
    } catch (err) {
      request.log.error('Server error in get city user:', err);
      return reply.code(500).send({ msg: 'Server error' });
    }
  });

  /**
   * @route   POST /api/city-auth/forgot-password
   * @desc    Send password reset email
   * @access  Public
   */
  fastify.post(
    '/forgot-password',
    {
      schema: forgotPasswordSchema,
      config: { public: true }, // Mark this route as public to bypass authentication middleware
    },
    async (request, reply) => {
      const { email } = request.body;

      try {
        // Check if user exists
        const { data: user, error: userError } = await supabase
          .from('city_users')
          .select('*')
          .eq('email', email)
          .single();

        if (userError && userError.code !== 'PGRST116') {
          request.log.error('Error checking for city user:', userError);
          return reply.code(500).send({ msg: 'Server error' });
        }

        // For security reasons, always return success even if user doesn't exist
        if (!user) {
          return reply.code(200).send({ msg: 'Password reset email sent if account exists' });
        }

        // Send password reset email using Supabase Auth
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${process.env.FRONTEND_URL}/city-reset-password`,
        });

        if (resetError) {
          request.log.error('Error sending password reset email:', resetError);
          return reply.code(500).send({ msg: 'Error sending password reset email' });
        }

        return reply.code(200).send({ msg: 'Password reset email sent' });
      } catch (err) {
        request.log.error('Server error in forgot password:', err);
        return reply.code(500).send({ msg: 'Server error' });
      }
    }
  );

  /**
   * @route   POST /api/city-auth/reset-password
   * @desc    Reset user password
   * @access  Public
   */
  fastify.post(
    '/reset-password',
    {
      schema: resetPasswordSchema,
      config: { public: true }, // Mark this route as public to bypass authentication middleware
    },
    async (request, reply) => {
      const { token, password } = request.body;

      try {
        // Update password using Supabase Auth
        const { error: updateError } = await supabase.auth.updateUser(
          {
            password,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (updateError) {
          request.log.error('Error resetting password:', updateError);
          return reply.code(400).send({ msg: 'Invalid or expired token' });
        }

        return reply.code(200).send({ msg: 'Password reset successful' });
      } catch (err) {
        request.log.error('Server error in reset password:', err);
        return reply.code(500).send({ msg: 'Server error' });
      }
    }
  );
}

export default routes;
