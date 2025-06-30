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

  // If no driver record found, use mock data for demo purposes
  let finalDriverData = driverData;
  let finalCompanyData = null;

  if (error || !driverData) {
    console.log('Driver not found, using mock data for:', user.email);
    // Use mock driver data
    finalDriverData = {
      id: 999,
      name: user.user_metadata?.name || 'Demo Driver',
      status: 'Active',
      license_number: 'DEMO123456789',
      phone: '+1-555-0123',
      company_id: 1
    };
    
    // Use mock company data
    finalCompanyData = {
      id: 1,
      name: 'Demo Trucking Company'
    };
  } else {
    // Get company information for real driver
    const { data: companyData } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', driverData.company_id)
      .single();
    
    finalCompanyData = companyData;
  }

  return (
    <UnifiedDriverDashboard
      driverId={finalDriverData.id.toString()}
      driverName={finalDriverData.name}
      driverLicense={finalDriverData.license_number}
      driverPhone={finalDriverData.phone}
      companyName={finalCompanyData?.name || 'Unknown Company'}
      companyId={finalDriverData.company_id?.toString()}
    />
  );
}

export const metadata = {
  title: 'Driver Dashboard - CargoScalePro',
  description: 'Unified driver dashboard for CargoScalePro TMS',
};
