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

import adminController from '../../controllers/fastify/admin.js';
import { authMiddleware } from '../../middleware/fastify/auth.js';
import { adminMiddleware } from '../../middleware/fastify/admin.js';

// User schema
const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    company_id: { type: 'integer' },
    is_admin: { type: 'boolean' },
    created_at: { type: ['string', 'null'], format: 'date-time' },
    updated_at: { type: ['string', 'null'], format: 'date-time' },
  },
};

// Dashboard data schema
const dashboardDataSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        counts: {
          type: 'object',
          properties: {
            users: { type: 'integer' },
            companies: { type: 'integer' },
            vehicles: { type: 'integer' },
            drivers: { type: 'integer' },
            weights: { type: 'integer' },
            loads: { type: 'integer' },
          },
        },
        recentUsers: {
          type: 'array',
          items: userSchema,
        },
        recentWeights: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              vehicle_id: { type: 'integer' },
              weight: { type: 'string' },
              date: { type: 'string' },
              status: { type: 'string' },
              company_id: { type: 'integer' },
              created_at: { type: 'string', format: 'date-time' },
            },
          },
        },
        compliance: {
          type: 'object',
          properties: {
            compliant: { type: 'integer' },
            warning: { type: 'integer' },
            nonCompliant: { type: 'integer' },
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

// Get all users schema
const getAllUsersSchema = {
  response: {
    200: {
      type: 'array',
      items: userSchema,
    },
    500: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

// Create user schema
const createUserSchema = {
  body: {
    type: 'object',
    required: ['name', 'email', 'password', 'companyId', 'isAdmin'],
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 },
      companyId: { type: 'integer' },
      isAdmin: { type: 'boolean' },
    },
  },
  response: {
    201: userSchema,
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

// Update user schema
const updateUserSchema = {
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
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 },
      companyId: { type: 'integer' },
      isAdmin: { type: 'boolean' },
    },
  },
  response: {
    200: userSchema,
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

// Delete user schema
const deleteUserSchema = {
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

// Admin routes
async function routes(fastify, _options) {
  // Get admin dashboard data
  fastify.get(
    '/dashboard',
    {
      preHandler: [authMiddleware, adminMiddleware],
      schema: dashboardDataSchema,
    },
    adminController.getDashboardData
  );

  // Get all users
  fastify.get(
    '/users',
    {
      preHandler: [authMiddleware, adminMiddleware],
      schema: getAllUsersSchema,
    },
    adminController.getAllUsers
  );

  // Create a new user
  fastify.post(
    '/users',
    {
      preHandler: [authMiddleware, adminMiddleware],
      schema: createUserSchema,
    },
    adminController.createUser
  );

  // Update a user
  fastify.put(
    '/users/:id',
    {
      preHandler: [authMiddleware, adminMiddleware],
      schema: updateUserSchema,
    },
    adminController.updateUser
  );

  // Delete a user
  fastify.delete(
    '/users/:id',
    {
      preHandler: [authMiddleware, adminMiddleware],
      schema: deleteUserSchema,
    },
    adminController.deleteUser
  );

  // Get weight reports
  fastify.get(
    '/reports/weights',
    {
      preHandler: [authMiddleware, adminMiddleware],
    },
    adminController.getWeightReports
  );

  // Get load reports
  fastify.get(
    '/reports/loads',
    {
      preHandler: [authMiddleware, adminMiddleware],
    },
    adminController.getLoadReports
  );

  // Get compliance reports
  fastify.get(
    '/reports/compliance',
    {
      preHandler: [authMiddleware, adminMiddleware],
    },
    adminController.getComplianceReports
  );

  // Export data
  fastify.get(
    '/export/:type',
    {
      preHandler: [authMiddleware, adminMiddleware],
    },
    adminController.exportData
  );
}

export default routes;
