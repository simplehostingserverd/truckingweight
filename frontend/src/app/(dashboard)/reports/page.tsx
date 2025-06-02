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
import ReportsClient from './client';

export default async function Reports() {
  const supabase = await createClient();

  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user?.id)
    .single();

  // Get company data
  const { data: companyData } = await supabase
    .from('companies')
    .select('name')
    .eq('id', userData?.company_id)
    .single();

  // Get counts for summary
  const { data: vehicleCount } = await supabase
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', userData?.company_id);

  const { data: driverCount } = await supabase
    .from('drivers')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', userData?.company_id);

  const { data: weightCount } = await supabase
    .from('weights')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', userData?.company_id);

  const { data: loadCount } = await supabase
    .from('loads')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', userData?.company_id);

  // Get non-compliant weights count
  const { data: nonCompliantCount } = await supabase
    .from('weights')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', userData?.company_id)
    .eq('status', 'Non-Compliant');

  return (
    <ReportsClient
      companyName={companyData?.name || 'your company'}
      vehicleCount={vehicleCount?.count || 0}
      driverCount={driverCount?.count || 0}
      weightCount={weightCount?.count || 0}
      loadCount={loadCount?.count || 0}
      nonCompliantCount={nonCompliantCount?.count || 0}
      companyId={userData?.company_id}
    />
  );
}
