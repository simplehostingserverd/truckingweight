import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import HomeClient from './home-client';

export default async function Home() {
  // Await cookies to fix the "cookies() should be awaited" error
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard');
  }

  // Fetch testimonials from the database
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .order('rating', { ascending: false })
    .limit(3);

  // Render the client component with the fetched data
  return <HomeClient testimonials={testimonials} />;
}
