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
  ArrowPathIcon,
  CheckCircleIcon,
  QrCodeIcon,
  ScaleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { QrScanner } from '@yudiel/react-qr-scanner';
import { useEffect, useState } from 'react';

interface ScaleSelectorProps {
  onScaleSelect: (scale: unknown) => void;
}

export default function ScaleSelector({ onScaleSelect }: ScaleSelectorProps) {
  const supabase = createClient();
  const [scales, setScales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const fetchScales = async () => {
      try {
        setLoading(true);

        // Get auth token from supabase
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error('No active session');
        }

        // Fetch scales from API
        const response = await fetch('/api/scales', {
          headers: {
            'x-auth-token': session.access_token,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch scales');
        }

        const scalesData = await response.json();

        // Filter only active scales
        const activeScales = scalesData.filter(
          (scale: unknown) => scale.status === 'Active'
        );

        setScales(activeScales);
      } catch (error: unknown) {
        console.error('Error fetching scales:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScales();
  }, [supabase]);

  const handleQrCodeScan = async (result: string) => {
    try {
      // Parse QR code data
      const qrData = JSON.parse(result);

      // Validate QR code format
      if (qrData.type !== 'scale') {
        setScanResult({
          success: false,
          message: 'Invalid QR code format. This is not a scale QR code.',
        });
        return;
      }

      // Get auth token from supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session');
      }

      // Validate QR code with backend
      const response = await fetch('/api/scales/validate-qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': session.access_token,
        },
        body: JSON.stringify({ qrCodeData: result }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to validate QR code');
      }

      const validationResult = await response.json();

      if (validationResult.valid && validationResult.scale) {
        setScanResult({
          success: true,
          message: `Successfully connected to scale: ${validationResult.scale.name}`,
        });

        // Select the scale
        onScaleSelect(validationResult.scale);

        // Close QR scanner after successful scan
        setTimeout(() => {
          setShowQrScanner(false);
        }, 2000);
      } else {
        setScanResult({ success: false, message: 'Invalid or unauthorized scale QR code.' });
      }
    } catch (error: unknown) {
      console.error('Error processing QR code:', error);
      setScanResult({ success: false, message: error.message || 'Failed to process QR code' });
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
        <div className="flex items-center mb-4">
          <div className="bg-gray-200 dark:bg-gray-700 h-8 w-8 rounded-full mr-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-red-500 dark:text-red-400 flex items-center mb-4">
          <XCircleIcon className="h-6 w-6 mr-2" />
          <h2 className="text-xl font-semibold">Error Loading Scales</h2>
        </div>
        <p className="text-gray-700 dark:text-gray-300">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <ScaleIcon className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Select Scale</h2>
        </div>
        <button
          onClick={() => setShowQrScanner(!showQrScanner)}
          className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <QrCodeIcon className="h-4 w-4 mr-2" />
          {showQrScanner ? 'Close Scanner' : 'Scan QR Code'}
        </button>
      </div>

      {showQrScanner ? (
        <div className="mb-6">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <QrScanner
              onDecode={handleQrCodeScan}
              onError={error => console.error(error)}
              containerStyle={{ borderRadius: '0.5rem', overflow: 'hidden' }}
              scanDelay={500}
            />
          </div>

          {scanResult && (
            <div
              className={`mt-4 p-3 rounded-md ${scanResult.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}
            >
              <div className="flex items-start">
                {scanResult.success ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                )}
                <p
                  className={`text-sm ${scanResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}
                >
                  {scanResult.message}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {scales.length > 0 ? (
            scales.map(scale => (
              <button
                key={scale.id}
                onClick={() => onScaleSelect(scale)}
                className="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  <ScaleIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3" />
                  <div className="text-left">
                    <h3 className="font-medium text-gray-800 dark:text-white">{scale.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{scale.location}</p>
                  </div>
                </div>
                <span className="text-sm px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                  {scale.status}
                </span>
              </button>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No active scales found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Please contact your administrator to set up scales
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
