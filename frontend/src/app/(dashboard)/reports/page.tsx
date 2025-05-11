import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import ReportsClient from './client';

export default async function Reports() {
  // Await cookies to fix the "cookies() should be awaited" error
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

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
