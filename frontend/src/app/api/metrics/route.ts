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
import { collectDefaultMetrics, Registry, Counter, Histogram } from 'prom-client';

// Create a registry to register the metrics
const register = new Registry();

// Add default metrics
collectDefaultMetrics({ register });

// Create custom metrics
const pageViewsCounter = new Counter({
  name: 'page_views_total',
  help: 'Total number of page views',
  labelNames: ['page'],
  registers: [register],
});

const apiRequestsCounter = new Counter({
  name: 'api_requests_total',
  help: 'Total number of API requests',
  labelNames: ['method', 'endpoint', 'status'],
  registers: [register],
});

const apiRequestDuration = new Histogram({
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

// Metrics endpoint
export async function GET(request: NextRequest) {
  try {
    // Record this metrics request
    apiRequestsCounter.inc({ method: 'GET', endpoint: '/api/metrics', status: '200' });
    
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
  pageViewsCounter.inc({ page });
}

// Function to record API request
export function recordApiRequest(method: string, endpoint: string, status: string) {
  apiRequestsCounter.inc({ method, endpoint, status });
}

// Function to record API request duration
export function recordApiRequestDuration(method: string, endpoint: string, duration: number) {
  apiRequestDuration.observe({ method, endpoint }, duration);
}
