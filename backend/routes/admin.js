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
import adminController from '../controllers/admin.js';

// Import middleware
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';
import companyAdmin from '../middleware/companyAdmin.js';

// @route   GET api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private/Admin
router.get('/dashboard', [auth, admin], adminController.getDashboardData);

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private/Super Admin Only (Company admins cannot access user management)
router.get('/users', [auth, admin, companyAdmin], adminController.getAllUsers);

// @route   POST api/admin/users
// @desc    Create a new user
// @access  Private/Super Admin Only (Company admins cannot create users)
router.post(
  '/users',
  [
    auth,
    admin,
    companyAdmin,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
      check('companyId', 'Company ID is required').not().isEmpty(),
      check('isAdmin', 'Admin status is required').isBoolean(),
    ],
  ],
  adminController.createUser
);

// @route   PUT api/admin/users/:id
// @desc    Update a user
// @access  Private/Super Admin Only (Company admins cannot update users)
router.put('/users/:id', [auth, admin, companyAdmin], adminController.updateUser);

// @route   DELETE api/admin/users/:id
// @desc    Delete a user
// @access  Private/Super Admin Only (Company admins cannot delete users)
router.delete('/users/:id', [auth, admin, companyAdmin], adminController.deleteUser);

// @route   GET api/admin/reports/weights
// @desc    Get weight reports
// @access  Private/Admin
router.get('/reports/weights', [auth, admin], adminController.getWeightReports);

// @route   GET api/admin/reports/loads
// @desc    Get load reports
// @access  Private/Admin
router.get('/reports/loads', [auth, admin], adminController.getLoadReports);

// @route   GET api/admin/reports/compliance
// @desc    Get compliance reports
// @access  Private/Admin
router.get('/reports/compliance', [auth, admin], adminController.getComplianceReports);

// @route   GET api/admin/export/:type
// @desc    Export data (CSV, PDF)
// @access  Private/Admin
router.get('/export/:type', [auth, admin], adminController.exportData);

export default router;
