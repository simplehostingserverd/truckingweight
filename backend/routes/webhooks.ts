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

import express from 'express';
import {
  getWebhookSubscriptions,
  getWebhookSubscription,
  createWebhookSubscription,
  updateWebhookSubscription,
  deleteWebhookSubscription,
  regenerateWebhookSecret,
} from '../controllers/webhooks';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Webhook subscription routes
router.get('/', getWebhookSubscriptions);
router.get('/:id', getWebhookSubscription);
router.post('/', createWebhookSubscription);
router.put('/:id', updateWebhookSubscription);
router.delete('/:id', deleteWebhookSubscription);
router.post('/:id/regenerate-secret', regenerateWebhookSecret);

export default router;
