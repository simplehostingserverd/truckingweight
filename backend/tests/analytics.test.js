/**
 * Analytics API Tests
 * Testing KPI metrics, performance analytics, and business intelligence
 */

const request = require('supertest');
const express = require('express');
const analyticsRoutes = require('../routes/analytics');

// Mock dependencies
jest.mock('../config/prisma', () => ({
  default: {
    loads: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
      count: jest.fn(),
    },
    vehicles: {
      count: jest.fn(),
    },
    fuel_transactions: {
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    maintenance_work_orders: {
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    safety_incidents: {
      groupBy: jest.fn(),
    },
    hos_logs: {
      groupBy: jest.fn(),
    },
    analytics_reports: {
      findMany: jest.fn(),
      count: jest.fn(),
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

jest.mock('../services/analytics/AnalyticsService', () => ({
  AnalyticsService: jest.fn().mockImplementation(() => ({
    combineFleetMetrics: jest.fn(),
    combineDriverMetrics: jest.fn(),
    getFinancialTrends: jest.fn(),
    analyzeRoutes: jest.fn(),
    getIndustryBenchmarks: jest.fn(),
    generatePredictions: jest.fn(),
    generateCustomReport: jest.fn(),
    getRealTimeMetrics: jest.fn(),
  }))
}));

jest.mock('../services/analytics/KPIService', () => ({
  KPIService: jest.fn().mockImplementation(() => ({
    calculateKPIs: jest.fn(),
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
app.use('/api/analytics', analyticsRoutes);

describe('Analytics API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/analytics/kpi', () => {
    it('should fetch KPI data successfully', async () => {
      const mockKPIData = {
        revenue: {
          total: 150000,
          growth: 12.5
        },
        efficiency: {
          fuelEfficiency: 6.8,
          onTimeDelivery: 94.2
        },
        safety: {
          incidentRate: 0.02,
          complianceScore: 98.5
        }
      };

      const KPIService = require('../services/analytics/KPIService').KPIService;
      const mockService = new KPIService();
      mockService.calculateKPIs.mockResolvedValue(mockKPIData);

      const response = await request(app)
        .get('/api/analytics/kpi')
        .expect(200);

      expect(response.body).toEqual(mockKPIData);
      expect(mockService.calculateKPIs).toHaveBeenCalledWith({
        companyId: 1,
        daysBack: 30,
        includeComparison: false
      });
    });

    it('should include comparison data when requested', async () => {
      const KPIService = require('../services/analytics/KPIService').KPIService;
      const mockService = new KPIService();
      mockService.calculateKPIs.mockResolvedValue({});

      await request(app)
        .get('/api/analytics/kpi?comparison=true&period=60')
        .expect(200);

      expect(mockService.calculateKPIs).toHaveBeenCalledWith({
        companyId: 1,
        daysBack: 60,
        includeComparison: true
      });
    });
  });

  describe('GET /api/analytics/fleet-performance', () => {
    it('should fetch fleet performance metrics', async () => {
      const mockVehicleUtilization = [
        { vehicle_id: 1, _count: { id: 10 }, _sum: { total_miles: 5000, revenue: 15000 } }
      ];

      const mockFuelData = [
        { vehicle_id: 1, _sum: { gallons: 800, total_amount: 2400 } }
      ];

      const mockMaintenanceCosts = [
        { vehicle_id: 1, _sum: { actual_cost: 1200 }, _count: { id: 3 } }
      ];

      const mockCombinedMetrics = {
        vehiclePerformance: [
          {
            vehicleId: 1,
            utilization: 85.5,
            fuelEfficiency: 6.25,
            maintenanceCost: 1200,
            revenue: 15000
          }
        ]
      };

      prisma.loads.groupBy.mockResolvedValue(mockVehicleUtilization);
      prisma.fuel_transactions.groupBy.mockResolvedValue(mockFuelData);
      prisma.maintenance_work_orders.groupBy.mockResolvedValue(mockMaintenanceCosts);

      const AnalyticsService = require('../services/analytics/AnalyticsService').AnalyticsService;
      const mockService = new AnalyticsService();
      mockService.combineFleetMetrics.mockResolvedValue(mockCombinedMetrics);

      const response = await request(app)
        .get('/api/analytics/fleet-performance')
        .expect(200);

      expect(response.body.fleetPerformance).toEqual(mockCombinedMetrics);
      expect(response.body.period).toBe('30 days');
    });

    it('should filter by specific vehicle', async () => {
      prisma.loads.groupBy.mockResolvedValue([]);
      prisma.fuel_transactions.groupBy.mockResolvedValue([]);
      prisma.maintenance_work_orders.groupBy.mockResolvedValue([]);

      const AnalyticsService = require('../services/analytics/AnalyticsService').AnalyticsService;
      const mockService = new AnalyticsService();
      mockService.combineFleetMetrics.mockResolvedValue({});

      await request(app)
        .get('/api/analytics/fleet-performance?vehicleId=1')
        .expect(200);

      expect(prisma.loads.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            vehicle_id: 1
          })
        })
      );
    });
  });

  describe('GET /api/analytics/driver-performance', () => {
    it('should fetch driver performance metrics', async () => {
      const mockLoadPerformance = [
        { driver_id: 1, _count: { id: 15 }, _sum: { total_miles: 7500, revenue: 22500 } }
      ];

      const mockSafetyMetrics = [
        { driver_id: 1, _count: { id: 0 } }
      ];

      const mockHOSCompliance = [
        { driver_id: 1, _count: { id: 30 } }
      ];

      const mockCombinedMetrics = {
        driverPerformance: [
          {
            driverId: 1,
            loadsCompleted: 15,
            totalMiles: 7500,
            revenue: 22500,
            safetyScore: 100,
            complianceRate: 100
          }
        ]
      };

      prisma.loads.groupBy.mockResolvedValue(mockLoadPerformance);
      prisma.safety_incidents.groupBy.mockResolvedValue(mockSafetyMetrics);
      prisma.hos_logs.groupBy.mockResolvedValue(mockHOSCompliance);

      const AnalyticsService = require('../services/analytics/AnalyticsService').AnalyticsService;
      const mockService = new AnalyticsService();
      mockService.combineDriverMetrics.mockResolvedValue(mockCombinedMetrics);

      const response = await request(app)
        .get('/api/analytics/driver-performance')
        .expect(200);

      expect(response.body.driverPerformance).toEqual(mockCombinedMetrics);
    });
  });

  describe('GET /api/analytics/financial-trends', () => {
    it('should fetch financial trends', async () => {
      const mockTrends = {
        revenue: [
          { period: '2025-01-01', value: 50000 },
          { period: '2025-01-08', value: 52000 },
          { period: '2025-01-15', value: 48000 }
        ],
        costs: [
          { period: '2025-01-01', value: 35000 },
          { period: '2025-01-08', value: 36000 },
          { period: '2025-01-15', value: 34000 }
        ],
        profit: [
          { period: '2025-01-01', value: 15000 },
          { period: '2025-01-08', value: 16000 },
          { period: '2025-01-15', value: 14000 }
        ]
      };

      const AnalyticsService = require('../services/analytics/AnalyticsService').AnalyticsService;
      const mockService = new AnalyticsService();
      mockService.getFinancialTrends.mockResolvedValue(mockTrends);

      const response = await request(app)
        .get('/api/analytics/financial-trends')
        .expect(200);

      expect(response.body).toEqual(mockTrends);
      expect(mockService.getFinancialTrends).toHaveBeenCalledWith({
        companyId: 1,
        daysBack: 90,
        granularity: 'weekly'
      });
    });

    it('should support different granularities', async () => {
      const AnalyticsService = require('../services/analytics/AnalyticsService').AnalyticsService;
      const mockService = new AnalyticsService();
      mockService.getFinancialTrends.mockResolvedValue({});

      await request(app)
        .get('/api/analytics/financial-trends?granularity=monthly&period=180')
        .expect(200);

      expect(mockService.getFinancialTrends).toHaveBeenCalledWith({
        companyId: 1,
        daysBack: 180,
        granularity: 'monthly'
      });
    });
  });

  describe('GET /api/analytics/route-analysis', () => {
    it('should analyze route performance', async () => {
      const mockRouteMetrics = [
        {
          pickup_city: 'Los Angeles',
          pickup_state: 'CA',
          delivery_city: 'Phoenix',
          delivery_state: 'AZ',
          total_miles: 400,
          revenue: 1200,
          delivery_time_hours: 8,
          fuel_cost: 180
        }
      ];

      const mockAnalysis = {
        topRoutes: [
          {
            route: 'Los Angeles, CA → Phoenix, AZ',
            loads: 25,
            avgRevenue: 1200,
            avgMiles: 400,
            profitability: 85.0
          }
        ],
        insights: {
          mostProfitable: 'Los Angeles, CA → Phoenix, AZ',
          leastProfitable: 'Seattle, WA → Portland, OR',
          avgRevenuePerMile: 3.0
        }
      };

      prisma.loads.findMany.mockResolvedValue(mockRouteMetrics);

      const AnalyticsService = require('../services/analytics/AnalyticsService').AnalyticsService;
      const mockService = new AnalyticsService();
      mockService.analyzeRoutes.mockResolvedValue(mockAnalysis);

      const response = await request(app)
        .get('/api/analytics/route-analysis')
        .expect(200);

      expect(response.body.routeAnalysis).toEqual(mockAnalysis);
    });

    it('should filter by origin and destination', async () => {
      prisma.loads.findMany.mockResolvedValue([]);

      const AnalyticsService = require('../services/analytics/AnalyticsService').AnalyticsService;
      const mockService = new AnalyticsService();
      mockService.analyzeRoutes.mockResolvedValue({});

      await request(app)
        .get('/api/analytics/route-analysis?origin=Los Angeles&destination=Phoenix')
        .expect(200);

      expect(prisma.loads.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            pickup_city: { contains: 'Los Angeles', mode: 'insensitive' },
            delivery_city: { contains: 'Phoenix', mode: 'insensitive' }
          })
        })
      );
    });
  });

  describe('GET /api/analytics/benchmarks', () => {
    it('should fetch industry benchmarks', async () => {
      const mockBenchmarks = {
        fuelEfficiency: {
          industry: 6.5,
          company: 6.8,
          percentile: 75
        },
        onTimeDelivery: {
          industry: 92.0,
          company: 94.2,
          percentile: 80
        },
        safetyScore: {
          industry: 95.0,
          company: 98.5,
          percentile: 95
        }
      };

      const AnalyticsService = require('../services/analytics/AnalyticsService').AnalyticsService;
      const mockService = new AnalyticsService();
      mockService.getIndustryBenchmarks.mockResolvedValue(mockBenchmarks);

      const response = await request(app)
        .get('/api/analytics/benchmarks')
        .expect(200);

      expect(response.body).toEqual(mockBenchmarks);
    });
  });

  describe('GET /api/analytics/predictive', () => {
    it('should generate predictive analytics', async () => {
      const mockPredictions = {
        type: 'demand',
        forecast: [
          { date: '2025-02-01', value: 125, confidence: 0.85 },
          { date: '2025-02-08', value: 130, confidence: 0.82 },
          { date: '2025-02-15', value: 128, confidence: 0.80 }
        ],
        insights: [
          'Demand expected to increase by 8% in February',
          'Peak demand anticipated around Valentine\'s Day'
        ]
      };

      const AnalyticsService = require('../services/analytics/AnalyticsService').AnalyticsService;
      const mockService = new AnalyticsService();
      mockService.generatePredictions.mockResolvedValue(mockPredictions);

      const response = await request(app)
        .get('/api/analytics/predictive?type=demand&horizon=30')
        .expect(200);

      expect(response.body).toEqual(mockPredictions);
      expect(mockService.generatePredictions).toHaveBeenCalledWith({
        companyId: 1,
        type: 'demand',
        forecastDays: 30
      });
    });
  });

  describe('POST /api/analytics/custom-report', () => {
    it('should generate custom report', async () => {
      const mockReport = {
        id: 1,
        name: 'Fleet Efficiency Report',
        data: {
          metrics: ['fuel_efficiency', 'utilization'],
          results: [
            { vehicle: 'T001', fuelEfficiency: 6.8, utilization: 85 }
          ]
        }
      };

      const AnalyticsService = require('../services/analytics/AnalyticsService').AnalyticsService;
      const mockService = new AnalyticsService();
      mockService.generateCustomReport.mockResolvedValue(mockReport);

      const reportRequest = {
        reportName: 'Fleet Efficiency Report',
        metrics: ['fuel_efficiency', 'utilization'],
        filters: { vehicleType: 'truck' },
        dateRange: { start: '2025-01-01', end: '2025-01-31' }
      };

      const response = await request(app)
        .post('/api/analytics/custom-report')
        .send(reportRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.report).toEqual(mockReport);
    });
  });

  describe('GET /api/analytics/real-time', () => {
    it('should fetch real-time metrics', async () => {
      const mockRealTimeData = {
        activeLoads: 15,
        availableDrivers: 8,
        fuelPrice: 3.45,
        avgSpeed: 62,
        alerts: 2,
        lastUpdate: new Date().toISOString()
      };

      const AnalyticsService = require('../services/analytics/AnalyticsService').AnalyticsService;
      const mockService = new AnalyticsService();
      mockService.getRealTimeMetrics.mockResolvedValue(mockRealTimeData);

      const response = await request(app)
        .get('/api/analytics/real-time')
        .expect(200);

      expect(response.body).toEqual(mockRealTimeData);
    });
  });
});

module.exports = {
  app
};
