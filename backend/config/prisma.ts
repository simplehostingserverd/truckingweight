/**
 * Prisma client singleton for database access
 * This module provides a singleton instance of the Prisma client
 * configured with the dedicated prisma_app role credentials
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define Prisma extensions for company context
const prismaWithExtensions = (prisma: PrismaClient) => {
  return prisma.$extends({
    name: 'company-context',
    query: {
      $allModels: {
        async $allOperations({ args, query, operation, model }) {
          // Get company ID and admin status from context
          const companyId = global.companyId;
          const isAdmin = global.isAdmin;

          // Check if the model has a company_id field
          // This is a simple check - in a real app, you might want to check the schema
          const modelHasCompanyId = ['companies', 'users', 'vehicles', 'drivers', 'loads', 'weights', 'weigh_tickets'].includes(model);

          // For admins, we don't need to filter by company_id
          if (isAdmin) {
            // Set admin context in PostgreSQL for RLS
            await prisma.$executeRawUnsafe(`SELECT set_admin_context(true)`);
            return query(args);
          }

          // For regular users with a company ID, filter by their company
          if (companyId && modelHasCompanyId) {
            // Set the PostgreSQL session variable for RLS
            await prisma.$executeRawUnsafe(`SELECT set_company_context(${companyId})`);

            // For operations that support filtering, we can also add a where clause
            // This provides an additional layer of security beyond RLS
            if (['findMany', 'count', 'findFirst', 'aggregate', 'groupBy'].includes(operation)) {
              args.where = {
                ...args.where,
                company_id: companyId
              };
            }
          }

          return query(args);
        },
      },
    },
  });
};

// Declare global augmentation for the companyId and isAdmin flag
declare global {
  var companyId: number | undefined;
  var isAdmin: boolean | undefined;
  var prisma: ReturnType<typeof prismaWithExtensions> | undefined;
}

// Create Prisma client with logging in development
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

  return prismaWithExtensions(client);
};

// Use existing Prisma instance if available to prevent multiple instances during hot reloading
const prisma = global.prisma || createPrismaClient();

// Set the Prisma instance on the global object in development
if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

/**
 * Set the current company context for row-level security
 * @param companyId - The company ID to set in the context
 * @param isAdmin - Whether the current user is an admin
 */
export const setCompanyContext = (companyId: number | undefined, isAdmin: boolean = false) => {
  global.companyId = companyId;
  global.isAdmin = isAdmin;

  // If it's an admin, we'll bypass RLS in the database queries
  // This is handled in the query middleware below
};

export default prisma;
