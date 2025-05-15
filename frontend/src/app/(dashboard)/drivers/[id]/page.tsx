import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { toSearchParamString } from '@/utils/searchParams';
import DriverDetailsClient from './client';

export default async function DriverDetail({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
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

  // Get driver data
  const { data: driver, error } = await supabase
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
    .eq('id', id)
    .eq('company_id', userData?.company_id)
    .single();

  if (error || !driver) {
    console.error('Error fetching driver:', error);
    notFound();
  }

  // Render the client component with the initial data
  return <DriverDetailsClient id={id} initialData={driver} />;
}
