import { NextResponse } from 'next/server';

/**
 * GET handler for metrics API
 * Returns system metrics in Prometheus format
 */
export async function GET() {
  try {
    // Fetch metrics from backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    const response = await fetch(`${backendUrl}/metrics`, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch metrics: ${response.status} ${response.statusText}`);
    }

    const metricsText = await response.text();

    // Return metrics in Prometheus format
    return new NextResponse(metricsText, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);

    // Return default metrics if backend is unavailable
    const defaultMetrics = `
# HELP api_requests_total Total number of API requests
# TYPE api_requests_total counter
api_requests_total{method="GET"} 0
api_requests_total{method="POST"} 0

# HELP api_request_duration_seconds API request duration in seconds
# TYPE api_request_duration_seconds histogram
api_request_duration_seconds_sum{path="/api/metrics"} 0
api_request_duration_seconds_count{path="/api/metrics"} 0

# HELP nodejs_heap_size_used_bytes Node.js heap size used in bytes
# TYPE nodejs_heap_size_used_bytes gauge
nodejs_heap_size_used_bytes 0
`;

    return new NextResponse(defaultMetrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
