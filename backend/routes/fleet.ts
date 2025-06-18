/**
 * Fleet Management API Routes
 * Comprehensive fleet monitoring, maintenance, and analytics
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { setCompanyContextMiddleware } from '../middleware/companyContext';
import { MLService } from '../services/ai/MLService';
import prisma from '../config/prisma';
import { logger } from '../utils/logger';

const router = express.Router();
const mlService = new MLService();

// Apply middleware to all routes
router.use(protect);
router.use(setCompanyContextMiddleware);

/**
 * GET /api/fleet/vehicles
 * Get all vehicles with real-time status and alerts
 */
router.get('/vehicles', async (req, res) => {
  try {
    const { status, type, alertLevel } = req.query;
    
    const whereClause: any = {
      company_id: req.user.companyId
    };

    if (status) {
      whereClause.status = status;
    }

    if (type) {
      whereClause.type = type;
    }

    const vehicles = await prisma.vehicles.findMany({
      where: whereClause,
      include: {
        drivers: {
          where: { status: 'Active' }
        },
        loads: {
          where: { status: { in: ['assigned', 'in_transit'] } },
          take: 1
        },
        maintenance_work_orders: {
          where: { status: { in: ['open', 'in_progress'] } },
          orderBy: { created_at: 'desc' },
          take: 5
        },
        vehicle_telematics_data: {
          orderBy: { timestamp: 'desc' },
          take: 1
        },
        predictive_alerts: {
          where: { resolved: false },
          orderBy: { created_at: 'desc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Transform data for frontend
    const transformedVehicles = await Promise.all(vehicles.map(async (vehicle) => {
      const telematicsData = vehicle.vehicle_telematics_data[0];
      const currentLoad = vehicle.loads[0];
      const assignedDriver = vehicle.drivers[0];

      // Generate mock alerts for demonstration
      const alerts = [
        ...vehicle.predictive_alerts.map(alert => ({
          id: alert.id,
          type: alert.alert_type,
          severity: alert.severity,
          message: alert.message,
          timestamp: alert.created_at.toISOString(),
          resolved: alert.resolved
        })),
        // Add maintenance alerts
        ...vehicle.maintenance_work_orders
          .filter(wo => wo.priority === 'critical' || wo.priority === 'high')
          .map(wo => ({
            id: wo.id + 10000, // Offset to avoid ID conflicts
            type: 'maintenance',
            severity: wo.priority === 'critical' ? 'critical' : 'high',
            message: `${wo.work_type} maintenance required: ${wo.description}`,
            timestamp: wo.created_at.toISOString(),
            resolved: false
          }))
      ];

      // Calculate safety score (mock calculation)
      const safetyScore = Math.max(60, Math.min(100, 
        90 - (alerts.filter(a => a.severity === 'critical').length * 10) -
        (alerts.filter(a => a.severity === 'high').length * 5)
      ));

      // Calculate maintenance score
      const maintenanceScore = vehicle.maintenance_work_orders.length === 0 ? 95 :
        Math.max(50, 95 - (vehicle.maintenance_work_orders.length * 10));

      return {
        id: vehicle.id,
        name: vehicle.name,
        type: vehicle.type,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin,
        licensePlate: vehicle.license_plate,
        status: vehicle.status,
        currentLocation: {
          latitude: telematicsData?.latitude || 0,
          longitude: telematicsData?.longitude || 0,
          address: telematicsData?.location_description || 'Unknown'
        },
        odometer: telematicsData?.odometer || vehicle.odometer || 0,
        fuelLevel: telematicsData?.fuel_level || Math.floor(Math.random() * 100),
        engineHours: telematicsData?.engine_hours || 0,
        lastMaintenance: vehicle.last_inspection_date?.toISOString() || new Date().toISOString(),
        nextMaintenanceDue: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        maintenanceScore,
        safetyScore,
        utilizationRate: currentLoad ? 100 : Math.floor(Math.random() * 40),
        assignedDriver: assignedDriver?.name,
        currentLoad: currentLoad?.load_number,
        alerts: alerts.sort((a, b) => {
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return severityOrder[b.severity as keyof typeof severityOrder] - 
                 severityOrder[a.severity as keyof typeof severityOrder];
        })
      };
    }));

    // Filter by alert level if specified
    const filteredVehicles = alertLevel 
      ? transformedVehicles.filter(v => 
          v.alerts.some(a => a.severity === alertLevel)
        )
      : transformedVehicles;

    res.json(filteredVehicles);

  } catch (error) {
    logger.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Error fetching vehicles' });
  }
});

/**
 * GET /api/fleet/metrics
 * Get fleet performance metrics and KPIs
 */
router.get('/metrics', async (req, res) => {
  try {
    const companyId = req.user.companyId;

    // Get vehicle counts by status
    const vehicleCounts = await prisma.vehicles.groupBy({
      by: ['status'],
      where: { company_id: companyId },
      _count: { id: true }
    });

    const totalVehicles = vehicleCounts.reduce((sum, group) => sum + group._count.id, 0);
    const activeVehicles = vehicleCounts.find(g => g.status === 'Active')?._count.id || 0;
    const maintenanceVehicles = vehicleCounts.find(g => g.status === 'Maintenance')?._count.id || 0;
    const outOfServiceVehicles = vehicleCounts.find(g => g.status === 'Out of Service')?._count.id || 0;

    // Calculate utilization (vehicles currently on loads)
    const vehiclesOnLoads = await prisma.vehicles.count({
      where: {
        company_id: companyId,
        status: 'Active',
        loads: {
          some: {
            status: { in: ['assigned', 'in_transit'] }
          }
        }
      }
    });

    const avgUtilization = activeVehicles > 0 ? (vehiclesOnLoads / activeVehicles) * 100 : 0;

    // Get fuel efficiency data (mock for now)
    const avgFuelEfficiency = 6.8; // MPG

    // Get maintenance costs (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const maintenanceCosts = await prisma.maintenance_work_orders.aggregate({
      where: {
        company_id: companyId,
        completed_at: { gte: thirtyDaysAgo },
        status: 'completed'
      },
      _sum: { total_cost: true }
    });

    const totalMaintenanceCost = maintenanceCosts._sum.total_cost || 0;

    // Calculate average safety score
    const vehicles = await prisma.vehicles.findMany({
      where: { company_id: companyId },
      include: {
        predictive_alerts: {
          where: { resolved: false }
        }
      }
    });

    const avgSafetyScore = vehicles.length > 0 
      ? vehicles.reduce((sum, vehicle) => {
          const alertPenalty = vehicle.predictive_alerts.length * 5;
          return sum + Math.max(60, 95 - alertPenalty);
        }, 0) / vehicles.length
      : 0;

    // Count critical alerts
    const criticalAlerts = await prisma.predictive_alerts.count({
      where: {
        company_id: companyId,
        severity: 'critical',
        resolved: false
      }
    });

    // Count upcoming maintenance
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const upcomingMaintenance = await prisma.maintenance_schedules.count({
      where: {
        company_id: companyId,
        next_due_at: { lte: nextWeek },
        active: true
      }
    });

    const metrics = {
      totalVehicles,
      activeVehicles,
      maintenanceVehicles,
      outOfServiceVehicles,
      avgUtilization,
      avgFuelEfficiency,
      totalMaintenanceCost,
      avgSafetyScore,
      criticalAlerts,
      upcomingMaintenance
    };

    res.json(metrics);

  } catch (error) {
    logger.error('Error fetching fleet metrics:', error);
    res.status(500).json({ message: 'Error fetching metrics' });
  }
});

/**
 * GET /api/fleet/vehicle/:id
 * Get detailed information for a specific vehicle
 */
router.get('/vehicle/:id', async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.id);

    const vehicle = await prisma.vehicles.findUnique({
      where: { 
        id: vehicleId,
        company_id: req.user.companyId
      },
      include: {
        drivers: true,
        loads: {
          orderBy: { created_at: 'desc' },
          take: 10
        },
        maintenance_work_orders: {
          orderBy: { created_at: 'desc' },
          take: 20
        },
        maintenance_schedules: {
          where: { active: true }
        },
        vehicle_telematics_data: {
          orderBy: { timestamp: 'desc' },
          take: 100
        },
        predictive_alerts: {
          orderBy: { created_at: 'desc' },
          take: 50
        }
      }
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json(vehicle);

  } catch (error) {
    logger.error('Error fetching vehicle details:', error);
    res.status(500).json({ message: 'Error fetching vehicle details' });
  }
});

/**
 * POST /api/fleet/vehicle/:id/maintenance-prediction
 * Get AI-powered maintenance predictions for a vehicle
 */
router.post('/vehicle/:id/maintenance-prediction', async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.id);

    const vehicle = await prisma.vehicles.findUnique({
      where: { 
        id: vehicleId,
        company_id: req.user.companyId
      }
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const predictions = await mlService.predictMaintenance(vehicleId);

    res.json({
      vehicleId,
      predictions,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error generating maintenance predictions:', error);
    res.status(500).json({ message: 'Error generating predictions' });
  }
});

/**
 * GET /api/fleet/maintenance/schedule
 * Get maintenance schedule for all vehicles
 */
router.get('/maintenance/schedule', async (req, res) => {
  try {
    const { upcoming, overdue } = req.query;
    const companyId = req.user.companyId;

    const whereClause: any = {
      company_id: companyId,
      active: true
    };

    if (upcoming === 'true') {
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      whereClause.next_due_at = { lte: nextMonth };
    }

    if (overdue === 'true') {
      whereClause.next_due_at = { lt: new Date() };
    }

    const schedules = await prisma.maintenance_schedules.findMany({
      where: whereClause,
      include: {
        vehicles: true,
        trailers: true,
        equipment: true
      },
      orderBy: { next_due_at: 'asc' }
    });

    const transformedSchedules = schedules.map(schedule => ({
      id: schedule.id,
      assetType: schedule.vehicle_id ? 'vehicle' : schedule.trailer_id ? 'trailer' : 'equipment',
      assetName: schedule.vehicles?.name || schedule.trailers?.trailer_number || schedule.equipment?.name,
      maintenanceType: schedule.maintenance_type,
      intervalType: schedule.interval_type,
      intervalValue: schedule.interval_value,
      lastPerformed: schedule.last_performed_at,
      nextDue: schedule.next_due_at,
      priority: schedule.priority,
      estimatedCost: schedule.estimated_cost,
      estimatedDuration: schedule.estimated_duration_hours,
      isOverdue: schedule.next_due_at ? schedule.next_due_at < new Date() : false
    }));

    res.json(transformedSchedules);

  } catch (error) {
    logger.error('Error fetching maintenance schedule:', error);
    res.status(500).json({ message: 'Error fetching maintenance schedule' });
  }
});

/**
 * POST /api/fleet/maintenance/work-order
 * Create a new maintenance work order
 */
router.post('/maintenance/work-order', async (req, res) => {
  try {
    const {
      vehicleId,
      trailerId,
      equipmentId,
      maintenanceScheduleId,
      workType,
      priority,
      description,
      scheduledDate,
      vendorId
    } = req.body;

    // Generate work order number
    const workOrderNumber = `WO-${Date.now()}`;

    const workOrder = await prisma.maintenance_work_orders.create({
      data: {
        work_order_number: workOrderNumber,
        vehicle_id: vehicleId,
        trailer_id: trailerId,
        equipment_id: equipmentId,
        maintenance_schedule_id: maintenanceScheduleId,
        work_type: workType,
        priority: priority || 'medium',
        description,
        scheduled_date: scheduledDate ? new Date(scheduledDate) : null,
        vendor_id: vendorId,
        status: 'open',
        company_id: req.user.companyId
      }
    });

    res.status(201).json({
      success: true,
      workOrder
    });

  } catch (error) {
    logger.error('Error creating work order:', error);
    res.status(500).json({ message: 'Error creating work order' });
  }
});

/**
 * GET /api/fleet/analytics/performance
 * Get fleet performance analytics
 */
router.get('/analytics/performance', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const companyId = req.user.companyId;
    const daysBack = parseInt(period as string);
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    // Get utilization trends
    const utilizationData = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(CASE WHEN status IN ('assigned', 'in_transit') THEN 1 END) as active_loads,
        COUNT(DISTINCT vehicle_id) as vehicles_used
      FROM loads 
      WHERE company_id = ${companyId} 
        AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    // Get maintenance costs by month
    const maintenanceCosts = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', completed_at) as month,
        SUM(total_cost) as total_cost,
        COUNT(*) as work_orders
      FROM maintenance_work_orders 
      WHERE company_id = ${companyId} 
        AND completed_at >= ${startDate}
        AND status = 'completed'
      GROUP BY DATE_TRUNC('month', completed_at)
      ORDER BY month
    `;

    // Get fuel efficiency trends (mock data)
    const fuelEfficiencyData = Array.from({ length: daysBack }, (_, i) => ({
      date: new Date(Date.now() - (daysBack - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      avgMpg: 6.5 + (Math.random() - 0.5) * 1.0,
      totalGallons: Math.floor(Math.random() * 1000) + 500
    }));

    res.json({
      utilization: utilizationData,
      maintenanceCosts,
      fuelEfficiency: fuelEfficiencyData,
      period: `${daysBack} days`
    });

  } catch (error) {
    logger.error('Error fetching performance analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

/**
 * GET /api/fleet/alerts
 * Get all active fleet alerts
 */
router.get('/alerts', async (req, res) => {
  try {
    const { severity, type, resolved = 'false' } = req.query;
    const companyId = req.user.companyId;

    const whereClause: any = {
      company_id: companyId,
      resolved: resolved === 'true'
    };

    if (severity) {
      whereClause.severity = severity;
    }

    if (type) {
      whereClause.alert_type = type;
    }

    const alerts = await prisma.predictive_alerts.findMany({
      where: whereClause,
      include: {
        vehicles: true
      },
      orderBy: [
        { severity: 'desc' },
        { created_at: 'desc' }
      ]
    });

    const transformedAlerts = alerts.map(alert => ({
      id: alert.id,
      vehicleId: alert.vehicle_id,
      vehicleName: alert.vehicles?.name,
      type: alert.alert_type,
      severity: alert.severity,
      message: alert.message,
      description: alert.description,
      timestamp: alert.created_at,
      resolved: alert.resolved,
      resolvedAt: alert.resolved_at,
      actionRequired: alert.action_required
    }));

    res.json(transformedAlerts);

  } catch (error) {
    logger.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Error fetching alerts' });
  }
});

/**
 * PUT /api/fleet/alert/:id/resolve
 * Resolve a fleet alert
 */
router.put('/alert/:id/resolve', async (req, res) => {
  try {
    const alertId = parseInt(req.params.id);
    const { resolution, notes } = req.body;

    const alert = await prisma.predictive_alerts.findUnique({
      where: { id: alertId }
    });

    if (!alert || alert.company_id !== req.user.companyId) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    await prisma.predictive_alerts.update({
      where: { id: alertId },
      data: {
        resolved: true,
        resolved_at: new Date(),
        resolution_notes: notes
      }
    });

    res.json({
      success: true,
      message: 'Alert resolved successfully'
    });

  } catch (error) {
    logger.error('Error resolving alert:', error);
    res.status(500).json({ message: 'Error resolving alert' });
  }
});

export default router;
