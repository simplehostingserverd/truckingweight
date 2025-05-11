import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import DashboardClient from './client';

export default async function Dashboard() {
  // Await cookies to fix the "cookies() should be awaited" error
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Get minimal user data for initial rendering
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: userData } = await supabase
    .from('users')
    .select('name, is_admin')
    .eq('id', user?.id)
    .single();

  return (
    <DashboardClient userName={userData?.name || 'User'} isAdmin={userData?.is_admin || false} />
  );
}
