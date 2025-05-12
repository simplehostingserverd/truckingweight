'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CityDashboardHeader from '@/components/CityDashboard/CityDashboardHeader';
import CityDashboardSidebar from '@/components/CityDashboard/CityDashboardSidebar';

export default function CityDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated as a city user
    const cityToken = localStorage.getItem('cityToken');
    const cityUser = localStorage.getItem('cityUser');

    if (!cityToken || !cityUser) {
      router.push('/city/login');
      return;
    }

    // Parse user data
    try {
      const parsedUserData = JSON.parse(cityUser);
      setUserData(parsedUserData);
    } catch (error) {
      console.error('Error parsing city user data:', error);
      localStorage.removeItem('cityToken');
      localStorage.removeItem('cityUser');
      router.push('/city/login');
      return;
    }

    // Verify token with backend
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
        localStorage.removeItem('cityToken');
        localStorage.removeItem('cityUser');
        router.push('/city/login');
      }
    };

    verifyToken();
  }, [router]);

  if (isLoading) {
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
}
