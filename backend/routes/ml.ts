/**
 * Machine Learning Management API Routes
 * ML model management, predictions, and AI-powered insights
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { setCompanyContextMiddleware } from '../middleware/companyContext';
import { MLService } from '../services/ai/MLService';
import { ModelManagementService } from '../services/ml/ModelManagementService';
import prisma from '../config/prisma';
import { logger } from '../utils/logger';

const router = express.Router();
const mlService = new MLService();
const modelManagementService = new ModelManagementService();

// Apply middleware to all routes
router.use(protect);
router.use(setCompanyContextMiddleware);

/**
 * GET /api/ml/models
 * Get all ML models with filtering
 */
router.get('/models', async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    
    const whereClause: any = {
      company_id: req.user.companyId
    };

    if (type) {
      whereClause.model_type = type;
    }

    if (status) {
      whereClause.status = status;
    }

    const models = await prisma.ml_models.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    const totalCount = await prisma.ml_models.count({
      where: whereClause
    });

    res.json({
      models,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit as string))
      }
    });

  } catch (error) {
    logger.error('Error fetching ML models:', error);
    res.status(500).json({ message: 'Error fetching ML models' });
  }
});

/**
 * POST /api/ml/models
 * Deploy a new ML model
 */
router.post('/models', async (req, res) => {
  try {
    const {
      name,
      modelType,
      version,
      description,
      configuration,
      trainingData,
      features
    } = req.body;

    const model = await modelManagementService.deployModel({
      name,
      modelType,
      version,
      description,
      configuration,
      trainingData,
      features,
      companyId: req.user.companyId,
      deployedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      model
    });

  } catch (error) {
    logger.error('Error deploying ML model:', error);
    res.status(500).json({ message: 'Error deploying ML model' });
  }
});

/**
 * GET /api/ml/models/:id
 * Get a specific ML model by ID
 */
router.get('/models/:id', async (req, res) => {
  try {
    const modelId = parseInt(req.params.id);

    const model = await prisma.ml_models.findUnique({
      where: { id: modelId },
      include: {
        ml_predictions: {
          orderBy: { created_at: 'desc' },
          take: 100 // Recent predictions
        }
      }
    });

    if (!model || model.company_id !== req.user.companyId) {
      return res.status(404).json({ message: 'ML model not found' });
    }

    res.json(model);

  } catch (error) {
    logger.error('Error fetching ML model:', error);
    res.status(500).json({ message: 'Error fetching ML model' });
  }
});

/**
 * PUT /api/ml/models/:id
 * Update an ML model configuration
 */
router.put('/models/:id', async (req, res) => {
  try {
    const modelId = parseInt(req.params.id);
    const updateData = req.body;

    const model = await modelManagementService.updateModel(modelId, {
      ...updateData,
      companyId: req.user.companyId,
      updatedBy: req.user.id
    });

    res.json({
      success: true,
      model
    });

  } catch (error) {
    logger.error('Error updating ML model:', error);
    res.status(500).json({ message: 'Error updating ML model' });
  }
});

/**
 * POST /api/ml/models/:id/retrain
 * Retrain an ML model
 */
router.post('/models/:id/retrain', async (req, res) => {
  try {
    const modelId = parseInt(req.params.id);
    const { trainingData, configuration } = req.body;

    const result = await modelManagementService.retrainModel(modelId, {
      trainingData,
      configuration,
      companyId: req.user.companyId,
      retrainedBy: req.user.id
    });

    res.json({
      success: true,
      retraining: result
    });

  } catch (error) {
    logger.error('Error retraining ML model:', error);
    res.status(500).json({ message: 'Error retraining ML model' });
  }
});

/**
 * GET /api/ml/predictions
 * Get ML predictions with filtering
 */
router.get('/predictions', async (req, res) => {
  try {
    const { 
      modelId, 
      modelType, 
      startDate, 
      endDate, 
      status,
      page = 1, 
      limit = 50 
    } = req.query;
    
    const whereClause: any = {
      ml_models: {
        company_id: req.user.companyId
      }
    };

    if (modelId) {
      whereClause.model_id = parseInt(modelId as string);
    }

    if (modelType) {
      whereClause.ml_models = {
        ...whereClause.ml_models,
        model_type: modelType
      };
    }

    if (status) {
      whereClause.status = status;
    }

    if (startDate && endDate) {
      whereClause.created_at = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const predictions = await prisma.ml_predictions.findMany({
      where: whereClause,
      include: {
        ml_models: {
          select: {
            id: true,
            name: true,
            model_type: true,
            version: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    const totalCount = await prisma.ml_predictions.count({
      where: whereClause
    });

    res.json({
      predictions,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit as string))
      }
    });

  } catch (error) {
    logger.error('Error fetching ML predictions:', error);
    res.status(500).json({ message: 'Error fetching ML predictions' });
  }
});

/**
 * POST /api/ml/predict/eta
 * Generate ETA prediction
 */
router.post('/predict/eta', async (req, res) => {
  try {
    const {
      loadId,
      routeId,
      currentLocation,
      trafficConditions,
      weatherConditions
    } = req.body;

    const prediction = await mlService.predictETA({
      loadId,
      routeId,
      currentLocation,
      trafficConditions,
      weatherConditions
    });

    res.json({
      success: true,
      prediction
    });

  } catch (error) {
    logger.error('Error generating ETA prediction:', error);
    res.status(500).json({ message: 'Error generating ETA prediction' });
  }
});

/**
 * POST /api/ml/predict/pricing
 * Generate dynamic pricing prediction
 */
router.post('/predict/pricing', async (req, res) => {
  try {
    const {
      origin,
      destination,
      loadType,
      weight,
      pickupDate,
      equipmentType
    } = req.body;

    const pricing = await mlService.calculateDynamicPricing({
      origin,
      destination,
      loadType,
      weight,
      pickupDate: new Date(pickupDate),
      equipmentType
    });

    res.json({
      success: true,
      pricing
    });

  } catch (error) {
    logger.error('Error generating pricing prediction:', error);
    res.status(500).json({ message: 'Error generating pricing prediction' });
  }
});

/**
 * POST /api/ml/predict/maintenance
 * Generate maintenance prediction for a vehicle
 */
router.post('/predict/maintenance', async (req, res) => {
  try {
    const { vehicleId } = req.body;

    // Verify vehicle belongs to company
    const vehicle = await prisma.vehicles.findUnique({
      where: { id: vehicleId }
    });

    if (!vehicle || vehicle.company_id !== req.user.companyId) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const predictions = await mlService.predictMaintenance(vehicleId);

    res.json({
      success: true,
      predictions
    });

  } catch (error) {
    logger.error('Error generating maintenance prediction:', error);
    res.status(500).json({ message: 'Error generating maintenance prediction' });
  }
});

/**
 * GET /api/ml/metrics
 * Get ML performance metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysBack = parseInt(period as string);
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const companyId = req.user.companyId;

    // Model counts by status
    const modelCounts = await prisma.ml_models.groupBy({
      by: ['status'],
      where: { company_id: companyId },
      _count: { id: true }
    });

    // Prediction counts by model type
    const predictionCounts = await prisma.ml_predictions.groupBy({
      by: ['ml_models', 'model_type'],
      where: {
        ml_models: { company_id: companyId },
        created_at: { gte: startDate }
      },
      _count: { id: true }
    });

    // Calculate average accuracy
    const accuracyData = await prisma.ml_predictions.aggregate({
      where: {
        ml_models: { company_id: companyId },
        created_at: { gte: startDate },
        actual_outcome: { not: null }
      },
      _avg: { accuracy_score: true }
    });

    // Calculate total predictions
    const totalPredictions = await prisma.ml_predictions.count({
      where: {
        ml_models: { company_id: companyId },
        created_at: { gte: startDate }
      }
    });

    const metrics = {
      models: {
        total: modelCounts.reduce((sum, item) => sum + item._count.id, 0),
        byStatus: modelCounts.reduce((acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {} as Record<string, number>)
      },
      predictions: {
        total: totalPredictions,
        averageAccuracy: accuracyData._avg.accuracy_score || 0,
        byType: predictionCounts.reduce((acc, item) => {
          acc[item.ml_models.model_type] = item._count.id;
          return acc;
        }, {} as Record<string, number>)
      },
      period: `${daysBack} days`
    };

    res.json(metrics);

  } catch (error) {
    logger.error('Error fetching ML metrics:', error);
    res.status(500).json({ message: 'Error fetching ML metrics' });
  }
});

/**
 * GET /api/ml/insights
 * Get AI-powered business insights
 */
router.get('/insights', async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const insights = await modelManagementService.generateBusinessInsights(companyId);

    res.json(insights);

  } catch (error) {
    logger.error('Error generating ML insights:', error);
    res.status(500).json({ message: 'Error generating ML insights' });
  }
});

export default router;
