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

import { ToastContainer } from '@/components/ui/toast';
import { Toast, ToastOptions } from '@/hooks/useToast';
import React, { createContext, useCallback, useContext, useState } from 'react';

interface ToastContextType {
  toast: (_options: ToastOptions) => string;
  success: (_options: Omit<ToastOptions, 'type'>) => string;
  error: (_options: Omit<ToastOptions, 'type'>) => string;
  warning: (_options: Omit<ToastOptions, 'type'>) => string;
  info: (_options: Omit<ToastOptions, 'type'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useToastContext = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Define dismiss function first to avoid circular reference
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dismiss = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toast = useCallback(
    (_options: ToastOptions) => {
      const id = Math.random().toString(36).substring(2, 9);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const newToast: Toast = {
        id,
        title: options.title,
        description: options.description,
        type: options.type || 'info',
        duration: options.duration || 5000,
        onDismiss: dismiss, // Add the onDismiss property
      };

      setToasts(prevToasts => [...prevToasts, newToast]);
      return id;
    },
    [dismiss]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _success = useCallback(
    (_options: Omit<ToastOptions, 'type'>) => toast({ ...options, type: 'success' }),
    [toast]
  );

  const _error = useCallback(
    (_options: Omit<ToastOptions, 'type'>) => toast({ ...options, type: 'error' }),
    [toast]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const warning = useCallback(
    (_options: Omit<ToastOptions, 'type'>) => toast({ ...options, type: 'warning' }),
    [toast]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const info = useCallback(
    (_options: Omit<ToastOptions, 'type'>) => toast({ ...options, type: 'info' }),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, dismiss, dismissAll }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};
