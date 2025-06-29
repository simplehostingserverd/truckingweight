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
import DashboardClient from './client';

export default async function Dashboard() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const supabase = createClient();

  // Get minimal user data for initial rendering
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: userData } = await supabase
    .from('users')
    .select('name, is_admin')
    .eq('id', user?.id)
    .single();

  return (
    <DashboardClient userName={userData?.name || 'User'} isAdmin={userData?.is_admin || false} />
  );
}
