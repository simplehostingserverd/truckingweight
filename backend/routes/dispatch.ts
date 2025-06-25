/**
 * Dispatch API Routes
 * Advanced dispatch management with auto-assignment and route optimization
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { setCompanyContextMiddleware } from '../middleware/companyContext';
import { DispatchService } from '../services/dispatch/DispatchService';
import { RouteOptimizationService } from '../services/dispatch/RouteOptimizationService';
import { MLService } from '../services/ai/MLService';
import prisma from '../config/prisma';
import { logger } from '../utils/logger';

// Type definitions for dispatch queries
interface LoadWhereClause {
  company_id: number;
  status?: string;
  dispatch_priority?: {
    gte: number;
  };
  equipment_type?: string;
  pickup_date?: {
    gte: Date;
    lte: Date;
  };
}

const router = express.Router();
const dispatchService = new DispatchService();
const routeOptimizer = new RouteOptimizationService();
const mlService = new MLService();

// Apply middleware to all routes
router.use(protect);
router.use(setCompanyContextMiddleware);

/**
 * GET /api/dispatch/loads
 * Get all loads for dispatch management
 */
router.get('/loads', async (req, res) => {
  try {
    const { status, priority, equipmentType, dateRange } = req.query;
    
    const whereClause: LoadWhereClause = {
      company_id: req.user.companyId
    };

    if (status) {
      whereClause.status = status;
    }

    if (priority) {
      whereClause.dispatch_priority = {
        gte: parseInt(priority as string)
      };
    }

    if (equipmentType) {
      whereClause.equipment_type = equipmentType;
    }

    if (dateRange) {
      const [startDate, endDate] = (dateRange as string).split(',');
      whereClause.pickup_date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const loads = await prisma.loads.findMany({
      where: whereClause,
      include: {
        load_stops: {
          orderBy: { stop_number: 'asc' }
        },
        customers: true,
        vehicles: true,
        drivers: true,
        trailers: true,
        routes: true
      },
      orderBy: [
        { dispatch_priority: 'desc' },
        { pickup_date: 'asc' }
      ]
    });

    // Transform data for frontend
    const transformedLoads = loads.map(load => ({
      id: load.id,
      loadNumber: load.load_number || `LOAD-${load.id}`,
      customer: load.customers?.name || 'Unknown Customer',
      pickupLocation: load.pickup_location,
      deliveryLocation: load.delivery_location,
      pickupDate: load.pickup_date,
      deliveryDate: load.delivery_date,
      weight: load.weight || 0,
      rate: load.total_rate || 0,
      status: load.status,
      priority: load.dispatch_priority || 5,
      equipmentType: load.equipment_type || 'dry_van',
      distance: load.routes?.[0]?.total_miles || 0,
      assignedDriver: load.drivers?.name,
      assignedVehicle: load.vehicles?.name,
      estimatedRevenue: load.total_rate || 0,
      fuelSurcharge: load.fuel_surcharge || 0,
      accessorialCharges: load.accessorial_charges || 0,
      stops: load.load_stops
    }));

    res.json(transformedLoads);

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
    const companyId = req.user.companyId;

    // Get load counts by status
    const loadCounts = await prisma.loads.groupBy({
      by: ['status'],
      where: { company_id: companyId },
      _count: { id: true }
    });

    // Get available drivers
    const availableDrivers = await prisma.drivers.count({
      where: {
        company_id: companyId,
        status: 'Active',
        current_load_id: null
      }
    });

    // Calculate utilization rate
    const totalDrivers = await prisma.drivers.count({
      where: {
        company_id: companyId,
        status: 'Active'
      }
    });

    const utilizationRate = totalDrivers > 0 ? ((totalDrivers - availableDrivers) / totalDrivers) * 100 : 0;

    // Calculate average revenue per mile
    const recentLoads = await prisma.loads.findMany({
      where: {
        company_id: companyId,
        status: 'delivered',
        delivery_date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      include: {
        routes: true
      }
    });

    const avgRevenuePerMile = recentLoads.length > 0 
      ? recentLoads.reduce((sum, load) => {
          const miles = load.routes?.[0]?.total_miles || 1;
          return sum + ((load.total_rate || 0) / miles);
        }, 0) / recentLoads.length
      : 0;

    // Calculate on-time delivery rate
    const onTimeDeliveries = recentLoads.filter(load => 
      load.delivery_date && load.delivery_appointment &&
      load.delivery_date <= load.delivery_appointment
    ).length;

    const onTimeDeliveryRate = recentLoads.length > 0 
      ? (onTimeDeliveries / recentLoads.length) * 100 
      : 0;

    const metrics = {
      totalLoads: loadCounts.reduce((sum, group) => sum + group._count.id, 0),
      availableLoads: loadCounts.find(g => g.status === 'available')?._count.id || 0,
      assignedLoads: loadCounts.find(g => g.status === 'assigned')?._count.id || 0,
      inTransitLoads: loadCounts.find(g => g.status === 'in_transit')?._count.id || 0,
      availableDrivers,
      utilizationRate,
      avgRevenuePerMile,
      onTimeDeliveryRate
    };

    res.json(metrics);

  } catch (error) {
    logger.error('Error fetching dispatch metrics:', error);
    res.status(500).json({ message: 'Error fetching metrics' });
  }
});

/**
 * POST /api/dispatch/auto-assign/:loadId
 * Auto-assign a load to the best available driver/vehicle
 */
router.post('/auto-assign/:loadId', async (req, res) => {
  try {
    const loadId = parseInt(req.params.loadId);
    const { constraints } = req.body;

    const result = await dispatchService.autoAssignLoad({
      loadId,
      companyId: req.user.companyId,
      constraints
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Load assigned successfully',
        assignment: {
          loadId: result.loadId,
          vehicleId: result.assignedVehicleId,
          driverId: result.assignedDriverId,
          trailerId: result.assignedTrailerId,
          routeId: result.routeId,
          estimatedCost: result.estimatedCost,
          estimatedDuration: result.estimatedDuration,
          optimizationScore: result.optimizationScore
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to assign load',
        reasons: result.reasons
      });
    }

  } catch (error) {
    logger.error('Error auto-assigning load:', error);
    res.status(500).json({ message: 'Error auto-assigning load' });
  }
});

/**
 * POST /api/dispatch/manual-assign
 * Manually assign a load to specific driver/vehicle
 */
router.post('/manual-assign', async (req, res) => {
  try {
    const { loadId, driverId, vehicleId, trailerId } = req.body;

    // Validate assignment
    const load = await prisma.loads.findUnique({
      where: { id: loadId }
    });

    if (!load || load.company_id !== req.user.companyId) {
      return res.status(404).json({ message: 'Load not found' });
    }

    // Update load assignment
    await prisma.loads.update({
      where: { id: loadId },
      data: {
        driver_id: driverId,
        vehicle_id: vehicleId,
        trailer_id: trailerId,
        status: 'assigned',
        assigned_at: new Date()
      }
    });

    // Update driver status
    if (driverId) {
      await prisma.drivers.update({
        where: { id: driverId },
        data: {
          current_load_id: loadId,
          status: 'On Load'
        }
      });
    }

    // Update vehicle status
    if (vehicleId) {
      await prisma.vehicles.update({
        where: { id: vehicleId },
        data: { status: 'In Use' }
      });
    }

    // Update trailer status
    if (trailerId) {
      await prisma.trailers.update({
        where: { id: trailerId },
        data: { status: 'in_use' }
      });
    }

    res.json({
      success: true,
      message: 'Load assigned successfully'
    });

  } catch (error) {
    logger.error('Error manually assigning load:', error);
    res.status(500).json({ message: 'Error assigning load' });
  }
});

/**
 * POST /api/dispatch/optimize-route/:loadId
 * Create optimized route for a load
 */
router.post('/optimize-route/:loadId', async (req, res) => {
  try {
    const loadId = parseInt(req.params.loadId);
    const { vehicleId, driverId, trailerId, preferences } = req.body;

    const load = await prisma.loads.findUnique({
      where: { id: loadId },
      include: {
        load_stops: {
          orderBy: { stop_number: 'asc' }
        }
      }
    });

    if (!load || load.company_id !== req.user.companyId) {
      return res.status(404).json({ message: 'Load not found' });
    }

    const optimizedRoute = await routeOptimizer.createOptimizedRoute({
      loadId,
      vehicleId,
      driverId,
      trailerId,
      stops: load.load_stops,
      preferences
    });

    if (optimizedRoute) {
      res.json({
        success: true,
        route: optimizedRoute
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to create optimized route'
      });
    }

  } catch (error) {
    logger.error('Error optimizing route:', error);
    res.status(500).json({ message: 'Error optimizing route' });
  }
});

/**
 * GET /api/dispatch/available-resources
 * Get available drivers, vehicles, and trailers for assignment
 */
router.get('/available-resources', async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const [drivers, vehicles, trailers] = await Promise.all([
      prisma.drivers.findMany({
        where: {
          company_id: companyId,
          status: 'Active',
          current_load_id: null
        },
        include: {
          driver_qualifications: true,
          driver_performance_metrics: {
            orderBy: { calculated_at: 'desc' },
            take: 1
          }
        }
      }),
      prisma.vehicles.findMany({
        where: {
          company_id: companyId,
          status: 'Active'
        }
      }),
      prisma.trailers.findMany({
        where: {
          company_id: companyId,
          status: 'available'
        }
      })
    ]);

    res.json({
      drivers: drivers.map(driver => ({
        id: driver.id,
        name: driver.name,
        licenseNumber: driver.license_number,
        qualifications: driver.driver_qualifications.map(q => q.qualification_type),
        performanceScore: driver.driver_performance_metrics[0]?.safety_score || 0,
        onTimeRate: driver.driver_performance_metrics[0]?.on_time_deliveries || 0
      })),
      vehicles: vehicles.map(vehicle => ({
        id: vehicle.id,
        name: vehicle.name,
        type: vehicle.type,
        make: vehicle.make,
        model: vehicle.model,
        maxWeight: vehicle.max_gross_weight,
        equipmentType: vehicle.equipment_type
      })),
      trailers: trailers.map(trailer => ({
        id: trailer.id,
        trailerNumber: trailer.trailer_number,
        type: trailer.type,
        capacity: trailer.capacity_weight
      }))
    });

  } catch (error) {
    logger.error('Error fetching available resources:', error);
    res.status(500).json({ message: 'Error fetching resources' });
  }
});

/**
 * GET /api/dispatch/eta-prediction/:loadId
 * Get AI-powered ETA prediction for a load
 */
router.get('/eta-prediction/:loadId', async (req, res) => {
  try {
    const loadId = parseInt(req.params.loadId);
    const { currentLat, currentLng, trafficConditions, weatherConditions } = req.query;

    const load = await prisma.loads.findUnique({
      where: { id: loadId },
      include: {
        routes: true
      }
    });

    if (!load || load.company_id !== req.user.companyId) {
      return res.status(404).json({ message: 'Load not found' });
    }

    const route = load.routes?.[0];
    if (!route) {
      return res.status(400).json({ message: 'No route found for load' });
    }

    const etaPrediction = await mlService.predictETA({
      loadId,
      routeId: route.id,
      currentLocation: {
        latitude: parseFloat(currentLat as string),
        longitude: parseFloat(currentLng as string)
      },
      trafficConditions: trafficConditions as any,
      weatherConditions: weatherConditions as any
    });

    res.json(etaPrediction);

  } catch (error) {
    logger.error('Error predicting ETA:', error);
    res.status(500).json({ message: 'Error predicting ETA' });
  }
});

export default router;
