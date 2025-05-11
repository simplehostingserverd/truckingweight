'use client';

import { ThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
// Import the CSS directly without source maps
import 'react-toastify/dist/ReactToastify.min.css';
import ServiceWorkerRegistration from '@/components/ui/ServiceWorkerRegistration';
import logger from '@/utils/logger';
import { SupabaseAuthProvider } from '@/providers/SupabaseAuthProvider';

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
      toast.success('You are back online!');
      logger.info('Application is online', {}, 'NetworkStatus');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warn('You are offline. Some features may be limited.');
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
    toast.info('A new version is available!', {
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: true,
      onClick: () => window.location.reload(),
    });
  };

  return (
    <SupabaseAuthProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {children}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        {/* Only render offline banner after client-side hydration */}
        {typeof isOnline === 'boolean' && !isOnline && (
          <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-white p-2 text-center z-50">
            You are currently offline. Some features may be limited.
          </div>
        )}
        <ServiceWorkerRegistration
          onUpdate={handleServiceWorkerUpdate}
          onError={error => logger.error('Service worker error', { error }, 'ServiceWorker')}
        />
      </ThemeProvider>
    </SupabaseAuthProvider>
  );
}
