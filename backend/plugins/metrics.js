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

import fp from 'fastify-plugin';
import pkg from 'prom-client';
const { collectDefaultMetrics, Registry, Counter, Histogram, Gauge } = pkg;

// Create a Registry to register the metrics
const register = new Registry();

// Add default metrics
collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestDurationSeconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register],
});

// Metrics plugin
export default fp(
  async function (fastify, opts) {
    // Increment active connections on connection
    fastify.addHook('onRequest', async (request, reply) => {
      activeConnections.inc();
    });

    // Decrement active connections on response
    fastify.addHook('onResponse', async (request, reply) => {
      activeConnections.dec();

      // Record request metrics
      const { method, routerPath } = request;
      const { statusCode } = reply;

      httpRequestsTotal.inc({
        method,
        route: routerPath || request.url,
        status_code: statusCode,
      });

      // Calculate request duration
      const responseTime = reply.getResponseTime();
      httpRequestDurationSeconds.observe(
        {
          method,
          route: routerPath || request.url,
          status_code: statusCode,
        },
        responseTime / 1000
      );
    });

    // Expose metrics endpoint
    fastify.get('/metrics', async (request, reply) => {
      reply.header('Content-Type', register.contentType);
      return register.metrics();
    });
  },
  {
    name: 'metrics',
    dependencies: [],
  }
);
