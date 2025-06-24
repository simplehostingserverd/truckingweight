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
  toast: (options: ToastOptions) => string;
  success: (options: Omit<ToastOptions, 'type'>) => string;
  error: (options: Omit<ToastOptions, 'type'>) => string;
  warning: (options: Omit<ToastOptions, 'type'>) => string;
  info: (options: Omit<ToastOptions, 'type'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Define dismiss function first to avoid circular reference
  const dismiss = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = Math.random().toString(36).substring(2, 9);
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

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback(
    (options: Omit<ToastOptions, 'type'>) => toast({ ...options, type: 'success' }),
    [toast]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const error = useCallback(
    (options: Omit<ToastOptions, 'type'>) => toast({ ...options, type: 'error' }),
    [toast]
  );

  const warning = useCallback(
    (options: Omit<ToastOptions, 'type'>) => toast({ ...options, type: 'warning' }),
    [toast]
  );

  const info = useCallback(
    (options: Omit<ToastOptions, 'type'>) => toast({ ...options, type: 'info' }),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, dismiss, dismissAll }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};
