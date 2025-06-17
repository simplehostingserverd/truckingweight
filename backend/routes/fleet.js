/**
 * Fleet Management API Routes
 * Enhanced fleet monitoring, trailer management, and equipment tracking
 */

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { setCompanyContextMiddleware } = require('../middleware/companyContext');
const prisma = require('../config/prisma').default;
const { logger } = require('../utils/logger');

const router = express.Router();

// Apply middleware to all routes
router.use(protect);
router.use(setCompanyContextMiddleware);

/**
 * GET /api/fleet/vehicles
 * Get all vehicles with enhanced filtering
 */
router.get('/vehicles', async (req, res) => {
  try {
    const { status, type, driverId, page = 1, limit = 20 } = req.query;

    const whereClause = {
      company_id: req.user.companyId,
    };

    if (status) {
      whereClause.status = status;
    }

    if (type) {
      whereClause.vehicle_type = type;
    }

    if (driverId) {
      whereClause.current_driver_id = parseInt(driverId);
    }

    const vehicles = await prisma.vehicles.findMany({
      where: whereClause,
      include: {
        drivers: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            license_number: true,
          },
        },
        loads: {
          where: { status: { in: ['assigned', 'in_transit'] } },
          select: {
            id: true,
            load_number: true,
            status: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    });

    const totalCount = await prisma.vehicles.count({
      where: whereClause,
    });

    res.json({
      vehicles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Error fetching vehicles' });
  }
});

/**
 * GET /api/fleet/metrics
 * Get fleet performance metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysBack = parseInt(period);
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const companyId = req.user.companyId;

    // Vehicle utilization
    const totalVehicles = await prisma.vehicles.count({
      where: { company_id: companyId, status: 'active' },
    });

    const activeVehicles = await prisma.vehicles.count({
      where: {
        company_id: companyId,
        status: 'active',
        loads: {
          some: {
            status: { in: ['assigned', 'in_transit'] },
          },
        },
      },
    });

    // Fuel efficiency
    const fuelData = await prisma.fuel_transactions.aggregate({
      where: {
        company_id: companyId,
        transaction_date: { gte: startDate },
      },
      _sum: {
        gallons: true,
        total_amount: true,
      },
    });

    // Maintenance costs
    const maintenanceCosts = await prisma.maintenance_work_orders.aggregate({
      where: {
        company_id: companyId,
        completed_at: { gte: startDate },
        status: 'completed',
      },
      _sum: { actual_cost: true },
    });

    const metrics = {
      utilization: {
        total: totalVehicles,
        active: activeVehicles,
        rate: totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0,
      },
      fuel: {
        totalGallons: fuelData._sum.gallons || 0,
        totalCost: fuelData._sum.total_amount || 0,
        avgCostPerGallon:
          fuelData._sum.gallons > 0 ? fuelData._sum.total_amount / fuelData._sum.gallons : 0,
      },
      maintenance: {
        totalCost: maintenanceCosts._sum.actual_cost || 0,
      },
      period: `${daysBack} days`,
    };

    res.json(metrics);
  } catch (error) {
    logger.error('Error fetching fleet metrics:', error);
    res.status(500).json({ message: 'Error fetching fleet metrics' });
  }
});

module.exports = router;
