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
          // Get company ID from context if available
          const companyId = global.companyId;
          
          // If we have a company ID in context and the model has a company_id field
          if (companyId && prisma[model as keyof typeof prisma]) {
            // Set the PostgreSQL session variable for RLS
            await prisma.$executeRawUnsafe(`SELECT set_company_context(${companyId})`);
          }
          
          return query(args);
        },
      },
    },
  });
};

// Declare global augmentation for the companyId
declare global {
  var companyId: number | undefined;
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
 */
export const setCompanyContext = (companyId: number | undefined) => {
  global.companyId = companyId;
};

export default prisma;
