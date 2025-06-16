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
 * City Users Routes
 * Handles CRUD operations for city users
 */

import cityUserController from '../../controllers/fastify/cityUsers.js';
import { authMiddleware, cityAdminMiddleware } from '../../middleware/fastify/auth.js';

// City user schema
const cityUserSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    city_id: { type: 'string' },
    role: { type: 'string', enum: ['admin', 'operator', 'inspector', 'viewer'] },
    status: { type: 'string', enum: ['active', 'inactive', 'pending'] },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
    last_login: { type: ['string', 'null'], format: 'date-time' },
  },
};

// Get all city users schema
const getAllCityUsersSchema = {
  tags: ['City Users'],
  summary: 'Get all city users',
  description: 'Returns a list of all users for the current city',
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: cityUserSchema,
        },
        count: { type: 'integer' },
      },
    },
    401: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
    403: {
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

// Get city user by ID schema
const getCityUserByIdSchema = {
  tags: ['City Users'],
  summary: 'Get city user by ID',
  description: 'Returns a single city user by ID',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        user: cityUserSchema,
      },
    },
    401: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
    403: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
    404: {
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

// Create city user schema
const createCityUserSchema = {
  tags: ['City Users'],
  summary: 'Create a new city user',
  description: 'Creates a new user for the current city',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['name', 'email', 'password', 'role'],
    properties: {
      name: { type: 'string', minLength: 2 },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 },
      role: { type: 'string', enum: ['admin', 'operator', 'inspector', 'viewer'] },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        user: cityUserSchema,
        msg: { type: 'string' },
      },
    },
    400: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
    401: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
    403: {
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

// Update city user schema
const updateCityUserSchema = {
  tags: ['City Users'],
  summary: 'Update a city user',
  description: 'Updates an existing city user',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 2 },
      email: { type: 'string', format: 'email' },
      role: { type: 'string', enum: ['admin', 'operator', 'inspector', 'viewer'] },
      status: { type: 'string', enum: ['active', 'inactive', 'pending'] },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        user: cityUserSchema,
        msg: { type: 'string' },
      },
    },
    400: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
    401: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
    403: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
    404: {
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

// Delete city user schema
const deleteCityUserSchema = {
  tags: ['City Users'],
  summary: 'Delete a city user',
  description: 'Deletes a city user by ID',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
    401: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
    403: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
    404: {
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

// City users routes
async function routes(fastify /* options */) {
  // Get all city users
  fastify.get(
    '/',
    {
      preHandler: [authMiddleware, cityAdminMiddleware],
      schema: getAllCityUsersSchema,
    },
    cityUserController.getAllCityUsers
  );

  // Get city user by ID
  fastify.get(
    '/:id',
    {
      preHandler: [authMiddleware, cityAdminMiddleware],
      schema: getCityUserByIdSchema,
    },
    cityUserController.getCityUserById
  );

  // Create a new city user
  fastify.post(
    '/',
    {
      preHandler: [authMiddleware, cityAdminMiddleware],
      schema: createCityUserSchema,
    },
    cityUserController.createCityUser
  );

  // Update a city user
  fastify.put(
    '/:id',
    {
      preHandler: [authMiddleware, cityAdminMiddleware],
      schema: updateCityUserSchema,
    },
    cityUserController.updateCityUser
  );

  // Delete a city user
  fastify.delete(
    '/:id',
    {
      preHandler: [authMiddleware, cityAdminMiddleware],
      schema: deleteCityUserSchema,
    },
    cityUserController.deleteCityUser
  );
}

export default routes;
