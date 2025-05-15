import driverController from '../../controllers/fastify/drivers.js';
import { authMiddleware } from '../../middleware/fastify/auth.js';

// Driver schema
const driverSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    license_number: { type: 'string' },
    license_expiry: { type: ['string', 'null'], format: 'date-time' },
    phone: { type: ['string', 'null'] },
    email: { type: ['string', 'null'] },
    status: { type: 'string' },
    company_id: { type: 'integer' },
    created_at: { type: ['string', 'null'], format: 'date-time' },
    updated_at: { type: ['string', 'null'], format: 'date-time' },
  },
};

// Get all drivers schema
const getAllDriversSchema = {
  response: {
    200: {
      type: 'array',
      items: driverSchema,
    },
    500: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

// Get driver by ID schema
const getDriverByIdSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', pattern: '^[0-9]+$' },
    },
  },
  response: {
    200: driverSchema,
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

// Create driver schema
const createDriverSchema = {
  body: {
    type: 'object',
    required: ['name', 'license_number', 'license_expiry'],
    properties: {
      name: { type: 'string' },
      license_number: { type: 'string' },
      license_expiry: { type: 'string', format: 'date-time' },
      phone: { type: 'string' },
      email: { type: 'string', format: 'email' },
      status: { type: 'string', default: 'Active' },
    },
  },
  response: {
    201: driverSchema,
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

// Update driver schema
const updateDriverSchema = {
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
      license_number: { type: 'string' },
      license_expiry: { type: 'string', format: 'date-time' },
      phone: { type: 'string' },
      email: { type: 'string', format: 'email' },
      status: { type: 'string' },
    },
  },
  response: {
    200: driverSchema,
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

// Delete driver schema
const deleteDriverSchema = {
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

// Driver routes
async function routes(fastify /* options */) {
  // Get all drivers
  fastify.get(
    '/',
    {
      preHandler: authMiddleware,
      schema: getAllDriversSchema,
    },
    driverController.getAllDrivers
  );

  // Get driver by ID
  fastify.get(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: getDriverByIdSchema,
    },
    driverController.getDriverById
  );

  // Create a new driver
  fastify.post(
    '/',
    {
      preHandler: authMiddleware,
      schema: createDriverSchema,
    },
    driverController.createDriver
  );

  // Update a driver
  fastify.put(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: updateDriverSchema,
    },
    driverController.updateDriver
  );

  // Delete a driver
  fastify.delete(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: deleteDriverSchema,
    },
    driverController.deleteDriver
  );
}

export default routes;
