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
 * Database connection utility for direct PostgreSQL connections
 * This module provides functions for connecting directly to the Supabase PostgreSQL database
 * when the Supabase client API is not sufficient for certain operations.
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get database connection strings from environment variables
const directConnectionUrl = process.env.DATABASE_URL;
const poolConnectionUrl = process.env.POOL_CONNECTION_URL;

// Create connection pools
let directPool = null;
let pooledPool = null;

/**
 * Initialize the direct database connection pool
 * @returns {Pool} PostgreSQL connection pool for direct database access
 */
const getDirectPool = () => {
  if (!directPool) {
    if (!directConnectionUrl) {
      console.error('Missing DATABASE_URL environment variable');
      process.exit(1);
    }

    directPool = new Pool({
      connectionString: directConnectionUrl,
      ssl: { rejectUnauthorized: false },
    });

    // Test the connection
    directPool.on('error', err => {
      console.error('Unexpected error on idle client', err);
      process.exit(1);
    });
  }

  return directPool;
};

/**
 * Initialize the connection pool using the session pooler
 * @returns {Pool} PostgreSQL connection pool using Supabase's connection pooler
 */
const getPooledPool = () => {
  if (!pooledPool) {
    if (!poolConnectionUrl) {
      console.error('Missing POOL_CONNECTION_URL environment variable');
      process.exit(1);
    }

    pooledPool = new Pool({
      connectionString: poolConnectionUrl,
      ssl: { rejectUnauthorized: false },
    });

    // Test the connection
    pooledPool.on('error', err => {
      console.error('Unexpected error on idle client', err);
      process.exit(1);
    });
  }

  return pooledPool;
};

/**
 * Execute a query using the direct connection
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
const queryDirect = async (text, params) => {
  const pool = getDirectPool();
  return pool.query(text, params);
};

/**
 * Execute a query using the pooled connection
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
const queryPooled = async (text, params) => {
  const pool = getPooledPool();
  return pool.query(text, params);
};

/**
 * Close all database connections
 * Should be called when the application is shutting down
 */
const closeConnections = async () => {
  if (directPool) {
    await directPool.end();
  }

  if (pooledPool) {
    await pooledPool.end();
  }
};

/**
 * Test database connection
 * @returns {Promise<Object>} Connection test result
 */
const testConnection = async () => {
  try {
    // Try to use the direct pool first
    const pool = directConnectionUrl ? getDirectPool() : getPooledPool();
    const result = await pool.query('SELECT version()');
    return {
      connected: true,
      version: result.rows[0].version,
    };
  } catch (err) {
    console.error('Database connection test failed:', err);
    throw err;
  }
};

export { getDirectPool, getPooledPool, queryDirect, queryPooled, closeConnections, testConnection };

export default {
  getDirectPool,
  getPooledPool,
  queryDirect,
  queryPooled,
  closeConnections,
  testConnection,
};
