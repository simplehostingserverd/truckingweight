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
  CameraIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  QrCodeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { QrScanner } from '@yudiel/react-qr-scanner';
import { useState } from 'react';

interface QRScannerProps {
  onScaleSelect: (scaleId: number, scaleName: string) => void;
}

export default function QRScanner({ onScaleSelect }: QRScannerProps) {
  const supabase = createClient();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    scaleId?: number;
    scaleName?: string;
    message?: string;
  } | null>(null);

  const handleScan = (result: string) => {
    if (result) {
      setScanResult(result);
      setIsScanning(false);
      validateQRCode(result);
    }
  };

  const handleError = (error: Error) => {
    console.error('QR Scanner error:', error);
    setError(`Scanner error: ${error.message}`);
    setIsScanning(false);
  };

  const validateQRCode = async (qrData: string) => {
    try {
      setIsValidating(true);
      setError(null);

      // Get auth token from supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session');
      }

      // Call API to validate QR code
      const response = await fetch('/api/scales/validate-qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': session.access_token,
        },
        body: JSON.stringify({ qrCodeData: qrData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to validate QR code');
      }

      const data = await response.json();

      setValidationResult({
        success: true,
        scaleId: data.scale.id,
        scaleName: data.scale.name,
        message: `Successfully identified scale: ${data.scale.name}`,
      });

      // Call the onScaleSelect callback
      onScaleSelect(data.scale.id, data.scale.name);
    } catch (error: unknown) {
      console.error('Error validating QR code:', error);
      setError(error.message);
      setValidationResult({
        success: false,
        message: `Error: ${error.message}`,
      });
    } finally {
      setIsValidating(false);
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    setScanResult(null);
    setError(null);
    setValidationResult(null);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          <QrCodeIcon className="h-6 w-6 mr-2" />
          QR Code Scale Selection
        </h2>
      </div>

      <div className="p-6">
        {!isScanning && !scanResult && !validationResult && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Scan a scale's QR code to quickly select it for weight capture.
            </p>
            <button
              onClick={startScanning}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <CameraIcon className="h-5 w-5 mr-2" />
              Start Scanning
            </button>
          </div>
        )}

        {isScanning && (
          <div className="relative">
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={stopScanning}
                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="max-w-md mx-auto">
              <QrScanner
                onDecode={handleScan}
                onError={handleError}
                scanDelay={500}
                constraints={{
                  facingMode: 'environment',
                }}
              />
              <p className="text-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                Position the QR code within the frame
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
            <div className="flex items-start">
              <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {validationResult && (
          <div
            className={`mt-4 p-4 rounded-md ${
              validationResult.success
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}
          >
            <div className="flex items-start">
              {validationResult.success ? (
                <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              ) : (
                <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium">{validationResult.message}</p>
                {validationResult.success && (
                  <p className="mt-1 text-sm">Scale ID: {validationResult.scaleId}</p>
                )}
              </div>
            </div>
            {validationResult.success ? (
              <button
                onClick={startScanning}
                className="mt-4 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <QrCodeIcon className="h-5 w-5 mr-2" />
                Scan Another Scale
              </button>
            ) : (
              <button
                onClick={startScanning}
                className="mt-4 flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <QrCodeIcon className="h-5 w-5 mr-2" />
                Try Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
