/**
 * Sync Routes
 *
 * This file defines the API routes for data synchronization
 */

import express from 'express';
import { processSyncQueue } from '../services/syncService.js';
import { protect } from '../middleware/authMiddleware.js';
import supabase from '../config/supabase.js';

const router = express.Router();

/**
 * @route   POST /api/sync/process
 * @desc    Process the sync queue
 * @access  Private
 */
router.post('/process', protect, async (req, res) => {
  try {
    const result = await processSyncQueue();

    if (result.success) {
      res.json({
        success: true,
        message: `Successfully processed ${result.processed} items (${result.failed} failed)`,
        processed: result.processed,
        failed: result.failed,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error processing sync queue',
        processed: result.processed,
        failed: result.failed,
      });
    }
  } catch (error) {
    console.error('Error in sync process route:', error);
    res.status(500).json({
      success: false,
      message: `Error: ${error.message}`,
      processed: 0,
      failed: 0,
    });
  }
});

/**
 * @route   GET /api/sync/status
 * @desc    Get sync queue status
 * @access  Private
 */
router.get('/status', protect, async (req, res) => {
  try {
    // Get company ID from authenticated user
    const companyId = req.user.company_id;

    // Get pending sync items count
    const { data: pendingItems, error: pendingError } = await supabase
      .from('sync_queue')
      .select('id')
      .eq('status', 'pending')
      .eq('company_id', companyId);

    if (pendingError) {
      throw new Error(`Error fetching pending items: ${pendingError.message}`);
    }

    // Get processed sync items count
    const { data: processedItems, error: processedError } = await supabase
      .from('sync_queue')
      .select('id')
      .eq('status', 'processed')
      .eq('company_id', companyId);

    if (processedError) {
      throw new Error(`Error fetching processed items: ${processedError.message}`);
    }

    // Get failed sync items count
    const { data: failedItems, error: failedError } = await supabase
      .from('sync_queue')
      .select('id')
      .eq('status', 'failed')
      .eq('company_id', companyId);

    if (failedError) {
      throw new Error(`Error fetching failed items: ${failedError.message}`);
    }

    res.json({
      success: true,
      pending: pendingItems.length,
      processed: processedItems.length,
      failed: failedItems.length,
    });
  } catch (error) {
    console.error('Error in sync status route:', error);
    res.status(500).json({
      success: false,
      message: `Error: ${error.message}`,
    });
  }
});

export default router;
