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
import { ArrowPathIcon, CheckCircleIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { createClient } from '@/utils/supabase/client';

interface SignatureCaptureProps {
  ticketId: number;
  onSignatureAdded: () => void;
}

export default function SignatureCapture({ ticketId, onSignatureAdded }: SignatureCaptureProps) {
  const supabase = createClient();
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Clear the signature pad
  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  // Save the signature
  const saveSignature = async () => {
    if (!sigCanvas.current) {
      return;
    }

    if (sigCanvas.current.isEmpty()) {
      setError('Please provide a signature');
      return;
    }

    if (!name) {
      setError('Please enter your name');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // Get the signature as a data URL
      const signatureDataUrl = sigCanvas.current.toDataURL('image/png');

      // Convert data URL to blob
      const response = await fetch(signatureDataUrl);
      const blob = await response.blob();

      // Generate a unique filename
      const filename = `signature_${ticketId}_${Date.now()}.png`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('signatures')
        .upload(filename, blob, {
          contentType: 'image/png',
          cacheControl: '3600',
        });

      if (uploadError) {
        throw new Error(`Failed to upload signature: ${uploadError.message}`);
      }

      // Get the public URL
      const { data: urlData } = supabase.storage.from('signatures').getPublicUrl(filename);

      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to get public URL for signature');
      }

      // Save signature record in the database
      const { error: dbError } = await supabase.from('ticket_signatures').insert({
        weigh_ticket_id: ticketId,
        signature_url: urlData.publicUrl,
        name,
        role: role || null,
        ip_address: '127.0.0.1', // In a real app, we would get the client's IP
      });

      if (dbError) {
        throw new Error(`Failed to save signature record: ${dbError.message}`);
      }

      // Success
      setSuccess(true);
      clearSignature();
      setName('');
      setRole('');

      // Notify parent component
      onSignatureAdded();
    } catch (error) {
      console.error('Error saving signature:', error);
      setError(
        `Failed to save signature: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Signature</h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Name *
          </label>
          <input
            type="text"
            id="name"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Role (Optional)
          </label>
          <input
            type="text"
            id="role"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="e.g. Driver, Operator, Manager"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Signature *
          </label>
          <div className="border-2 border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white">
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                width: 500,
                height: 200,
                className: 'w-full h-full signature-canvas',
              }}
              backgroundColor="white"
            />
          </div>
          <div className="flex justify-end mt-2">
            <button
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              onClick={clearSignature}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={clearSignature}
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Clear
          </button>

          <button
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={saveSignature}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <PencilIcon className="h-5 w-5 mr-2" />
                Save Signature
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-md text-sm flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Signature saved successfully!
          </div>
        )}
      </div>
    </div>
  );
}
