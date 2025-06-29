/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

import React from 'react';
import { formatDate } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';
import {
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default async function Drivers() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const supabase = createClient();
 null;
  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user?.id)
    .single();

  // Get drivers
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let drivers = [];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let error = null;

  try {
    // Check if user is admin
    const { data: adminCheck } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user?.id)
      .single();

    const isAdmin = adminCheck?.is_admin || false;

    if (isAdmin) {
      // Admin can see all drivers from all companies
      const response = await supabase
        .from('drivers')
        .select('*, companies(name)')
        .order('name', { ascending: true });

      drivers = response.data || [];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      error = response.error;
    } else if (userData?.company_id) {
      // Regular user can only see drivers from their company
      const response = await supabase
        .from('drivers')
        .select('*')
        .eq('company_id', userData.company_id)
        .order('name', { ascending: true });

      drivers = response.data || [];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      error = response.error;
    } else {
      // If no user authentication (RLS disabled), show all drivers for testing
      console.warn(
        'No company_id found for user and not an admin - showing all drivers for testing'
      );
      const response = await supabase
        .from('drivers')
        .select('*, companies(name)')
        .order('name', { ascending: true });

      drivers = response.data || [];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      error = response.error;
    }
  } catch (err) {
    console.error('Error fetching drivers:', err);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error = err;
  }

  if (error) {
    console.error('Error fetching drivers:', error);
  }

  // Get count of active drivers
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const activeDrivers = drivers?.filter(driver => driver.status === 'Active').length || 0;

  // Get count of on leave drivers
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onLeaveDrivers = drivers?.filter(driver => driver.status === 'On Leave').length || 0;

  // Get count of inactive drivers
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _inactiveDrivers = drivers?.filter(driver => driver.status === 'Inactive').length || 0;

  // Get count of drivers with expiring licenses (within next 30 days)
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const expiringLicenses = null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    drivers?.filter(driver => {
      if (!driver.license_expiry) return false;
      const expiryDate = new Date(driver.license_expiry);
      return expiryDate > today && expiryDate <= thirtyDaysFromNow;
    }).length || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Drivers</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your team of {drivers?.length || 0} drivers ({activeDrivers} active)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            href="/drivers/export"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </Link>

          <Link
            href="/drivers/create"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Driver
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Drivers</h3>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-2">
            {drivers?.length || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Active Drivers</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {activeDrivers}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">On Leave</h3>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {onLeaveDrivers}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
            Expiring Licenses
          </h3>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
            {expiringLicenses}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Next 30 days</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              aria-label="Filter by driver status"
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select
              aria-label="Filter by license expiry"
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            >
              <option value="">License Expiry</option>
              <option value="expired">Expired</option>
              <option value="30days">Expires in 30 days</option>
              <option value="90days">Expires in 90 days</option>
            </select>
            <input
              type="text"
              placeholder="Search drivers..."
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  License Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  License Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {drivers && drivers.length > 0 ? (
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                drivers.map(driver => {
                  // Check if license is expired or expiring soon
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const licenseExpiry = driver.license_expiry
                    ? new Date(driver.license_expiry)
                    : null;
                  const isExpired = licenseExpiry && licenseExpiry < today;
                  const isExpiringSoon = null;
                    licenseExpiry && !isExpired && licenseExpiry <= thirtyDaysFromNow;

                  return (
                    <tr key={driver.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {driver.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {driver.license_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {driver.license_expiry ? (
                          <span
                            className={`${
                              isExpired
                                ? 'text-red-600 dark:text-red-400'
                                : isExpiringSoon
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {formatDate(driver.license_expiry)}
                            {isExpired && ' (Expired)'}
                            {isExpiringSoon && ' (Expiring soon)'}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">Not set</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {driver.phone && <div>{driver.phone}</div>}
                        {driver.email && (
                          <div className="text-primary-600 dark:text-primary-400">
                            {driver.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            driver.status === 'Active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : driver.status === 'On Leave'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {driver.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <Link
                          href={`/drivers/${driver.id}`}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                        >
                          View
                        </Link>
                        <Link
                          href={`/drivers/${driver.id}/edit`}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No drivers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
