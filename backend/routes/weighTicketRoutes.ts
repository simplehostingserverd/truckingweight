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
 * Weigh Ticket Routes
 *
 * This file defines the API routes for weigh ticket management
 */

import express from 'express';
import {
  getWeighTickets,
  getWeighTicketById,
  createWeighTicket,
  updateWeighTicketById,
  processCameraScan,
  validateQRCode,
} from '../controllers/weighTicketController';
import { protect } from '../middleware/authMiddleware';
import { setCompanyContextMiddleware } from '../middleware/companyContext';

const router = express.Router();

// Apply middleware to all routes
router.use(protect);
router.use(setCompanyContextMiddleware);

// Weigh ticket management routes
router.route('/').get(getWeighTickets).post(createWeighTicket);

router.route('/:id').get(getWeighTicketById).put(updateWeighTicketById);

// Camera scan route
router.post('/camera-scan', processCameraScan);

// QR code validation route
router.post('/validate-qrcode', validateQRCode);

export default router;
