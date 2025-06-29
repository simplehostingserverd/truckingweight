/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

import * as pasetoService from '../../services/pasetoService.js';

// Auth middleware for Fastify
async function authMiddleware(request, reply) {
  // Get token from header
  const token = request.headers['x-auth-token'];

  // Check if no token
  if (!token) {
    return reply.code(401).send({ msg: 'No token, authorization denied' });
  }

  // Verify Paseto token
  try {
    const decoded = await pasetoService.decryptToken(token);

    if (!decoded) {
      return reply.code(401).send({ msg: 'Token is not valid or expired' });
    }

    request.user = decoded.user;
  } catch (err) {
    return reply.code(401).send({ msg: 'Token is not valid' });
  }
}

// City Admin middleware for Fastify
async function cityAdminMiddleware(request, reply) {
  // Check if user exists (should be set by authMiddleware)
  if (!request.user) {
    return reply.code(401).send({ msg: 'Authorization denied' });
  }

  // Check if user is a city admin
  if (request.user.role !== 'admin' || !request.user.city_id) {
    return reply.code(403).send({ msg: 'Access denied. City admin privileges required' });
  }
}

// Admin middleware for Fastify
async function adminMiddleware(request, reply) {
  // Check if user exists (should be set by authMiddleware)
  if (!request.user) {
    return reply.code(401).send({ msg: 'Authorization denied' });
  }

  // Check if user is an admin
  if (request.user.role !== 'admin') {
    return reply.code(403).send({ msg: 'Access denied. Admin privileges required' });
  }
}

export { authMiddleware, cityAdminMiddleware, adminMiddleware };

export default {
  authMiddleware,
  cityAdminMiddleware,
  adminMiddleware,
};
