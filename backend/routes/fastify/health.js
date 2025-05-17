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


/**
 * Health Check Routes
 *
 * This module provides endpoints for checking the health of the application
 * and its dependencies like the database.
 */

import * as db from '../../config/database.js';
import cacheService from '../../services/cache/index.js';

/**
 * Register health check routes
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, _options) {
  // Basic health check
  fastify.get('/', async (_request, _reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Detailed health check
  fastify.get('/detailed', async (_request, _reply) => {
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

    // Check cache status
    const cacheStatus = {
      available: true,
      type: 'in-memory LRU',
    };

    // System info
    const systemInfo = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    };

    return {
      status: dbStatus.connected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      cache: cacheStatus,
      database: dbStatus,
      system: systemInfo,
    };
  });

  // Cache health check
  fastify.get('/cache', async (request, reply) => {
    try {
      // Test cache by setting and getting a value
      const testKey = 'health-check-test';
      const testValue = { timestamp: new Date().toISOString() };

      await cacheService.set(testKey, testValue);
      const retrieved = await cacheService.get(testKey);

      if (retrieved && retrieved.timestamp) {
        return {
          status: 'ok',
          message: 'Cache is working properly',
          type: 'in-memory LRU',
        };
      } else {
        reply.code(503);
        return { status: 'error', message: 'Cache retrieval failed' };
      }
    } catch (err) {
      reply.code(503);
      return { status: 'error', message: 'Cache operation failed', error: err.message };
    }
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

export default routes;
