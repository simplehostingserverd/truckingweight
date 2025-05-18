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

import { NextRequest, NextResponse } from 'next/server';

// Import prom-client dynamically to avoid issues with Next.js bundling
// This ensures the module is only loaded on the server side
// Define types for Prometheus client
type PrometheusRegistry = {
  metrics: () => Promise<string>;
  contentType: string;
};

type PrometheusCounter = {
  inc: (labels?: Record<string, string>, value?: number) => void;
};

type PrometheusHistogram = {
  observe: (labels: Record<string, string>, value: number) => void;
};

// Use dynamic imports for server-side only code
let collectDefaultMetrics: ((options: { register: PrometheusRegistry }) => void) | null = null;
let Registry: any = null;
let Counter: any = null;
let Histogram: any = null;

// Only import and initialize in a server context
if (typeof window === 'undefined') {
  try {
    const pkg = require('prom-client');
    collectDefaultMetrics = pkg.collectDefaultMetrics;
    Registry = pkg.Registry;
    Counter = pkg.Counter;
    Histogram = pkg.Histogram;
  } catch (error) {
    console.error('Error importing prom-client:', error);
  }
}

// Initialize metrics only if we're on the server
let register: PrometheusRegistry | null = null;
let pageViewsCounter: PrometheusCounter | null = null;
let apiRequestsCounter: PrometheusCounter | null = null;
let apiRequestDuration: PrometheusHistogram | null = null;

// Only initialize metrics on the server
if (typeof window === 'undefined' && Registry && Counter && Histogram) {
  try {
    // Create a registry to register the metrics
    register = new Registry();

    // Add default metrics
    if (collectDefaultMetrics) {
      collectDefaultMetrics({ register });
    }

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

    // Initialize metrics with some sample data
    pageViewsCounter.inc({ page: '/dashboard' }, 10);
    pageViewsCounter.inc({ page: '/city/dashboard' }, 5);
    apiRequestsCounter.inc({ method: 'GET', endpoint: '/api/weights', status: '200' }, 15);
    apiRequestsCounter.inc({ method: 'POST', endpoint: '/api/weights', status: '201' }, 5);
    apiRequestDuration.observe({ method: 'GET', endpoint: '/api/weights' }, 0.3);
  } catch (error) {
    console.error('Error initializing metrics:', error);
  }
}

// Metrics endpoint
export async function GET(_: NextRequest) {
  try {
    // Check if metrics are initialized
    if (!register) {
      return NextResponse.json({ error: 'Metrics not initialized' }, { status: 503 });
    }

    // Record this metrics request
    if (apiRequestsCounter) {
      apiRequestsCounter.inc({ method: 'GET', endpoint: '/api/metrics', status: '200' });
    }

    // Get metrics
    const metrics = await register.metrics();

    // Return metrics
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': register.contentType,
      },
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return NextResponse.json({ error: 'Failed to generate metrics' }, { status: 500 });
  }
}

// Function to record page view
export function recordPageView(page: string) {
  if (pageViewsCounter) {
    pageViewsCounter.inc({ page });
  }
}

// Function to record API request
export function recordApiRequest(method: string, endpoint: string, status: string) {
  if (apiRequestsCounter) {
    apiRequestsCounter.inc({ method, endpoint, status });
  }
}

// Function to record API request duration
export function recordApiRequestDuration(method: string, endpoint: string, duration: number) {
  if (apiRequestDuration) {
    apiRequestDuration.observe({ method, endpoint }, duration);
  }
}
