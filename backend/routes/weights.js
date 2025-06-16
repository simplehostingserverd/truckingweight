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
const router = express.Router();
import { check } from 'express-validator';

// Import controllers
import weightController from '../controllers/weights.js';

// Import middleware
import auth from '../middleware/auth.js';

// @route   GET api/weights
// @desc    Get all weights for the company
// @access  Private
router.get('/', auth, weightController.getAllWeights);

// @route   GET api/weights/:id
// @desc    Get weight by ID
// @access  Private
router.get('/:id', auth, weightController.getWeightById);

// @route   POST api/weights
// @desc    Create a new weight entry
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('vehicle', 'Vehicle is required').not().isEmpty(),
      check('weight', 'Weight is required').not().isEmpty(),
      check('date', 'Date is required').not().isEmpty(),
      check('driver', 'Driver is required').not().isEmpty(),
    ],
  ],
  weightController.createWeight
);

// @route   PUT api/weights/:id
// @desc    Update a weight entry
// @access  Private
router.put('/:id', auth, weightController.updateWeight);

// @route   DELETE api/weights/:id
// @desc    Delete a weight entry
// @access  Private
router.delete('/:id', auth, weightController.deleteWeight);

export default router;
