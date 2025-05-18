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


import integrationController from '../../controllers/fastify/integrations.js';
import { authMiddleware } from '../../middleware/fastify/auth.js';
import { adminMiddleware } from '../../middleware/fastify/admin.js';

// Integration schema
const integrationSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    type: { type: 'string' },
    config: { type: 'object' },
    description: { type: ['string', 'null'] },
    secret_key: { type: ['string', 'null'] },
    status: { type: 'string' },
    company_id: { type: 'integer' },
    created_at: { type: ['string', 'null'], format: 'date-time' },
    updated_at: { type: ['string', 'null'], format: 'date-time' },
    last_sync_at: { type: ['string', 'null'], format: 'date-time' },
  },
};

// Get all integrations schema
const getAllIntegrationsSchema = {
  response: {
    200: {
      type: 'array',
      items: integrationSchema,
    },
    500: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

// Get integration by ID schema
const getIntegrationByIdSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', pattern: '^[0-9]+$' },
    },
  },
  response: {
    200: integrationSchema,
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

// Create integration schema
const createIntegrationSchema = {
  body: {
    type: 'object',
    required: ['name', 'type', 'config'],
    properties: {
      name: { type: 'string' },
      type: { type: 'string', enum: ['erp', 'telematics', 'accounting', 'crm', 'custom'] },
      config: { type: 'object' },
      description: { type: 'string' },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        type: { type: 'string' },
        config: { type: 'object' },
        description: { type: ['string', 'null'] },
        secret_key: { type: 'string' },
        status: { type: 'string' },
        company_id: { type: 'integer' },
        created_at: { type: ['string', 'null'], format: 'date-time' },
        note: { type: 'string' },
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

// Update integration schema
const updateIntegrationSchema = {
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
      config: { type: 'object' },
      description: { type: 'string' },
      status: { type: 'string', enum: ['active', 'inactive', 'error'] },
    },
  },
  response: {
    200: integrationSchema,
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

// Delete integration schema
const deleteIntegrationSchema = {
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

// Test integration schema
const testIntegrationSchema = {
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
        success: { type: 'boolean' },
        message: { type: 'string' },
        integration: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            type: { type: 'string' },
          },
        },
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

// Integrations routes
async function routes(fastify, _options) {
  // Get all integrations
  fastify.get(
    '/',
    {
      preHandler: authMiddleware,
      schema: getAllIntegrationsSchema,
    },
    integrationController.getAllIntegrations
  );

  // Get integration by ID
  fastify.get(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: getIntegrationByIdSchema,
    },
    integrationController.getIntegrationById
  );

  // Create a new integration
  fastify.post(
    '/',
    {
      preHandler: [authMiddleware, adminMiddleware],
      schema: createIntegrationSchema,
    },
    integrationController.createIntegration
  );

  // Update an integration
  fastify.put(
    '/:id',
    {
      preHandler: [authMiddleware, adminMiddleware],
      schema: updateIntegrationSchema,
    },
    integrationController.updateIntegration
  );

  // Delete an integration
  fastify.delete(
    '/:id',
    {
      preHandler: [authMiddleware, adminMiddleware],
      schema: deleteIntegrationSchema,
    },
    integrationController.deleteIntegration
  );

  // Test an integration
  fastify.post(
    '/:id/test',
    {
      preHandler: authMiddleware,
      schema: testIntegrationSchema,
    },
    integrationController.testIntegration
  );
}

export default routes;
