/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * 
 * This file contains proprietary and confidential information of 
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */


/**
 * Dashboard routes
 * These routes provide data for the dashboard components
 */

import express from 'express';
import * as dashboardController from '../controllers/dashboard';
import auth from '../middleware/auth';

const router = express.Router();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard stats (vehicle count, driver count, etc.)
 * @access  Private
 */
router.get('/stats', auth, dashboardController.getDashboardStats);

/**
 * @route   GET /api/dashboard/recent-weights
 * @desc    Get recent weight measurements
 * @access  Private
 */
router.get('/recent-weights', auth, dashboardController.getRecentWeights);

/**
 * @route   GET /api/dashboard/compliance
 * @desc    Get compliance data for chart
 * @access  Private
 */
router.get('/compliance', auth, dashboardController.getComplianceData);

/**
 * @route   GET /api/dashboard/vehicle-weights
 * @desc    Get vehicle weight distribution data for chart
 * @access  Private
 */
router.get('/vehicle-weights', auth, dashboardController.getVehicleWeightData);

/**
 * @route   GET /api/dashboard/load-status
 * @desc    Get load status distribution data for chart
 * @access  Private
 */
router.get('/load-status', auth, dashboardController.getLoadStatusData);

export default router;
