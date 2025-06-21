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

import {
  DocumentTextIcon,
  PlusIcon,
  ScaleIcon,
  TruckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';

function QuickActions() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/weights/new"
          className="flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Weight Entry
        </Link>
        <Link
          href="/weights/capture"
          className="flex items-center justify-center bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <ScaleIcon className="h-5 w-5 mr-2" />
          Weight Capture
        </Link>
        <Link
          href="/loads/new"
          className="flex items-center justify-center bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <TruckIcon className="h-5 w-5 mr-2" />
          Create Load
        </Link>
        <Link
          href="/weights/compliance"
          className="flex items-center justify-center bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
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
          href="/drivers"
          className="flex items-center justify-center bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <UserGroupIcon className="h-5 w-5 mr-2" />
          Manage Drivers
        </Link>
        <Link
          href="/reports"
          className="flex items-center justify-center bg-gray-700 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          Generate Report
        </Link>
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(QuickActions);
