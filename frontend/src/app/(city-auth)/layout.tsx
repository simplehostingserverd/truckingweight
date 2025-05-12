import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function CityAuthLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is already logged in, redirect to appropriate dashboard
  if (user) {
    // Check if user has city_user metadata
    const userMetadata = user.user_metadata;

    if (userMetadata && userMetadata.user_type === 'city') {
      redirect('/city/dashboard');
    } else {
      redirect('/dashboard');
    }
  }

  return children;
}
