import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cacheService from '../../../services/cache';

interface SampleData {
  id: number;
  name: string;
  description: string;
  items: Array<{
    id: number;
    value: string;
  }>;
  generatedAt: string;
}

interface CachedResponse {
  data: SampleData;
  source: 'cache' | 'database';
  timestamp: string;
}

interface ClearCacheResponse {
  success: boolean;
  message: string;
}

/**
 * Example route handler demonstrating the use of the hybrid cache service
 * This shows how to use the ultra-fast LRU cache with Redis fallback
 */
export default async function routes(fastify: FastifyInstance): Promise<void> {
  // Example route with caching
  fastify.get<{
    Reply: CachedResponse;
  }>('/cached-data', {
    schema: {
      description: 'Get cached data example',
      tags: ['examples'],
      summary: 'Retrieve data with caching',
      response: {
        200: {
          type: 'object',
          properties: {
            data: { type: 'object' },
            source: { type: 'string' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    config: {
      public: true, // No authentication required
    },
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<CachedResponse> => {
    const cacheKey = 'example-data';
    
    // Try to get data from cache first (ultra-fast)
    const cachedData = await cacheService.get<SampleData>(cacheKey);
    
    if (cachedData) {
      return {
        data: cachedData,
        source: 'cache',
        timestamp: new Date().toISOString(),
      };
    }
    
    // If not in cache, simulate fetching from database or external API
    const data = await simulateExpensiveOperation();
    
    // Store in cache for future requests (both LRU and Redis)
    await cacheService.set(cacheKey, data, 60); // Cache for 60 seconds
    
    return {
      data,
      source: 'database',
      timestamp: new Date().toISOString(),
    };
  });
  
  // Route to clear cache
  fastify.delete<{
    Reply: ClearCacheResponse;
  }>('/clear-cache', {
    schema: {
      description: 'Clear cache example',
      tags: ['examples'],
      summary: 'Clear the cache',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
    config: {
      public: true, // No authentication required
    },
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<ClearCacheResponse> => {
    await cacheService.clear();
    
    return {
      success: true,
      message: 'Cache cleared successfully',
    };
  });
}

// Simulate an expensive operation (e.g., database query, API call)
async function simulateExpensiveOperation(): Promise<SampleData> {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return some sample data
  return {
    id: Math.floor(Math.random() * 1000),
    name: 'Sample Data',
    description: 'This data was expensive to generate',
    items: Array.from({ length: 5 }, (_, i) => ({
      id: i,
      value: Math.random().toString(36).substring(2, 15),
    })),
    generatedAt: new Date().toISOString(),
  };
}
