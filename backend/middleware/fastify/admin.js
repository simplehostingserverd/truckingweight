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

// Admin middleware for Fastify
async function adminMiddleware(request, reply) {
  // Check if user is admin
  if (!request.user.isAdmin) {
    return reply.code(403).send({ msg: 'Access denied. Admin privileges required.' });
  }
}

export { adminMiddleware };

export default {
  adminMiddleware,
};
