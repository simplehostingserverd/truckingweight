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

'use client';

// Global type declarations
declare const navigator: Navigator;

import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/utils/supabase/client';
import {
  addToSyncQueue,
  getUnsyncedItems,
  markAsSynced,
  processSyncQueue,
} from './offline-storage';

// Create Supabase client
const supabase = createClient();

/**
 * Sync all unsynced items to the server
 * @returns {Promise<{success: boolean, message: string}>} Result of the sync operation
 */
export async function syncAllData(): Promise<{ success: boolean; message: string }> {
  try {
    // Check if online
    if (!navigator.onLine) {
      return { success: false, message: 'Cannot sync while offline' };
    }

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, message: 'You must be logged in to sync data' };
    }

    // Get company ID from user metadata or from a separate query
    const { data: userData, error: profileError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (profileError || !userData) {
      return { success: false, message: 'Could not determine company ID' };
    }

    const companyId = userData.company_id;

    // Get unsynced weights
    const unsyncedWeights = await getUnsyncedItems('weights');
    console.log(`Found ${unsyncedWeights.length} unsynced weights`);

    // Get unsynced loads
    const unsyncedLoads = await getUnsyncedItems('loads');
    console.log(`Found ${unsyncedLoads.length} unsynced loads`);

    // Add weights to sync queue
    for (const weight of unsyncedWeights) {
      await addToSyncQueue('weights', 'create', {
        ...weight,
        company_id: companyId,
      });
    }

    // Add loads to sync queue
    for (const load of unsyncedLoads) {
      await addToSyncQueue('loads', 'create', {
        ...load,
        company_id: companyId,
      });
    }

    // Process sync queue
    let syncedCount = 0;
    await processSyncQueue(async item => {
      try {
        // Send to server
        const { error } = await supabase.from('sync_queue').insert([
          {
            id: uuidv4(),
            company_id: companyId,
            table_name: item.table,
            action: item.action,
            data: item.data,
            status: 'pending',
          },
        ]);

        if (error) {
          console.error('Error adding to server sync queue:', error);
          return false;
        }

        // Mark local item as synced
        if (item.table === 'weights' || item.table === 'loads') {
          const id = item.data.id;
          await markAsSynced(item.table, id);
        }

        syncedCount++;
        return true;
      } catch (error) {
        console.error('Error processing sync item:', error);
        return false;
      }
    });

    return {
      success: true,
      message: `Successfully synced ${syncedCount} items`,
    };
  } catch (error) {
    console.error('Error syncing data:', error);
    return {
      success: false,
      message: `Error syncing data: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Check if there are items that need to be synced
 * @returns {Promise<boolean>} True if there are items to sync
 */
export async function hasPendingSync(): Promise<boolean> {
  try {
    const unsyncedWeights = await getUnsyncedItems('weights');
    const unsyncedLoads = await getUnsyncedItems('loads');

    return unsyncedWeights.length > 0 || unsyncedLoads.length > 0;
  } catch (error) {
    console.error('Error checking for pending sync:', error);
    return false;
  }
}

/**
 * Set up automatic sync when coming back online
 */
export function setupAutoSync(): void {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', async () => {
      console.log('Back online, checking for data to sync...');
      const hasPending = await hasPendingSync();

      if (hasPending) {
        console.log('Found pending data to sync, syncing now...');
        const result = await syncAllData();
        console.log('Auto-sync result:', result);
      }
    });
  }
}
