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


import vehicleController from '../../controllers/fastify/vehicles.js';
import { authMiddleware } from '../../middleware/fastify/auth.js';

// Vehicle schema
const vehicleSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    type: { type: 'string' },
    license_plate: { type: 'string' },
    vin: { type: ['string', 'null'] },
    make: { type: ['string', 'null'] },
    model: { type: ['string', 'null'] },
    year: { type: ['integer', 'null'] },
    status: { type: 'string' },
    max_weight: { type: ['number', 'null'] },
    company_id: { type: 'integer' },
    created_at: { type: ['string', 'null'], format: 'date-time' },
    updated_at: { type: ['string', 'null'], format: 'date-time' },
  },
};

// Get all vehicles schema
const getAllVehiclesSchema = {
  response: {
    200: {
      type: 'array',
      items: vehicleSchema,
    },
    500: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

// Get vehicle by ID schema
const getVehicleByIdSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', pattern: '^[0-9]+$' },
    },
  },
  response: {
    200: vehicleSchema,
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

// Create vehicle schema
const createVehicleSchema = {
  body: {
    type: 'object',
    required: ['name', 'type', 'license_plate'],
    properties: {
      name: { type: 'string' },
      type: { type: 'string' },
      license_plate: { type: 'string' },
      vin: { type: 'string' },
      make: { type: 'string' },
      model: { type: 'string' },
      year: { type: 'integer' },
      status: { type: 'string', default: 'Active' },
      max_weight: { type: 'number' },
    },
  },
  response: {
    201: vehicleSchema,
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

// Update vehicle schema
const updateVehicleSchema = {
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
      name: { type: 'string' },
      type: { type: 'string' },
      license_plate: { type: 'string' },
      vin: { type: 'string' },
      make: { type: 'string' },
      model: { type: 'string' },
      year: { type: 'integer' },
      status: { type: 'string' },
      max_weight: { type: 'number' },
    },
  },
  response: {
    200: vehicleSchema,
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

// Delete vehicle schema
const deleteVehicleSchema = {
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
    500: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

// Vehicle routes
async function routes(fastify /* options */) {
  // Get all vehicles
  fastify.get(
    '/',
    {
      preHandler: authMiddleware,
      schema: getAllVehiclesSchema,
    },
    vehicleController.getAllVehicles
  );

  // Get vehicle by ID
  fastify.get(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: getVehicleByIdSchema,
    },
    vehicleController.getVehicleById
  );

  // Create a new vehicle
  fastify.post(
    '/',
    {
      preHandler: authMiddleware,
      schema: createVehicleSchema,
    },
    vehicleController.createVehicle
  );

  // Update a vehicle
  fastify.put(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: updateVehicleSchema,
    },
    vehicleController.updateVehicle
  );

  // Delete a vehicle
  fastify.delete(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: deleteVehicleSchema,
    },
    vehicleController.deleteVehicle
  );
}

export default routes;
