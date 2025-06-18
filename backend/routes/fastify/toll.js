/**
 * Fastify Toll Management Routes
 * REST API endpoints for toll provider integration and management
 */

import tollController from '../../controllers/fastify/toll.js';
import { authMiddleware } from '../../middleware/fastify/auth.js';

// Toll provider schema
const tollProviderSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    provider_type: { type: 'string' },
    api_endpoint: { type: ['string', 'null'] },
    api_version: { type: ['string', 'null'] },
    authentication_type: { type: ['string', 'null'] },
    is_active: { type: 'boolean' },
    supported_regions: { type: 'array', items: { type: 'string' } },
    features: { type: ['object', 'null'] },
    rate_limits: { type: ['object', 'null'] },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

// Company toll account schema
const companyTollAccountSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    company_id: { type: 'integer' },
    toll_provider_id: { type: 'integer' },
    account_number: { type: ['string', 'null'] },
    account_name: { type: ['string', 'null'] },
    credentials: { type: ['object', 'null'] },
    account_settings: { type: ['object', 'null'] },
    account_status: { type: 'string' },
    balance_amount: { type: ['number', 'null'] },
    balance_currency: { type: 'string' },
    last_sync_at: { type: ['string', 'null'], format: 'date-time' },
    sync_status: { type: 'string' },
    sync_error_message: { type: ['string', 'null'] },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

// Route calculation request schema
const routeCalculationSchema = {
  body: {
    type: 'object',
    required: ['origin', 'destination'],
    properties: {
      origin: {
        type: 'object',
        properties: {
          address: { type: 'string' },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
        },
      },
      destination: {
        type: 'object',
        properties: {
          address: { type: 'string' },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
        },
      },
      vehicleClass: { type: 'string' },
      vehicleType: { type: 'string' },
      avoidTolls: { type: 'boolean' },
      providerId: { type: 'integer' },
      routeOptions: {
        type: 'object',
        properties: {
          fastest: { type: 'boolean' },
          shortest: { type: 'boolean' },
          truckRoute: { type: 'boolean' },
        },
      },
    },
  },
};

// Create toll account schema
const createTollAccountSchema = {
  body: {
    type: 'object',
    required: ['toll_provider_id', 'account_number'],
    properties: {
      toll_provider_id: { type: 'integer' },
      account_number: { type: 'string' },
      account_name: { type: 'string' },
      credentials: { type: 'object' },
      account_settings: { type: 'object' },
    },
  },
};

/**
 * Toll management routes
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 * @param {Object} _options - Plugin options (unused)
 */
export default async function (fastify, _options) {
  // ===== TOLL PROVIDER ROUTES =====
  
  // Get all toll providers
  fastify.get('/providers', {
    preHandler: [authMiddleware],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            providers: {
              type: 'array',
              items: tollProviderSchema,
            },
          },
        },
      },
    },
  }, tollController.getTollProviders);

  // Get specific toll provider
  fastify.get('/providers/:providerId', {
    preHandler: [authMiddleware],
    schema: {
      params: {
        type: 'object',
        properties: {
          providerId: { type: 'string' },
        },
        required: ['providerId'],
      },
      response: {
        200: tollProviderSchema,
      },
    },
  }, tollController.getTollProvider);

  // Test provider connection
  fastify.post('/providers/:providerId/test', {
    preHandler: [authMiddleware],
    schema: {
      params: {
        type: 'object',
        properties: {
          providerId: { type: 'string' },
        },
        required: ['providerId'],
      },
      body: {
        type: 'object',
        properties: {
          credentials: { type: 'object' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, tollController.testProviderConnection);

  // ===== COMPANY TOLL ACCOUNT ROUTES =====
  
  // Get company toll accounts
  fastify.get('/accounts', {
    preHandler: [authMiddleware],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          provider_id: { type: 'string' },
          status: { type: 'string' },
          limit: { type: 'string' },
          offset: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            accounts: {
              type: 'array',
              items: companyTollAccountSchema,
            },
            total: { type: 'integer' },
          },
        },
      },
    },
  }, tollController.getCompanyTollAccounts);

  // Get specific toll account
  fastify.get('/accounts/:accountId', {
    preHandler: [authMiddleware],
    schema: {
      params: {
        type: 'object',
        properties: {
          accountId: { type: 'string' },
        },
        required: ['accountId'],
      },
      response: {
        200: companyTollAccountSchema,
      },
    },
  }, tollController.getCompanyTollAccount);

  // Create toll account
  fastify.post('/accounts', {
    preHandler: [authMiddleware],
    schema: createTollAccountSchema,
  }, tollController.createCompanyTollAccount);

  // Update toll account
  fastify.put('/accounts/:accountId', {
    preHandler: [authMiddleware],
    schema: {
      params: {
        type: 'object',
        properties: {
          accountId: { type: 'string' },
        },
        required: ['accountId'],
      },
      body: {
        type: 'object',
        properties: {
          account_name: { type: 'string' },
          credentials: { type: 'object' },
          account_settings: { type: 'object' },
          account_status: { type: 'string' },
        },
      },
    },
  }, tollController.updateCompanyTollAccount);

  // Delete toll account
  fastify.delete('/accounts/:accountId', {
    preHandler: [authMiddleware],
    schema: {
      params: {
        type: 'object',
        properties: {
          accountId: { type: 'string' },
        },
        required: ['accountId'],
      },
    },
  }, tollController.deleteCompanyTollAccount);

  // Sync toll account
  fastify.post('/accounts/:accountId/sync', {
    preHandler: [authMiddleware],
    schema: {
      params: {
        type: 'object',
        properties: {
          accountId: { type: 'string' },
        },
        required: ['accountId'],
      },
    },
  }, tollController.syncTollAccount);

  // ===== ROUTE CALCULATION ROUTES =====
  
  // Calculate route tolls
  fastify.post('/routes/calculate', {
    preHandler: [authMiddleware],
    schema: routeCalculationSchema,
  }, tollController.calculateRouteTolls);

  // Save route estimate
  fastify.post('/routes/estimates', {
    preHandler: [authMiddleware],
    schema: {
      body: {
        type: 'object',
        required: ['origin_address', 'destination_address'],
        properties: {
          route_name: { type: 'string' },
          origin_address: { type: 'string' },
          destination_address: { type: 'string' },
          estimated_toll_cost: { type: 'number' },
          estimated_distance_miles: { type: 'number' },
          estimated_duration_minutes: { type: 'integer' },
          vehicle_class: { type: 'string' },
          toll_breakdown: { type: 'object' },
          route_alternatives: { type: 'object' },
          toll_provider_id: { type: 'integer' },
          load_id: { type: 'integer' },
          vehicle_id: { type: 'integer' },
        },
      },
    },
  }, tollController.saveRouteEstimate);

  // Get route estimates
  fastify.get('/routes/estimates', {
    preHandler: [authMiddleware],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          load_id: { type: 'string' },
          vehicle_id: { type: 'string' },
          limit: { type: 'string' },
          offset: { type: 'string' },
        },
      },
    },
  }, tollController.getRouteEstimates);

  // ===== TRANSACTION ROUTES =====
  
  // Get toll transactions
  fastify.get('/transactions', {
    preHandler: [authMiddleware],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          account_id: { type: 'string' },
          vehicle_id: { type: 'string' },
          driver_id: { type: 'string' },
          start_date: { type: 'string', format: 'date' },
          end_date: { type: 'string', format: 'date' },
          limit: { type: 'string' },
          offset: { type: 'string' },
        },
      },
    },
  }, tollController.getTollTransactions);

  // Get specific transaction
  fastify.get('/transactions/:transactionId', {
    preHandler: [authMiddleware],
    schema: {
      params: {
        type: 'object',
        properties: {
          transactionId: { type: 'string' },
        },
        required: ['transactionId'],
      },
    },
  }, tollController.getTollTransaction);

  // Sync transactions
  fastify.post('/transactions/sync', {
    preHandler: [authMiddleware],
    schema: {
      body: {
        type: 'object',
        properties: {
          account_id: { type: 'integer' },
          start_date: { type: 'string', format: 'date' },
          end_date: { type: 'string', format: 'date' },
        },
      },
    },
  }, tollController.syncTransactions);

  // ===== REPORTING ROUTES =====
  
  // Get toll summary
  fastify.get('/summary', {
    preHandler: [authMiddleware],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          period: { type: 'string', enum: ['week', 'month', 'quarter', 'year'] },
          start_date: { type: 'string', format: 'date' },
          end_date: { type: 'string', format: 'date' },
        },
      },
    },
  }, tollController.getTollSummary);

  // Get toll reports
  fastify.get('/reports', {
    preHandler: [authMiddleware],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          report_type: { type: 'string', enum: ['monthly', 'vehicle', 'driver', 'route'] },
          format: { type: 'string', enum: ['json', 'csv', 'pdf'] },
          start_date: { type: 'string', format: 'date' },
          end_date: { type: 'string', format: 'date' },
        },
      },
    },
  }, tollController.getTollReports);
}
