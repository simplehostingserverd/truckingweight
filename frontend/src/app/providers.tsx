'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';
import { ToastProvider } from '@/providers/ToastProvider';
import ServiceWorkerRegistration from '@/components/ui/ServiceWorkerRegistration';
import ErrorBoundary from '@/components/ErrorBoundary';
import logger from '@/utils/logger';
import { SupabaseAuthProvider } from '@/providers/SupabaseAuthProvider';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme/theme';

export function Providers({ children }: { children: React.ReactNode }) {
  // Use undefined as initial state to avoid hydration mismatch
  const [isOnline, setIsOnline] = useState<boolean | undefined>(undefined);

  // Monitor online/offline status
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
                onError={error => logger.error('Service worker error', { error }, 'ServiceWorker')}
              />
            </ErrorBoundary>
          </ToastProvider>
        </NextThemeProvider>
      </MUIThemeProvider>
    </SupabaseAuthProvider>
  );
}
