/**
 * Toll Management Routes
 * REST API endpoints for toll provider integration and management
 */

import express from 'express';
import {
  // Provider management
  getTollProviders,
  getTollProvider,
  
  // Account management
  getCompanyTollAccounts,
  getCompanyTollAccount,
  createCompanyTollAccount,
  updateCompanyTollAccount,
  deleteCompanyTollAccount,
  syncTollAccount,
  
  // Vehicle transponder management
  getVehicleTransponders,
  assignTransponder,
  updateTransponder,
  removeTransponder,
  
  // Route and toll calculation
  calculateRouteTolls,
  saveRouteEstimate,
  getRouteEstimates,
  
  // Transaction management
  getTollTransactions,
  getTollTransaction,
  syncTransactions,
  
  // Reporting and analytics
  getTollSummary,
  getTollReports,
  
  // Provider testing and validation
  testProviderConnection,
  validateProviderCredentials,
} from '../controllers/tollController';

import { protect } from '../middleware/authMiddleware';
import { setCompanyContextMiddleware } from '../middleware/companyContext';

const router = express.Router();

// Apply middleware to all routes
router.use(protect);
router.use(setCompanyContextMiddleware);

// ===== TOLL PROVIDER ROUTES =====
/**
 * @route   GET /api/toll/providers
 * @desc    Get all available toll providers
 * @access  Private
 */
router.get('/providers', getTollProviders);

/**
 * @route   GET /api/toll/providers/:providerId
 * @desc    Get specific toll provider information
 * @access  Private
 */
router.get('/providers/:providerId', getTollProvider);

/**
 * @route   POST /api/toll/providers/:providerId/test
 * @desc    Test connection to toll provider
 * @access  Private
 */
router.post('/providers/:providerId/test', testProviderConnection);

/**
 * @route   POST /api/toll/providers/:providerId/validate
 * @desc    Validate toll provider credentials
 * @access  Private
 */
router.post('/providers/:providerId/validate', validateProviderCredentials);

// ===== COMPANY TOLL ACCOUNT ROUTES =====
/**
 * @route   GET /api/toll/accounts
 * @desc    Get all company toll accounts
 * @access  Private
 */
router.get('/accounts', getCompanyTollAccounts);

/**
 * @route   GET /api/toll/accounts/:accountId
 * @desc    Get specific company toll account
 * @access  Private
 */
router.get('/accounts/:accountId', getCompanyTollAccount);

/**
 * @route   POST /api/toll/accounts
 * @desc    Create new company toll account
 * @access  Private
 */
router.post('/accounts', createCompanyTollAccount);

/**
 * @route   PUT /api/toll/accounts/:accountId
 * @desc    Update company toll account
 * @access  Private
 */
router.put('/accounts/:accountId', updateCompanyTollAccount);

/**
 * @route   DELETE /api/toll/accounts/:accountId
 * @desc    Delete company toll account
 * @access  Private
 */
router.delete('/accounts/:accountId', deleteCompanyTollAccount);

/**
 * @route   POST /api/toll/accounts/:accountId/sync
 * @desc    Sync toll account data from provider
 * @access  Private
 */
router.post('/accounts/:accountId/sync', syncTollAccount);

// ===== VEHICLE TRANSPONDER ROUTES =====
/**
 * @route   GET /api/toll/vehicles/:vehicleId/transponders
 * @desc    Get transponders for a vehicle
 * @access  Private
 */
router.get('/vehicles/:vehicleId/transponders', getVehicleTransponders);

/**
 * @route   POST /api/toll/vehicles/:vehicleId/transponders
 * @desc    Assign transponder to vehicle
 * @access  Private
 */
router.post('/vehicles/:vehicleId/transponders', assignTransponder);

/**
 * @route   PUT /api/toll/transponders/:transponderId
 * @desc    Update transponder information
 * @access  Private
 */
router.put('/transponders/:transponderId', updateTransponder);

/**
 * @route   DELETE /api/toll/transponders/:transponderId
 * @desc    Remove transponder from vehicle
 * @access  Private
 */
router.delete('/transponders/:transponderId', removeTransponder);

// ===== ROUTE CALCULATION ROUTES =====
/**
 * @route   POST /api/toll/routes/calculate
 * @desc    Calculate toll costs for a route
 * @access  Private
 */
router.post('/routes/calculate', calculateRouteTolls);

/**
 * @route   POST /api/toll/routes/estimates
 * @desc    Save route toll estimate
 * @access  Private
 */
router.post('/routes/estimates', saveRouteEstimate);

/**
 * @route   GET /api/toll/routes/estimates
 * @desc    Get saved route estimates
 * @access  Private
 */
router.get('/routes/estimates', getRouteEstimates);

// ===== TRANSACTION ROUTES =====
/**
 * @route   GET /api/toll/transactions
 * @desc    Get toll transactions
 * @access  Private
 */
router.get('/transactions', getTollTransactions);

/**
 * @route   GET /api/toll/transactions/:transactionId
 * @desc    Get specific toll transaction
 * @access  Private
 */
router.get('/transactions/:transactionId', getTollTransaction);

/**
 * @route   POST /api/toll/transactions/sync
 * @desc    Sync transactions from toll providers
 * @access  Private
 */
router.post('/transactions/sync', syncTransactions);

// ===== REPORTING ROUTES =====
/**
 * @route   GET /api/toll/summary
 * @desc    Get toll cost summary
 * @access  Private
 */
router.get('/summary', getTollSummary);

/**
 * @route   GET /api/toll/reports
 * @desc    Get toll reports
 * @access  Private
 */
router.get('/reports', getTollReports);

export default router;
