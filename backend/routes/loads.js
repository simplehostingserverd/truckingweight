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
import loadController from '../controllers/loads.js';

// Import middleware
import auth from '../middleware/auth.js';

// @route   GET api/loads
// @desc    Get all loads for the company
// @access  Private
router.get('/', auth, loadController.getAllLoads);

// @route   GET api/loads/:id
// @desc    Get load by ID
// @access  Private
router.get('/:id', auth, loadController.getLoadById);

// @route   POST api/loads
// @desc    Create a new load
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('description', 'Description is required').not().isEmpty(),
      check('origin', 'Origin is required').not().isEmpty(),
      check('destination', 'Destination is required').not().isEmpty(),
      check('weight', 'Weight is required').not().isEmpty(),
      check('vehicle', 'Vehicle is required').not().isEmpty(),
    ],
  ],
  loadController.createLoad
);

// @route   PUT api/loads/:id
// @desc    Update a load
// @access  Private
router.put('/:id', auth, loadController.updateLoad);

// @route   DELETE api/loads/:id
// @desc    Delete a load
// @access  Private
router.delete('/:id', auth, loadController.deleteLoad);

export default router;
