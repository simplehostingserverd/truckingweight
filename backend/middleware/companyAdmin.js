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
 * Company Admin Middleware
 * 
 * This middleware restricts company admin access to:
 * - City dashboards and city-related functionality
 * - User management (creating/editing users)
 * - Cross-company data access
 * 
 * Company admins can only access their own company's data
 */

export default function (req, res, next) {
  // Check if user exists and is authenticated
  if (!req.user) {
    return res.status(401).json({ msg: 'Authentication required' });
  }

  // Check if user is a company admin (has isAdmin but also has companyId)
  const isCompanyAdmin = req.user.isAdmin && req.user.companyId;
  const isSuperAdmin = req.user.isAdmin && !req.user.companyId;

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
      req.path.startsWith(path)
    );

    if (isRestrictedPath) {
      return res.status(403).json({ 
        msg: 'Access denied. Company administrators cannot access city dashboards or user management functionality.' 
      });
    }

    // Ensure company isolation - company admin can only access their own company data
    // This will be enforced by the companyContext middleware
    req.companyRestricted = true;
  }

  next();
}