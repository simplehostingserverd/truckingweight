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
import Link from 'next/link';
import { formatDate, getStatusColor } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Weight {
  id: number;
  weight: string;
  date: string;
  time: string | null;
  status: string;
  vehicle_id: number | null;
  driver_id: number | null;
  vehicles: {
    id: number;
    name: string;
  } | null;
  drivers: {
    id: number;
    name: string;
  } | null;
}

interface RecentWeightsTableProps {
  weights?: Weight[];
  companyId?: number | null;
}

export default function RecentWeightsTable({ weights = [], companyId }: RecentWeightsTableProps) {
  if (!weights || weights.length === 0) {
    return <div className="p-6 text-center text-gray-400">No weight measurements found.</div>;
  }

  return (
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
        <tbody className="divide-y divide-gray-800">
          {weights.map(item => (
            <tr key={item.id} className="hover:bg-gray-800/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                {item.vehicles?.name || 'Unknown'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {item.drivers?.name || 'Unknown'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.weight}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {formatDate(item.date)}
                {item.time && <span className="ml-1 text-xs text-gray-500">{item.time}</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
