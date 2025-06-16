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

import React from 'react';
import useSWRFetch from '../hooks/useSWRFetch';

interface DataTableProps<T> {
  url: string;
  columns: {
    key: keyof T;
    header: string;
    render?: (value: any /* @ts-ignore */, item: T) => React.ReactNode;
  }[];
  onRowClick?: (item: T) => void;
}

function DataTable<T extends { id: string | number }>({
  url,
  columns,
  onRowClick,
}: DataTableProps<T>) {
  // Use SWR to fetch data
  const { data, error, isLoading, mutate } = useSWRFetch<T[]>(url);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error.message || 'Failed to load data'}</span>
      </div>
    );
  }

  // Handle empty data
  if (!data || data.length === 0) {
    return <div className="text-center py-10 text-gray-500">No data available</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(column => (
              <th
                key={column.key.toString()}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map(item => (
            <tr
              key={item.id}
              onClick={() => onRowClick && onRowClick(item)}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            >
              {columns.map(column => (
                <td
                  key={`${item.id}-${column.key.toString()}`}
                  className="px-6 py-4 whitespace-nowrap"
                >
                  {column.render
                    ? column.render(item[column.key], item)
                    : item[column.key]?.toString()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
