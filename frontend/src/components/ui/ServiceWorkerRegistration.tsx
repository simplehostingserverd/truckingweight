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


// Global type declarations
declare function confirm(message?: string): boolean;

import { useEffect, useState } from 'react';
import { Workbox } from 'workbox-window';
import logger from '@/utils/logger';
import { useToastContext } from '@/providers/ToastProvider';

interface ServiceWorkerRegistrationProps {
  onUpdate?: () => void;
  onSuccess?: () => void;
  onError?: (_error: Error) => void;
}

export default function ServiceWorkerRegistration({
  onUpdate,
  onSuccess,
  onError,
}: ServiceWorkerRegistrationProps) {
  // Use undefined as initial state to avoid hydration mismatch
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toast = useToastContext();

  useEffect(() => {
    // Only run in production or when explicitly enabled
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const shouldRegisterSW =
      process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_SW === 'true';

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && shouldRegisterSW) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const wb = new Workbox('/service-worker.js');

        // Successful registration
        wb.addEventListener('installed', event => {
          logger.info('Service Worker installed successfully', { event }, 'ServiceWorker');

          if (event.isUpdate) {
            logger.info('New content is available, please refresh', {}, 'ServiceWorker');
            setIsUpdateAvailable(true);

            // Show toast notification for update
            toast.info({
              title: 'Update Available',
              description:
                'A new version is available. Click to refresh and use the latest version.',
            });

            onUpdate?.();
          } else {
            logger.info('Content is cached for offline use', {}, 'ServiceWorker');

            // Show toast notification for successful caching
            toast.success({
              title: 'Offline Ready',
              description: 'App is now available offline',
            });

            onSuccess?.();
          }
        });

        // Registration error
        wb.addEventListener('error', event => {
          const _error = new Error('Service worker registration failed');
          logger.error('Service Worker registration failed', { event }, 'ServiceWorker');

          // Show toast notification for error
          toast.error({
            title: 'Service Worker Error',
            description: 'Failed to enable offline functionality',
          });

          onError?.(error);
        });

        // Controlling service worker
        wb.addEventListener('controlling', () => {
          logger.info('Service Worker is controlling the page', {}, 'ServiceWorker');
          // Use a more gentle approach than forced reload
          if (confirm('A new version is available. Reload to update?')) {
            window.location.reload();
          }
        });

        // Register the service worker with a timeout
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const registrationPromise = wb.register();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Service Worker registration timed out')), 10000);
        });

        Promise.race([registrationPromise, timeoutPromise])
          .then(registration => {
            if (registration) {
              logger.info(
                'Service Worker registered',
                { scope: (registration as unknown).scope },
                'ServiceWorker'
              );
            }
          })
          .catch(error => {
            logger.error('Service Worker registration failed', { _error }, 'ServiceWorker');

            // Show toast notification for registration error
            toast.error({
              title: 'Service Worker Error',
              description: error.message || 'Failed to register service worker',
            });

            onError?.(error instanceof Error ? _error : new Error(String(error)));
          });
      } catch (error) {
        logger.error('Service Worker setup error', { _error }, 'ServiceWorker');
        onError?.(error instanceof Error ? _error : new Error(String(error)));
      }
    }
  }, [onUpdate, onSuccess, onError, toast]);

  // Only render UI on client-side after initial hydration
  if (typeof isUpdateAvailable === 'boolean' && isUpdateAvailable) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-primary-600 text-white p-4 flex justify-between items-center z-50">
        <p>A new version is available!</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-white text-primary-600 px-4 py-2 rounded-md font-medium hover:bg-primary-50 transition-colors"
        >
          Refresh
        </button>
      </div>
    );
  }

  return null;
}
