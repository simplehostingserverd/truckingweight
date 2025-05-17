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

import { useState, useEffect } from 'react';
import { syncAllData, hasPendingSync, setupAutoSync } from '../utils/sync-service';

export default function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [hasPending, setHasPending] = useState(false);

  // Check for pending sync on mount
  useEffect(() => {
    const checkPending = async () => {
      const pending = await hasPendingSync();
      setHasPending(pending);
    };

    checkPending();

    // Set up auto sync
    setupAutoSync();

    // Check for pending sync every minute
    const interval = setInterval(checkPending, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setSyncStatus('Syncing...');

    try {
      const result = await syncAllData();

      if (result.success) {
        setSyncStatus(result.message);
        setHasPending(false);
      } else {
        setSyncStatus(`Sync failed: ${result.message}`);
      }
    } catch (error) {
      setSyncStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSyncing(false);

      // Clear status after 5 seconds
      setTimeout(() => {
        setSyncStatus(null);
      }, 5000);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleSync}
        disabled={isSyncing || !hasPending}
        className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
          hasPending
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
        }`}
      >
        {isSyncing ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Syncing...</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{hasPending ? 'Sync Data' : 'No Data to Sync'}</span>
          </>
        )}
      </button>

      {syncStatus && (
        <div
          className={`mt-2 text-sm ${
            syncStatus.includes('failed') || syncStatus.includes('Error')
              ? 'text-red-600'
              : 'text-green-600'
          }`}
        >
          {syncStatus}
        </div>
      )}

      {hasPending && !isSyncing && (
        <div className="mt-2 text-sm text-amber-600">You have unsynchronized data</div>
      )}
    </div>
  );
}
