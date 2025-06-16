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
import companyController from '../controllers/companies.js';

// Import middleware
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

// @route   GET api/companies
// @desc    Get all companies (admin only)
// @access  Private/Admin
router.get('/', [auth, admin], companyController.getAllCompanies);

// @route   GET api/companies/:id
// @desc    Get company by ID
// @access  Private
router.get('/:id', auth, companyController.getCompanyById);

// @route   POST api/companies
// @desc    Create a new company (admin only)
// @access  Private/Admin
router.post(
  '/',
  [
    auth,
    admin,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('address', 'Address is required').not().isEmpty(),
      check('contactEmail', 'Valid email is required').isEmail(),
      check('contactPhone', 'Phone number is required').not().isEmpty(),
    ],
  ],
  companyController.createCompany
);

// @route   PUT api/companies/:id
// @desc    Update a company
// @access  Private/Admin
router.put('/:id', [auth, admin], companyController.updateCompany);

// @route   DELETE api/companies/:id
// @desc    Delete a company
// @access  Private/Admin
router.delete('/:id', [auth, admin], companyController.deleteCompany);

export default router;
