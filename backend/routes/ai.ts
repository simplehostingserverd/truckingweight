import express from 'express';
import { PredictiveMaintenanceService } from '../services/ai/PredictiveMaintenanceService';
import { RouteOptimizationService } from '../services/ai/RouteOptimizationService';
import { DriverSafetyService } from '../services/ai/DriverSafetyService';
import { DynamicPricingService } from '../services/ai/DynamicPricingService';

const router = express.Router();

// Initialize AI services
const predictiveMaintenanceService = new PredictiveMaintenanceService();
const routeOptimizationService = new RouteOptimizationService();
const driverSafetyService = new DriverSafetyService();
const dynamicPricingService = new DynamicPricingService();

/**
 * @route POST /api/ai/predictive-maintenance
 * @desc Analyze vehicle maintenance needs and predict failures
 * @access Private
 */
router.post('/predictive-maintenance', async (req, res) => {
  try {
    const { companyId, vehicleId } = req.body;
    
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }
    
    let result;
    if (vehicleId) {
      // Analyze specific vehicle
      result = await predictiveMaintenanceService.analyzeVehicleMaintenance(vehicleId);
    } else {
      // Analyze all vehicles for company
      result = await predictiveMaintenanceService.analyzeFleetMaintenance(companyId);
    }
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Predictive maintenance analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze maintenance needs',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/ai/predictive-maintenance/analytics/:companyId
 * @desc Get maintenance analytics and insights
 * @access Private
 */
router.get('/predictive-maintenance/analytics/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { startDate, endDate } = req.query;
    
    const dateRange = {
      start: startDate ? new Date(startDate as string) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate as string) : new Date()
    };
    
    const analytics = await predictiveMaintenanceService.getMaintenanceAnalytics(
      parseInt(companyId),
      dateRange
    );
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Maintenance analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to get maintenance analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/ai/route-optimization
 * @desc Optimize route for a specific request
 * @access Private
 */
router.post('/route-optimization', async (req, res) => {
  try {
    const optimizationRequest = req.body;
    
    // Validate required fields
    const requiredFields = ['origin', 'destination', 'vehicleSpecs', 'driverHOS'];
    for (const field of requiredFields) {
      if (!optimizationRequest[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }
    
    const result = await routeOptimizationService.optimizeRoute(optimizationRequest);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Route optimization error:', error);
    res.status(500).json({ 
      error: 'Failed to optimize route',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/ai/route-optimization/analytics/:companyId
 * @desc Get route optimization analytics
 * @access Private
 */
router.get('/route-optimization/analytics/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { startDate, endDate } = req.query;
    
    const dateRange = {
      start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate as string) : new Date()
    };
    
    const analytics = await routeOptimizationService.getRouteAnalytics(
      parseInt(companyId),
      dateRange
    );
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Route analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to get route analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/ai/driver-safety
 * @desc Analyze driver safety and compliance
 * @access Private
 */
router.post('/driver-safety', async (req, res) => {
  try {
    const { companyId } = req.body;
    
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }
    
    const result = await driverSafetyService.analyzeDriverSafety(companyId);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Driver safety analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze driver safety',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/ai/driver-safety/analytics/:companyId
 * @desc Get driver safety analytics
 * @access Private
 */
router.get('/driver-safety/analytics/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { startDate, endDate } = req.query;
    
    const dateRange = {
      start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate as string) : new Date()
    };
    
    const analytics = await driverSafetyService.getDriverSafetyAnalytics(
      parseInt(companyId),
      dateRange
    );
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Driver safety analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to get driver safety analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/ai/dynamic-pricing
 * @desc Generate dynamic pricing recommendation
 * @access Private
 */
router.post('/dynamic-pricing', async (req, res) => {
  try {
    const { loadCharacteristics, companyId } = req.body;
    
    if (!loadCharacteristics || !companyId) {
      return res.status(400).json({ error: 'Load characteristics and company ID are required' });
    }
    
    // Validate load characteristics
    const requiredFields = ['origin', 'destination', 'distance', 'weight', 'equipmentType', 'serviceLevel', 'pickupDate', 'deliveryDate', 'customerTier', 'urgency'];
    for (const field of requiredFields) {
      if (!loadCharacteristics[field]) {
        return res.status(400).json({ error: `Load characteristic '${field}' is required` });
      }
    }
    
    // Convert date strings to Date objects
    loadCharacteristics.pickupDate = new Date(loadCharacteristics.pickupDate);
    loadCharacteristics.deliveryDate = new Date(loadCharacteristics.deliveryDate);
    
    const result = await dynamicPricingService.generatePricingRecommendation(
      loadCharacteristics,
      companyId
    );
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dynamic pricing error:', error);
    res.status(500).json({ 
      error: 'Failed to generate pricing recommendation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/ai/dynamic-pricing/market-intelligence/:companyId
 * @desc Get market intelligence and pricing analytics
 * @access Private
 */
router.get('/dynamic-pricing/market-intelligence/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const marketIntelligence = await dynamicPricingService.getMarketIntelligence(
      parseInt(companyId)
    );
    
    res.json({
      success: true,
      data: marketIntelligence,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Market intelligence error:', error);
    res.status(500).json({ 
      error: 'Failed to get market intelligence',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/ai/dynamic-pricing/analytics/:companyId
 * @desc Get pricing analytics
 * @access Private
 */
router.get('/dynamic-pricing/analytics/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { startDate, endDate } = req.query;
    
    const dateRange = {
      start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate as string) : new Date()
    };
    
    const analytics = await dynamicPricingService.getPricingAnalytics(
      parseInt(companyId),
      dateRange
    );
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Pricing analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to get pricing analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/ai/dashboard
 * @desc Get comprehensive AI dashboard data (default company)
 * @access Private
 */
router.get('/dashboard', async (req, res) => {
  try {
    // Return comprehensive realistic data for demo
    const dashboardData = {
      predictiveMaintenance: {
        vehiclesMonitored: 48,
        alertsGenerated: 15,
        downtimePrevented: 92,
        costSavings: 145000,
        riskScore: 18
      },
      routeOptimization: {
        routesOptimized: 189,
        fuelSaved: 2890,
        timeSaved: 112,
        costReduction: 18.7,
        efficiency: 94
      },
      driverSafety: {
        driversMonitored: 85,
        safetyScore: 91,
        incidentsReduced: 42,
        complianceRate: 98,
        trainingRecommendations: 6
      },
      dynamicPricing: {
        loadsAnalyzed: 312,
        profitIncrease: 11.2,
        marketPosition: 88,
        pricingAccuracy: 96,
        revenueOptimization: 15.8
      },
      alerts: [
        {
          id: '1',
          vehicleId: 'TRK-001',
          component: 'Engine',
          severity: 'high',
          prediction: 'Oil pressure sensor failure predicted',
          confidence: 89,
          estimatedFailureDate: '2024-02-15',
          recommendedAction: 'Schedule maintenance within 7 days'
        },
        {
          id: '2',
          vehicleId: 'TRK-003',
          component: 'Brakes',
          severity: 'medium',
          prediction: 'Brake pad wear approaching limit',
          confidence: 76,
          estimatedFailureDate: '2024-03-01',
          recommendedAction: 'Inspect brake pads within 2 weeks'
        },
        {
          id: '3',
          vehicleId: 'TRK-007',
          component: 'Transmission',
          severity: 'critical',
          prediction: 'Transmission overheating detected',
          confidence: 94,
          estimatedFailureDate: '2024-02-08',
          recommendedAction: 'Immediate inspection required'
        }
      ],
      routeOptimizations: [
        {
          id: '1',
          routeId: 'RT-001',
          origin: 'Los Angeles, CA',
          destination: 'Phoenix, AZ',
          originalDistance: 385,
          optimizedDistance: 362,
          fuelSavings: 45,
          timeSavings: 32,
          costSavings: 180
        },
        {
          id: '2',
          routeId: 'RT-002',
          origin: 'Dallas, TX',
          destination: 'Houston, TX',
          originalDistance: 245,
          optimizedDistance: 231,
          fuelSavings: 28,
          timeSavings: 18,
          costSavings: 95
        },
        {
          id: '3',
          routeId: 'RT-003',
          origin: 'Chicago, IL',
          destination: 'Detroit, MI',
          originalDistance: 285,
          optimizedDistance: 267,
          fuelSavings: 35,
          timeSavings: 25,
          costSavings: 125
        }
      ],
      safetyInsights: [
        {
          id: '1',
          driverId: 'DRV-001',
          driverName: 'John Smith',
          safetyScore: 92,
          riskFactors: ['Hard braking events', 'Late night driving'],
          recommendations: ['Defensive driving course', 'Rest schedule optimization'],
          lastIncident: '2024-01-15'
        },
        {
          id: '2',
          driverId: 'DRV-005',
          driverName: 'Maria Garcia',
          safetyScore: 88,
          riskFactors: ['Speed variance', 'Weather conditions'],
          recommendations: ['Weather driving training', 'Speed management coaching'],
          lastIncident: '2024-01-08'
        },
        {
          id: '3',
          driverId: 'DRV-012',
          driverName: 'Robert Johnson',
          safetyScore: 95,
          riskFactors: ['None identified'],
          recommendations: ['Continue excellent performance'],
          lastIncident: 'None'
        }
      ],
      pricingRecommendations: [
        {
          id: '1',
          loadId: 'LD-001',
          route: 'LA to Phoenix',
          currentPrice: 2500,
          recommendedPrice: 2750,
          confidence: 87,
          marketPosition: 'competitive',
          factors: ['High demand corridor', 'Fuel price increase', 'Limited capacity']
        },
        {
          id: '2',
          loadId: 'LD-002',
          route: 'Dallas to Houston',
          currentPrice: 1800,
          recommendedPrice: 1950,
          confidence: 92,
          marketPosition: 'premium',
          factors: ['Peak season', 'Express delivery', 'Specialized equipment']
        },
        {
          id: '3',
          loadId: 'LD-003',
          route: 'Chicago to Detroit',
          currentPrice: 1200,
          recommendedPrice: 1350,
          confidence: 85,
          marketPosition: 'competitive',
          factors: ['Manufacturing demand', 'Short haul premium', 'Return load availability']
        }
      ]
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error('AI dashboard error:', error);
    res.status(500).json({ 
      error: 'Failed to get AI dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/ai/dashboard/:companyId
 * @desc Get comprehensive AI dashboard data for specific company
 * @access Private
 */
router.get('/dashboard/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const companyIdInt = companyId ? parseInt(companyId) : 1; // Default to company 1 for demo
    
    // Get data from all AI services in parallel
    const [maintenanceData, safetyData, marketIntelligence] = await Promise.all([
      predictiveMaintenanceService.analyzeFleetMaintenance(companyIdInt),
      driverSafetyService.analyzeDriverSafety(companyIdInt),
      dynamicPricingService.getMarketIntelligence(companyIdInt)
    ]);
    
    // Calculate key metrics
    const totalVehicles = maintenanceData.vehicleAnalysis.length;
    const highRiskVehicles = maintenanceData.vehicleAnalysis.filter(v => v.riskLevel === 'high' || v.riskLevel === 'critical').length;
    const totalDrivers = safetyData.safetyScores.length;
    const highRiskDrivers = safetyData.safetyScores.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length;
    const averageSafetyScore = safetyData.safetyScores.reduce((sum, s) => sum + s.overallScore, 0) / totalDrivers || 0;
    
    // Calculate potential savings
    const maintenanceSavings = maintenanceData.fleetMetrics.estimatedSavings;
    const insuranceSavings = safetyData.companyMetrics.estimatedInsuranceSavings;
    const totalSavings = maintenanceSavings + insuranceSavings;
    
    const dashboardData = {
      overview: {
        totalVehicles,
        highRiskVehicles,
        totalDrivers,
        highRiskDrivers,
        averageSafetyScore: Math.round(averageSafetyScore),
        totalPotentialSavings: Math.round(totalSavings),
        complianceRate: safetyData.companyMetrics.complianceRate
      },
      maintenance: {
        upcomingMaintenance: maintenanceData.maintenancePredictions.filter(p => 
          new Date(p.predictedDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        ).length,
        criticalAlerts: maintenanceData.maintenancePredictions.filter(p => p.severity === 'critical').length,
        estimatedSavings: maintenanceSavings,
        topRecommendations: maintenanceData.fleetMetrics.recommendations.slice(0, 3)
      },
      safety: {
        totalIncidents: safetyData.incidents.length,
        hosViolations: safetyData.hosViolations.length,
        trainingNeeded: safetyData.trainingRecommendations.filter(t => t.priority === 'high' || t.priority === 'urgent').length,
        estimatedInsuranceSavings: insuranceSavings,
        topConcerns: safetyData.companyMetrics.recommendations.slice(0, 3)
      },
      pricing: {
        activeLanes: marketIntelligence.laneAnalysis.length,
        pricingOpportunities: marketIntelligence.pricingOpportunities.length,
        topOpportunities: marketIntelligence.pricingOpportunities.slice(0, 3),
        marketTrends: 'Stable demand with seasonal uptick expected'
      },
      alerts: [
        ...maintenanceData.maintenancePredictions
          .filter(p => p.severity === 'critical')
          .slice(0, 3)
          .map(p => ({
            type: 'maintenance',
            severity: 'critical',
            message: `${p.component} failure predicted for Vehicle ${p.vehicleId}`,
            action: 'Schedule immediate inspection'
          })),
        ...safetyData.safetyScores
          .filter(s => s.riskLevel === 'critical')
          .slice(0, 2)
          .map(s => ({
            type: 'safety',
            severity: 'critical',
            message: `Driver ${s.driverId} has critical safety score: ${s.overallScore}`,
            action: 'Immediate coaching required'
          })),
        ...marketIntelligence.pricingOpportunities
          .filter(o => o.riskLevel === 'low')
          .slice(0, 2)
          .map(o => ({
            type: 'pricing',
            severity: 'info',
            message: o.opportunity,
            action: `Consider ${(o.potentialIncrease * 100).toFixed(1)}% rate increase`
          }))
      ]
    };
    
    res.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI dashboard error:', error);
    res.status(500).json({ 
      error: 'Failed to get AI dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/ai/health
 * @desc Health check for AI services
 * @access Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI services are operational',
    services: {
      predictiveMaintenance: 'active',
      routeOptimization: 'active',
      driverSafety: 'active',
      dynamicPricing: 'active'
    },
    timestamp: new Date().toISOString()
  });
});

export default router;