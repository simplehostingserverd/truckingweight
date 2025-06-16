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
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ScaleIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UsersIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

// Define breakpoints directly to avoid using the hook
const BREAKPOINTS = {
  md: 768,
  lg: 1024,
  xl: 1280,
};

interface SidebarProps {
  role: string;
}

export default function CityDashboardSidebar({ role }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const pathname = usePathname();

  // Handle all responsive states in a single effect
  useEffect(() => {
    // Mark as mounted
    setMounted(true);

    // Function to check screen sizes
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < BREAKPOINTS.md);
      setIsTablet(width >= BREAKPOINTS.md && width < BREAKPOINTS.lg);
      setIsLargeScreen(width >= BREAKPOINTS.xl);

      // Set collapsed state based on screen size
      if (width >= BREAKPOINTS.md && width < BREAKPOINTS.lg) {
        setCollapsed(true);
      } else if (width >= BREAKPOINTS.xl) {
        setCollapsed(false);
      }
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Define navigation items based on user role
  const navigation = [
    {
      name: 'Dashboard',
      href: '/city/dashboard',
      icon: HomeIcon,
      roles: ['admin', 'operator', 'inspector', 'viewer'],
    },
    {
      name: 'Scales',
      href: '/city/scales',
      icon: ScaleIcon,
      roles: ['admin', 'operator', 'inspector', 'viewer'],
    },
    {
      name: 'Weighing',
      href: '/city/weighing',
      icon: ScaleIcon,
      roles: ['admin', 'operator', 'inspector'],
    },
    {
      name: 'Permits',
      href: '/city/permits',
      icon: DocumentTextIcon,
      roles: ['admin', 'operator', 'viewer'],
    },
    {
      name: 'Violations',
      href: '/city/violations',
      icon: ExclamationTriangleIcon,
      roles: ['admin', 'operator', 'inspector'],
    },
    {
      name: 'Revenue',
      href: '/city/revenue',
      icon: CurrencyDollarIcon,
      roles: ['admin', 'operator', 'viewer'],
    },
    {
      name: 'Reports',
      href: '/city/reports',
      icon: ChartBarIcon,
      roles: ['admin', 'operator', 'viewer'],
    },
    {
      name: 'Map',
      href: '/city/map',
      icon: MapPinIcon,
      roles: ['admin', 'operator', 'inspector', 'viewer'],
    },
  ];

  const adminNavigation = [
    { name: 'Users', href: '/city/users', icon: UsersIcon, roles: ['admin'] },
    { name: 'City Profile', href: '/city/profile', icon: BuildingOfficeIcon, roles: ['admin'] },
    { name: 'Settings', href: '/city/settings', icon: Cog6ToothIcon, roles: ['admin'] },
  ];

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(item => item.roles.includes(role));
  const filteredAdminNavigation = adminNavigation.filter(item => item.roles.includes(role));

  // Don't render sidebar on mobile as we use the mobile navigation instead
  // Also don't render until after client-side hydration
  if (!mounted || isMobile) {
    return null;
  }

  return (
    <div
      className={cn(
        'bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col',
        collapsed ? 'w-20' : 'w-64',
        'hidden md:flex' // Hide on mobile, show on tablet and up
      )}
    >
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center justify-between px-4 mb-6">
          {!collapsed && <div className="text-xl font-bold text-white">City Portal</div>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none transition-colors duration-200"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="px-3 mb-4">
          <div className="h-px bg-gray-800"></div>
        </div>

        <nav className="mt-2 flex-1 px-3 space-y-1">
          {filteredNavigation.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                  'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150'
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white',
                    'flex-shrink-0 h-5 w-5',
                    collapsed ? 'mx-auto' : 'mr-3'
                  )}
                  aria-hidden="true"
                />
                {!collapsed && <span>{item.name}</span>}
                {collapsed && <span className="sr-only">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {filteredAdminNavigation.length > 0 && (
          <>
            <div className="px-3 mt-6 mb-4">
              <div className="h-px bg-gray-800"></div>
              {!collapsed && (
                <h3 className="px-3 mt-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Administration
                </h3>
              )}
            </div>
            <nav className="mt-2 flex-1 px-3 space-y-1">
              {filteredAdminNavigation.map(item => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                      'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150'
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-white',
                        'flex-shrink-0 h-5 w-5',
                        collapsed ? 'mx-auto' : 'mr-3'
                      )}
                      aria-hidden="true"
                    />
                    {!collapsed && <span>{item.name}</span>}
                    {collapsed && <span className="sr-only">{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </>
        )}
      </div>
    </div>
  );
}
