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


import webhookController from '../../controllers/fastify/webhooks.js';
import { authMiddleware } from '../../middleware/fastify/auth.js';

// Webhook schema
const webhookSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    url: { type: 'string', format: 'uri' },
    events: {
      type: 'array',
      items: { type: 'string' },
    },
    description: { type: ['string', 'null'] },
    headers: { type: 'object' },
    secret_token: { type: 'string' },
    status: { type: 'string' },
    company_id: { type: 'integer' },
    created_at: { type: ['string', 'null'], format: 'date-time' },
    updated_at: { type: ['string', 'null'], format: 'date-time' },
  },
};

// Get all webhooks schema
const getAllWebhooksSchema = {
  response: {
    200: {
      type: 'array',
      items: webhookSchema,
    },
    500: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

// Get webhook by ID schema
const getWebhookByIdSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', pattern: '^[0-9]+$' },
    },
  },
  response: {
    200: webhookSchema,
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

// Create webhook schema
const createWebhookSchema = {
  body: {
    type: 'object',
    required: ['name', 'url', 'events'],
    properties: {
      name: { type: 'string' },
      url: { type: 'string', format: 'uri' },
      events: {
        type: 'array',
        items: { type: 'string' },
      },
      description: { type: 'string' },
      headers: { type: 'object' },
    },
  },
  response: {
    201: webhookSchema,
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

// Update webhook schema
const updateWebhookSchema = {
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
      url: { type: 'string', format: 'uri' },
      events: {
        type: 'array',
        items: { type: 'string' },
      },
      description: { type: 'string' },
      headers: { type: 'object' },
      status: { type: 'string', enum: ['active', 'inactive'] },
    },
  },
  response: {
    200: webhookSchema,
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

// Delete webhook schema
const deleteWebhookSchema = {
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

// Webhook callback schema
const webhookCallbackSchema = {
  params: {
    type: 'object',
    required: ['token'],
    properties: {
      token: { type: 'string' },
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

// Test webhook schema
const testWebhookSchema = {
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
        webhook: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            url: { type: 'string' },
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

// Webhooks routes
async function routes(fastify /* options */) {
  // Get all webhooks
  fastify.get(
    '/',
    {
      preHandler: authMiddleware,
      schema: getAllWebhooksSchema,
    },
    webhookController.getAllWebhooks
  );

  // Get webhook by ID
  fastify.get(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: getWebhookByIdSchema,
    },
    webhookController.getWebhookById
  );

  // Create a new webhook
  fastify.post(
    '/',
    {
      preHandler: authMiddleware,
      schema: createWebhookSchema,
    },
    webhookController.createWebhook
  );

  // Update a webhook
  fastify.put(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: updateWebhookSchema,
    },
    webhookController.updateWebhook
  );

  // Delete a webhook
  fastify.delete(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: deleteWebhookSchema,
    },
    webhookController.deleteWebhook
  );

  // Webhook callback endpoint (public)
  fastify.post(
    '/callback/:token',
    {
      schema: webhookCallbackSchema,
    },
    webhookController.processWebhookCallback
  );

  // Test a webhook
  fastify.post(
    '/:id/test',
    {
      preHandler: authMiddleware,
      schema: testWebhookSchema,
    },
    webhookController.testWebhook
  );
}

export default routes;
