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

import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';
import { ToastProvider } from '@/providers/ToastProvider';
import ServiceWorkerRegistration from '@/components/ui/ServiceWorkerRegistration';
import ErrorBoundary from '@/components/ErrorBoundary';
import logger from '@/utils/logger';
import { SupabaseAuthProvider } from '@/providers/SupabaseAuthProvider';
import { CesiumProvider } from '@/providers/CesiumProvider';
import MapTilerProvider from '@/providers/MapTilerProvider';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme/theme';
import { initializeLicense, isKillSwitchActivated } from '@/utils/license';

export function Providers({ children }: { children: React.ReactNode }) {
  // Use undefined as initial state to avoid hydration mismatch
  const [isOnline, setIsOnline] = useState<boolean | undefined>(undefined);

  // Monitor online/offline status and initialize license
  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    // Define event handlers
    const handleOnline = () => {
      setIsOnline(true);
      // Toast will be handled by ToastProvider
      logger.info('Application is online', {}, 'NetworkStatus');
    };

    const handleOffline = () => {
      setIsOnline(false);
      // Toast will be handled by ToastProvider
      logger.warn('Application is offline', {}, 'NetworkStatus');
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize license verification
    if (typeof window !== 'undefined') {
      // Check if kill switch is already activated
      if (isKillSwitchActivated()) {
        // Redirect to license error page if not already there
        if (!window.location.pathname.includes('/license-error')) {
          window.location.href = '/license-error';
        }
      } else {
        // Initialize license verification
        initializeLicense().catch(error => {
          logger.error('License initialization error', { error }, 'License');
        });
      }
    }

    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle service worker updates
  const handleServiceWorkerUpdate = () => {
    // Toast will be handled by ToastProvider
    // We'll implement this in the ServiceWorkerRegistration component
  };

  return (
    <SupabaseAuthProvider>
      <CesiumProvider>
        <MapTilerProvider>
          <MUIThemeProvider theme={theme}>
            <CssBaseline />
            <NextThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              <ToastProvider>
                <ErrorBoundary>
                  {children}
                  {/* Only render offline banner after client-side hydration */}
                  {typeof isOnline === 'boolean' && !isOnline && (
                    <div
                      style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: theme.palette.warning.main,
                        color: theme.palette.warning.contrastText,
                        padding: '8px',
                        textAlign: 'center',
                        zIndex: 9999,
                      }}
                    >
                      You are currently offline. Some features may be limited.
                    </div>
                  )}
                  <ServiceWorkerRegistration
                    onUpdate={handleServiceWorkerUpdate}
                    onError={error =>
                      logger.error('Service worker error', { error }, 'ServiceWorker')
                    }
                  />
                </ErrorBoundary>
              </ToastProvider>
            </NextThemeProvider>
          </MUIThemeProvider>
        </MapTilerProvider>
      </CesiumProvider>
    </SupabaseAuthProvider>
  );
}
