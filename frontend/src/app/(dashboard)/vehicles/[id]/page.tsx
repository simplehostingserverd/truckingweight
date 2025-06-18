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
import VehicleDetailsClient from './client';

export default async function VehicleDetail({ params }: { params: Promise<{ id: string }> }) {
  const supabase = createClient();
  // Await params before using its properties (Next.js 15 requirement)
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

  // Get vehicle data with better error handling
  let vehicleQuery = supabase
    .from('vehicles')
    .select(
      `
      *,
      weights:weights(
        id,
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
    vehicleQuery = vehicleQuery.eq('company_id', userData.company_id);
  }

  const { data: vehicle, error } = await vehicleQuery.single();

  if (error || !vehicle) {
    console.error('Error fetching vehicle:', error);
    console.log('Requested vehicle ID:', id);
    console.log('User company ID:', userData?.company_id);

    // Check if it's a "no rows" error vs other errors
    if (error?.code === 'PGRST116') {
      console.log('Vehicle not found - redirecting to 404');
    }

    notFound();
  }

  // Render the client component with the initial data
  return <VehicleDetailsClient id={id} initialData={vehicle} />;
}
