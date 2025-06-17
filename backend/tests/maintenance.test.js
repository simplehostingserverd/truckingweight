/**
 * Maintenance Management API Tests
 * Comprehensive testing for maintenance work orders, schedules, parts, and vendors
 */

const request = require('supertest');
const express = require('express');
const maintenanceRoutes = require('../routes/maintenance');

// Mock dependencies
jest.mock('../config/prisma', () => ({
  default: {
    maintenance_work_orders: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    maintenance_schedules: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    maintenance_parts: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      fields: {
        reorder_point: 'reorder_point'
      }
    },
    maintenance_vendors: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    vehicles: {
      findUnique: jest.fn(),
    }
  }
}));

jest.mock('../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    req.user = { id: 1, companyId: 1 };
    next();
  }
}));

jest.mock('../middleware/companyContext', () => ({
  setCompanyContextMiddleware: (req, res, next) => next()
}));

jest.mock('../services/maintenance/MaintenanceService', () => ({
  MaintenanceService: jest.fn().mockImplementation(() => ({
    createWorkOrder: jest.fn(),
    updateWorkOrder: jest.fn(),
    completeWorkOrder: jest.fn(),
    createMaintenanceSchedule: jest.fn(),
  }))
}));

jest.mock('../services/ai/MLService', () => ({
  MLService: jest.fn().mockImplementation(() => ({
    predictMaintenance: jest.fn(),
  }))
}));

jest.mock('../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  }
}));

const prisma = require('../config/prisma').default;

// Create test app
const app = express();
app.use(express.json());
app.use('/api/maintenance', maintenanceRoutes);

describe('Maintenance API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/maintenance/work-orders', () => {
    it('should fetch work orders successfully', async () => {
      const mockWorkOrders = [
        {
          id: 1,
          title: 'Oil Change',
          status: 'pending',
          vehicles: { unit_number: 'T001' },
          maintenance_vendors: { name: 'Service Center' }
        }
      ];

      prisma.maintenance_work_orders.findMany.mockResolvedValue(mockWorkOrders);
      prisma.maintenance_work_orders.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/maintenance/work-orders')
        .expect(200);

      expect(response.body.workOrders).toEqual(mockWorkOrders);
      expect(response.body.pagination.total).toBe(1);
    });

    it('should filter work orders by status', async () => {
      prisma.maintenance_work_orders.findMany.mockResolvedValue([]);
      prisma.maintenance_work_orders.count.mockResolvedValue(0);

      await request(app)
        .get('/api/maintenance/work-orders?status=completed')
        .expect(200);

      expect(prisma.maintenance_work_orders.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'completed'
          })
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      prisma.maintenance_work_orders.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/maintenance/work-orders')
        .expect(500);

      expect(response.body.message).toBe('Error fetching work orders');
    });
  });

  describe('POST /api/maintenance/work-orders', () => {
    it('should create a new work order successfully', async () => {
      const mockWorkOrder = {
        id: 1,
        title: 'Brake Inspection',
        vehicleId: 1,
        priority: 'high'
      };

      const MaintenanceService = require('../services/maintenance/MaintenanceService').MaintenanceService;
      const mockService = new MaintenanceService();
      mockService.createWorkOrder.mockResolvedValue(mockWorkOrder);

      const workOrderData = {
        vehicleId: 1,
        title: 'Brake Inspection',
        description: 'Annual brake inspection',
        priority: 'high',
        scheduledDate: '2025-01-25T10:00:00Z'
      };

      const response = await request(app)
        .post('/api/maintenance/work-orders')
        .send(workOrderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(mockService.createWorkOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          vehicleId: 1,
          title: 'Brake Inspection',
          companyId: 1
        })
      );
    });

    it('should handle validation errors', async () => {
      const MaintenanceService = require('../services/maintenance/MaintenanceService').MaintenanceService;
      const mockService = new MaintenanceService();
      mockService.createWorkOrder.mockRejectedValue(new Error('Validation error'));

      const response = await request(app)
        .post('/api/maintenance/work-orders')
        .send({})
        .expect(500);

      expect(response.body.message).toBe('Error creating work order');
    });
  });

  describe('GET /api/maintenance/schedules', () => {
    it('should fetch maintenance schedules', async () => {
      const mockSchedules = [
        {
          id: 1,
          maintenance_type: 'oil_change',
          next_due_date: '2025-02-01',
          vehicles: { unit_number: 'T001' }
        }
      ];

      prisma.maintenance_schedules.findMany.mockResolvedValue(mockSchedules);

      const response = await request(app)
        .get('/api/maintenance/schedules')
        .expect(200);

      expect(response.body).toEqual(mockSchedules);
    });

    it('should filter upcoming schedules', async () => {
      prisma.maintenance_schedules.findMany.mockResolvedValue([]);

      await request(app)
        .get('/api/maintenance/schedules?upcoming=true')
        .expect(200);

      expect(prisma.maintenance_schedules.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            next_due_date: expect.objectContaining({
              lte: expect.any(Date)
            })
          })
        })
      );
    });
  });

  describe('GET /api/maintenance/parts', () => {
    it('should fetch parts inventory', async () => {
      const mockParts = [
        {
          id: 1,
          part_number: 'BRK001',
          description: 'Brake Pads',
          quantity_on_hand: 10
        }
      ];

      prisma.maintenance_parts.findMany.mockResolvedValue(mockParts);
      prisma.maintenance_parts.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/maintenance/parts')
        .expect(200);

      expect(response.body.parts).toEqual(mockParts);
    });

    it('should filter low stock parts', async () => {
      prisma.maintenance_parts.findMany.mockResolvedValue([]);
      prisma.maintenance_parts.count.mockResolvedValue(0);

      await request(app)
        .get('/api/maintenance/parts?lowStock=true')
        .expect(200);

      expect(prisma.maintenance_parts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            quantity_on_hand: expect.objectContaining({
              lte: expect.any(Object)
            })
          })
        })
      );
    });
  });

  describe('GET /api/maintenance/vendors', () => {
    it('should fetch maintenance vendors', async () => {
      const mockVendors = [
        {
          id: 1,
          name: 'ABC Service Center',
          contact_email: 'service@abc.com'
        }
      ];

      prisma.maintenance_vendors.findMany.mockResolvedValue(mockVendors);
      prisma.maintenance_vendors.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/maintenance/vendors')
        .expect(200);

      expect(response.body.vendors).toEqual(mockVendors);
    });
  });

  describe('GET /api/maintenance/metrics', () => {
    it('should calculate maintenance metrics', async () => {
      prisma.maintenance_work_orders.groupBy.mockResolvedValue([
        { status: 'completed', _count: { id: 5 } },
        { status: 'pending', _count: { id: 3 } }
      ]);

      prisma.maintenance_work_orders.aggregate.mockResolvedValue({
        _sum: { actual_cost: 5000 },
        _avg: { actual_cost: 1000 }
      });

      prisma.maintenance_schedules.count
        .mockResolvedValueOnce(2) // upcoming
        .mockResolvedValueOnce(1); // overdue

      prisma.maintenance_parts.count.mockResolvedValue(3); // low stock

      prisma.maintenance_work_orders.findMany.mockResolvedValue([
        {
          scheduled_date: '2025-01-20',
          completed_at: '2025-01-22'
        }
      ]);

      const response = await request(app)
        .get('/api/maintenance/metrics')
        .expect(200);

      expect(response.body.workOrders.total).toBe(8);
      expect(response.body.costs.total).toBe(5000);
      expect(response.body.scheduling.upcoming).toBe(2);
      expect(response.body.scheduling.overdue).toBe(1);
      expect(response.body.inventory.lowStockParts).toBe(3);
    });
  });

  describe('GET /api/maintenance/predictive/:vehicleId', () => {
    it('should get predictive maintenance for vehicle', async () => {
      const mockVehicle = { id: 1, company_id: 1 };
      const mockPredictions = {
        brakes: { probability: 0.23, estimatedFailureDate: '2025-03-15' }
      };

      prisma.vehicles.findUnique.mockResolvedValue(mockVehicle);
      
      const MLService = require('../services/ai/MLService').MLService;
      const mockMLService = new MLService();
      mockMLService.predictMaintenance.mockResolvedValue(mockPredictions);

      const response = await request(app)
        .get('/api/maintenance/predictive/1')
        .expect(200);

      expect(response.body.vehicleId).toBe(1);
      expect(response.body.predictions).toEqual(mockPredictions);
    });

    it('should return 404 for non-existent vehicle', async () => {
      prisma.vehicles.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/maintenance/predictive/999')
        .expect(404);

      expect(response.body.message).toBe('Vehicle not found');
    });
  });
});

module.exports = {
  // Export for integration tests
  app
};
