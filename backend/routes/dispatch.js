/**
 * Dispatch Management API Routes
 * Load management, route optimization, and real-time tracking
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
 * GET /api/dispatch/loads
 * Get all loads with filtering and pagination
 */
router.get('/loads', async (req, res) => {
  try {
    const { status, driverId, vehicleId, dateRange, page = 1, limit = 20 } = req.query;

    const whereClause = {
      company_id: req.user.companyId,
    };

    if (status) {
      whereClause.status = status;
    }

    if (driverId) {
      whereClause.driver_id = parseInt(driverId);
    }

    if (vehicleId) {
      whereClause.vehicle_id = parseInt(vehicleId);
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange.split(',');
      whereClause.pickup_date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const loads = await prisma.loads.findMany({
      where: whereClause,
      include: {
        drivers: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            phone: true,
          },
        },
        vehicles: {
          select: {
            id: true,
            unit_number: true,
            make: true,
            model: true,
          },
        },
        customers: {
          select: {
            id: true,
            name: true,
            contact_email: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    });

    const totalCount = await prisma.loads.count({
      where: whereClause,
    });

    res.json({
      loads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching loads:', error);
    res.status(500).json({ message: 'Error fetching loads' });
  }
});

/**
 * GET /api/dispatch/metrics
 * Get dispatch performance metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysBack = parseInt(period);
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const companyId = req.user.companyId;

    // Load counts by status
    const loadCounts = await prisma.loads.groupBy({
      by: ['status'],
      where: {
        company_id: companyId,
        created_at: { gte: startDate },
      },
      _count: { id: true },
    });

    // Revenue metrics
    const revenueData = await prisma.loads.aggregate({
      where: {
        company_id: companyId,
        status: 'delivered',
        delivery_date: { gte: startDate },
      },
      _sum: { revenue: true },
      _avg: { revenue: true },
      _count: { id: true },
    });

    // On-time delivery rate
    const onTimeDeliveries = await prisma.loads.count({
      where: {
        company_id: companyId,
        status: 'delivered',
        delivery_date: { gte: startDate },
        actual_delivery_date: { lte: prisma.loads.fields.delivery_date },
      },
    });

    const totalDeliveries = revenueData._count.id;
    const onTimeRate = totalDeliveries > 0 ? (onTimeDeliveries / totalDeliveries) * 100 : 0;

    const metrics = {
      loads: {
        total: loadCounts.reduce((sum, item) => sum + item._count.id, 0),
        byStatus: loadCounts.reduce((acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {}),
      },
      revenue: {
        total: revenueData._sum.revenue || 0,
        average: revenueData._avg.revenue || 0,
        deliveredLoads: totalDeliveries,
      },
      performance: {
        onTimeDeliveryRate: Math.round(onTimeRate * 10) / 10,
      },
      period: `${daysBack} days`,
    };

    res.json(metrics);
  } catch (error) {
    logger.error('Error fetching dispatch metrics:', error);
    res.status(500).json({ message: 'Error fetching dispatch metrics' });
  }
});

/**
 * POST /api/dispatch/auto-assign/:loadId
 * Auto-assign a load to the best available driver/vehicle
 */
router.post('/auto-assign/:loadId', async (req, res) => {
  try {
    const loadId = parseInt(req.params.loadId);
    const companyId = req.user.companyId;

    // Verify load belongs to company
    const load = await prisma.loads.findUnique({
      where: { id: loadId },
    });

    if (!load || load.company_id !== companyId) {
      return res.status(404).json({ message: 'Load not found' });
    }

    if (load.status !== 'available') {
      return res.status(400).json({ message: 'Load is not available for assignment' });
    }

    // Find available drivers and vehicles
    const availableDrivers = await prisma.drivers.findMany({
      where: {
        company_id: companyId,
        status: 'available',
        vehicles: {
          status: 'available',
        },
      },
      include: {
        vehicles: true,
      },
    });

    if (availableDrivers.length === 0) {
      return res.status(400).json({ message: 'No available drivers/vehicles found' });
    }

    // Simple assignment logic (would be enhanced with ML optimization)
    const selectedDriver = availableDrivers[0];

    // Update load assignment
    const updatedLoad = await prisma.loads.update({
      where: { id: loadId },
      data: {
        driver_id: selectedDriver.id,
        vehicle_id: selectedDriver.vehicles.id,
        status: 'assigned',
        assigned_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Update driver and vehicle status
    await prisma.drivers.update({
      where: { id: selectedDriver.id },
      data: { status: 'assigned' },
    });

    await prisma.vehicles.update({
      where: { id: selectedDriver.vehicles.id },
      data: { status: 'assigned' },
    });

    res.json({
      success: true,
      assignment: {
        loadId,
        driverId: selectedDriver.id,
        vehicleId: selectedDriver.vehicles.id,
        assignedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error auto-assigning load:', error);
    res.status(500).json({ message: 'Error auto-assigning load' });
  }
});

module.exports = router;
