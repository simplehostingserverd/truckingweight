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


import weightController from '../../controllers/fastify/weights.js';
import { authMiddleware } from '../../middleware/fastify/auth.js';

// Weight schemas
const weightSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    vehicle: { type: 'string' },
    weight: { type: 'string' },
    date: { type: 'string', format: 'date' },
    time: { type: 'string' },
    driver: { type: 'string' },
    status: { type: 'string' },
    company_id: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

const getAllWeightsSchema = {
  response: {
    200: {
      type: 'array',
      items: weightSchema,
    },
    500: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

const getWeightByIdSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', pattern: '^[0-9]+$' },
    },
  },
  response: {
    200: weightSchema,
    404: {
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

const createWeightSchema = {
  body: {
    type: 'object',
    required: ['vehicle', 'weight', 'date', 'driver'],
    properties: {
      vehicle: { type: 'string' },
      weight: { type: 'string' },
      date: { type: 'string', format: 'date' },
      time: { type: 'string' },
      driver: { type: 'string' },
    },
  },
  response: {
    200: weightSchema,
    400: {
      type: 'object',
      properties: {
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              msg: { type: 'string' },
              param: { type: 'string' },
              location: { type: 'string' },
            },
          },
        },
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

const updateWeightSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', pattern: '^[0-9]+$' },
    },
  },
  body: {
    type: 'object',
    properties: {
      vehicle: { type: 'string' },
      weight: { type: 'string' },
      date: { type: 'string', format: 'date' },
      time: { type: 'string' },
      driver: { type: 'string' },
    },
  },
  response: {
    200: weightSchema,
    404: {
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

const deleteWeightSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', pattern: '^[0-9]+$' },
    },
  },
  response: {
    200: {
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

// Weight routes
async function routes(fastify, _options) {
  // Get all weights
  fastify.get(
    '/',
    {
      preHandler: authMiddleware,
      schema: getAllWeightsSchema,
    },
    weightController.getAllWeights
  );

  // Get weight by ID
  fastify.get(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: getWeightByIdSchema,
    },
    weightController.getWeightById
  );

  // Create a new weight
  fastify.post(
    '/',
    {
      preHandler: authMiddleware,
      schema: createWeightSchema,
    },
    weightController.createWeight
  );

  // Update a weight
  fastify.put(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: updateWeightSchema,
    },
    weightController.updateWeight
  );

  // Delete a weight
  fastify.delete(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: deleteWeightSchema,
    },
    weightController.deleteWeight
  );
}

export default routes;
