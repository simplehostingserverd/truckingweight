/*
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
import UnifiedDriverDashboard from '@/components/Dashboard/driver/UnifiedDriverDashboard';

export default async function DriverDashboardPage() {
  const supabase = createClient();

  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get driver data based on user email
  const { data: driverData, error } = await supabase
    .from('drivers')
    .select('id, name, status, license_number, phone, company_id')
    .eq('email', user.email)
    .eq('status', 'Active')
    .single();

  if (error || !driverData) {
    console.error('Driver not found or inactive:', error);
    redirect('/dashboard'); // Redirect to main dashboard if not a driver
  }

  // Get company information
  const { data: companyData } = await supabase
    .from('companies')
    .select('id, name')
    .eq('id', driverData.company_id)
    .single();

  return (
    <UnifiedDriverDashboard
      driverId={driverData.id.toString()}
      driverName={driverData.name}
      driverLicense={driverData.license_number}
      driverPhone={driverData.phone}
      companyName={companyData?.name || 'Unknown Company'}
      companyId={driverData.company_id?.toString()}
    />
  );
}

export const metadata = {
  title: 'Driver Dashboard - CargoScalePro',
  description: 'Unified driver dashboard for CargoScalePro TMS',
};
