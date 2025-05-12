const fastify = require('fastify')({
  logger: true,
  ajv: {
    customOptions: {
      removeAdditional: 'all',
      coerceTypes: true,
      useDefaults: true,
    }
  }
});
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import database connection
const db = require('./config/database');

// Import Redis service
const { redisService } = require('./services/redis');

// Import Swagger configuration
const { swaggerOptions, swaggerUiOptions } = require('./config/swagger');

// Import authentication middleware
const { bearerAuthMiddleware, apiKeyAuthMiddleware } = require('./middleware/fastify/bearerAuth');

// Register plugins
async function registerPlugins() {
  // CORS
  await fastify.register(require('@fastify/cors'), {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'x-api-key'],
  });

  // Compression
  await fastify.register(require('@fastify/compress'), { global: true });

  // Helmet for security headers
  await fastify.register(require('@fastify/helmet'), {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for Swagger UI
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
  });

  // JWT Authentication
  fastify.register(require('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'supersecretkey',
    sign: {
      expiresIn: '24h',
    },
  });

  // Add authenticate decorator
  fastify.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ message: 'Unauthorized' });
    }
  });

  // Rate limiting
  await fastify.register(require('@fastify/rate-limit'), {
    max: 100,
    timeWindow: '1 minute',
  });

  // Multipart for file uploads
  await fastify.register(require('@fastify/multipart'), {
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
  await fastify.register(require('@fastify/swagger'), swaggerOptions);

  // Register Swagger UI
  await fastify.register(require('@fastify/swagger-ui'), swaggerUiOptions);

  // Add global hooks for authentication
  fastify.addHook('onRequest', async (request, reply) => {
    // Skip authentication for Swagger UI and documentation
    if (request.url.startsWith('/documentation') ||
        request.url === '/swagger.json' ||
        request.url === '/swagger.yaml') {
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
  const authRoutes = require('./routes/fastify/auth');
  const weightRoutes = require('./routes/fastify/weights');
  const loadRoutes = require('./routes/fastify/loads');
  const companyRoutes = require('./routes/fastify/companies');
  const vehicleRoutes = require('./routes/fastify/vehicles');
  const driverRoutes = require('./routes/fastify/drivers');
  const adminRoutes = require('./routes/fastify/admin');
  const syncRoutes = require('./routes/fastify/syncRoutes');
  const integrationRoutes = require('./routes/fastify/integrations');
  const webhookRoutes = require('./routes/fastify/webhooks');
  const apiKeyRoutes = require('./routes/fastify/apiKeys');
  const healthRoutes = require('./routes/fastify/health');

  // Import city route handlers
  const cityAuthRoutes = require('./routes/fastify/cityAuth');
  const cityDashboardRoutes = require('./routes/fastify/cityDashboard');
  const cityPermitsRoutes = require('./routes/fastify/cityPermits');

  // Register routes
  fastify.register(authRoutes, { prefix: '/api/auth' });
  fastify.register(weightRoutes, { prefix: '/api/weights' });
  fastify.register(loadRoutes, { prefix: '/api/loads' });
  fastify.register(companyRoutes, { prefix: '/api/companies' });
  fastify.register(vehicleRoutes, { prefix: '/api/vehicles' });
  fastify.register(driverRoutes, { prefix: '/api/drivers' });
  fastify.register(adminRoutes, { prefix: '/api/admin' });
  fastify.register(syncRoutes, { prefix: '/api/sync' });
  fastify.register(integrationRoutes, { prefix: '/api/integrations' });
  fastify.register(webhookRoutes, { prefix: '/api/webhooks' });
  fastify.register(apiKeyRoutes, { prefix: '/api/api-keys' });
  fastify.register(healthRoutes, { prefix: '/health' });

  // Register city routes
  fastify.register(cityAuthRoutes, { prefix: '/api/city-auth' });
  fastify.register(cityDashboardRoutes, { prefix: '/api/city-dashboard' });
  fastify.register(cityPermitsRoutes, { prefix: '/api/city-permits' });

  // Root route
  fastify.get('/', async (request, reply) => {
    return { message: 'Welcome to TruckingSemis API' };
  });

  // Error handler
  fastify.setErrorHandler((error, request, reply) => {
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

  // Close Redis connection
  await redisService.close();
  fastify.log.info('Redis connection closed');

  process.exit(0);
});

process.on('SIGINT', async () => {
  fastify.log.info('SIGINT signal received: closing HTTP server');
  await fastify.close();
  fastify.log.info('HTTP server closed');

  // Close database connections
  await db.closeConnections();
  fastify.log.info('Database connections closed');

  // Close Redis connection
  await redisService.close();
  fastify.log.info('Redis connection closed');

  process.exit(0);
});

// Start the server
start();

module.exports = fastify;
