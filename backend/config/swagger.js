/**
 * Swagger configuration for Fastify
 * This file configures Swagger documentation for the API
 */

const swaggerOptions = {
  swagger: {
    info: {
      title: 'TruckingSemis API',
      description: 'API documentation for TruckingSemis weight management system',
      version: '1.0.0',
      contact: {
        name: 'API Support',
        email: 'support@truckingsemis.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    externalDocs: {
      url: 'https://truckingsemis.com/docs',
      description: 'Find more info here',
    },
    host: process.env.API_HOST || 'localhost:5000',
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Weights', description: 'Weight management endpoints' },
      { name: 'Loads', description: 'Load management endpoints' },
      { name: 'Companies', description: 'Company management endpoints' },
      { name: 'Vehicles', description: 'Vehicle management endpoints' },
      { name: 'Drivers', description: 'Driver management endpoints' },
      { name: 'Admin', description: 'Admin endpoints' },
      { name: 'Sync', description: 'Data synchronization endpoints' },
      { name: 'Integrations', description: 'Third-party integration endpoints' },
      { name: 'Webhooks', description: 'Webhook endpoints' },
      { name: 'API Keys', description: 'API key management endpoints' },
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'City Auth', description: 'City authentication endpoints' },
      { name: 'City Dashboard', description: 'City dashboard endpoints' },
      { name: 'City Permits', description: 'City permit management endpoints' },
    ],
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'Enter your bearer token in the format "Bearer {token}"',
      },
      apiKeyAuth: {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'Enter your API key',
      },
    },
    security: [
      { bearerAuth: [] },
    ],
  },
};

const swaggerUiOptions = {
  routePrefix: '/documentation',
  exposeRoute: true,
  staticCSP: true,
  transformStaticCSP: (header) => header,
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
    persistAuthorization: true,
  },
  uiHooks: {
    onRequest: function (request, reply, next) { next(); },
    preHandler: function (request, reply, next) { next(); },
  },
};

module.exports = {
  swaggerOptions,
  swaggerUiOptions,
};
