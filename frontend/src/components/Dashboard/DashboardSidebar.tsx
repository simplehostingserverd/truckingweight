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

import { cn } from '@/lib/utils';
import {
  ArrowsRightLeftIcon,
  BanknotesIcon,
  BeakerIcon,
  BuildingOfficeIcon,
  CameraIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  CpuChipIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DevicePhoneMobileIcon,
  DocumentIcon,
  DocumentTextIcon,
  HomeIcon,
  MapPinIcon,
  PencilIcon,
  PresentationChartLineIcon,
  ScaleIcon,
  ServerIcon,
  ShieldCheckIcon,
  SignalIcon,
  TruckIcon,
  UserGroupIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// Define breakpoints directly to avoid using the hook
const BREAKPOINTS = {
  md: 768,
  lg: 1024,
  xl: 1280,
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

  // Core Operations Navigation
  const coreNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Weights', href: '/weights', icon: ScaleIcon },
    { name: 'Weight Capture', href: '/weights/capture', icon: ScaleIcon },
    { name: 'Scales', href: '/scales', icon: ScaleIcon },
  ];

  // Fleet Management Navigation
  const fleetNavigation = [
    { name: 'Vehicles', href: '/vehicles', icon: TruckIcon },
    { name: 'Trailers', href: '/trailers', icon: TruckIcon },
    { name: 'Equipment', href: '/equipment', icon: WrenchScrewdriverIcon },
    { name: 'Drivers', href: '/drivers', icon: UserGroupIcon },
    { name: 'Driver Qualifications', href: '/driver-qualifications', icon: DocumentIcon },
    { name: 'Fleet Analytics', href: '/fleet-analytics', icon: ChartBarIcon },
    { name: 'Driver Tracking', href: '/driver-tracking', icon: MapPinIcon },
  ];

  // Dispatch & Load Management Navigation
  const dispatchNavigation = [
    { name: 'Dispatch Center', href: '/dispatch', icon: TruckIcon },
    { name: 'Loads', href: '/loads', icon: TruckIcon },
    { name: 'Load Boards', href: '/load-boards', icon: ClipboardDocumentListIcon },
    { name: 'Route Planning', href: '/routes', icon: MapPinIcon },
    { name: 'Customers', href: '/customers', icon: BuildingOfficeIcon },
  ];

  // Maintenance Navigation
  const maintenanceNavigation = [
    { name: 'Maintenance', href: '/maintenance', icon: WrenchScrewdriverIcon },
    { name: 'Work Orders', href: '/work-orders', icon: DocumentTextIcon },
    { name: 'Parts Inventory', href: '/parts', icon: Cog6ToothIcon },
    { name: 'Vendors', href: '/vendors', icon: BuildingOfficeIcon },
  ];

  // Financial Navigation
  const financialNavigation = [
    { name: 'Invoices', href: '/invoices', icon: DocumentTextIcon },
    { name: 'Payments', href: '/payments', icon: CreditCardIcon },
    { name: 'Fuel Management', href: '/fuel', icon: BanknotesIcon },
    { name: 'Toll Management', href: '/toll-management', icon: CurrencyDollarIcon },
    { name: 'Accounts Receivable', href: '/accounts-receivable', icon: CurrencyDollarIcon },
    { name: 'Financial Reports', href: '/financial-reports', icon: ChartBarIcon },
  ];

  // Technology Navigation
  const technologyNavigation = [
    { name: 'Telematics', href: '/telematics', icon: SignalIcon },
    { name: 'IoT Devices', href: '/iot-devices', icon: CpuChipIcon },
    { name: 'Sensor Monitoring', href: '/sensor-monitoring', icon: DevicePhoneMobileIcon },
    { name: 'LPR Cameras', href: '/lpr-cameras', icon: CameraIcon },
    { name: 'Documents', href: '/documents', icon: DocumentIcon },
    { name: 'Signatures', href: '/signatures', icon: PencilIcon },
  ];

  // Compliance & Safety Navigation
  const complianceNavigation = [
    { name: 'HOS Logs', href: '/hos-logs', icon: ClipboardDocumentListIcon },
    { name: 'DVIR Reports', href: '/dvir', icon: ShieldCheckIcon },
    { name: 'Safety Scores', href: '/safety', icon: ShieldCheckIcon },
    { name: 'Compliance Documents', href: '/compliance/documents', icon: DocumentTextIcon },
  ];

  // Analytics & Reports Navigation
  const analyticsNavigation = [
    { name: 'KPI Dashboard', href: '/kpi', icon: ChartBarIcon },
    { name: 'Advanced Analytics', href: '/analytics', icon: PresentationChartLineIcon },
    { name: 'Fleet Analytics', href: '/fleet-analytics', icon: TruckIcon },
    { name: 'Financial Reports', href: '/financial-reports', icon: CurrencyDollarIcon },
    { name: 'Reports', href: '/reports', icon: DocumentTextIcon },
  ];

  // Integration Navigation
  const integrationNavigation = [
    { name: 'EDI Integration', href: '/edi', icon: ArrowsRightLeftIcon },
    { name: 'Trading Partners', href: '/edi/partners', icon: BuildingOfficeIcon },
    { name: 'ERP Integration', href: '/erp', icon: ServerIcon },
    { name: 'AI/ML Models', href: '/ml', icon: BeakerIcon },
  ];

  const adminNavigation = [
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Companies', href: '/admin/companies', icon: BuildingOfficeIcon },
    { name: 'LPR Cameras', href: '/admin/lpr-cameras', icon: CameraIcon },
    { name: 'Storage Systems', href: '/admin/storage-systems', icon: ServerIcon },
    { name: 'City Dashboard', href: '/city-weighing', icon: MapPinIcon },
    { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  ];

  // Company-specific navigation
  const companyNavigation = [
    { name: 'Company Profile', href: '/company/profile', icon: BuildingOfficeIcon },
  ];

  // Don't render sidebar on mobile as we use the mobile navigation instead
  // Also don't render until after client-side hydration
  if (!mounted || isMobile) {
    return null;
  }

  return (
    <div
      className={cn(
        'bg-[#0A0A0A] border-r border-gray-800 transition-all duration-300 flex flex-col',
        collapsed ? 'w-20' : 'w-64',
        'hidden md:flex' // Hide on mobile, show on tablet and up
      )}
    >
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center justify-between px-4 mb-6">
          {!collapsed && <div className="text-xl font-bold text-white">CargoFlex</div>}
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

        {/* Core Operations */}
        <nav className="mt-2 px-3 space-y-1">
          {coreNavigation.map(item => {
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

        {/* Fleet Management Section */}
        <div className="px-3 mt-6 mb-2">
          {!collapsed ? (
            <>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Fleet
              </h3>
              <div className="h-px bg-gray-800"></div>
            </>
          ) : (
            <div className="h-px bg-gray-800"></div>
          )}
        </div>
        <nav className="mt-2 px-3 space-y-1">
          {fleetNavigation.map(item => {
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

        {/* Dispatch Section */}
        <div className="px-3 mt-6 mb-2">
          {!collapsed ? (
            <>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Dispatch
              </h3>
              <div className="h-px bg-gray-800"></div>
            </>
          ) : (
            <div className="h-px bg-gray-800"></div>
          )}
        </div>
        <nav className="mt-2 px-3 space-y-1">
          {dispatchNavigation.map(item => {
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

        {/* Maintenance Section */}
        <div className="px-3 mt-6 mb-2">
          {!collapsed ? (
            <>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Maintenance
              </h3>
              <div className="h-px bg-gray-800"></div>
            </>
          ) : (
            <div className="h-px bg-gray-800"></div>
          )}
        </div>
        <nav className="mt-2 px-3 space-y-1">
          {maintenanceNavigation.map(item => {
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

        {/* Financial Section */}
        <div className="px-3 mt-6 mb-2">
          {!collapsed ? (
            <>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Financial
              </h3>
              <div className="h-px bg-gray-800"></div>
            </>
          ) : (
            <div className="h-px bg-gray-800"></div>
          )}
        </div>
        <nav className="mt-2 px-3 space-y-1">
          {financialNavigation.map(item => {
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

        {/* Technology Section */}
        <div className="px-3 mt-6 mb-2">
          {!collapsed ? (
            <>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Technology
              </h3>
              <div className="h-px bg-gray-800"></div>
            </>
          ) : (
            <div className="h-px bg-gray-800"></div>
          )}
        </div>
        <nav className="mt-2 px-3 space-y-1">
          {technologyNavigation.map(item => {
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

        {/* Compliance Section */}
        <div className="px-3 mt-6 mb-2">
          {!collapsed ? (
            <>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Compliance
              </h3>
              <div className="h-px bg-gray-800"></div>
            </>
          ) : (
            <div className="h-px bg-gray-800"></div>
          )}
        </div>
        <nav className="mt-2 px-3 space-y-1">
          {complianceNavigation.map(item => {
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

        {/* Analytics Section */}
        <div className="px-3 mt-6 mb-2">
          {!collapsed ? (
            <>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Analytics
              </h3>
              <div className="h-px bg-gray-800"></div>
            </>
          ) : (
            <div className="h-px bg-gray-800"></div>
          )}
        </div>
        <nav className="mt-2 px-3 space-y-1">
          {analyticsNavigation.map(item => {
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

        {/* Integration Section */}
        <div className="px-3 mt-6 mb-2">
          {!collapsed ? (
            <>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Integration
              </h3>
              <div className="h-px bg-gray-800"></div>
            </>
          ) : (
            <div className="h-px bg-gray-800"></div>
          )}
        </div>
        <nav className="mt-2 px-3 space-y-1">
          {integrationNavigation.map(item => {
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

        {/* Company Navigation */}
        <div className="px-3 mt-6 mb-2">
          {!collapsed ? (
            <>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Company
              </h3>
              <div className="h-px bg-gray-800"></div>
            </>
          ) : (
            <div className="h-px bg-gray-800"></div>
          )}
        </div>
        <nav className="mt-2 flex-1 px-3 space-y-1">
          {companyNavigation.map(item => {
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

        {isAdmin && (
          <>
            <div className="px-3 mt-6 mb-2">
              {!collapsed ? (
                <>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                    Admin
                  </h3>
                  <div className="h-px bg-gray-800"></div>
                </>
              ) : (
                <div className="h-px bg-gray-800"></div>
              )}
            </div>
            <nav className="mt-2 flex-1 px-3 space-y-1">
              {adminNavigation.map(item => {
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
