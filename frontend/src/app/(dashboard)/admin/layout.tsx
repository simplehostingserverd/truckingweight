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

import React from 'react';
import CompanyAdminGuard from '@/components/auth/CompanyAdminGuard';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // If user is not logged in, redirect to login
  if (error || !user) {
    redirect('/login');
  }

  // Get user data with company information
  const { data: userData } = await supabase
    .from('users')
    .select('*, companies(*)')
    .eq('id', user.id)
    .single();

  // If user is not an admin, redirect to dashboard
  if (!userData?.is_admin) {
    redirect('/dashboard');
  }

  return (
    <CompanyAdminGuard 
      user={userData}
      restrictedPaths={['/admin/users', '/admin/companies']}
    >
      {children}
    </CompanyAdminGuard>
  );
}