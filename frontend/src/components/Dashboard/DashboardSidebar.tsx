'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ScaleIcon,
  TruckIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UsersIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

// Define breakpoints directly to avoid using the hook
const BREAKPOINTS = {
  md: 768,
  lg: 1024,
  xl: 1280
};

interface SidebarProps {
  isAdmin: boolean;
}

export default function DashboardSidebar({ isAdmin }: SidebarProps) {
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

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Weights', href: '/weights', icon: ScaleIcon },
    { name: 'Loads', href: '/loads', icon: TruckIcon },
    { name: 'Vehicles', href: '/vehicles', icon: TruckIcon },
    { name: 'Drivers', href: '/drivers', icon: UserGroupIcon },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  ];

  const adminNavigation = [
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Companies', href: '/admin/companies', icon: BuildingOfficeIcon },
    { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  ];

  // Don't render sidebar on mobile as we use the mobile navigation instead
  // Also don't render until after client-side hydration
  if (!mounted || isMobile) {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 shadow-md transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
        "hidden md:flex" // Hide on mobile, show on tablet and up
      )}
    >
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center justify-between px-4 mb-5">
          {!collapsed && (
            <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
              TruckingSemis
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                pathname === item.href
                  ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
              )}
            >
              <item.icon
                className={cn(
                  pathname === item.href
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400',
                  'mr-3 flex-shrink-0 h-6 w-6'
                )}
                aria-hidden="true"
              />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {isAdmin && (
          <>
            <div className={cn(
              "px-3 mt-5 mb-2",
              collapsed ? "text-center" : ""
            )}>
              {!collapsed ? (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Admin
                </h3>
              ) : (
                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
              )}
            </div>
            <nav className="mt-1 flex-1 px-2 space-y-1">
              {adminNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    pathname === item.href
                      ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={cn(
                      pathname === item.href
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              ))}
            </nav>
          </>
        )}
      </div>
    </div>
  );
}
