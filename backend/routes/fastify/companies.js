import companyController from '../../controllers/fastify/companies.js';
import { authMiddleware } from '../../middleware/fastify/auth.js';
import { adminMiddleware } from '../../middleware/fastify/admin.js';

// Company schema
const companySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    address: { type: 'string' },
    city: { type: ['string', 'null'] },
    state: { type: ['string', 'null'] },
    zip: { type: ['string', 'null'] },
    country: { type: ['string', 'null'] },
    contact_name: { type: ['string', 'null'] },
    contact_email: { type: ['string', 'null'] },
    contact_phone: { type: ['string', 'null'] },
    logo: { type: ['string', 'null'] },
    status: { type: 'string' },
    created_at: { type: ['string', 'null'], format: 'date-time' },
    updated_at: { type: ['string', 'null'], format: 'date-time' },
  },
};

// Get all companies schema
const getAllCompaniesSchema = {
  response: {
    200: {
      type: 'array',
      items: companySchema,
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

// Get company by ID schema
const getCompanyByIdSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', pattern: '^[0-9]+$' },
    },
  },
  response: {
    200: companySchema,
    403: {
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

// Create company schema
const createCompanySchema = {
  body: {
    type: 'object',
    required: ['name', 'address', 'contactEmail', 'contactPhone'],
    properties: {
      name: { type: 'string' },
      address: { type: 'string' },
      city: { type: 'string' },
      state: { type: 'string' },
      zip: { type: 'string' },
      country: { type: 'string' },
      contactName: { type: 'string' },
      contactEmail: { type: 'string', format: 'email' },
      contactPhone: { type: 'string' },
      logo: { type: 'string' },
      status: { type: 'string', default: 'active' },
    },
  },
  response: {
    201: companySchema,
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

// Update company schema
const updateCompanySchema = {
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
      address: { type: 'string' },
      city: { type: 'string' },
      state: { type: 'string' },
      zip: { type: 'string' },
      country: { type: 'string' },
      contactName: { type: 'string' },
      contactEmail: { type: 'string', format: 'email' },
      contactPhone: { type: 'string' },
      logo: { type: 'string' },
      status: { type: 'string' },
    },
  },
  response: {
    200: companySchema,
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

// Delete company schema
const deleteCompanySchema = {
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

// Company routes
async function routes(fastify /* options */) {
  // Get all companies (admin only)
  fastify.get(
    '/',
    {
      preHandler: [authMiddleware, adminMiddleware],
      schema: getAllCompaniesSchema,
    },
    companyController.getAllCompanies
  );

  // Get company by ID
  fastify.get(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: getCompanyByIdSchema,
    },
    companyController.getCompanyById
  );

  // Create a new company (admin only)
  fastify.post(
    '/',
    {
      preHandler: [authMiddleware, adminMiddleware],
      schema: createCompanySchema,
    },
    companyController.createCompany
  );

  // Update a company (admin only)
  fastify.put(
    '/:id',
    {
      preHandler: [authMiddleware, adminMiddleware],
      schema: updateCompanySchema,
    },
    companyController.updateCompany
  );

  // Delete a company (admin only)
  fastify.delete(
    '/:id',
    {
      preHandler: [authMiddleware, adminMiddleware],
      schema: deleteCompanySchema,
    },
    companyController.deleteCompany
  );
}

export default routes;
