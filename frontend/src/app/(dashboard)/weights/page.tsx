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

import { formatDate, getStatusColor } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';
import { ArrowDownTrayIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default async function Weights() {
  const supabase = createClient();

  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user?.id)
    .single();

  // Get weights with vehicle and driver info
  let weights = [];
  let error = null;

  // Only fetch if we have a company_id
  if (userData?.company_id) {
    const response = await supabase
      .from('weights')
      .select(
        `
        id,
        weight,
        date,
        time,
        status,
        created_at,
        vehicles(id, name),
        drivers(id, name)
      `
      )
      .eq('company_id', userData.company_id)
      .order('created_at', { ascending: false });

    weights = response.data || [];
    error = response.error;
  } else {
    console.warn('No company_id found for user, attempting to fetch all weights');
    // Try to fetch all weights if no company_id (admin user)
    const { data: allWeights, error: allWeightsError } = await supabase
      .from('weights')
      .select('*, vehicles(*), drivers(*)')
      .order('created_at', { ascending: false })
      .limit(10);

    if (allWeightsError) {
      console.error('Error fetching all weights:', allWeightsError);
    } else {
      weights = allWeights || [];
    }

    // If still no weights, return empty array
    if (!weights || weights.length === 0) {
      weights = [];
    }
  }

  if (error) {
    console.error('Error fetching weights:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Weight Measurements</h1>

        <div className="flex space-x-2">
          <Link
            href="/weights/compliance"
            className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Compliance Check
          </Link>

          <Link
            href="/weights/export"
            className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </Link>

          <Link
            href="/weights/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Weight
          </Link>
        </div>
      </div>

      <div className="bg-[#1A1A1A] shadow-lg rounded-lg overflow-hidden border border-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Weight
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#1A1A1A] divide-y divide-gray-800">
              {weights && weights.length > 0 ? (
                weights.map(item => (
                  <tr key={item.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {item.vehicles?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.drivers?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.weight}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(item.date)}
                      {item.time && <span className="ml-1 text-xs text-gray-500">{item.time}</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status || '')}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/weights/${item.id}`}
                        className="text-blue-500 hover:text-blue-400 mr-3"
                      >
                        View
                      </Link>
                      <Link
                        href={`/weights/${item.id}/edit`}
                        className="text-blue-500 hover:text-blue-400"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-400">
                    No weight measurements found
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
