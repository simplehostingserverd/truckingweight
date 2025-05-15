/**
 * LPR Cameras Routes
 * Handles CRUD operations for License Plate Recognition cameras
 */

import lprCameraController from '../../controllers/fastify/lprCameras.js';
import { authMiddleware, adminMiddleware } from '../../middleware/fastify/auth.js';

// LPR camera schema
const lprCameraSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    vendor: { type: 'string' },
    ip_address: { type: 'string' },
    port: { type: ['integer', 'null'] },
    username: { type: ['string', 'null'] },
    password: { type: ['string', 'null'] },
    api_key: { type: ['string', 'null'] },
    api_endpoint: { type: ['string', 'null'] },
    is_active: { type: 'boolean' },
    location: { type: ['string', 'null'] },
    notes: { type: ['string', 'null'] },
    city_id: { type: ['string', 'null'] },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

// Get all LPR cameras schema
const getAllLPRCamerasSchema = {
  tags: ['LPR Cameras'],
  summary: 'Get all LPR cameras',
  description: 'Returns a list of all LPR cameras',
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'integer', default: 50 },
      offset: { type: 'integer', default: 0 },
      vendor: { type: 'string' },
      is_active: { type: 'boolean' },
      city_id: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        cameras: {
          type: 'array',
          items: lprCameraSchema,
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
    500: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

// Get LPR camera by ID schema
const getLPRCameraByIdSchema = {
  tags: ['LPR Cameras'],
  summary: 'Get LPR camera by ID',
  description: 'Returns a single LPR camera by ID',
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
        camera: lprCameraSchema,
      },
    },
    401: {
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

// Create LPR camera schema
const createLPRCameraSchema = {
  tags: ['LPR Cameras'],
  summary: 'Create a new LPR camera',
  description: 'Creates a new LPR camera',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['name', 'vendor', 'ip_address'],
    properties: {
      name: { type: 'string', minLength: 1 },
      vendor: { type: 'string', enum: ['genetec', 'axis', 'hikvision', 'dahua', 'bosch', 'hanwha', 'custom'] },
      ip_address: { type: 'string', minLength: 1 },
      port: { type: ['integer', 'null'] },
      username: { type: ['string', 'null'] },
      password: { type: ['string', 'null'] },
      api_key: { type: ['string', 'null'] },
      api_endpoint: { type: ['string', 'null'] },
      is_active: { type: 'boolean', default: true },
      location: { type: ['string', 'null'] },
      notes: { type: ['string', 'null'] },
      city_id: { type: ['string', 'null'] },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        camera: lprCameraSchema,
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
    500: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

// Update LPR camera schema
const updateLPRCameraSchema = {
  tags: ['LPR Cameras'],
  summary: 'Update an LPR camera',
  description: 'Updates an existing LPR camera',
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
      name: { type: 'string', minLength: 1 },
      vendor: { type: 'string', enum: ['genetec', 'axis', 'hikvision', 'dahua', 'bosch', 'hanwha', 'custom'] },
      ip_address: { type: 'string', minLength: 1 },
      port: { type: ['integer', 'null'] },
      username: { type: ['string', 'null'] },
      password: { type: ['string', 'null'] },
      api_key: { type: ['string', 'null'] },
      api_endpoint: { type: ['string', 'null'] },
      is_active: { type: 'boolean' },
      location: { type: ['string', 'null'] },
      notes: { type: ['string', 'null'] },
      city_id: { type: ['string', 'null'] },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        camera: lprCameraSchema,
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

// Delete LPR camera schema
const deleteLPRCameraSchema = {
  tags: ['LPR Cameras'],
  summary: 'Delete an LPR camera',
  description: 'Deletes an LPR camera by ID',
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

// LPR cameras routes
async function routes(fastify /* options */) {
  // Get all LPR cameras
  fastify.get(
    '/',
    {
      preHandler: [authMiddleware],
      schema: getAllLPRCamerasSchema,
    },
    lprCameraController.getAllLPRCameras
  );

  // Get LPR camera by ID
  fastify.get(
    '/:id',
    {
      preHandler: [authMiddleware],
      schema: getLPRCameraByIdSchema,
    },
    lprCameraController.getLPRCameraById
  );

  // Create a new LPR camera
  fastify.post(
    '/',
    {
      preHandler: [authMiddleware, adminMiddleware],
      schema: createLPRCameraSchema,
    },
    lprCameraController.createLPRCamera
  );

  // Update an LPR camera
  fastify.put(
    '/:id',
    {
      preHandler: [authMiddleware, adminMiddleware],
      schema: updateLPRCameraSchema,
    },
    lprCameraController.updateLPRCamera
  );

  // Delete an LPR camera
  fastify.delete(
    '/:id',
    {
      preHandler: [authMiddleware, adminMiddleware],
      schema: deleteLPRCameraSchema,
    },
    lprCameraController.deleteLPRCamera
  );
}

export default routes;
