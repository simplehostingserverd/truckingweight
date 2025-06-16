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

export default async function VehicleDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  // Safely convert the ID parameter to a string
  const id = toSearchParamString(params.id, '');

  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user?.id)
    .single();

  // Get vehicle data
  const { data: vehicle, error } = await supabase
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
    .eq('id', id)
    .eq('company_id', userData?.company_id)
    .single();

  if (error || !vehicle) {
    console.error('Error fetching vehicle:', error);
    notFound();
  }

  // Render the client component with the initial data
  return <VehicleDetailsClient id={id} initialData={vehicle} />;
}
