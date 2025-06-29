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

import loadController from '../../controllers/fastify/loads.js';
import { authMiddleware } from '../../middleware/fastify/auth.js';

// Load schemas
const vehicleSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    license_plate: { type: 'string' },
  },
};

const driverSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    license_number: { type: 'string' },
  },
};

const loadSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    description: { type: 'string' },
    origin: { type: 'string' },
    destination: { type: 'string' },
    weight: { type: 'string' },
    status: { type: 'string' },
    pickup_date: { type: ['string', 'null'], format: 'date-time' },
    delivery_date: { type: ['string', 'null'], format: 'date-time' },
    created_at: { type: ['string', 'null'], format: 'date-time' },
    updated_at: { type: ['string', 'null'], format: 'date-time' },
    vehicles: vehicleSchema,
    drivers: driverSchema,
    vehicle_id: { type: ['integer', 'null'] },
    driver_id: { type: ['integer', 'null'] },
    company_id: { type: 'integer' },
  },
};

const getAllLoadsSchema = {
  response: {
    200: {
      type: 'array',
      items: loadSchema,
    },
    500: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        error: { type: 'string' },
      },
    },
  },
};

const getLoadByIdSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', pattern: '^[0-9]+$' },
    },
  },
  response: {
    200: loadSchema,
    404: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        error: { type: 'string' },
      },
    },
  },
};

const createLoadSchema = {
  body: {
    type: 'object',
    required: ['description', 'origin', 'destination', 'weight'],
    properties: {
      description: { type: 'string' },
      origin: { type: 'string' },
      destination: { type: 'string' },
      weight: { type: 'string' },
      vehicle_id: { type: 'integer' },
      driver_id: { type: 'integer' },
      pickup_date: { type: ['string', 'null'], format: 'date-time' },
      delivery_date: { type: ['string', 'null'], format: 'date-time' },
      status: { type: 'string', default: 'pending' },
    },
  },
  response: {
    201: loadSchema,
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
        message: { type: 'string' },
        error: { type: 'string' },
      },
    },
  },
};

const updateLoadSchema = {
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
      description: { type: 'string' },
      origin: { type: 'string' },
      destination: { type: 'string' },
      weight: { type: 'string' },
      vehicle_id: { type: 'integer' },
      driver_id: { type: 'integer' },
      pickup_date: { type: ['string', 'null'], format: 'date-time' },
      delivery_date: { type: ['string', 'null'], format: 'date-time' },
      status: { type: 'string' },
    },
  },
  response: {
    200: loadSchema,
    404: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        error: { type: 'string' },
      },
    },
  },
};

const deleteLoadSchema = {
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
        message: { type: 'string' },
      },
    },
    404: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        error: { type: 'string' },
      },
    },
  },
};

// Load routes
async function routes(fastify, _options) {
  // Get all loads
  fastify.get(
    '/',
    {
      preHandler: authMiddleware,
      schema: getAllLoadsSchema,
    },
    loadController.getAllLoads
  );

  // Get load by ID
  fastify.get(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: getLoadByIdSchema,
    },
    loadController.getLoadById
  );

  // Create a new load
  fastify.post(
    '/',
    {
      preHandler: authMiddleware,
      schema: createLoadSchema,
    },
    loadController.createLoad
  );

  // Update a load
  fastify.put(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: updateLoadSchema,
    },
    loadController.updateLoad
  );

  // Delete a load
  fastify.delete(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: deleteLoadSchema,
    },
    loadController.deleteLoad
  );
}

export default routes;
