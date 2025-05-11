'use client';

import { useEffect, useState } from 'react';
import { Workbox } from 'workbox-window';
import logger from '@/utils/logger';

interface ServiceWorkerRegistrationProps {
  onUpdate?: () => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function ServiceWorkerRegistration({
  onUpdate,
  onSuccess,
  onError,
}: ServiceWorkerRegistrationProps) {
  // Use undefined as initial state to avoid hydration mismatch
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      const wb = new Workbox('/service-worker.js');

      // Successful registration
      wb.addEventListener('installed', event => {
        logger.info('Service Worker installed successfully', { event }, 'ServiceWorker');

        if (event.isUpdate) {
          logger.info('New content is available, please refresh', {}, 'ServiceWorker');
          setIsUpdateAvailable(true);
          onUpdate?.();
        } else {
          logger.info('Content is cached for offline use', {}, 'ServiceWorker');
          onSuccess?.();
        }
      });

      // Registration error
      wb.addEventListener('error', event => {
        const error = new Error('Service worker registration failed');
        logger.error('Service Worker registration failed', { event }, 'ServiceWorker');
        onError?.(error);
      });

      // Controlling service worker
      wb.addEventListener('controlling', () => {
        logger.info('Service Worker is controlling the page', {}, 'ServiceWorker');
        window.location.reload();
      });

      // Register the service worker
      wb.register()
        .then(registration => {
          logger.info('Service Worker registered', { scope: registration.scope }, 'ServiceWorker');
        })
        .catch(error => {
          logger.error('Service Worker registration failed', { error }, 'ServiceWorker');
          onError?.(error);
        });
    }
  }, [onUpdate, onSuccess, onError]);

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
