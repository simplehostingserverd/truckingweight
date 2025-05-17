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
 * 
 * Designed and built by Michael Anthony Trevino Jr., Lead Full-Stack Developer
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LicenseErrorPage() {
  const [reason, setReason] = useState<string>('License verification failed');
  const [timestamp, setTimestamp] = useState<string>('');
  const [instanceId, setInstanceId] = useState<string>('');

  useEffect(() => {
    // Get error details from localStorage
    const storedReason = localStorage.getItem('kill_switch_reason');
    const storedTimestamp = localStorage.getItem('kill_switch_timestamp');
    const storedInstanceId = localStorage.getItem('instance_id');

    if (storedReason) {
      setReason(storedReason);
    }

    if (storedTimestamp) {
      const date = new Date(parseInt(storedTimestamp));
      setTimestamp(date.toLocaleString());
    } else {
      setTimestamp(new Date().toLocaleString());
    }

    if (storedInstanceId) {
      setInstanceId(storedInstanceId);
    }

    // Report error to server
    const reportError = async () => {
      try {
        await fetch('/api/license/report-error', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reason: storedReason || reason,
            timestamp: storedTimestamp || Date.now().toString(),
            instanceId: storedInstanceId || 'unknown',
            userAgent: navigator.userAgent,
            url: window.location.href,
          }),
        });
      } catch (error) {
        console.error('Failed to report license error:', error);
      }
    };

    reportError();
  }, [reason]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="relative w-64 h-16">
              <Image
                src="/images/logo.svg"
                alt="Cosmo Exploit Group LLC"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-red-500 text-3xl font-bold mb-4">License Error</h1>
            <div className="bg-red-900/30 border border-red-700 rounded-md p-4 mb-6">
              <p className="text-white mb-2">
                This application has been disabled due to a license validation error.
              </p>
              <p className="text-red-300 font-semibold mb-4">
                Error: {reason}
              </p>
              <p className="text-gray-300 text-sm">
                Error occurred at: {timestamp}
              </p>
              <p className="text-gray-300 text-sm">
                Instance ID: {instanceId}
              </p>
            </div>
            
            <p className="text-gray-300 mb-6">
              Please contact Cosmo Exploit Group LLC to resolve this issue.
            </p>
            
            <div className="flex flex-col space-y-3">
              <a
                href="mailto:licensing@cosmoexploitgroup.com"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Contact Support
              </a>
              
              <Link
                href="/"
                className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 p-4 text-center">
          <p className="text-gray-400 text-xs">
            © 2025 Cosmo Exploit Group LLC. All Rights Reserved.
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Designed and built by Michael Anthony Trevino Jr., Lead Full-Stack Developer
          </p>
        </div>
      </div>
    </div>
  );
}
