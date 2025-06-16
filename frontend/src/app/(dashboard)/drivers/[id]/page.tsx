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

import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { toSearchParamString } from '@/utils/searchParams';
import { notFound } from 'next/navigation';
import DriverDetailsClient from './client';

export default async function DriverDetail({ params }: { params: Promise<{ id: string }> }) {
  const supabase = createClient();
  // Await params in Next.js 15
  const resolvedParams = await params;
  // Safely convert the ID parameter to a string
  const id = toSearchParamString(resolvedParams.id, '');

  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user?.id)
    .single();

  // Get driver data
  let driverQuery = supabase
    .from('drivers')
    .select(
      `
      *,
      weights:weights(
        id,
        vehicle_id,
        weight,
        date,
        time,
        status
      ),
      loads:loads(
        id,
        description,
        origin,
        destination,
        status
      )
    `
    )
    .eq('id', id);

  // Only filter by company if user has a company_id (when RLS is enabled)
  if (userData?.company_id) {
    driverQuery = driverQuery.eq('company_id', userData.company_id);
  }

  const { data: driver, error } = await driverQuery.single();

  if (error || !driver) {
    console.error('Error fetching driver:', error);
    notFound();
  }

  // Render the client component with the initial data
  return <DriverDetailsClient id={id} initialData={driver} />;
}
