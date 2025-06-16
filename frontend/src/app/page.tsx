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
import { redirect } from 'next/navigation';
import HomeClient from './home-client';

export default async function Home() {
  const supabase = createClient();

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
