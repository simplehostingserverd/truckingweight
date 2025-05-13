/**
 * Health Check Routes
 *
 * This module provides endpoints for checking the health of the application
 * and its dependencies like the database.
 */

const db = require('../../config/database');
const cacheService = require('../../services/cache');

/**
 * Register health check routes
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, options) {
  // Basic health check
  fastify.get('/', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Detailed health check
  fastify.get('/detailed', async (request, reply) => {
    // Check Redis connection
    const redisStatus = {
      connected: redisService.isReady(),
    };

    // Check database connection
    let dbStatus = { connected: false };
    try {
      const dbResult = await db.testConnection();
      dbStatus = {
        connected: true,
        version: dbResult?.version || 'unknown',
      };
    } catch (err) {
      dbStatus.error = err.message;
    }

    // System info
    const systemInfo = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    };

    return {
      status: redisStatus.connected && dbStatus.connected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      redis: redisStatus,
      database: dbStatus,
      system: systemInfo,
    };
  });

  // Redis health check
  fastify.get('/redis', async (request, reply) => {
    const isConnected = redisService.isReady();

    if (!isConnected) {
      reply.code(503);
      return { status: 'error', message: 'Redis connection failed' };
    }

    return { status: 'ok', message: 'Redis connection successful' };
  });

  // Database health check
  fastify.get('/database', async (request, reply) => {
    try {
      const result = await db.testConnection();
      return {
        status: 'ok',
        message: 'Database connection successful',
        version: result?.version || 'unknown',
      };
    } catch (err) {
      reply.code(503);
      return {
        status: 'error',
        message: 'Database connection failed',
        error: err.message,
      };
    }
  });
}

module.exports = routes;
