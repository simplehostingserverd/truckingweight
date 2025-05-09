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
  validateQRCode 
} from '../controllers/scaleController';
import { protect } from '../middleware/authMiddleware';
import { setCompanyContextMiddleware } from '../middleware/companyContext';

const router = express.Router();

// Apply middleware to all routes
router.use(protect);
router.use(setCompanyContextMiddleware);

// Scale management routes
router.route('/')
  .get(getScales)
  .post(createScale);

router.route('/:id')
  .get(getScaleById)
  .put(updateScale)
  .delete(deleteScale);

// Scale reading route
router.get('/:id/reading', getReading);

// QR code routes
router.get('/:id/qrcode', getScaleQRCode);
router.post('/validate-qrcode', validateQRCode);

export default router;
