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


import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function CityAuthLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is already logged in, redirect to appropriate dashboard
  if (user) {
    // Check if user has city_user metadata
    const userMetadata = user.user_metadata;

    if (userMetadata && userMetadata.user_type === 'city') {
      redirect('/city/dashboard');
    } else {
      redirect('/dashboard');
    }
  }

  return children;
}
