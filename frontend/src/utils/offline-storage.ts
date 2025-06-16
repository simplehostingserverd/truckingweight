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

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the database schema
interface TruckingDB extends DBSchema {
  weights: {
    key: string;
    value: {
      id: string;
      vehicle_id: string;
      driver_id: string;
      date: string;
      weight: number;
      location: string;
      notes?: string;
      synced: boolean;
      created_at: string;
      updated_at: string;
    };
    indexes: { 'by-date': string; 'by-synced': boolean };
  };
  loads: {
    key: string;
    value: {
      id: string;
      description: string;
      origin: string;
      destination: string;
      weight: number;
      status: string;
      vehicle_id?: string;
      driver_id?: string;
      synced: boolean;
      created_at: string;
      updated_at: string;
    };
    indexes: { 'by-status': string; 'by-synced': boolean };
  };
  sync_queue: {
    key: string;
    value: {
      id: string;
      table: string;
      action: 'create' | 'update' | 'delete';
      data: any /* @ts-ignore */;
      timestamp: number;
    };
  };
}

// Database version
const DB_VERSION = 1;
const DB_NAME = 'trucking-offline-db';

// Initialize the database
async function initDB(): Promise<IDBPDatabase<TruckingDB>> {
  return openDB<TruckingDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create weights store
      if (!db.objectStoreNames.contains('weights')) {
        const weightStore = db.createObjectStore('weights', { keyPath: 'id' });
        weightStore.createIndex('by-date', 'date');
        weightStore.createIndex('by-synced', 'synced');
      }

      // Create loads store
      if (!db.objectStoreNames.contains('loads')) {
        const loadStore = db.createObjectStore('loads', { keyPath: 'id' });
        loadStore.createIndex('by-status', 'status');
        loadStore.createIndex('by-synced', 'synced');
      }

      // Create sync queue store
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id' });
      }
    },
  });
}

// Get database instance (singleton)
let dbPromise: Promise<IDBPDatabase<TruckingDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<TruckingDB>> {
  if (!dbPromise) {
    dbPromise = initDB();
  }
  return dbPromise;
}

// Generic CRUD operations
export async function addItem<T extends keyof TruckingDB>(
  storeName: T,
  item: TruckingDB[T]['value']
): Promise<string> {
  const db = await getDB();
  const id = await db.add(storeName, item);
  return String(id);
}

export async function getItem<T extends keyof TruckingDB>(
  storeName: T,
  id: string
): Promise<TruckingDB[T]['value'] | undefined> {
  const db = await getDB();
  return db.get(storeName, id);
}

export async function updateItem<T extends keyof TruckingDB>(
  storeName: T,
  item: TruckingDB[T]['value']
): Promise<string> {
  const db = await getDB();
  const id = await db.put(storeName, item);
  return String(id);
}

export async function deleteItem<T extends keyof TruckingDB>(
  storeName: T,
  id: string
): Promise<void> {
  const db = await getDB();
  await db.delete(storeName, id);
}

export async function getAllItems<T extends keyof TruckingDB>(
  storeName: T
): Promise<TruckingDB[T]['value'][]> {
  const db = await getDB();
  return db.getAll(storeName);
}

// Sync-specific operations
export async function getUnsyncedItems<T extends 'weights' | 'loads'>(
  storeName: T
): Promise<TruckingDB[T]['value'][]> {
  const db = await getDB();
  const index = db.transaction(storeName).store.index('by-synced');
  return index.getAll(false);
}

export async function markAsSynced<T extends 'weights' | 'loads'>(
  storeName: T,
  id: string
): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(storeName, 'readwrite');
  const item = await tx.store.get(id);
  if (item) {
    item.synced = true;
    await tx.store.put(item);
  }
  await tx.done;
}

// Queue operations for offline actions
export async function addToSyncQueue(
  table: string,
  action: 'create' | 'update' | 'delete',
  data: any /* @ts-ignore */
): Promise<void> {
  const db = await getDB();
  const id = `${table}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  await db.add('sync_queue', {
    id,
    table,
    action,
    data,
    timestamp: Date.now(),
  });
}

export async function processSyncQueue(
  processFn: (item: TruckingDB['sync_queue']['value']) => Promise<boolean>
): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('sync_queue', 'readwrite');
  const items = await tx.store.getAll();

  for (const item of items) {
    const success = await processFn(item);
    if (success) {
      await tx.store.delete(item.id);
    }
  }

  await tx.done;
}

// Check if the browser supports IndexedDB
export function isIndexedDBSupported(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}
