'use client';

import Link from 'next/link';
import { PlusIcon, DocumentTextIcon, ArrowPathIcon, ScaleIcon } from '@heroicons/react/24/outline';

export default function QuickActions() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/weights/new"
          className="flex items-center justify-center bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Weight Entry
        </Link>
        <Link
          href="/weights/capture"
          className="flex items-center justify-center bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
        >
          <ScaleIcon className="h-5 w-5 mr-2" />
          Weight Capture
        </Link>
        <Link
          href="/loads/new"
          className="flex items-center justify-center bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Load
        </Link>
        <Link
          href="/reports"
          className="flex items-center justify-center bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700 transition-colors"
        >
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          Generate Report
        </Link>
      </div>
    </div>
  );
}
