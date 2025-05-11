const apiKeyController = require('../../controllers/fastify/apiKeys');
const { authMiddleware } = require('../../middleware/fastify/auth');
const { adminMiddleware } = require('../../middleware/fastify/admin');

// API Key schema
const apiKeySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    prefix: { type: 'string' },
    scopes: {
      type: 'array',
      items: { type: 'string' }
    },
    expires_at: { type: ['string', 'null'], format: 'date-time' },
    created_at: { type: ['string', 'null'], format: 'date-time' },
    updated_at: { type: ['string', 'null'], format: 'date-time' },
    created_by: { type: ['string', 'null'] },
    last_used_at: { type: ['string', 'null'], format: 'date-time' },
    status: { type: 'string' },
  },
};

// Get all API keys schema
const getAllApiKeysSchema = {
  response: {
    200: {
      type: 'array',
      items: apiKeySchema,
    },
    500: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

// Get API key by ID schema
const getApiKeyByIdSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', pattern: '^[0-9]+$' },
    },
  },
  response: {
    200: apiKeySchema,
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

// Create API key schema
const createApiKeySchema = {
  body: {
    type: 'object',
    required: ['name', 'scopes'],
    properties: {
      name: { type: 'string' },
      scopes: {
        type: 'array',
        items: { type: 'string' }
      },
      expiresAt: { type: 'string', format: 'date-time' },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        prefix: { type: 'string' },
        key: { type: 'string' },
        scopes: {
          type: 'array',
          items: { type: 'string' }
        },
        expires_at: { type: ['string', 'null'], format: 'date-time' },
        created_at: { type: ['string', 'null'], format: 'date-time' },
        status: { type: 'string' },
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

// Update API key schema
const updateApiKeySchema = {
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
      scopes: {
        type: 'array',
        items: { type: 'string' }
      },
      status: { type: 'string', enum: ['active', 'inactive', 'revoked'] },
    },
  },
  response: {
    200: apiKeySchema,
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

// Delete API key schema
const deleteApiKeySchema = {
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

// Verify API key schema
const verifyApiKeySchema = {
  body: {
    type: 'object',
    required: ['apiKey'],
    properties: {
      apiKey: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        scopes: {
          type: 'array',
          items: { type: 'string' }
        },
        companyId: { type: 'integer' },
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

// API Keys routes
async function routes(fastify, options) {
  // Get all API keys
  fastify.get('/', {
    preHandler: authMiddleware,
    schema: getAllApiKeysSchema,
  }, apiKeyController.getAllApiKeys);

  // Get API key by ID
  fastify.get('/:id', {
    preHandler: authMiddleware,
    schema: getApiKeyByIdSchema,
  }, apiKeyController.getApiKeyById);

  // Create a new API key
  fastify.post('/', {
    preHandler: [authMiddleware, adminMiddleware],
    schema: createApiKeySchema,
  }, apiKeyController.createApiKey);

  // Update an API key
  fastify.put('/:id', {
    preHandler: [authMiddleware, adminMiddleware],
    schema: updateApiKeySchema,
  }, apiKeyController.updateApiKey);

  // Delete an API key
  fastify.delete('/:id', {
    preHandler: [authMiddleware, adminMiddleware],
    schema: deleteApiKeySchema,
  }, apiKeyController.deleteApiKey);

  // Verify an API key
  fastify.post('/verify', {
    schema: verifyApiKeySchema,
  }, apiKeyController.verifyApiKey);
}

module.exports = routes;
