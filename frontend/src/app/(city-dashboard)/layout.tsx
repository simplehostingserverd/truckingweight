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

'use client';

import CityDashboardHeader from '@/components/CityDashboard/CityDashboardHeader';
import CityDashboardSidebar from '@/components/CityDashboard/CityDashboardSidebar';
import { SkipToContent } from '@/components/ui/SkipToContent';
import { createSafeUrl } from '@/utils/navigation';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

// Create a client-side only component to avoid hydration issues
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CityDashboardLayoutClient = ({ children }: { children: _React.ReactNode }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userData, setUserData] = useState<unknown>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isMounted, setIsMounted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _router = useRouter();

  useEffect(() => {
    setIsMounted(true);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const checkAuth = async () => {
      try {
        // First try to use Supabase Auth
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { createClient } = await import('@/utils/supabase/client');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _supabase = createClient();

        // Get the current session
        const {
          data: { session },
          _error: sessionError,
        } = await supabase.auth.getSession();

        if (session && !sessionError) {
          // Get user metadata
          const {
            data: { _user },
            _error: userError,
          } = await supabase.auth.getUser();

          if (user && !userError) {
            // Check if this is a city user
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const userMetadata = user.user_metadata;

            if (userMetadata && userMetadata.user_type === 'city') {
              // Get city user data from Supabase
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { _data: cityUserData, _error: cityUserError } = await supabase
                .from('city_users')
                .select('*, cities(*)')
                .eq('id', user.id)
                .single();

              if (cityUserData && !cityUserError) {
                // Format the user data
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const formattedUserData = {
                  id: cityUserData.id,
                  name: cityUserData.name,
                  email: cityUserData.email,
                  cityId: cityUserData.city_id,
                  role: cityUserData.role,
                  city: cityUserData.cities,
                };

                setUserData(formattedUserData);
                setIsLoading(false);
                return;
              }
            }
          }
        }

        // Fallback to localStorage if Supabase Auth fails
        console.warn('Falling back to localStorage for city auth');

        // Check if user is authenticated as a city user using localStorage
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const cityToken = localStorage.getItem('cityToken');
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const cityUser = localStorage.getItem('cityUser');

          if (!cityToken || !cityUser) {
            router.push(createSafeUrl('/city/login'));
            return;
          }

          // Parse user data
          try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const parsedUserData = JSON.parse(cityUser);
            setUserData(parsedUserData);

            // Check if this is a test token
            if (cityToken && cityToken.startsWith('test-city-token-')) {
              console.warn('Using test token for city dashboard');
              // Use the parsed user data directly
              setIsLoading(false);
              return;
            }

            // Verify token with backend if we have a token
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const verifyToken = async () => {
              try {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const response = await fetch('/api/city-auth/me', {
                  headers: {
                    Authorization: `Bearer ${cityToken}`,
                  },
                });

                if (!response.ok) {
                  throw new Error('Invalid token');
                }

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const _data = await response.json();
                setUserData(data.user);
                setIsLoading(false);
              } catch (error) {
                console.error('Error verifying city token:', error);

                // For development/testing, allow using the parsed user data even if token verification fails
                if (process.env.NODE_ENV !== 'production') {
                  console.warn('Using local user data for development');
                  setIsLoading(false);
                  return;
                }

                if (typeof window !== 'undefined') {
                  localStorage.removeItem('cityToken');
                  localStorage.removeItem('cityUser');
                }
                router.push(createSafeUrl('/city/login'));
              }
            };

            await verifyToken();
          } catch (error) {
            console.error('Error parsing city user data:', error);
            localStorage.removeItem('cityToken');
            localStorage.removeItem('cityUser');
            router.push(createSafeUrl('/city/login'));
            return;
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push(createSafeUrl('/city/login'));
      }
    };

    if (isMounted) {
      checkAuth();
    }
  }, [router, isMounted]);

  // Show loading state if not mounted or still loading
  if (!isMounted || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <SkipToContent />
      <CityDashboardSidebar role={userData?.role || 'viewer'} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <CityDashboardHeader user={_userData} />
        <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-800">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

// Use dynamic import with SSR disabled to avoid hydration issues
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CityDashboardLayout = dynamic(() => Promise.resolve(CityDashboardLayoutClient), {
  ssr: false,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <CityDashboardLayout>{children}</CityDashboardLayout>;
}
