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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _supabase = await createClient();

  // Get user data
  const {
    data: { _user },
  } = await supabase.auth.getUser();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user?.id)
    .single();

  // Get company data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _data: companyData } = await supabase
    .from('companies')
    .select('name')
    .eq('id', userData?.company_id)
    .single();

  // Get counts for summary
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _data: vehicleCount } = await supabase
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', userData?.company_id);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _data: driverCount } = await supabase
    .from('drivers')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', userData?.company_id);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _data: weightCount } = await supabase
    .from('weights')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', userData?.company_id);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _data: loadCount } = await supabase
    .from('loads')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', userData?.company_id);

  // Get non-compliant weights count
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _data: nonCompliantCount } = await supabase
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
