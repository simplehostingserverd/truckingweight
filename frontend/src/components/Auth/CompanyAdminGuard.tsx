/*
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

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CompanyAdminGuardProps {
  children: React.ReactNode;
  user?: {
    id: string;
    company_id?: string;
    is_admin: boolean;
  };
  restrictedPaths?: string[];
}

const DEFAULT_RESTRICTED_PATHS = [
  '/admin/users',
  '/admin/companies', 
  '/city-weighing',
  '/city-dashboard'
];

export default function CompanyAdminGuard({ 
  children, 
  user, 
  restrictedPaths = DEFAULT_RESTRICTED_PATHS 
}: CompanyAdminGuardProps) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is a company admin (has admin privileges but is assigned to a company)
    const isCompanyAdmin = user?.is_admin && user?.company_id;
    
    if (isCompanyAdmin) {
      const currentPath = window.location.pathname;
      
      // Check if current path is restricted for company admins
      const isRestrictedPath = restrictedPaths.some(path => 
        currentPath.startsWith(path)
      );
      
      if (isRestrictedPath) {
        // Redirect to dashboard with error message
        router.push('/dashboard?error=access_denied');
        return;
      }
    }
  }, [user, restrictedPaths, router]);

  // Check if user is a company admin trying to access restricted content
  const isCompanyAdmin = user?.is_admin && user?.company_id;
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const isRestrictedPath = restrictedPaths.some(path => currentPath.startsWith(path));
  
  if (isCompanyAdmin && isRestrictedPath) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            Company administrators do not have access to this feature.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}