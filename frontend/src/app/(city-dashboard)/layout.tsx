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

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import CityDashboardHeader from '@/components/CityDashboard/CityDashboardHeader';
import CityDashboardSidebar from '@/components/CityDashboard/CityDashboardSidebar';
import { createSafeUrl } from '@/utils/navigation';

// Create a client-side only component to avoid hydration issues
const CityDashboardLayoutClient = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    
    const checkAuth = async () => {
      try {
        // First try to use Supabase Auth
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session && !sessionError) {
          // Get user metadata
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (user && !userError) {
            // Check if this is a city user
            const userMetadata = user.user_metadata;
            
            if (userMetadata && userMetadata.user_type === 'city') {
              // Get city user data from Supabase
              const { data: cityUserData, error: cityUserError } = await supabase
                .from('city_users')
                .select('*, cities(*)')
                .eq('id', user.id)
                .single();
              
              if (cityUserData && !cityUserError) {
                // Format the user data
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
        console.log('Falling back to localStorage for city auth');
        
        // Check if user is authenticated as a city user using localStorage
        if (typeof window !== 'undefined') {
          const cityToken = localStorage.getItem('cityToken');
          const cityUser = localStorage.getItem('cityUser');

          if (!cityToken || !cityUser) {
            router.push(createSafeUrl('/city/login'));
            return;
          }

          // Parse user data
          try {
            const parsedUserData = JSON.parse(cityUser);
            setUserData(parsedUserData);
            
            // Check if this is a test token
            if (cityToken && cityToken.startsWith('test-city-token-')) {
              console.log('Using test token for city dashboard');
              // Use the parsed user data directly
              setIsLoading(false);
              return;
            }
            
            // Verify token with backend if we have a token
            const verifyToken = async () => {
              try {
                const response = await fetch('/api/city-auth/me', {
                  headers: {
                    Authorization: `Bearer ${cityToken}`,
                  },
                });

                if (!response.ok) {
                  throw new Error('Invalid token');
                }

                const data = await response.json();
                setUserData(data.user);
                setIsLoading(false);
              } catch (error) {
                console.error('Error verifying city token:', error);

                // For development/testing, allow using the parsed user data even if token verification fails
                if (process.env.NODE_ENV !== 'production') {
                  console.log('Using local user data for development');
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
      <CityDashboardSidebar role={userData?.role || 'viewer'} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <CityDashboardHeader user={userData} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-800">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

// Use dynamic import with SSR disabled to avoid hydration issues
const CityDashboardLayout = dynamic(() => Promise.resolve(CityDashboardLayoutClient), {
  ssr: false,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <CityDashboardLayout>{children}</CityDashboardLayout>;
}
