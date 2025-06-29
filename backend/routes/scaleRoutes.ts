/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

/**
 * Scale Routes
 *
 * This file defines the API routes for scale management and weight capture
 */

import express from 'express';
import {
  getScales,
  getScaleById,
  createScale,
  updateScale,
  deleteScale,
  getReading,
  getScaleQRCode,
  validateQRCode,
  processCameraTicket,
  getHardwareOptions,
  configureHardware,
} from '../controllers/scaleController';
import { protect } from '../middleware/authMiddleware';
import { setCompanyContextMiddleware } from '../middleware/companyContext';

const router = express.Router();

// Apply middleware to all routes
router.use(protect);
router.use(setCompanyContextMiddleware);

// Scale management routes
router.route('/').get(getScales).post(createScale);

router.route('/:id').get(getScaleById).put(updateScale).delete(deleteScale);

// Scale reading route
router.get('/:id/reading', getReading);

// QR code routes
router.get('/:id/qrcode', getScaleQRCode);
router.post('/validate-qrcode', validateQRCode);

// Camera ticket processing route
router.post('/camera-ticket', processCameraTicket);

// IoT hardware integration routes
router.get('/hardware-options', getHardwareOptions);
router.post('/:id/configure-hardware', configureHardware);

export default router;
