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
import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';

interface LoadStatusUpdaterProps {
  loadId: number;
  currentStatus: string;
  onStatusUpdate: () => void;
}

export default function LoadStatusUpdater({
  loadId,
  currentStatus,
  onStatusUpdate,
}: LoadStatusUpdaterProps) {
  const [status, setStatus] = useState(currentStatus);
  const [actualDeparture, setActualDeparture] = useState('');
  const [actualArrival, setActualArrival] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const supabase = createClient();

  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'In Transit', label: 'In Transit' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Cancelled', label: 'Cancelled' },
  ];

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);

    // If status is changed to "In Transit", set actual departure to now
    if (newStatus === 'In Transit' && currentStatus !== 'In Transit') {
      const now = new Date();
      const formattedDate = formatDateForInput(now);
      setActualDeparture(formattedDate);
    }

    // If status is changed to "Delivered", set actual arrival to now
    if (newStatus === 'Delivered' && currentStatus !== 'Delivered') {
      const now = new Date();
      const formattedDate = formatDateForInput(now);
      setActualArrival(formattedDate);
    }
  };

  const formatDateForInput = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError('');
    setSuccess('');

    try {
      const updateData: unknown = { status };

      // Add actual departure if provided
      if (actualDeparture) {
        updateData.actual_departure = actualDeparture;
      }

      // Add actual arrival if provided
      if (actualArrival) {
        updateData.actual_arrival = actualArrival;
      }

      // Update the load
      const { error: updateError } = await supabase
        .from('loads')
        .update(updateData)
        .eq('id', loadId);

      if (updateError) {
        throw updateError;
      }

      setSuccess('Load status updated successfully');
      onStatusUpdate();
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : String(err)) || 'An error occurred while updating the load status');
      console.error('Update load status error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-primary-700 text-white">
        <h2 className="text-xl font-semibold">Update Load Status</h2>
      </div>

      <form className="p-6 space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/30">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/30">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  {success}
                </h3>
              </div>
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={status}
            onChange={handleStatusChange}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {(status === 'In Transit' || status === 'Delivered') && (
          <div>
            <label
              htmlFor="actualDeparture"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Actual Departure
            </label>
            <input
              id="actualDeparture"
              name="actualDeparture"
              type="datetime-local"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={actualDeparture}
              onChange={e => setActualDeparture(e.target.value)}
            />
          </div>
        )}

        {status === 'Delivered' && (
          <div>
            <label
              htmlFor="actualArrival"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Actual Arrival
            </label>
            <input
              id="actualArrival"
              name="actualArrival"
              type="datetime-local"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={actualArrival}
              onChange={e => setActualArrival(e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUpdating}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400"
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </form>
    </div>
  );
}
