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
declare const navigator: Navigator;

import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import ServiceWorkerRegistration from '@/components/ui/ServiceWorkerRegistration';
import { AccessibilityProvider } from '@/providers/AccessibilityProvider';
import { CesiumProvider } from '@/providers/CesiumProvider';
import MapTilerProvider from '@/providers/MapTilerProvider';
import { SupabaseAuthProvider } from '@/providers/SupabaseAuthProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import theme from '@/theme/theme';
import { initializeLicense, isKillSwitchActivated } from '@/utils/license';
import logger from '@/utils/logger';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';

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
              <AccessibilityProvider>
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
                        role="alert"
                        aria-live="assertive"
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
              </AccessibilityProvider>
            </NextThemeProvider>
          </MUIThemeProvider>
        </MapTilerProvider>
      </CesiumProvider>
    </SupabaseAuthProvider>
  );
}
