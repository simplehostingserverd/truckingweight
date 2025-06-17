/**
 * Analytics API Routes
 * KPI metrics, performance benchmarks, and advanced analytics
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { setCompanyContextMiddleware } from '../middleware/companyContext';
import { AnalyticsService } from '../services/analytics/AnalyticsService';
import { KPIService } from '../services/analytics/KPIService';
import prisma from '../config/prisma';
import { logger } from '../utils/logger';

const router = express.Router();
const analyticsService = new AnalyticsService();
const kpiService = new KPIService();

// Apply middleware to all routes
router.use(protect);
router.use(setCompanyContextMiddleware);

/**
 * GET /api/analytics/kpi
 * Get Key Performance Indicators
 */
router.get('/kpi', async (req, res) => {
  try {
    const { period = '30', comparison = false } = req.query;
    const daysBack = parseInt(period as string);
    const companyId = req.user.companyId;

    const kpiData = await kpiService.calculateKPIs({
      companyId,
      daysBack,
      includeComparison: comparison === 'true'
    });

    res.json(kpiData);

  } catch (error) {
    logger.error('Error fetching KPI data:', error);
    res.status(500).json({ message: 'Error fetching KPI data' });
  }
});

/**
 * GET /api/analytics/fleet-performance
 * Get fleet performance metrics
 */
router.get('/fleet-performance', async (req, res) => {
  try {
    const { period = '30', vehicleId } = req.query;
    const daysBack = parseInt(period as string);
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const companyId = req.user.companyId;

    const whereClause: any = {
      company_id: companyId,
      created_at: { gte: startDate }
    };

    if (vehicleId) {
      whereClause.vehicle_id = parseInt(vehicleId as string);
    }

    // Vehicle utilization
    const vehicleUtilization = await prisma.loads.groupBy({
      by: ['vehicle_id'],
      where: {
        ...whereClause,
        status: 'delivered'
      },
      _count: { id: true },
      _sum: { 
        total_miles: true,
        revenue: true
      }
    });

    // Fuel efficiency
    const fuelData = await prisma.fuel_transactions.groupBy({
      by: ['vehicle_id'],
      where: {
        company_id: companyId,
        transaction_date: { gte: startDate }
      },
      _sum: {
        gallons: true,
        total_amount: true
      }
    });

    // Maintenance costs
    const maintenanceCosts = await prisma.maintenance_work_orders.groupBy({
      by: ['vehicle_id'],
      where: {
        company_id: companyId,
        completed_at: { gte: startDate },
        status: 'completed'
      },
      _sum: { actual_cost: true },
      _count: { id: true }
    });

    // Combine data
    const fleetPerformance = await analyticsService.combineFleetMetrics({
      vehicleUtilization,
      fuelData,
      maintenanceCosts,
      companyId
    });

    res.json({
      fleetPerformance,
      period: `${daysBack} days`
    });

  } catch (error) {
    logger.error('Error fetching fleet performance:', error);
    res.status(500).json({ message: 'Error fetching fleet performance' });
  }
});

/**
 * GET /api/analytics/driver-performance
 * Get driver performance metrics
 */
router.get('/driver-performance', async (req, res) => {
  try {
    const { period = '30', driverId } = req.query;
    const daysBack = parseInt(period as string);
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const companyId = req.user.companyId;

    const whereClause: any = {
      company_id: companyId,
      created_at: { gte: startDate }
    };

    if (driverId) {
      whereClause.driver_id = parseInt(driverId as string);
    }

    // Load performance
    const loadPerformance = await prisma.loads.groupBy({
      by: ['driver_id'],
      where: {
        ...whereClause,
        status: 'delivered'
      },
      _count: { id: true },
      _sum: { 
        total_miles: true,
        revenue: true
      },
      _avg: {
        delivery_time_hours: true
      }
    });

    // Safety metrics
    const safetyMetrics = await prisma.safety_incidents.groupBy({
      by: ['driver_id'],
      where: {
        company_id: companyId,
        incident_date: { gte: startDate }
      },
      _count: { id: true }
    });

    // HOS compliance
    const hosCompliance = await prisma.hos_logs.groupBy({
      by: ['driver_id'],
      where: {
        drivers: { company_id: companyId },
        log_date: { gte: startDate }
      },
      _count: { id: true }
    });

    // Combine driver metrics
    const driverPerformance = await analyticsService.combineDriverMetrics({
      loadPerformance,
      safetyMetrics,
      hosCompliance,
      companyId
    });

    res.json({
      driverPerformance,
      period: `${daysBack} days`
    });

  } catch (error) {
    logger.error('Error fetching driver performance:', error);
    res.status(500).json({ message: 'Error fetching driver performance' });
  }
});

/**
 * GET /api/analytics/financial-trends
 * Get financial trend analysis
 */
router.get('/financial-trends', async (req, res) => {
  try {
    const { period = '90', granularity = 'weekly' } = req.query;
    const daysBack = parseInt(period as string);
    const companyId = req.user.companyId;

    const financialTrends = await analyticsService.getFinancialTrends({
      companyId,
      daysBack,
      granularity: granularity as 'daily' | 'weekly' | 'monthly'
    });

    res.json(financialTrends);

  } catch (error) {
    logger.error('Error fetching financial trends:', error);
    res.status(500).json({ message: 'Error fetching financial trends' });
  }
});

/**
 * GET /api/analytics/route-analysis
 * Get route performance analysis
 */
router.get('/route-analysis', async (req, res) => {
  try {
    const { period = '30', origin, destination } = req.query;
    const daysBack = parseInt(period as string);
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const companyId = req.user.companyId;

    const whereClause: any = {
      company_id: companyId,
      created_at: { gte: startDate },
      status: 'delivered'
    };

    if (origin) {
      whereClause.pickup_city = { contains: origin as string, mode: 'insensitive' };
    }

    if (destination) {
      whereClause.delivery_city = { contains: destination as string, mode: 'insensitive' };
    }

    // Route performance metrics
    const routeMetrics = await prisma.loads.findMany({
      where: whereClause,
      select: {
        pickup_city: true,
        pickup_state: true,
        delivery_city: true,
        delivery_state: true,
        total_miles: true,
        revenue: true,
        delivery_time_hours: true,
        fuel_cost: true
      }
    });

    // Analyze route performance
    const routeAnalysis = await analyticsService.analyzeRoutes(routeMetrics);

    res.json({
      routeAnalysis,
      period: `${daysBack} days`
    });

  } catch (error) {
    logger.error('Error fetching route analysis:', error);
    res.status(500).json({ message: 'Error fetching route analysis' });
  }
});

/**
 * GET /api/analytics/benchmarks
 * Get industry benchmarks and comparisons
 */
router.get('/benchmarks', async (req, res) => {
  try {
    const { category = 'all' } = req.query;
    const companyId = req.user.companyId;

    const benchmarks = await analyticsService.getIndustryBenchmarks({
      companyId,
      category: category as string
    });

    res.json(benchmarks);

  } catch (error) {
    logger.error('Error fetching benchmarks:', error);
    res.status(500).json({ message: 'Error fetching benchmarks' });
  }
});

/**
 * GET /api/analytics/predictive
 * Get predictive analytics and forecasts
 */
router.get('/predictive', async (req, res) => {
  try {
    const { type = 'demand', horizon = '30' } = req.query;
    const forecastDays = parseInt(horizon as string);
    const companyId = req.user.companyId;

    const predictions = await analyticsService.generatePredictions({
      companyId,
      type: type as 'demand' | 'revenue' | 'costs' | 'maintenance',
      forecastDays
    });

    res.json(predictions);

  } catch (error) {
    logger.error('Error generating predictions:', error);
    res.status(500).json({ message: 'Error generating predictions' });
  }
});

/**
 * POST /api/analytics/custom-report
 * Generate a custom analytics report
 */
router.post('/custom-report', async (req, res) => {
  try {
    const {
      reportName,
      metrics,
      filters,
      dateRange,
      groupBy,
      chartType
    } = req.body;

    const customReport = await analyticsService.generateCustomReport({
      companyId: req.user.companyId,
      reportName,
      metrics,
      filters,
      dateRange,
      groupBy,
      chartType,
      createdBy: req.user.id
    });

    res.json({
      success: true,
      report: customReport
    });

  } catch (error) {
    logger.error('Error generating custom report:', error);
    res.status(500).json({ message: 'Error generating custom report' });
  }
});

/**
 * GET /api/analytics/reports
 * Get saved analytics reports
 */
router.get('/reports', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const companyId = req.user.companyId;

    const reports = await prisma.analytics_reports.findMany({
      where: { company_id: companyId },
      orderBy: { created_at: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    const totalCount = await prisma.analytics_reports.count({
      where: { company_id: companyId }
    });

    res.json({
      reports,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit as string))
      }
    });

  } catch (error) {
    logger.error('Error fetching analytics reports:', error);
    res.status(500).json({ message: 'Error fetching analytics reports' });
  }
});

/**
 * GET /api/analytics/real-time
 * Get real-time analytics dashboard data
 */
router.get('/real-time', async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const realTimeData = await analyticsService.getRealTimeMetrics(companyId);

    res.json(realTimeData);

  } catch (error) {
    logger.error('Error fetching real-time analytics:', error);
    res.status(500).json({ message: 'Error fetching real-time analytics' });
  }
});

export default router;
