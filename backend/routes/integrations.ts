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

import express from 'express';
import {
  getIntegrationConnections,
  getIntegrationConnection,
  createIntegrationConnection,
  updateIntegrationConnection,
  deleteIntegrationConnection,
} from '../controllers/integrations';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Integration connections routes
router.get('/', getIntegrationConnections);
router.get('/:id', getIntegrationConnection);
router.post('/', createIntegrationConnection);
router.put('/:id', updateIntegrationConnection);
router.delete('/:id', deleteIntegrationConnection);

export default router;
