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

import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import DashboardSidebar from '@/components/Dashboard/DashboardSidebar';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Accessibility component to skip to main content
function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md focus:outline-none"
    >
      Skip to content
    </a>
  );
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // If user is not logged in, redirect to login
  if (error || !user) {
    redirect('/login');
  }

  // Get user data with company information
  const { data: userData } = await supabase
    .from('users')
    .select('*, companies(*)')
    .eq('id', user.id)
    .single();

  return (
    <div className="flex h-screen bg-black text-white">
      <SkipToContent />
      <DashboardSidebar isAdmin={userData?.is_admin || false} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader user={userData} isAdmin={userData?.is_admin || false} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#121212]"
          aria-label="Main content"
        >
          <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
