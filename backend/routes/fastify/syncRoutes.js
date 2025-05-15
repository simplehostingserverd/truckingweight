import syncController from '../../controllers/fastify/syncRoutes.js';
import { authMiddleware } from '../../middleware/fastify/auth.js';

// Sync status schema
const syncStatusSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        message: { type: 'string' },
        pendingItems: { type: 'integer' },
        lastSuccessfulSync: { type: ['string', 'null'], format: 'date-time' },
        cacheStatus: { type: 'string' },
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

// Sync data schema
const syncDataSchema = {
  body: {
    type: 'object',
    required: ['table', 'action', 'data', 'companyId'],
    properties: {
      table: { type: 'string' },
      action: { type: 'string', enum: ['create', 'update', 'delete'] },
      data: { type: 'object' },
      companyId: { type: 'integer' },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
        syncId: { type: 'string' },
        status: { type: 'string' },
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

// Sync history schema
const syncHistorySchema = {
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'integer', default: 50 },
      offset: { type: 'integer', default: 0 },
      status: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              company_id: { type: 'integer' },
              table_name: { type: 'string' },
              action: { type: 'string' },
              data: { type: 'object' },
              status: { type: 'string' },
              created_at: { type: ['string', 'null'], format: 'date-time' },
              updated_at: { type: ['string', 'null'], format: 'date-time' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            limit: { type: 'integer' },
            offset: { type: 'integer' },
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

// Sync routes
async function routes(fastify /* options */) {
  // Get sync status
  fastify.get(
    '/status',
    {
      preHandler: authMiddleware,
      schema: syncStatusSchema,
    },
    syncController.getSyncStatus
  );

  // Sync data
  fastify.post(
    '/data',
    {
      preHandler: authMiddleware,
      schema: syncDataSchema,
    },
    syncController.syncData
  );

  // Get sync history
  fastify.get(
    '/history',
    {
      preHandler: authMiddleware,
      schema: syncHistorySchema,
    },
    syncController.getSyncHistory
  );
}

export default routes;
