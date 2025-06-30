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

import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from './client';

export default async function Dashboard() {
  const supabase = createClient();

  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('name, is_admin, email')
    .eq('id', user?.id)
    .single();

  // Check if user is a driver by matching email
  const { data: driverData } = await supabase
    .from('drivers')
    .select('id, name, status')
    .eq('email', user.email)
    .eq('status', 'Active')
    .single();

  // If user is an active driver, redirect to driver dashboard
  if (driverData && !userData?.is_admin) {
    redirect('/driver-dashboard');
  }

  return (
    <DashboardClient userName={userData?.name || 'User'} isAdmin={userData?.is_admin || false} />
  );
}
