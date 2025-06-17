/**
 * Maintenance Management API Routes
 * Comprehensive maintenance scheduling, work orders, parts inventory, and vendor management
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { setCompanyContextMiddleware } from '../middleware/companyContext';
import { MaintenanceService } from '../services/maintenance/MaintenanceService';
import { MLService } from '../services/ai/MLService';
import prisma from '../config/prisma';
import { logger } from '../utils/logger';

const router = express.Router();
const maintenanceService = new MaintenanceService();
const mlService = new MLService();

// Apply middleware to all routes
router.use(protect);
router.use(setCompanyContextMiddleware);

/**
 * GET /api/maintenance/work-orders
 * Get all maintenance work orders with filtering
 */
router.get('/work-orders', async (req, res) => {
  try {
    const { status, priority, vehicleId, dateRange, page = 1, limit = 20 } = req.query;

    const whereClause: any = {
      company_id: req.user.companyId,
    };

    if (status) {
      whereClause.status = status;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    if (vehicleId) {
      whereClause.vehicle_id = parseInt(vehicleId as string);
    }

    if (dateRange) {
      const [startDate, endDate] = (dateRange as string).split(',');
      whereClause.scheduled_date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const workOrders = await prisma.maintenance_work_orders.findMany({
      where: whereClause,
      include: {
        vehicles: {
          select: {
            id: true,
            unit_number: true,
            make: true,
            model: true,
            year: true,
          },
        },
        maintenance_vendors: {
          select: {
            id: true,
            name: true,
            contact_email: true,
            contact_phone: true,
          },
        },
        maintenance_work_order_parts: {
          include: {
            maintenance_parts: {
              select: {
                id: true,
                part_number: true,
                description: true,
                unit_cost: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string),
    });

    const totalCount = await prisma.maintenance_work_orders.count({
      where: whereClause,
    });

    res.json({
      workOrders,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit as string)),
      },
    });
  } catch (error) {
    logger.error('Error fetching work orders:', error);
    res.status(500).json({ message: 'Error fetching work orders' });
  }
});

/**
 * POST /api/maintenance/work-orders
 * Create a new maintenance work order
 */
router.post('/work-orders', async (req, res) => {
  try {
    const {
      vehicleId,
      title,
      description,
      priority,
      scheduledDate,
      vendorId,
      estimatedCost,
      parts,
      maintenanceType,
      mileage,
    } = req.body;

    const workOrder = await maintenanceService.createWorkOrder({
      vehicleId,
      companyId: req.user.companyId,
      title,
      description,
      priority,
      scheduledDate: new Date(scheduledDate),
      vendorId,
      estimatedCost,
      parts,
      maintenanceType,
      mileage,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      workOrder,
    });
  } catch (error) {
    logger.error('Error creating work order:', error);
    res.status(500).json({ message: 'Error creating work order' });
  }
});

/**
 * GET /api/maintenance/work-orders/:id
 * Get a specific work order by ID
 */
router.get('/work-orders/:id', async (req, res) => {
  try {
    const workOrderId = parseInt(req.params.id);

    const workOrder = await prisma.maintenance_work_orders.findUnique({
      where: { id: workOrderId },
      include: {
        vehicles: true,
        maintenance_vendors: true,
        maintenance_work_order_parts: {
          include: {
            maintenance_parts: true,
          },
        },
      },
    });

    if (!workOrder || workOrder.company_id !== req.user.companyId) {
      return res.status(404).json({ message: 'Work order not found' });
    }

    res.json(workOrder);
  } catch (error) {
    logger.error('Error fetching work order:', error);
    res.status(500).json({ message: 'Error fetching work order' });
  }
});

/**
 * PUT /api/maintenance/work-orders/:id
 * Update a work order
 */
router.put('/work-orders/:id', async (req, res) => {
  try {
    const workOrderId = parseInt(req.params.id);
    const updateData = req.body;

    const workOrder = await maintenanceService.updateWorkOrder(workOrderId, {
      ...updateData,
      companyId: req.user.companyId,
      updatedBy: req.user.id,
    });

    res.json({
      success: true,
      workOrder,
    });
  } catch (error) {
    logger.error('Error updating work order:', error);
    res.status(500).json({ message: 'Error updating work order' });
  }
});

/**
 * POST /api/maintenance/work-orders/:id/complete
 * Mark a work order as completed
 */
router.post('/work-orders/:id/complete', async (req, res) => {
  try {
    const workOrderId = parseInt(req.params.id);
    const { actualCost, completionNotes, partsUsed, laborHours } = req.body;

    const workOrder = await maintenanceService.completeWorkOrder(workOrderId, {
      actualCost,
      completionNotes,
      partsUsed,
      laborHours,
      completedBy: req.user.id,
      companyId: req.user.companyId,
    });

    res.json({
      success: true,
      workOrder,
    });
  } catch (error) {
    logger.error('Error completing work order:', error);
    res.status(500).json({ message: 'Error completing work order' });
  }
});

/**
 * GET /api/maintenance/schedules
 * Get maintenance schedules for vehicles
 */
router.get('/schedules', async (req, res) => {
  try {
    const { vehicleId, upcoming = true } = req.query;

    const whereClause: any = {
      company_id: req.user.companyId,
      is_active: true,
    };

    if (vehicleId) {
      whereClause.vehicle_id = parseInt(vehicleId as string);
    }

    if (upcoming === 'true') {
      whereClause.next_due_date = {
        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
      };
    }

    const schedules = await prisma.maintenance_schedules.findMany({
      where: whereClause,
      include: {
        vehicles: {
          select: {
            id: true,
            unit_number: true,
            make: true,
            model: true,
            year: true,
            current_mileage: true,
          },
        },
      },
      orderBy: { next_due_date: 'asc' },
    });

    res.json(schedules);
  } catch (error) {
    logger.error('Error fetching maintenance schedules:', error);
    res.status(500).json({ message: 'Error fetching maintenance schedules' });
  }
});

/**
 * POST /api/maintenance/schedules
 * Create a new maintenance schedule
 */
router.post('/schedules', async (req, res) => {
  try {
    const {
      vehicleId,
      maintenanceType,
      intervalMiles,
      intervalDays,
      description,
      estimatedCost,
      vendorId,
    } = req.body;

    const schedule = await maintenanceService.createMaintenanceSchedule({
      vehicleId,
      companyId: req.user.companyId,
      maintenanceType,
      intervalMiles,
      intervalDays,
      description,
      estimatedCost,
      vendorId,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      schedule,
    });
  } catch (error) {
    logger.error('Error creating maintenance schedule:', error);
    res.status(500).json({ message: 'Error creating maintenance schedule' });
  }
});

/**
 * GET /api/maintenance/parts
 * Get parts inventory
 */
router.get('/parts', async (req, res) => {
  try {
    const { search, category, lowStock = false, page = 1, limit = 20 } = req.query;

    const whereClause: any = {
      company_id: req.user.companyId,
    };

    if (search) {
      whereClause.OR = [
        { part_number: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (category) {
      whereClause.category = category;
    }

    if (lowStock === 'true') {
      whereClause.quantity_on_hand = {
        lte: prisma.maintenance_parts.fields.reorder_point,
      };
    }

    const parts = await prisma.maintenance_parts.findMany({
      where: whereClause,
      include: {
        maintenance_vendors: {
          select: {
            id: true,
            name: true,
            contact_email: true,
          },
        },
      },
      orderBy: { part_number: 'asc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string),
    });

    const totalCount = await prisma.maintenance_parts.count({
      where: whereClause,
    });

    res.json({
      parts,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit as string)),
      },
    });
  } catch (error) {
    logger.error('Error fetching parts:', error);
    res.status(500).json({ message: 'Error fetching parts' });
  }
});

/**
 * POST /api/maintenance/parts
 * Add a new part to inventory
 */
router.post('/parts', async (req, res) => {
  try {
    const {
      partNumber,
      description,
      category,
      unitCost,
      quantityOnHand,
      reorderPoint,
      vendorId,
      location,
    } = req.body;

    const part = await prisma.maintenance_parts.create({
      data: {
        company_id: req.user.companyId,
        part_number: partNumber,
        description,
        category,
        unit_cost: unitCost,
        quantity_on_hand: quantityOnHand,
        reorder_point: reorderPoint,
        vendor_id: vendorId,
        location,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      part,
    });
  } catch (error) {
    logger.error('Error creating part:', error);
    res.status(500).json({ message: 'Error creating part' });
  }
});

/**
 * GET /api/maintenance/vendors
 * Get maintenance vendors
 */
router.get('/vendors', async (req, res) => {
  try {
    const { search, specialty, page = 1, limit = 20 } = req.query;

    const whereClause: any = {
      company_id: req.user.companyId,
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { contact_email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (specialty) {
      whereClause.specialties = {
        has: specialty,
      };
    }

    const vendors = await prisma.maintenance_vendors.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string),
    });

    const totalCount = await prisma.maintenance_vendors.count({
      where: whereClause,
    });

    res.json({
      vendors,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit as string)),
      },
    });
  } catch (error) {
    logger.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Error fetching vendors' });
  }
});

/**
 * POST /api/maintenance/vendors
 * Create a new maintenance vendor
 */
router.post('/vendors', async (req, res) => {
  try {
    const {
      name,
      contactName,
      contactEmail,
      contactPhone,
      address,
      specialties,
      certifications,
      hourlyRate,
      notes,
    } = req.body;

    const vendor = await prisma.maintenance_vendors.create({
      data: {
        company_id: req.user.companyId,
        name,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        address,
        specialties,
        certifications,
        hourly_rate: hourlyRate,
        notes,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      vendor,
    });
  } catch (error) {
    logger.error('Error creating vendor:', error);
    res.status(500).json({ message: 'Error creating vendor' });
  }
});

/**
 * GET /api/maintenance/metrics
 * Get maintenance performance metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysBack = parseInt(period as string);
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const companyId = req.user.companyId;

    // Get work order counts by status
    const workOrderCounts = await prisma.maintenance_work_orders.groupBy({
      by: ['status'],
      where: {
        company_id: companyId,
        created_at: { gte: startDate },
      },
      _count: { id: true },
    });

    // Get total maintenance costs
    const maintenanceCosts = await prisma.maintenance_work_orders.aggregate({
      where: {
        company_id: companyId,
        completed_at: { gte: startDate },
        status: 'completed',
      },
      _sum: { actual_cost: true },
      _avg: { actual_cost: true },
    });

    // Get upcoming maintenance
    const upcomingMaintenance = await prisma.maintenance_schedules.count({
      where: {
        company_id: companyId,
        is_active: true,
        next_due_date: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Get overdue maintenance
    const overdueMaintenance = await prisma.maintenance_schedules.count({
      where: {
        company_id: companyId,
        is_active: true,
        next_due_date: {
          lt: new Date(),
        },
      },
    });

    // Get parts inventory status
    const lowStockParts = await prisma.maintenance_parts.count({
      where: {
        company_id: companyId,
        quantity_on_hand: {
          lte: prisma.maintenance_parts.fields.reorder_point,
        },
      },
    });

    // Calculate average completion time
    const completedOrders = await prisma.maintenance_work_orders.findMany({
      where: {
        company_id: companyId,
        status: 'completed',
        completed_at: { gte: startDate },
      },
      select: {
        scheduled_date: true,
        completed_at: true,
      },
    });

    const avgCompletionTime =
      completedOrders.length > 0
        ? completedOrders.reduce((sum, order) => {
            const days =
              Math.abs(
                new Date(order.completed_at!).getTime() - new Date(order.scheduled_date).getTime()
              ) /
              (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / completedOrders.length
        : 0;

    const metrics = {
      workOrders: {
        total: workOrderCounts.reduce((sum, item) => sum + item._count.id, 0),
        byStatus: workOrderCounts.reduce(
          (acc, item) => {
            acc[item.status] = item._count.id;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
      costs: {
        total: maintenanceCosts._sum.actual_cost || 0,
        average: maintenanceCosts._avg.actual_cost || 0,
      },
      scheduling: {
        upcoming: upcomingMaintenance,
        overdue: overdueMaintenance,
        avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
      },
      inventory: {
        lowStockParts,
      },
      period: `${daysBack} days`,
    };

    res.json(metrics);
  } catch (error) {
    logger.error('Error fetching maintenance metrics:', error);
    res.status(500).json({ message: 'Error fetching maintenance metrics' });
  }
});

/**
 * GET /api/maintenance/predictive/:vehicleId
 * Get predictive maintenance recommendations for a vehicle
 */
router.get('/predictive/:vehicleId', async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId);

    // Verify vehicle belongs to company
    const vehicle = await prisma.vehicles.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle || vehicle.company_id !== req.user.companyId) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Get ML predictions for maintenance
    const predictions = await mlService.predictMaintenance(vehicleId);

    res.json({
      vehicleId,
      predictions,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error getting predictive maintenance:', error);
    res.status(500).json({ message: 'Error getting predictive maintenance' });
  }
});

export default router;
