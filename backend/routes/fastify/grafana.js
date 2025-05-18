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

import { createClient } from '@supabase/supabase-js';
import { logger } from '../../utils/logger.js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Grafana integration routes
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 * @param {Object} _options - Plugin options (unused)
 */
export default async function (fastify, _options) {
  // Get weight statistics for Grafana
  fastify.get('/weight-stats', async (request, reply) => {
    try {
      // Get query parameters
      const { timeRange = '7d', cityId } = request.query;

      // Calculate time range
      let timeFilter = '';
      switch (timeRange) {
        case '24h':
          timeFilter = "created_at > now() - interval '24 hours'";
          break;
        case '7d':
          timeFilter = "created_at > now() - interval '7 days'";
          break;
        case '30d':
          timeFilter = "created_at > now() - interval '30 days'";
          break;
        case '90d':
          timeFilter = "created_at > now() - interval '90 days'";
          break;
        case '1y':
          timeFilter = "created_at > now() - interval '1 year'";
          break;
        default:
          timeFilter = "created_at > now() - interval '7 days'";
      }

      // Build query
      let query = `
        SELECT
          date_trunc('day', created_at) as day,
          COUNT(*) as total_weighings,
          AVG(gross_weight) as avg_gross_weight,
          SUM(CASE WHEN is_overweight THEN 1 ELSE 0 END) as overweight_count
        FROM weights
        WHERE ${timeFilter}
      `;

      // Add city filter if provided
      if (cityId) {
        query += ` AND city_id = ${cityId}`;
      }

      // Group by day
      query += ` GROUP BY day ORDER BY day`;

      // Execute query
      const { data, error } = await supabase.rpc('run_sql', { query });

      if (error) {
        logger.error('Error getting weight statistics:', error);
        return reply.code(500).send({ error: 'Failed to get weight statistics' });
      }

      return reply.code(200).send(data);
    } catch (err) {
      logger.error('Error in weight statistics endpoint:', err);
      return reply.code(500).send({ error: 'Server error' });
    }
  });

  // Get vehicle statistics for Grafana
  fastify.get('/vehicle-stats', async (request, reply) => {
    try {
      // Get query parameters
      const { companyId } = request.query;

      // Build query
      let query = `
        SELECT
          v.make,
          v.model,
          COUNT(*) as vehicle_count,
          AVG(w.gross_weight) as avg_gross_weight,
          COUNT(DISTINCT w.id) as weighing_count
        FROM vehicles v
        LEFT JOIN weights w ON v.id = w.vehicle_id
      `;

      // Add company filter if provided
      if (companyId) {
        query += ` WHERE v.company_id = ${companyId}`;
      }

      // Group by make and model
      query += ` GROUP BY v.make, v.model ORDER BY vehicle_count DESC`;

      // Execute query
      const { data, error } = await supabase.rpc('run_sql', { query });

      if (error) {
        logger.error('Error getting vehicle statistics:', error);
        return reply.code(500).send({ error: 'Failed to get vehicle statistics' });
      }

      return reply.code(200).send(data);
    } catch (err) {
      logger.error('Error in vehicle statistics endpoint:', err);
      return reply.code(500).send({ error: 'Server error' });
    }
  });

  // Get city statistics for Grafana
  fastify.get('/city-stats', async (request, reply) => {
    try {
      // Build query
      const query = `
        SELECT
          c.name as city_name,
          c.state,
          COUNT(w.id) as weighing_count,
          SUM(CASE WHEN w.is_overweight THEN 1 ELSE 0 END) as overweight_count,
          SUM(w.fee_amount) as total_fees
        FROM cities c
        LEFT JOIN weights w ON c.id = w.city_id
        GROUP BY c.name, c.state
        ORDER BY weighing_count DESC
      `;

      // Execute query
      const { data, error } = await supabase.rpc('run_sql', { query });

      if (error) {
        logger.error('Error getting city statistics:', error);
        return reply.code(500).send({ error: 'Failed to get city statistics' });
      }

      return reply.code(200).send(data);
    } catch (err) {
      logger.error('Error in city statistics endpoint:', err);
      return reply.code(500).send({ error: 'Server error' });
    }
  });

  // Get company statistics for Grafana
  fastify.get('/company-stats', async (request, reply) => {
    try {
      // Build query
      const query = `
        SELECT
          tc.name as company_name,
          COUNT(DISTINCT v.id) as vehicle_count,
          COUNT(DISTINCT d.id) as driver_count,
          COUNT(w.id) as weighing_count,
          SUM(CASE WHEN w.is_overweight THEN 1 ELSE 0 END) as overweight_count,
          SUM(w.fee_amount) as total_fees
        FROM trucking_companies tc
        LEFT JOIN vehicles v ON tc.id = v.company_id
        LEFT JOIN drivers d ON tc.id = d.company_id
        LEFT JOIN weights w ON v.id = w.vehicle_id
        GROUP BY tc.name
        ORDER BY weighing_count DESC
      `;

      // Execute query
      const { data, error } = await supabase.rpc('run_sql', { query });

      if (error) {
        logger.error('Error getting company statistics:', error);
        return reply.code(500).send({ error: 'Failed to get company statistics' });
      }

      return reply.code(200).send(data);
    } catch (err) {
      logger.error('Error in company statistics endpoint:', err);
      return reply.code(500).send({ error: 'Server error' });
    }
  });
}
