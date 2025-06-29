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

/**
 * Company Admin Middleware for Fastify
 * 
 * This middleware restricts company admin access to:
 * - City dashboards and city-related functionality
 * - User management (creating/editing users)
 * - Cross-company data access
 * 
 * Company admins can only access their own company's data
 */

async function companyAdminMiddleware(request, reply) {
  // Check if user exists and is authenticated
  if (!request.user) {
    return reply.code(401).send({ msg: 'Authentication required' });
  }

  // Check if user is a company admin (has admin role but also has companyId)
  const isCompanyAdmin = request.user.role === 'admin' && request.user.companyId;
  const isSuperAdmin = request.user.role === 'admin' && !request.user.companyId;

  // If this is a company admin (not super admin), apply restrictions
  if (isCompanyAdmin) {
    const restrictedPaths = [
      // City-related endpoints
      '/api/city-dashboard',
      '/api/city-auth',
      '/api/city-users',
      '/api/city-permits',
      '/api/city-settings',
      
      // User management endpoints (company admins cannot manage users)
      '/api/admin/users',
      '/api/users',
      
      // Cross-company admin endpoints
      '/api/admin/companies',
      '/api/admin/settings'
    ];

    // Check if the current request path is restricted
    const isRestrictedPath = restrictedPaths.some(path => 
      request.url.startsWith(path)
    );

    if (isRestrictedPath) {
      return reply.code(403).send({ 
        msg: 'Access denied. Company administrators cannot access city dashboards or user management functionality.' 
      });
    }

    // Ensure company isolation - company admin can only access their own company data
    request.companyRestricted = true;
  }
}

// Export the middleware function
export { companyAdminMiddleware };