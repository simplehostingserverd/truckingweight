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


/**
 * Sync Service
 *
 * This service processes the sync queue and applies changes to the database.
 */

import supabase from '../config/supabase.js';
import logger from '../utils/logger.js';

/**
 * Process all pending sync queue items
 * @returns {Promise<{success: boolean, processed: number, failed: number}>}
 */
async function processSyncQueue() {
  try {
    logger.info('Processing sync queue...');

    // Get all pending sync queue items
    const { data: syncItems, error: syncError } = await supabase
      .from('sync_queue')
      .select('*')
      .eq('status', 'pending');

    if (syncError) {
      logger.error('Error fetching sync queue items:', syncError);
      return { success: false, processed: 0, failed: 0 };
    }

    logger.info(`Found ${syncItems.length} pending sync items`);

    let processed = 0;
    let failed = 0;

    // Process each sync item
    for (const item of syncItems) {
      logger.info(`Processing sync item: ${item.id}`);
      logger.info(`  Table: ${item.table_name}`);
      logger.info(`  Action: ${item.action}`);

      try {
        // Process based on action type
        switch (item.action) {
          case 'create':
            await processCreateAction(item);
            break;
          case 'update':
            await processUpdateAction(item);
            break;
          case 'delete':
            await processDeleteAction(item);
            break;
          default:
            logger.error(`Unknown action type: ${item.action}`);
            failed++;
            continue;
        }

        // Mark as processed
        const { error: updateError } = await supabase
          .from('sync_queue')
          .update({ status: 'processed' })
          .eq('id', item.id);

        if (updateError) {
          logger.error(`Error updating sync item status: ${updateError.message}`);
          failed++;
        } else {
          logger.info(`  Sync item ${item.id} processed successfully`);
          processed++;
        }
      } catch (error) {
        logger.error(`Error processing sync item ${item.id}:`, error);

        // Mark as failed
        const { error: updateError } = await supabase
          .from('sync_queue')
          .update({ status: 'failed' })
          .eq('id', item.id);

        if (updateError) {
          logger.error(`Error updating sync item status: ${updateError.message}`);
        }

        failed++;
      }
    }

    logger.info(`Sync queue processing completed. Processed: ${processed}, Failed: ${failed}`);
    return { success: true, processed, failed };
  } catch (error) {
    logger.error('Unexpected error processing sync queue:', error);
    return { success: false, processed: 0, failed: 0 };
  }
}

/**
 * Process create action
 * @param {Object} item Sync queue item
 */
async function processCreateAction(item) {
  logger.info(`  Processing CREATE action for ${item.table_name}`);

  // Add company_id to the data if not present
  const data = { ...item.data };
  if (!data.company_id) {
    data.company_id = item.company_id;
  }

  // Insert the data into the appropriate table
  const { error } = await supabase.from(item.table_name).insert([data]);

  if (error) {
    throw new Error(`Error creating record in ${item.table_name}: ${error.message}`);
  }

  logger.info(`  Record created in ${item.table_name}`);
}

/**
 * Process update action
 * @param {Object} item Sync queue item
 */
async function processUpdateAction(item) {
  logger.info(`  Processing UPDATE action for ${item.table_name}`);

  // Extract the ID from the data
  const { id, ...updateData } = item.data;

  if (!id) {
    throw new Error(`Missing ID for update action on ${item.table_name}`);
  }

  // Update the record
  const { error } = await supabase
    .from(item.table_name)
    .update(updateData)
    .eq('id', id)
    .eq('company_id', item.company_id);

  if (error) {
    throw new Error(`Error updating record in ${item.table_name}: ${error.message}`);
  }

  logger.info(`  Record updated in ${item.table_name}`);
}

/**
 * Process delete action
 * @param {Object} item Sync queue item
 */
async function processDeleteAction(item) {
  logger.info(`  Processing DELETE action for ${item.table_name}`);

  // Extract the ID from the data
  const { id } = item.data;

  if (!id) {
    throw new Error(`Missing ID for delete action on ${item.table_name}`);
  }

  // Delete the record
  const { error } = await supabase
    .from(item.table_name)
    .delete()
    .eq('id', id)
    .eq('company_id', item.company_id);

  if (error) {
    throw new Error(`Error deleting record in ${item.table_name}: ${error.message}`);
  }

  logger.info(`  Record deleted from ${item.table_name}`);
}

export { processSyncQueue };

export default {
  processSyncQueue,
};
