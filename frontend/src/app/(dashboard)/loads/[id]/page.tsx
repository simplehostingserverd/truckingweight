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
import { getStatusColor } from '@/lib/utils';
import { toSearchParamString } from '@/utils/searchParams';
import { createClient } from '@/utils/supabase/client';
import {
  ArrowLeftIcon,
  ClockIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Dynamically import the LoadStatusUpdater component
const LoadStatusUpdater = dynamic(() => import('@/components/Loads/LoadStatusUpdater'), {
  ssr: false,
});

export default function LoadDetail({ params }: { params: { id: string } }) {
  const [load, setLoad] = useState<unknown>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [statusUpdated, setStatusUpdated] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  // Safely convert the ID parameter to a string
  const id = toSearchParamString(params.id, '');

  useEffect(() => {
    const fetchLoad = async () => {
      try {
        // Get session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push('/login');
          return;
        }

        // Get load with vehicle and driver info
        const { data, error } = await supabase
          .from('loads')
          .select(
            `
            id,
            description,
            origin,
            destination,
            weight,
            status,
            created_at,
            updated_at,
            estimated_departure,
            estimated_arrival,
            actual_departure,
            actual_arrival,
            distance,
            duration,
            route_details,
            vehicles(id, name, license_plate),
            drivers(id, name, license_number)
          `
          )
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setLoad(data);
      } catch (err: unknown) {
        console.error('Error fetching load:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoad();

    // Reset status updated flag
    if (statusUpdated) {
      setStatusUpdated(false);
    }
  }, [id, router, supabase, statusUpdated]);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const { error } = await supabase.from('loads').delete().eq('id', id);

      if (error) {
        throw error;
      }

      router.push('/loads');
    } catch (err: unknown) {
      console.error('Error deleting load:', err);
      setError(err.message || 'Failed to delete load');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/30">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Link
              href="/loads"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Loads
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!load) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/30">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Load not found
                </h3>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Link
              href="/loads"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Loads
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Load Details</h1>

          <div className="flex space-x-2">
            <Link
              href="/loads"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Link>

            <Link
              href={`/loads/edit/${id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </Link>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Load Information */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-primary-700 text-white flex justify-between items-center">
              <h2 className="text-xl font-semibold">Load Information</h2>
              <span
                className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(load.status || '')}`}
              >
                {load.status}
              </span>
            </div>

            <div className="p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Description
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{load.description}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Origin</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{load.origin}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Destination
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{load.destination}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Weight</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{load.weight}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {load.vehicles
                      ? `${load.vehicles.name} (${load.vehicles.license_plate})`
                      : 'Unassigned'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Driver</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {load.drivers
                      ? `${load.drivers.name} (${load.drivers.license_number})`
                      : 'Unassigned'}
                  </dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Record Information
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    <div className="flex flex-col space-y-1">
                      <span>Created: {new Date(load.created_at).toLocaleString()}</span>
                      <span>Last Updated: {new Date(load.updated_at).toLocaleString()}</span>
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Status Updater */}
          <LoadStatusUpdater
            loadId={parseInt(id) || 0}
            currentStatus={load.status}
            onStatusUpdate={() => setStatusUpdated(true)}
          />
        </div>

        {/* Route Information */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 bg-primary-700 text-white">
            <h2 className="text-xl font-semibold">Route Information</h2>
          </div>

          <div className="p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              {/* Distance and Duration */}
              <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-primary-500 mr-2" />
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Distance</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {load.distance || 'Not available'}
                  </dd>
                </div>
              </div>

              <div className="flex items-start">
                <ClockIcon className="h-5 w-5 text-primary-500 mr-2" />
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {load.duration || 'Not available'}
                  </dd>
                </div>
              </div>

              {/* Estimated Times */}
              <div className="flex items-start">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Estimated Departure
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {load.estimated_departure
                      ? new Date(load.estimated_departure).toLocaleString()
                      : 'Not scheduled'}
                  </dd>
                </div>
              </div>

              <div className="flex items-start">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Estimated Arrival
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {load.estimated_arrival
                      ? new Date(load.estimated_arrival).toLocaleString()
                      : 'Not scheduled'}
                  </dd>
                </div>
              </div>

              {/* Actual Times */}
              <div className="flex items-start">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Actual Departure
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {load.actual_departure
                      ? new Date(load.actual_departure).toLocaleString()
                      : 'Not departed'}
                  </dd>
                </div>
              </div>

              <div className="flex items-start">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Actual Arrival
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {load.actual_arrival
                      ? new Date(load.actual_arrival).toLocaleString()
                      : 'Not arrived'}
                  </dd>
                </div>
              </div>

              {/* Route Details */}
              {load.route_details && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Route Details
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(JSON.parse(load.route_details), null, 2)}
                      </pre>
                    </div>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Are you sure you want to delete this load? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
