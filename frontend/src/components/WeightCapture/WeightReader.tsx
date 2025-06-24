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
import {
  ArrowDownIcon,
  ArrowPathIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  ScaleIcon,
  TruckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface WeightReaderProps {
  scale: unknown;
  readingType: 'gross' | 'tare' | 'axle';
  axleNumber?: number;
  onWeightCaptured: (weight: number) => void;
  autoCapture?: boolean;
}

export default function WeightReader({
  scale,
  readingType,
  axleNumber = 1,
  onWeightCaptured,
  autoCapture = false,
}: WeightReaderProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const supabase = createClient();
  const [weight, setWeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captured, setCaptured] = useState(false);
  const [polling, setPolling] = useState(autoCapture);
  const [weightHistory, setWeightHistory] = useState<number[]>([]);
  const [weightStable, setWeightStable] = useState(false);

  // Function to get weight reading from scale
  const getWeightReading = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Get auth token from supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session');
      }

      // Fetch weight reading from API
      const response = await fetch(
        `/api/scales/${scale.id}/reading?type=${readingType}${axleNumber ? `&axle=${axleNumber}` : ''}`,
        {
          headers: {
            'x-auth-token': session.access_token,
          },
        }
      );

      if (!response.ok) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const errorData = await response.json();
        throw new Error((errorData instanceof Error ? errorData.message : String(errorData)) || 'Failed to get weight reading');
      }

      const data = await response.json();

      if (data.reading !== undefined) {
        setWeight(data.reading);

        // Add to weight history for stability check
        setWeightHistory(prev => {
          const newHistory = [...prev, data.reading];
          // Keep only the last 5 readings
          return newHistory.slice(-5);
        });
      } else {
        throw new Error('Invalid reading from scale');
      }
    } catch (error: unknown) {
      console.error('Error getting weight reading:', error);
      setError((error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  }, [supabase, scale.id, readingType, axleNumber]);

  // Memoize the weight stability calculation
  const isWeightStable = useMemo(() => {
    if (weightHistory.length >= 3) {
      return weightHistory.every((w, i, arr) => {
        if (i === 0) return true;
        return Math.abs(w - arr[i - 1]) < 20;
      });
    }
    return false;
  }, [weightHistory]);

  // Effect to handle weight stability and auto-capture
  useEffect(() => {
    // Update the stable state
    setWeightStable(isWeightStable);

    // Auto-capture if weight is stable and auto-capture is enabled
    if (isWeightStable && autoCapture && !captured && weight !== null) {
      setCaptured(true);
      onWeightCaptured(weight);
      setPolling(false);
    }
  }, [isWeightStable, autoCapture, captured, weight, onWeightCaptured]);

  // Polling effect
  useEffect(() => {
    if (!polling) return;

    const pollInterval = setInterval(() => {
      getWeightReading();
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [polling, getWeightReading]);

  // Initial reading
  useEffect(() => {
    getWeightReading();
  }, [getWeightReading]);

  // Memoize event handlers to prevent unnecessary re-creations
  const handleCapture = useCallback(() => {
    if (weight !== null) {
      setCaptured(true);
      onWeightCaptured(weight);
      setPolling(false);
    }
  }, [weight, onWeightCaptured]);

  const handleReset = useCallback(() => {
    setCaptured(false);
    setWeight(null);
    setWeightHistory([]);
    setWeightStable(false);
    getWeightReading();
    setPolling(autoCapture);
  }, [getWeightReading, autoCapture]);

  const togglePolling = useCallback(() => {
    setPolling(prevPolling => !prevPolling);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          {readingType === 'gross' ? (
            <TruckIcon className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
          ) : readingType === 'tare' ? (
            <ScaleIcon className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center text-blue-600 dark:text-blue-400 mr-2 font-bold">
              A{axleNumber}
            </div>
          )}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {readingType === 'gross'
              ? 'Gross Weight'
              : readingType === 'tare'
                ? 'Tare Weight'
                : `Axle ${axleNumber} Weight`}
          </h2>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={togglePolling}
            className={`inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
              polling
                ? 'text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50'
                : 'text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
            disabled={captured}
          >
            {polling ? 'Stop' : 'Start'} Live Reading
          </button>
          <button
            type="button"
            onClick={getWeightReading}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={loading || captured}
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Connected to:</p>
            <p className="font-medium text-gray-800 dark:text-white">{scale.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{scale.location}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Status:</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {scale.status}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Current Reading:</p>
        <div className="flex items-center justify-center">
          {loading ? (
            <div className="animate-pulse flex space-x-2 items-center">
              <div className="h-12 w-32 bg-gray-200 dark:bg-gray-600 rounded"></div>
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-600 rounded"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 dark:text-red-400">
              <XCircleIcon className="h-8 w-8 mx-auto mb-2" />
              <p>{error}</p>
            </div>
          ) : (
            <div className="flex items-baseline">
              <span className="text-5xl font-bold text-gray-800 dark:text-white">
                {weight?.toLocaleString() || '—'}
              </span>
              <span className="ml-2 text-xl text-gray-600 dark:text-gray-300">lbs</span>

              {weightHistory.length > 1 && (
                <div className="ml-4">
                  {weightHistory[weightHistory.length - 1] >
                  weightHistory[weightHistory.length - 2] ? (
                    <ArrowUpIcon className="h-5 w-5 text-red-500" />
                  ) : weightHistory[weightHistory.length - 1] <
                    weightHistory[weightHistory.length - 2] ? (
                    <ArrowDownIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-yellow-400"></div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {weightStable && !captured && (
          <div className="mt-2 text-green-600 dark:text-green-400 text-sm flex items-center justify-center">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Weight stable
          </div>
        )}
      </div>

      <div className="flex justify-between">
        {captured ? (
          <button
            type="button"
            onClick={handleReset}
            className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Reset
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCapture}
            className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={weight === null || loading}
          >
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Capture Weight
          </button>
        )}
      </div>
    </div>
  );
}
