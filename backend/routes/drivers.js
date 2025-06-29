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
const router = express.Router();
import { check } from 'express-validator';

// Import controllers
import driverController from '../controllers/drivers.js';

// Import middleware
import auth from '../middleware/auth.js';

// @route   GET api/drivers
// @desc    Get all drivers for the company
// @access  Private
router.get('/', auth, driverController.getAllDrivers);

// @route   GET api/drivers/:id
// @desc    Get driver by ID
// @access  Private
router.get('/:id', auth, driverController.getDriverById);

// @route   POST api/drivers
// @desc    Create a new driver
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('license_number', 'License number is required').not().isEmpty(),
      check('license_expiry', 'License expiry date is required').isDate(),
    ],
  ],
  driverController.createDriver
);

// @route   PUT api/drivers/:id
// @desc    Update a driver
// @access  Private
router.put('/:id', auth, driverController.updateDriver);

// @route   DELETE api/drivers/:id
// @desc    Delete a driver
// @access  Private
router.delete('/:id', auth, driverController.deleteDriver);

export default router;
