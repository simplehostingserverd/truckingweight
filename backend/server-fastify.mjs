/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

import Fastify from 'fastify';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from '@fastify/cors';
import compress from '@fastify/compress';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in the backend directory (optional for production)
try {
  dotenv.config({ path: path.resolve(__dirname, '.env') });
} catch (error) {
  // In production, environment variables are provided by the deployment platform
  console.log('No .env file found, using environment variables from deployment platform');
}

// Import environment validator
import { validateAllConfig } from './utils/envValidator.js';

// Import toll configuration
import { initializeTollConfig } from './config/toll.js';

// Import database connection
import * as db from './config/database.js';

// Import high-performance LRU cache service
import cacheService from './services/cache/index.js';

// Import Swagger configuration
import { swaggerOptions, swaggerUiOptions } from './config/swagger.js';

// Import authentication middleware
import { bearerAuthMiddleware, apiKeyAuthMiddleware } from './middleware/fastify/bearerAuth.js';

// Import Paseto service for secure token handling
import * as pasetoService from './services/pasetoService.js';

// Create Fastify instance
const fastify = Fastify({
  logger: true,
  ajv: {
    customOptions: {
      removeAdditional: 'all',
      coerceTypes: true,
      useDefaults: true,
    },
  },
});

// Register plugins
async function registerPlugins() {
  // CORS
  await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'x-api-key'],
  });

  // Compression
  await fastify.register(compress, { global: true });

  // Helmet for security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for Swagger UI
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
  });

  // Register metrics plugin
  const metricsPlugin = await import('./plugins/metrics.js');
  await fastify.register(metricsPlugin.default);

  // Add authenticate decorator using Paseto
  fastify.decorate('authenticate', async (request, reply) => {
    try {
      // Get token from header
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No token provided');
      }

      const token = authHeader.split(' ')[1];

      // Verify token using Paseto
      const decoded = await pasetoService.decryptToken(token);
      if (!decoded) {
        throw new Error('Invalid token');
      }

      // Set user data in request
      request.user = decoded.user;
    } catch (err) {
      reply.code(401).send({ message: 'Unauthorized' });
    }
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Multipart for file uploads
  await fastify.register(multipart, {
    limits: {
      fieldNameSize: 100, // Max field name size in bytes
      fieldSize: 100, // Max field value size in bytes
      fields: 10, // Max number of non-file fields
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 5, // Max number of file fields
      headerPairs: 2000, // Max number of header key=>value pairs
    },
  });

  // Register Swagger
  await fastify.register(swagger, swaggerOptions);

  // Register Swagger UI
  await fastify.register(swaggerUi, swaggerUiOptions);

  // Add global hooks for authentication
  fastify.addHook('onRequest', async (request, reply) => {
    // Skip authentication for Swagger UI and documentation
    if (
      request.url.startsWith('/documentation') ||
      request.url === '/swagger.json' ||
      request.url === '/swagger.yaml'
    ) {
      return;
    }

    // Skip authentication for health routes
    if (request.url.startsWith('/health')) {
      return;
    }

    // Skip authentication for public routes
    if (request.routeOptions.config && request.routeOptions.config.public) {
      return;
    }

    // Check for API key authentication first
    if (request.headers['x-api-key']) {
      await apiKeyAuthMiddleware(request, reply);
      return;
    }

    // Fall back to bearer token authentication
    await bearerAuthMiddleware(request, reply);
  });
}

// Register routes
async function registerRoutes() {
  // Import route handlers
  const authRoutes = await import('./routes/fastify/auth.js');
  const weightRoutes = await import('./routes/fastify/weights.js');
  const loadRoutes = await import('./routes/fastify/loads.js');
  const companyRoutes = await import('./routes/fastify/companies.js');
  const vehicleRoutes = await import('./routes/fastify/vehicles.js');
  const driverRoutes = await import('./routes/fastify/drivers.js');
  const adminRoutes = await import('./routes/fastify/admin.js');
  const syncRoutes = await import('./routes/fastify/syncRoutes.js');
  const integrationRoutes = await import('./routes/fastify/integrations.js');
  const webhookRoutes = await import('./routes/fastify/webhooks.js');
  const apiKeyRoutes = await import('./routes/fastify/apiKeys.js');
  const healthRoutes = await import('./routes/fastify/health.js');

  // Import city route handlers
  const cityAuthRoutes = await import('./routes/fastify/cityAuth.js');
  const cityDashboardRoutes = await import('./routes/fastify/cityDashboard.js');
  const cityPermitsRoutes = await import('./routes/fastify/cityPermits.js');
  const cityUsersRoutes = await import('./routes/fastify/cityUsers.js');

  // Import trucking route handlers
  const truckingAuthRoutes = await import('./routes/fastify/truckingAuth.js');

  // Import LPR cameras routes
  const lprCamerasRoutes = await import('./routes/fastify/lprCameras.js');

  // Import toll management routes
  const tollRoutes = await import('./routes/fastify/toll.js');

  // Import Grafana integration routes
  const grafanaRoutes = await import('./routes/fastify/grafana.js');

  // Import AI routes
  const aiRoutes = await import('./routes/fastify/ai.js');

  // Import driver tracking routes
  const driverTrackingRoutes = await import('./routes/fastify/driver-tracking.js');

  // Register routes
  fastify.register(authRoutes.default, { prefix: '/api/auth' });
  fastify.register(weightRoutes.default, { prefix: '/api/weights' });
  fastify.register(loadRoutes.default, { prefix: '/api/loads' });
  fastify.register(companyRoutes.default, { prefix: '/api/companies' });
  fastify.register(vehicleRoutes.default, { prefix: '/api/vehicles' });
  fastify.register(driverRoutes.default, { prefix: '/api/drivers' });
  fastify.register(adminRoutes.default, { prefix: '/api/admin' });
  fastify.register(syncRoutes.default, { prefix: '/api/sync' });
  fastify.register(integrationRoutes.default, { prefix: '/api/integrations' });
  fastify.register(webhookRoutes.default, { prefix: '/api/webhooks' });
  fastify.register(apiKeyRoutes.default, { prefix: '/api/api-keys' });
  fastify.register(healthRoutes.default, { prefix: '/health' });

  // Register city routes
  fastify.register(cityAuthRoutes.default, { prefix: '/api/city-auth' });
  fastify.register(cityDashboardRoutes.default, { prefix: '/api/city-dashboard' });
  fastify.register(cityPermitsRoutes.default, { prefix: '/api/city-permits' });
  fastify.register(cityUsersRoutes.default, { prefix: '/api/city-users' });

  // Register trucking routes
  fastify.register(truckingAuthRoutes.default, { prefix: '/api/trucking-auth' });

  // Register LPR cameras routes
  fastify.register(lprCamerasRoutes.default, { prefix: '/api/lpr-cameras' });

  // Register toll management routes
  fastify.register(tollRoutes.default, { prefix: '/api/toll' });

  // Register Grafana integration routes
  fastify.register(grafanaRoutes.default, { prefix: '/api/grafana' });

  // Register AI routes
  fastify.register(aiRoutes.default, { prefix: '/api/ai' });

  // Register driver tracking routes
  fastify.register(driverTrackingRoutes.default, { prefix: '/api/driver-tracking' });

  // Root route
  fastify.get('/', async () => {
    return { message: 'Welcome to Cargo Scale Pro API' };
  });

  // Error handler
  fastify.setErrorHandler((error, _request, reply) => {
    fastify.log.error(error);
    reply.status(500).send({
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'production' ? {} : error,
    });
  });
}

// Start the server
async function start() {
  try {
    // Validate environment variables
    if (!validateAllConfig()) {
      fastify.log.error('Environment validation failed. Please check your .env file.');
      process.exit(1);
    }

    // Initialize toll configuration
    try {
      initializeTollConfig();
      fastify.log.info('Toll management configuration initialized successfully');
    } catch (error) {
      fastify.log.warn('Toll configuration initialization failed:', error.message);
      fastify.log.warn('Toll management features will be disabled');
    }

    await registerPlugins();
    await registerRoutes();

    const PORT = process.env.PORT || 5000;
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    fastify.log.info(`Server running on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  fastify.log.info('SIGTERM signal received: closing HTTP server');
  await fastify.close();
  fastify.log.info('HTTP server closed');

  // Close database connections
  await db.closeConnections();
  fastify.log.info('Database connections closed');

  // Clear cache
  await cacheService.clear();
  fastify.log.info('Cache cleared');

  process.exit(0);
});

process.on('SIGINT', async () => {
  fastify.log.info('SIGINT signal received: closing HTTP server');
  await fastify.close();
  fastify.log.info('HTTP server closed');

  // Close database connections
  await db.closeConnections();
  fastify.log.info('Database connections closed');

  // Clear cache
  await cacheService.clear();
  fastify.log.info('Cache cleared');

  process.exit(0);
});

// Start the server
start();

export default fastify;
