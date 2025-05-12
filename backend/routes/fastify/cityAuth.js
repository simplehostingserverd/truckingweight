/**
 * City Authentication Routes
 * Handles city user registration, login, and authentication
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../../utils/logger');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// City auth route schemas
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

/**
 * City Auth Routes
 */
async function routes(fastify, options) {
  /**
   * @route   POST /api/city-auth/register
   * @desc    Register a city user
   * @access  Public
   */
  fastify.post('/register', { schema: registerCityUserSchema }, async (request, reply) => {
    const { name, email, password, cityId, role } = request.body;

    try {
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

      // Create and return JWT token
      const payload = {
        user: {
          id: newUser.id,
          cityId: newUser.city_id,
          role: newUser.role,
          userType: 'city',
        },
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

      return reply.code(200).send({
        token,
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
  });

  /**
   * @route   POST /api/city-auth/login
   * @desc    Authenticate city user & get token
   * @access  Public
   */
  fastify.post('/login', { schema: loginCityUserSchema }, async (request, reply) => {
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

      // Create and return JWT token
      const payload = {
        user: {
          id: userData.id,
          cityId: userData.city_id,
          role: userData.role,
          userType: 'city',
        },
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

      return reply.code(200).send({
        token,
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
  });

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
}

module.exports = routes;
