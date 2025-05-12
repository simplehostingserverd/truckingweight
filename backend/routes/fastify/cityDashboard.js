/**
 * City Dashboard Routes
 * Provides data for the city weighing dashboard
 */

const { createClient } = require('@supabase/supabase-js');
const { cityAuthMiddleware } = require('../../middleware/fastify/cityAuth');
const { logger } = require('../../utils/logger');
const { bearerAuthMiddleware } = require('../../middleware/fastify/bearerAuth');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// City dashboard route schemas
const dashboardStatsSchema = {
  tags: ['City Dashboard'],
  summary: 'Get city dashboard statistics',
  description: 'Returns key metrics for the city dashboard including scales, weighings, revenue, and permits',
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      description: 'Successful response with dashboard statistics',
      type: 'object',
      properties: {
        totalScales: { type: 'number', description: 'Total number of scales registered to the city' },
        activeScales: { type: 'number', description: 'Number of scales currently active' },
        totalWeighings: { type: 'number', description: 'Total number of weighings recorded' },
        revenueCollected: { type: 'number', description: 'Total revenue collected from permits and fines' },
        complianceRate: { type: 'number', description: 'Percentage of compliant weighings' },
        pendingPermits: { type: 'number', description: 'Number of permits pending approval or payment' },
        activePermits: { type: 'number', description: 'Number of currently active permits' },
        recentViolations: { type: 'number', description: 'Number of violations in the last 30 days' },
      },
    },
    401: {
      description: 'Unauthorized - Invalid or missing authentication token',
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
    },
    500: {
      description: 'Server error',
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

const recentWeighingsSchema = {
  tags: ['City Dashboard'],
  summary: 'Get recent weighings for city',
  description: 'Returns a list of recent weighing tickets for the city',
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        description: 'Number of records to return',
        default: 10
      }
    }
  },
  response: {
    200: {
      description: 'Successful response with recent weighings',
      type: 'object',
      properties: {
        weighings: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'Weighing ticket ID' },
              ticketNumber: { type: 'string', description: 'Unique ticket number' },
              vehicleInfo: { type: 'string', description: 'Vehicle information (license plate, VIN)' },
              companyName: { type: 'string', description: 'Company name' },
              grossWeight: { type: 'number', description: 'Gross weight of the vehicle' },
              netWeight: { type: 'number', description: 'Net weight (gross - tare)' },
              weighDate: { type: 'string', format: 'date-time', description: 'Date and time of weighing' },
              status: { type: 'string', description: 'Status of the weighing (Compliant, Non-Compliant, Warning)' },
              scaleName: { type: 'string', description: 'Name of the scale used' },
            },
          },
        },
      },
    },
    401: {
      description: 'Unauthorized - Invalid or missing authentication token',
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
    },
    500: {
      description: 'Server error',
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

const complianceDataSchema = {
  tags: ['City Dashboard'],
  summary: 'Get compliance data for charts',
  description: 'Returns compliance data for the specified time period for visualization',
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      days: {
        type: 'integer',
        description: 'Number of days to include in the data',
        default: 30
      }
    }
  },
  response: {
    200: {
      description: 'Successful response with compliance data',
      type: 'object',
      properties: {
        labels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Date labels for the data points'
        },
        compliant: {
          type: 'array',
          items: { type: 'number' },
          description: 'Number of compliant weighings for each date'
        },
        nonCompliant: {
          type: 'array',
          items: { type: 'number' },
          description: 'Number of non-compliant weighings for each date'
        },
        warning: {
          type: 'array',
          items: { type: 'number' },
          description: 'Number of warning weighings for each date'
        },
      },
    },
    401: {
      description: 'Unauthorized - Invalid or missing authentication token',
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
    },
    500: {
      description: 'Server error',
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

const revenueDataSchema = {
  tags: ['City Dashboard'],
  summary: 'Get revenue data for charts',
  description: 'Returns revenue data for the specified time period for visualization',
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      months: {
        type: 'integer',
        description: 'Number of months to include in the data',
        default: 6
      }
    }
  },
  response: {
    200: {
      description: 'Successful response with revenue data',
      type: 'object',
      properties: {
        labels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Month labels for the data points'
        },
        permitRevenue: {
          type: 'array',
          items: { type: 'number' },
          description: 'Revenue from permits for each month'
        },
        fineRevenue: {
          type: 'array',
          items: { type: 'number' },
          description: 'Revenue from fines for each month'
        },
      },
    },
    401: {
      description: 'Unauthorized - Invalid or missing authentication token',
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
    },
    500: {
      description: 'Server error',
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

/**
 * City Dashboard Routes
 */
async function routes(fastify, options) {
  // We're using the global bearer auth middleware now
  // This will validate the token and set the user in the request

  /**
   * @route   GET /api/city-dashboard/stats
   * @desc    Get city dashboard stats
   * @access  Private (City Users)
   */
  fastify.get('/stats', { schema: dashboardStatsSchema }, async (request, reply) => {
    try {
      const cityId = request.user.cityId;

      // Get total scales count
      const { count: totalScales, error: scalesError } = await supabase
        .from('city_scales')
        .select('*', { count: 'exact', head: true })
        .eq('city_id', cityId);

      if (scalesError) {
        request.log.error('Error fetching scales count:', scalesError);
        return reply.code(500).send({ msg: 'Error fetching dashboard data' });
      }

      // Get active scales count
      const { count: activeScales, error: activeScalesError } = await supabase
        .from('city_scales')
        .select('*', { count: 'exact', head: true })
        .eq('city_id', cityId)
        .eq('status', 'Active');

      // Get total weighings count
      const { count: totalWeighings, error: weighingsError } = await supabase
        .from('city_weigh_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('city_id', cityId);

      // Get revenue collected (sum of permit fees and violation fines)
      const { data: permitRevenue, error: permitRevenueError } = await supabase
        .from('city_permits')
        .select('fee_amount')
        .eq('city_id', cityId)
        .eq('payment_status', 'Paid');

      const { data: fineRevenue, error: fineRevenueError } = await supabase
        .from('city_violations')
        .select('fine_amount')
        .eq('city_id', cityId)
        .eq('payment_status', 'Paid');

      // Calculate total revenue
      const totalPermitRevenue = permitRevenue
        ? permitRevenue.reduce((sum, item) => sum + parseFloat(item.fee_amount), 0)
        : 0;

      const totalFineRevenue = fineRevenue
        ? fineRevenue.reduce((sum, item) => sum + parseFloat(item.fine_amount), 0)
        : 0;

      const revenueCollected = totalPermitRevenue + totalFineRevenue;

      // Get compliance rate
      const { data: complianceData, error: complianceError } = await supabase
        .from('city_weigh_tickets')
        .select('status')
        .eq('city_id', cityId);

      let complianceRate = 0;
      if (complianceData && complianceData.length > 0) {
        const compliantCount = complianceData.filter(ticket => ticket.status === 'Compliant').length;
        complianceRate = Math.round((compliantCount / complianceData.length) * 100);
      }

      // Get pending permits count
      const { count: pendingPermits, error: pendingPermitsError } = await supabase
        .from('city_permits')
        .select('*', { count: 'exact', head: true })
        .eq('city_id', cityId)
        .eq('payment_status', 'Pending');

      // Get active permits count
      const { count: activePermits, error: activePermitsError } = await supabase
        .from('city_permits')
        .select('*', { count: 'exact', head: true })
        .eq('city_id', cityId)
        .eq('status', 'Active');

      // Get recent violations count (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: recentViolations, error: recentViolationsError } = await supabase
        .from('city_violations')
        .select('*', { count: 'exact', head: true })
        .eq('city_id', cityId)
        .gte('violation_date', thirtyDaysAgo.toISOString());

      return reply.code(200).send({
        totalScales: totalScales || 0,
        activeScales: activeScales || 0,
        totalWeighings: totalWeighings || 0,
        revenueCollected: revenueCollected || 0,
        complianceRate: complianceRate || 0,
        pendingPermits: pendingPermits || 0,
        activePermits: activePermits || 0,
        recentViolations: recentViolations || 0,
      });
    } catch (err) {
      request.log.error('Server error in city dashboard stats:', err);
      return reply.code(500).send({ msg: 'Server error' });
    }
  });

  /**
   * @route   GET /api/city-dashboard/recent-weighings
   * @desc    Get recent weighings for city
   * @access  Private (City Users)
   */
  fastify.get('/recent-weighings', { schema: recentWeighingsSchema }, async (request, reply) => {
    try {
      const cityId = request.user.cityId;
      const limit = request.query.limit || 10;

      const { data: weighings, error } = await supabase
        .from('city_weigh_tickets')
        .select(`
          id,
          ticket_number,
          vehicle_info,
          company_name,
          gross_weight,
          net_weight,
          weigh_date,
          status,
          city_scales (
            name
          )
        `)
        .eq('city_id', cityId)
        .order('weigh_date', { ascending: false })
        .limit(limit);

      if (error) {
        request.log.error('Error fetching recent weighings:', error);
        return reply.code(500).send({ msg: 'Error fetching weighings data' });
      }

      // Format the data
      const formattedWeighings = weighings.map(weighing => ({
        id: weighing.id,
        ticketNumber: weighing.ticket_number,
        vehicleInfo: weighing.vehicle_info,
        companyName: weighing.company_name || 'Unknown',
        grossWeight: parseFloat(weighing.gross_weight),
        netWeight: weighing.net_weight ? parseFloat(weighing.net_weight) : null,
        weighDate: weighing.weigh_date,
        status: weighing.status,
        scaleName: weighing.city_scales ? weighing.city_scales.name : 'Unknown',
      }));

      return reply.code(200).send({ weighings: formattedWeighings });
    } catch (err) {
      request.log.error('Server error in recent weighings:', err);
      return reply.code(500).send({ msg: 'Server error' });
    }
  });

  /**
   * @route   GET /api/city-dashboard/compliance-data
   * @desc    Get compliance data for charts
   * @access  Private (City Users)
   */
  fastify.get('/compliance-data', { schema: complianceDataSchema }, async (request, reply) => {
    try {
      const cityId = request.user.cityId;
      const days = request.query.days || 30;

      // Generate date labels for the past N days
      const labels = [];
      const compliant = Array(days).fill(0);
      const nonCompliant = Array(days).fill(0);
      const warning = Array(days).fill(0);

      const today = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toISOString().split('T')[0]);
      }

      // Get compliance data for the past N days
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - days);

      const { data: complianceData, error } = await supabase
        .from('city_weigh_tickets')
        .select('status, weigh_date')
        .eq('city_id', cityId)
        .gte('weigh_date', startDate.toISOString());

      if (error) {
        request.log.error('Error fetching compliance data:', error);
        return reply.code(500).send({ msg: 'Error fetching compliance data' });
      }

      // Process the data
      complianceData.forEach(ticket => {
        const dateStr = new Date(ticket.weigh_date).toISOString().split('T')[0];
        const index = labels.indexOf(dateStr);

        if (index !== -1) {
          if (ticket.status === 'Compliant') {
            compliant[index]++;
          } else if (ticket.status === 'Non-Compliant') {
            nonCompliant[index]++;
          } else if (ticket.status === 'Warning') {
            warning[index]++;
          }
        }
      });

      return reply.code(200).send({
        labels,
        compliant,
        nonCompliant,
        warning,
      });
    } catch (err) {
      request.log.error('Server error in compliance data:', err);
      return reply.code(500).send({ msg: 'Server error' });
    }
  });

  /**
   * @route   GET /api/city-dashboard/revenue-data
   * @desc    Get revenue data for charts
   * @access  Private (City Users)
   */
  fastify.get('/revenue-data', { schema: revenueDataSchema }, async (request, reply) => {
    try {
      const cityId = request.user.cityId;
      const months = request.query.months || 6;

      // Generate month labels
      const labels = [];
      const permitRevenue = Array(months).fill(0);
      const fineRevenue = Array(months).fill(0);

      const today = new Date();
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        labels.push(date.toLocaleString('default', { month: 'short', year: 'numeric' }));
      }

      // Get permit revenue data
      const startDate = new Date(today.getFullYear(), today.getMonth() - (months - 1), 1);

      const { data: permitData, error: permitError } = await supabase
        .from('city_permits')
        .select('fee_amount, created_at')
        .eq('city_id', cityId)
        .eq('payment_status', 'Paid')
        .gte('created_at', startDate.toISOString());

      if (permitError) {
        request.log.error('Error fetching permit revenue data:', permitError);
        return reply.code(500).send({ msg: 'Error fetching revenue data' });
      }

      // Get fine revenue data
      const { data: fineData, error: fineError } = await supabase
        .from('city_violations')
        .select('fine_amount, created_at')
        .eq('city_id', cityId)
        .eq('payment_status', 'Paid')
        .gte('created_at', startDate.toISOString());

      if (fineError) {
        request.log.error('Error fetching fine revenue data:', fineError);
        return reply.code(500).send({ msg: 'Error fetching revenue data' });
      }

      // Process permit data
      permitData.forEach(permit => {
        const date = new Date(permit.created_at);
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        const index = labels.indexOf(monthYear);

        if (index !== -1) {
          permitRevenue[index] += parseFloat(permit.fee_amount);
        }
      });

      // Process fine data
      fineData.forEach(fine => {
        const date = new Date(fine.created_at);
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        const index = labels.indexOf(monthYear);

        if (index !== -1) {
          fineRevenue[index] += parseFloat(fine.fine_amount);
        }
      });

      return reply.code(200).send({
        labels,
        permitRevenue,
        fineRevenue,
      });
    } catch (err) {
      request.log.error('Server error in revenue data:', err);
      return reply.code(500).send({ msg: 'Server error' });
    }
  });
}

module.exports = routes;
