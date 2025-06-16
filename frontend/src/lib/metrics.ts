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

// This file contains server-side only code for metrics
// It should never be imported on the client side

// Define types for metrics to help with TypeScript
export type MetricsRegistry = any;
export type MetricsCounter = any;
export type MetricsHistogram = any;

// Variables to hold metrics objects
let register: MetricsRegistry | null = null;
let pageViewsCounter: MetricsCounter | null = null;
let apiRequestsCounter: MetricsCounter | null = null;
let apiRequestDuration: MetricsHistogram | null = null;
let isInitialized = false;

// Initialize metrics - only call this on the server
export function initializeMetrics() {
  // Only initialize once and only on the server
  if (isInitialized || typeof window !== 'undefined') {
    return;
  }

  try {
    // Dynamically import prom-client
    const promClient = require('prom-client');
    const { collectDefaultMetrics, Registry, Counter, Histogram } = promClient;

    // Create a registry
    register = new Registry();

    // Add default metrics
    collectDefaultMetrics({ register });

    // Create custom metrics
    pageViewsCounter = new Counter({
      name: 'page_views_total',
      help: 'Total number of page views',
      labelNames: ['page'],
      registers: [register],
    });

    apiRequestsCounter = new Counter({
      name: 'api_requests_total',
      help: 'Total number of API requests',
      labelNames: ['method', 'endpoint', 'status'],
      registers: [register],
    });

    apiRequestDuration = new Histogram({
      name: 'api_request_duration_seconds',
      help: 'Duration of API requests in seconds',
      labelNames: ['method', 'endpoint'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [register],
    });

    // Add some sample data
    pageViewsCounter.inc({ page: '/dashboard' }, 10);
    pageViewsCounter.inc({ page: '/city/dashboard' }, 5);
    apiRequestsCounter.inc({ method: 'GET', endpoint: '/api/weights', status: '200' }, 15);
    apiRequestsCounter.inc({ method: 'POST', endpoint: '/api/weights', status: '201' }, 5);
    apiRequestDuration.observe({ method: 'GET', endpoint: '/api/weights' }, 0.3);

    isInitialized = true;
  } catch (error) {
    console.error('Error initializing metrics:', error);
  }
}

// Get metrics registry
export function getMetricsRegistry() {
  return register;
}

// Record page view
export function recordPageView(page: string) {
  if (pageViewsCounter) {
    pageViewsCounter.inc({ page });
  }
}

// Record API request
export function recordApiRequest(method: string, endpoint: string, status: string) {
  if (apiRequestsCounter) {
    apiRequestsCounter.inc({ method, endpoint, status });
  }
}

// Record API request duration
export function recordApiRequestDuration(method: string, endpoint: string, duration: number) {
  if (apiRequestDuration) {
    apiRequestDuration.observe({ method, endpoint }, duration);
  }
}

// Get metrics as string
export async function getMetrics() {
  if (!register) {
    return null;
  }

  try {
    return await register.metrics();
  } catch (error) {
    console.error('Error getting metrics:', error);
    return null;
  }
}

// Get content type
export function getMetricsContentType() {
  return register ? register.contentType : 'text/plain';
}
