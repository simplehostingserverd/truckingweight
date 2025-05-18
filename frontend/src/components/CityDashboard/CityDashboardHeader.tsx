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

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createSafeUrl } from '@/utils/navigation';
import {
  BellIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CityDashboardHeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
    cityId: number;
    city?: {
      name: string;
      state: string;
      logo_url?: string;
    };
  };
}

export default function CityDashboardHeader({ user }: CityDashboardHeaderProps) {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New permit request',
      message: 'A new overweight permit request has been submitted.',
      time: '10 minutes ago',
      read: false,
    },
    {
      id: 2,
      title: 'Scale maintenance required',
      message: 'Scale #3 requires calibration.',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 3,
      title: 'Violation issued',
      message: 'A new violation has been issued for an overweight vehicle.',
      time: '1 day ago',
      read: true,
    },
  ]);

  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Import Supabase client dynamically to avoid SSR issues
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();

      // Sign out using Supabase Auth
      await supabase.auth.signOut();

      // Also clear local storage for backward compatibility
      localStorage.removeItem('cityToken');
      localStorage.removeItem('cityUser');

      // Redirect to login page
      router.push(createSafeUrl('/city/login'));
      router.refresh(); // Important to refresh the router
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback to manual logout if Supabase Auth fails
      localStorage.removeItem('cityToken');
      localStorage.removeItem('cityUser');
      router.push(createSafeUrl('/city/login'));
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <header className="bg-gray-800 border-b border-gray-700 py-3 px-4 md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {user?.city?.logo_url ? (
            <div className="mr-3 flex-shrink-0">
              <Image
                src={user.city.logo_url}
                alt={`${user?.city?.name || 'City'} Logo`}
                width={40}
                height={40}
                priority
                className="object-contain rounded-md"
              />
            </div>
          ) : (
            <BuildingOfficeIcon className="h-8 w-8 text-gray-400 mr-3" />
          )}
          <div>
            <h1 className="text-xl font-semibold text-white">
              {user?.city?.name || 'City'} Municipal Weighing System
            </h1>
            <Badge variant="outline" className="bg-blue-900 text-blue-200 border-blue-700 mt-1">
              {user?.role === 'admin'
                ? 'Administrator'
                : user?.role === 'operator'
                  ? 'Operator'
                  : user?.role === 'inspector'
                    ? 'Inspector'
                    : 'Viewer'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <BellIcon className="h-6 w-6 text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 bg-gray-800 border-gray-700 text-white"
            >
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Mark all as read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              {notifications.length === 0 ? (
                <div className="py-4 px-2 text-center text-gray-400">No notifications</div>
              ) : (
                notifications.map(notification => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`px-4 py-3 focus:bg-gray-700 ${
                      !notification.read ? 'bg-gray-700/50' : ''
                    }`}
                  >
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{notification.title}</span>
                        <span className="text-xs text-gray-400">{notification.time}</span>
                      </div>
                      <p className="text-sm text-gray-300">{notification.message}</p>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem asChild>
                <Link
                  href="/city/notifications"
                  className="w-full text-center text-sm text-blue-400 hover:text-blue-300 py-2"
                >
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Link href="/city/settings">
            <Button variant="ghost" size="icon">
              <Cog6ToothIcon className="h-6 w-6 text-gray-300" />
            </Button>
          </Link>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircleIcon className="h-6 w-6 text-gray-300" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-gray-800 border-gray-700 text-white"
            >
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{user?.name}</span>
                  <span className="text-xs text-gray-400">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem asChild>
                <Link href="/city/profile" className="cursor-pointer">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/city/settings" className="cursor-pointer">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
