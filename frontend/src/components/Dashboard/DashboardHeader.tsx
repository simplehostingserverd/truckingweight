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

import React from 'react';
import MobileNav from '@/components/ui/MobileNav';
import { Database } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import { Menu, Transition } from '@headlessui/react';
import {
  ArrowRightOnRectangleIcon,
  BellIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentIcon,
  HomeIcon,
  PencilIcon,
  ScaleIcon,
  TruckIcon,
  UserGroupIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';

type User = Database['public']['Tables']['users']['Row'];

interface DashboardHeaderProps {
  user: User | null;
  isAdmin?: boolean;
}

export default function DashboardHeader({ user, isAdmin = false }: DashboardHeaderProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Set mounted state after hydration and check screen size
  useEffect(() => {
    setMounted(true);

    // Check if mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    // Initial check
    checkIfMobile();

    // Add resize listener
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleSignOut = async () => {
    try {
      // Sign out using Supabase Auth
      await supabase.auth.signOut();

      // Also clear local storage for backward compatibility
      localStorage.removeItem('cityToken');
      localStorage.removeItem('cityUser');

      // Redirect to login page
      router.push('/login');
      router.refresh(); // Important to refresh the router
    } catch (error) {
      console.error('Error signing out:', error);

      // Fallback to manual logout if Supabase Auth fails
      localStorage.removeItem('cityToken');
      localStorage.removeItem('cityUser');
      router.push('/login');
      router.refresh();
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Define navigation items for mobile menu
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Weights', href: '/weights', icon: ScaleIcon },
    { name: 'Weight Capture', href: '/weights/capture', icon: ScaleIcon },
    { name: 'Loads', href: '/loads', icon: TruckIcon },
    { name: 'Load Boards', href: '/load-boards', icon: TruckIcon },
    { name: 'Vehicles', href: '/vehicles', icon: TruckIcon },
    { name: 'Drivers', href: '/drivers', icon: UserGroupIcon },
    { name: 'Documents', href: '/documents', icon: DocumentIcon },
    { name: 'Signatures', href: '/signatures', icon: PencilIcon },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  ];

  // Filter admin navigation based on user type
  const getAdminNavigation = () => {
    const baseAdminNavigation = [
      { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
    ];

    // Super admin gets access to all features
    const superAdminNavigation = [
      { name: 'Users', href: '/admin/users', icon: UsersIcon },
      { name: 'Companies', href: '/admin/companies', icon: BuildingOfficeIcon },
      ...baseAdminNavigation,
    ];

    // Company admins are restricted from user management and company management
    const isCompanyAdmin = user?.is_admin && user?.company_id;
    
    return isCompanyAdmin ? baseAdminNavigation : superAdminNavigation;
  };

  const adminNavigation = getAdminNavigation();

  // Company-specific navigation for mobile
  const companyNavigation = [
    { name: 'Company Profile', href: '/company/profile', icon: BuildingOfficeIcon },
  ];

  return (
    <header className="bg-[#0A0A0A] border-b border-gray-800 z-10">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button - only render after hydration */}
            {mounted && isMobile && (
              <MobileNav
                navigation={navigation}
                adminNavigation={adminNavigation}
                companyNavigation={companyNavigation}
                isAdmin={isAdmin}
              />
            )}

            <div className="flex-shrink-0 flex items-center ml-2 lg:ml-0">
              <span className="text-xl font-bold text-white">CargoFlex</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Accessibility Settings Button - TODO: Create component */}
            {/* {mounted && <AccessibilityButton />} */}

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {mounted &&
                (theme === 'dark' ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                ))}
            </button>

            {/* Hide notifications on mobile */}
            <button
              type="button"
              className="hidden sm:flex p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none transition-colors duration-200 relative"
              aria-label="Notifications"
            >
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            <Menu as="div" className="relative">
              <div>
                <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || <UserIcon className="h-4 w-4" />}
                  </div>
                  <span className="hidden md:flex ml-2 text-sm font-medium text-white">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg py-1 bg-[#1A1A1A] border border-gray-800 focus:outline-none">
                  <div className="px-4 py-3 border-b border-gray-800">
                    <p className="text-sm font-semibold text-white">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate mt-1">{user?.email}</p>
                  </div>

                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="/profile"
                        className={`${
                          active ? 'bg-gray-800' : ''
                        } flex px-4 py-2 text-sm text-gray-300 transition-colors duration-150`}
                      >
                        <UserIcon className="mr-3 h-5 w-5 text-blue-500" />
                        Your Profile
                      </a>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="/settings"
                        className={`${
                          active ? 'bg-gray-800' : ''
                        } flex px-4 py-2 text-sm text-gray-300 transition-colors duration-150`}
                      >
                        <Cog6ToothIcon className="mr-3 h-5 w-5 text-blue-500" />
                        Settings
                      </a>
                    )}
                  </Menu.Item>

                  <div className="px-2 py-2 border-t border-gray-800">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className={`${
                            active ? 'bg-gray-800' : ''
                          } flex w-full px-4 py-2 text-sm text-gray-300 rounded-md transition-colors duration-150`}
                        >
                          <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-blue-500" />
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
}
