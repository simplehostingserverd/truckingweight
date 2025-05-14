/**
 * Health Check Routes
 *
 * This module provides endpoints for checking the health of the application
 * and its dependencies like the database.
 */

const db = require('../../config/database')
const cacheService = require('../../services/cache')

/**
 * Register health check routes
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, options) {
  // Basic health check
  fastify.get('/', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  // Detailed health check
  fastify.get('/detailed', async (request, reply) => {
    // Check database connection
    let dbStatus = { connected: false }
    try {
      const dbResult = await db.testConnection()
      dbStatus = {
        connected: true,
        version: dbResult?.version || 'unknown',
      }
    } catch (err) {
      dbStatus.error = err.message
    }

    // Check cache status
    const cacheStatus = {
      available: true,
      type: 'in-memory LRU',
    }

    // System info
    const systemInfo = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    }

    return {
      status: dbStatus.connected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      cache: cacheStatus,
      database: dbStatus,
      system: systemInfo,
    }
  })

  // Cache health check
  fastify.get('/cache', async (request, reply) => {
    try {
      // Test cache by setting and getting a value
      const testKey = 'health-check-test'
      const testValue = { timestamp: new Date().toISOString() }

      await cacheService.set(testKey, testValue)
      const retrieved = await cacheService.get(testKey)

      if (retrieved && retrieved.timestamp) {
        return {
          status: 'ok',
          message: 'Cache is working properly',
          type: 'in-memory LRU',
        }
      } else {
        reply.code(503)
        return { status: 'error', message: 'Cache retrieval failed' }
      }
    } catch (err) {
      reply.code(503)
      return { status: 'error', message: 'Cache operation failed', error: err.message }
    }
  })

  // Database health check
  fastify.get('/database', async (request, reply) => {
    try {
      const result = await db.testConnection()
      return {
        status: 'ok',
        message: 'Database connection successful',
        version: result?.version || 'unknown',
      }
    } catch (err) {
      reply.code(503)
      return {
        status: 'error',
        message: 'Database connection failed',
        error: err.message,
      }
    }
  })
}

module.exports = routes
