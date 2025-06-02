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

import { Scale } from '@/types/scale-master';
import { ArrowPathIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

interface QRCodeScaleSelectorProps {
  onScaleSelected: (scaleId: number) => void;
}

export default function QRCodeScaleSelector({ onScaleSelected }: QRCodeScaleSelectorProps) {
  const supabase = createClient();
  const [scales, setScales] = useState<Scale[]>([]);
  const [selectedScale, setSelectedScale] = useState<Scale | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load scales on component mount
  useEffect(() => {
    const fetchScales = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get user's company ID
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const { data: userData } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', user?.id)
          .single();

        if (!userData) {
          throw new Error('Failed to get user data');
        }

        // Fetch scales
        const { data: scalesData, error: scalesError } = await supabase
          .from('scales')
          .select('*')
          .eq('company_id', userData.company_id)
          .eq('status', 'Active');

        if (scalesError) {
          throw new Error(scalesError.message);
        }

        if (scalesData) {
          setScales(scalesData);
        }
      } catch (error) {
        console.error('Error fetching scales:', error);
        setError('Failed to load scales');
      } finally {
        setIsLoading(false);
      }
    };

    fetchScales();
  }, [supabase]);

  // Generate QR code for the selected scale
  const generateQRCode = () => {
    if (!selectedScale) {
      setError('Please select a scale');
      return;
    }

    try {
      // In a real application, this would be a secure token with an expiration
      // For demo purposes, we'll just use a simple JSON object
      const qrData = {
        type: 'scale_selection',
        scaleId: selectedScale.id,
        scaleName: selectedScale.name,
        timestamp: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      };

      setQrCodeData(JSON.stringify(qrData));
    } catch (error) {
      console.error('Error generating QR code:', error);
      setError('Failed to generate QR code');
    }
  };

  // Handle scale selection
  const handleScaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scaleId = parseInt(e.target.value);
    const scale = scales.find(s => s.id === scaleId) || null;
    setSelectedScale(scale);
    setQrCodeData(''); // Clear QR code when scale changes
  };

  // Simulate scanning a QR code
  const simulateScan = () => {
    if (selectedScale) {
      onScaleSelected(selectedScale.id);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        QR Code Scale Selection
      </h2>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="scale"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Select Scale
          </label>
          <select
            id="scale"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={selectedScale?.id || ''}
            onChange={handleScaleChange}
            disabled={isLoading}
          >
            <option value="">Select a scale</option>
            {scales.map(scale => (
              <option key={scale.id} value={scale.id}>
                {scale.name} - {scale.manufacturer} {scale.model}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-center">
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={generateQRCode}
            disabled={!selectedScale || isLoading}
          >
            <QrCodeIcon className="h-5 w-5 mr-2" />
            Generate QR Code
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}

        {qrCodeData && (
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG
                value={qrCodeData}
                size={200}
                level="H"
                includeMargin
                imageSettings={{
                  src: '/logo.png',
                  excavate: true,
                  height: 24,
                  width: 24,
                }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Scan this QR code with the mobile app to select this scale
            </p>

            {/* For demo purposes only */}
            <button
              className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={simulateScan}
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Simulate Scan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
